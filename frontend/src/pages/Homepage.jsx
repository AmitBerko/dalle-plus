import React, { useState, useEffect } from 'react'
import { db } from '../firebaseConfig'
import { ref, get, onValue, query, update } from 'firebase/database'
import AccountsModal from '../components/AccountsModal'
import io from 'socket.io-client'
import { useSelector, useDispatch } from 'react-redux'
import { setAccounts, updateAccount, addAccount } from '../redux/accountsSlice'

const socket = io('https://super-dalle3.onrender.com')
// const socket = io('localhost:8080')

function Homepage({ setIsLoggedIn, userUid }) {
	const accounts = useSelector((state) => state.accounts.value)
	const dispatch = useDispatch()
	// const { setAccounts, updateAccount, fetchAccounts } = useFirebaseAccounts(userUid)
	const [urlArray, setUrlArray] = useState([])
	const [prompt, setPrompt] = useState('')
	const [generatingCount, setGeneratingCount] = useState(0)
	const [isSlowMode, setIsSlowMode] = useState(true)
	const [isGenerating, setIsGenerating] = useState(false)
	const [user, setUser] = useState(null)
	const accountsRef = `users/${userUid}/accounts`

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
		const updateDb = () => {
			try {
				update(ref(db, `users/${userUid}`), { accounts: accounts })
			} catch (error) {
				console.error(`error when updating db: `, error)
			}
		}

		updateDb()
		const generatingAccounts = accounts.filter((account) => account.isGenerating)
		setGeneratingCount(generatingAccounts.length)
	}, [accounts])

	useEffect(() => {
		socket.on('connect', () => {
			console.log('client connect')
		})

		socket.on('imagesGenerated', (data) => {
			console.log(`data is`, data)
			const urls = data.urls
			const cookie = data.cookie
			// console.log(`${cookie.slice(0, 5)} generated`)
			setUrlArray((prevUrls) => prevUrls.concat(urls))
			const accountIndex = accounts.findIndex((account) => account.cookie === cookie)
			console.log(`the cookie is ${cookie.slice(0, 5)} and index is ${accountIndex}`)

			dispatch(updateAccount({ accountIndex, newValues: { isGenerating: false } }))
			setIsGenerating(false)
		})

		socket.on('imagesFailed', (data) => {
			const cookie = data.cookie
			const accountIndex = accounts.findIndex((account) => account.cookie === cookie)
			dispatch(updateAccount({ accountIndex, newValues: { isGenerating: false } }))
		})

		return () => {
			socket.off('imagesGenerated')
		}
	}, [socket])

	useEffect(() => {
		window.addEventListener('beforeunload', handleUnload)

		return () => {
			window.removeEventListener('beforeunload', handleUnload)
		}
	}, [])

	// useEffect(() => {
	//   const filteredUrls = urlArray.filter((image) => !errorImages.includes(image))
	//   // Set isGenerating to true either if there's a good image, or 50% of accounts has finished generating
	//   if (filteredUrls.length > 0) setIsGenerating(false)
	//   if (generatingCount <= parseInt(accounts.length * 0.5)) setIsGenerating(false)
	//   // if (generatingCount === 0) setIsGenerating(false)
	//   setFilteredUrlArray(filteredUrls)
	// }, [urlArray])

	const handleGenerate = () => {
		if (!prompt) return
		setUrlArray([])
		setIsGenerating(true)
		socket.emit('generateImages', { prompt, accounts, isSlowMode })
		const updatedAccounts = accounts.map((account) => {
			return { ...account, isGenerating: true }
		})
		dispatch(setAccounts(updatedAccounts))
		// // Set every account's isGenerating status to true
		// // setAccounts((prevAccounts) => {
		// //   const result = prevAccounts.map((account) => {
		// //     return { ...account, isGenerating: true }
		// //   })
		// //   console.log(result)
		// //   return result
		// // })
		// const userRef = ref(db, `users/${userUid}`)
		// update(userRef, { accounts })
		// setGeneratingCount(accounts.length)
	}

	function updateGeneratingStatus(cookie, isGenerating) {
		// if (cookie === undefined || cookie === '') return
		// const accountIndex = accounts.findIndex((acc) => acc.cookie === cookie)
		// if (accountIndex === -1) {
		// 	console.log('Account not found')
		// 	return
		// }
		// const updatedAccountRef = ref(db, `${accountsRef}/${accountIndex}`)
		// // Update isGenerating value on firebase and accounts state
		// // setAccounts((prevAccounts) => {
		// //   prevAccounts[accountIndex].isGenerating = isGenerating
		// //   return prevAccounts
		// // })
		// update(updatedAccountRef, { cookie, isGenerating })
	}

	function getIsGenerating(cookie) {
		const account = accounts.find((acc) => acc.cookie === cookie)
		if (!account) return
		console.log(`account:`, account, `s isgenerating is: ${account.isGenerating}`)
		return account.isGenerating
	}

	// Set all accounts' isGenerating to false when exiting a page
	function handleUnload() {
		// accounts.forEach((account) => {
		// 	updateGeneratingStatus(account.cookie, false)
		// })
	}

	function printUser(userUid) {
		const userQuery = query(ref(db, `users/${userUid}`))

		onValue(userQuery, (snapshot) => {
			if (!snapshot.exists) {
				console.log('snapshot doesnt exist')
				return
			}
			console.log(snapshot.val())
		})
	}

	function testing() {
		dispatch(updateAccount({ accountIndex: 0, newValues: { isGenerating: false } }))
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
						<button className="btn btn-danger d-none w-100 d-md-block">Ping Api Servers</button>
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
				{/* Ping button - Small */}
				<button className="btn btn-danger mb-2 col-12 d-md-none">Ping Api Servers</button>
				{/* Accounts / images / Checkbox */}
				<div className="row">
					<div className="col-xl-4 col-md-6 mb-md-2 d-flex justify-content-center justify-content-md-end justify-content-xl-center">
						<div className="fs-3 text-center">Successful images: {urlArray.length}</div>
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
						{urlArray.map((url, index) => {
							return (
								<img
									key={index}
									src={`${url}?w=270&h=270`}
									alt={url}
									className="img-fluid generated-image p-2 m-0"
									onClick={() => window.open(url, '_blank')}
									style={{ cursor: 'pointer' }}
								/>
							)
						})}
					</div>
				</div>
			</section>

			<AccountsModal userUid={userUid} />

			{/* <div>
				<button className="btn btn-warning" data-bs-toggle="modal" data-bs-target="#accounts-modal">
					open modal
				</button>
			</div> */}
			<button
				onClick={() => {
					console.log(accounts)
				}}
			>
				print accounts
			</button>

			{/* <button
        onClick={() =>
          updateGeneratingStatus(
            '1GUivhY-8ozgPkE1kL1lKVQpklGbylujaaDcEuMViTBEykuVBVHWEcg9KyhuQCSWPVNIU1_ksTfYzNdmeHIso3XJIJFOcZFuOhZaVHxWChq-JkRuE2lIjIBOaszRtF6eyvWyAi1uzQG8lXg3ayAXdepUBnLo36UOPoQxlLhOlus54B9pcd0tAMA6orNe7I5KOoKNMsiOD1JHJipJ2ONJTGg',
            false
          )
        }
      >
        change user
      </button> */}

			<button onClick={testing}>test button</button>
			<button
				onClick={() =>
					dispatch(
						addAccount({
							cookie: Math.floor(Math.random() * 1000),
							isGenerating: false,
							creationDate: '123',
						})
					)
				}
			>
				test Redux
			</button>
			{/* <h6 className="display-6">{JSON.stringify(accounts)}</h6> */}
		</>
	)
}

export default Homepage
