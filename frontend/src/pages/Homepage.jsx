import React, { useState, useEffect } from 'react'
import { db } from '../firebaseConfig'
import { ref, get, onValue } from 'firebase/database'
import AccountsModal from '../components/AccountsModal'
import { useSelector, useDispatch } from 'react-redux'
import { setAccounts } from '../redux/accountsSlice'
import { io } from 'socket.io-client'

const backendUrl = 'http://localhost:8080'
// const backendUrl = 'https://super-dalle3.onrender.com'

const socket = io(backendUrl)

function Homepage({ setIsLoggedIn, userUid }) {
	const accounts = useSelector((state) => state.accounts.value)
	const dispatch = useDispatch()
	const [urlArray, setUrlArray] = useState([])
	const [prompt, setPrompt] = useState('')
	const [generatingCount, setGeneratingCount] = useState(0)
	const [isSlowMode, setIsSlowMode] = useState(true)
	const [isGenerating, setIsGenerating] = useState(false)
	const [user, setUser] = useState(null)
	const accountsRef = ref(db, `users/${userUid}/accounts`)
	const imagesRef = ref(db, `users/${userUid}/generatedImages`)

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
    if (generatingCount === accounts.length && accounts.length !== 0) {
      setIsGenerating(true)
    } else {
      setIsGenerating(false)
    }
  }, [generatingCount])

	useEffect(() => {
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
		window.addEventListener('beforeunload', handleUnload)

		return () => {
			window.removeEventListener('beforeunload', handleUnload)
		}
	}, [])

	const handleGenerate = () => {
		if (!prompt) return
		const notGeneratingAccounts = accounts.filter((account) => !account.isGenerating)
		socket.emit('generateImages', { prompt, accounts: notGeneratingAccounts, isSlowMode, userUid })
	}

	function handleUnload() {
		// console.log(`accounts before update is `, accounts)
		// const updatedAccounts = accounts.map((account) => {
		// 	return { ...account, isGenerating: false }
		// })

		// console.log(`the updated accounts are:`, updatedAccounts)

		// dispatch(setAccounts(updatedAccounts))
		clearImages()
	}

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
							data-bs-toggle="modal"
							data-bs-target="#accounts-modal"
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
				<div className="row">
					<div className="col-xl-4 col-md-6 mb-md-2 d-flex justify-content-center justify-content-md-end justify-content-xl-center">
						<div className="fs-3 text-center">
							Successful images: {urlArray ? urlArray.length : 0}
						</div>
					</div>
					<div className="col-xl-4 col-md-6 d-flex justify-content-center justify-content-md-start justify-content-xl-center">
						<div className="fs-3 text-center">
							{accounts
								? `Now generating: ${generatingCount} / ${accounts.length}`
								: 'Now generating: 0 / 0'}
						</div>
					</div>

					<div className="col-xl-4">
						<div className="form-check form-switch d-flex justify-content-center align-items-center">
							<input
								className="form-check-input me-2 me-lg-3 switch-size"
								type="checkbox"
								role="switch"
								checked={isSlowMode}
								onChange={() => setIsSlowMode((prev) => !prev)}
								id="imageFilterSwitch"
							/>
							<label className="form-check-label fs-3" htmlFor="imageFilterSwitch">
								Slow Mode
							</label>
						</div>
					</div>
				</div>
			</section>

			{/* Result images section, Shows either all images or only successful ones (depending if filter's true) */}
			<section>
				<div className="container-fluid px-2 px-md-5">
					<div className="row justify-content-center">
						{urlArray?.map((url, index) => (
							<img
								key={index}
								src={`${url}?w=270&h=270`}
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
