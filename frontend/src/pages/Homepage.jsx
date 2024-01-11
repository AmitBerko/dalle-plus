import React, { useState, useEffect } from 'react'
import { db } from '../firebaseConfig'
import { ref, get, onValue } from 'firebase/database'
import AccountsModal from '../components/AccountsModal'
import { useSelector, useDispatch } from 'react-redux'
import { setAccounts } from '../redux/accountsSlice'
import { io } from 'socket.io-client'
import toastr from '../toastrConfig'

// const backendUrl = 'http://localhost:8080'
const backendUrl = 'https://super-dalle3.onrender.com'

const socket = io(backendUrl)

function Homepage({ setIsLoggedIn, userUid }) {
	const accounts = useSelector((state) => state.accounts.value)
	const dispatch = useDispatch()
	const [urlArray, setUrlArray] = useState([])
	const [prompt, setPrompt] = useState('')
	const [generatingCount, setGeneratingCount] = useState(0)
	const [isSlowMode, setIsSlowMode] = useState(false)
	const [isGenerating, setIsGenerating] = useState(false)
	const [user, setUser] = useState(null)
	const accountsRef = ref(db, `users/${userUid}/accounts`)
	const imagesRef = ref(db, `users/${userUid}/generatedImages`)

	useEffect(() => {
		const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
		const tooltipList = [...tooltipTriggerList].map(
			(tooltipTriggerEl) => new window.bootstrap.Tooltip(tooltipTriggerEl)
		)
	}, [])

	// Getting initial user data
	useEffect(() => {
		const setInitialData = async () => {
			setUser(userUid)
			const userRef = ref(db, `users/${userUid}`)
			const snapshot = await get(userRef)
			if (snapshot.exists) {
				setUser(snapshot.val())
			}
		}

		setInitialData()
	}, [])

	useEffect(() => {
		if (accounts && generatingCount === accounts.length && accounts.length !== 0) {
			setIsGenerating(true)
		} else {
			setIsGenerating(false)
		}
	}, [generatingCount])

	useEffect(() => {
		if (!accounts) return
		const generatingAccounts = accounts.filter((account) => account.isGenerating)
		setGeneratingCount(generatingAccounts.length)
	}, [accounts])

	useEffect(() => {
		const imagesUnsubscribe = onValue(imagesRef, (snapshot) => {
			const data = snapshot.val()
			setUrlArray(data)
		})

		const accountsUnsubscribe = onValue(accountsRef, async (snapshot) => {
			const data = await snapshot.val()
			dispatch(setAccounts(data))
		})

		return () => {
			imagesUnsubscribe()
			accountsUnsubscribe()
		}
	}, [userUid])

	useEffect(() => {
		const errorToastListener = ({ errorMessage }) => {
			toastr.error(errorMessage, 'Error')
		}

		const warningToastListener = ({ warningMessage }) => {
			toastr.warning(warningMessage, 'Warning')
		}

		socket.on('errorToast', errorToastListener)
		socket.on('warningToast', warningToastListener)

		return () => {
			socket.off('errorToast', errorToastListener)
			socket.off('warningToast', warningToastListener)
		}
	}, [socket])

	// useEffect(() => {
	// 	window.addEventListener('beforeunload', handleUnload)

	// 	return () => {
	// 		window.removeEventListener('beforeunload', handleUnload)
	// 	}
	// }, [])

	const handleGenerate = () => {
		if (!prompt || !accounts) return
		const notGeneratingAccounts = accounts
			.map((account, originalIndex) => {
				if (account.isGenerating) return null
				return { ...account, originalIndex }
			})
			.filter((account) => account !== null)
		socket.emit('generateImages', { prompt, accounts: notGeneratingAccounts, isSlowMode, userUid })
	}

	// function handleUnload() {
	// console.log(`accounts before update is `, accounts)
	// const updatedAccounts = accounts.map((account) => {
	// 	return { ...account, isGenerating: false }
	// })

	// console.log(`the updated accounts are:`, updatedAccounts)

	// dispatch(setAccounts(updatedAccounts))
	// 	clearImages()
	// }

	function clearImages() {
		socket.emit('clearImages', { userUid })
	}

	return (
		<>
			{/* Title and prompt section */}
			<section className="container-fluid p-3 pt-0 p-md-4 pt-md-0 px-lg-5 pb-2 pb-lg-3">
				<div className="row mb-3 mb-lg-4 position-relative">
					<p className="col-12 fs-6 position-absolute mt-3">
						{user ? `Hello ${user.name}` : ''}{' '}
						<a
							style={{ cursor: 'pointer', color: 'lightblue' }}
							onClick={() => setIsLoggedIn(false)}
						>
							Log out
						</a>
					</p>
					<h1 className="text-center display-4 fw-bold mx-auto pt-4 pt-md-3 mt-4 mt-md-2 col-12">
						Super Dalle-3
					</h1>
				</div>
				<div className="row">
					<div className="col-12">
						<div className="input-group">
							<input
								maxLength="480"
								type="text"
								value={prompt}
								onChange={(event) => setPrompt(event.target.value)}
								className="form-control fs-6 d-none d-sm-block"
							></input>
							<textarea
								maxLength="480"
								type="text"
								value={prompt}
								onChange={(event) => setPrompt(event.target.value)}
								className="form-control fs-6 d-sm-none"
								rows="4"
							></textarea>
							{isGenerating ? (
								<button
									className="btn btn-primary btn-lg d-none d-sm-inline"
									style={{ width: '175px' }}
									disabled
								>
									<span
										className="spinner-border spinner-size me-2"
										role="status"
										aria-hidden="true"
									></span>
									Generating...
								</button>
							) : (
								<button
									onClick={handleGenerate}
									className="btn btn-primary btn-lg d-none d-sm-inline"
									style={{ width: '175px' }}
								>
									Generate
								</button>
							)}
						</div>
					</div>
					<div className="col-12 mt-2 mt-lg-0">
						{isGenerating ? (
							<button
								onClick={handleGenerate}
								disabled
								className="btn btn-primary btn-lg w-100 d-sm-none"
							>
								<span className="spinner-border spinner-size me-2"></span>
								Generating...
							</button>
						) : (
							<button onClick={handleGenerate} className="btn btn-primary btn-lg w-100 d-sm-none">
								Generate
							</button>
						)}
					</div>
				</div>
				{/* Add account - Big */}
				<div className="row mt-3 mb-2 d-none d-md-flex">
					<div className="col">
						<button className="btn btn-danger d-none w-100 d-md-block" onClick={clearImages}>
							Clear Images
						</button>
					</div>
					<div className="col">
						<button
							className="btn btn-success d-none w-100 d-md-block"
							data-bs-target="#accounts-modal"
							data-bs-toggle="modal"
						>
							Browse Accounts
						</button>
					</div>
				</div>
				{/* Add account - Small */}
				<div className="mt-4 mb-2 d-md-none">
					<button
						className="btn btn-success w-100"
						data-bs-toggle="modal"
						data-bs-target="#accounts-modal"
					>
						Browse Accounts
					</button>
				</div>
				{/* Clear Images - Small */}
				<button className="btn btn-danger mb-2 col-12 d-md-none" onClick={clearImages}>
					Clear Images
				</button>
				{/* Accounts / images / Checkbox */}
				<div
					className="d-flex flex-column justify-content-center
          flex-sm-row flex-sm-wrap w-100 align-items-center"
				>
					{/* <div className="col-xl-4 col-md-6 mb-md-2 d-flex justify-content-center justify-content-md-end justify-content-xl-center"> */}
					<div className="fs-3 text-center me-sm-3 me-lg-4 me-xl-5">
						Successful images: {urlArray ? urlArray.length : 0}
					</div>
					{/* </div> */}

					{/* <div className="col-xl-4 col-md-6 d-flex justify-content-center justify-content-md-start justify-content-xl-center"> */}
					<div className="form-check form-switch d-flex align-items-center mx-sm-3 mx-lg-4 mx-xl-5">
						<input
							className="form-check-input me-2 switch-size"
							type="checkbox"
							role="switch"
							checked={isSlowMode}
							onChange={() => setIsSlowMode((prev) => !prev)}
							id="imageFilterSwitch"
						/>
						<label className="form-check-label fs-3 me-2" htmlFor="imageFilterSwitch">
							Slow Mode
						</label>
						<i
							style={{ cursor: 'pointer' }}
							className="bi bi-question-circle fs-2"
							data-bs-toggle="tooltip"
							data-bs-placement="right"
							data-bs-title="Each account receives 15 daily credits for faster prompt generation. Enable Slow Mode to generate prompts without consuming credits."
						></i>
					</div>
					{/* </div> */}

					{/* <div className="col-xl-4"> */}
					<div className="fs-3 text-center ms-sm-3 ms-lg-4 ms-xl-5">
						{accounts
							? `Now generating: ${generatingCount} / ${accounts.length}`
							: 'Now generating: 0 / 0'}
					</div>
					{/* </div> */}
				</div>
			</section>

			{/* Result images section, Shows either all images or only successful ones (depending if filter's true) */}
			<section>
				<div className="container-fluid px-2 px-md-5">
					<div className="row justify-content-center">
						{urlArray?.map((url, index) => (
							<img
								key={index}
								src={url}
								alt={url}
								className="img-fluid generated-image p-2 m-0"
								onClick={() => window.open(url, '_blank')}
								style={{ cursor: 'pointer' }}
							/>
						))}
					</div>
				</div>
			</section>
			<AccountsModal userUid={userUid} />
		</>
	)
}

export default Homepage
