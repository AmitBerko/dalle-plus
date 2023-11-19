import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { accounts, apiServers } from '../accounts'
import { db } from '../firebaseConfig'
import { ref, set, onValue, query, update } from 'firebase/database'
import AccountsModal from '../components/AccountsModal'

function Homepage({ setIsLoggedIn, userUid, userName }) {
	const [urlArray, setUrlArray] = useState([
		// 'https://tse1.mm.bing.net/th/id/OIG.MScRbcNm04kmR5C28zmE',
		// 'https://tse1.mm.bing.net/th/id/OIG.MScRbcNm04kmR5C28zmE',
		// 'https://tse1.mm.bing.net/th/id/OIG.MScRbcNm04kmR5C28zmE',
		// 'https://tse1.mm.bing.net/th/id/OIG.MScRbcNm04kmR5C28zmE',
		// 'https://tse1.mm.bing.net/th/id/OIG.MScRbcNm04kmR5C28zmE',
		// 'https://tse1.mm.bing.net/th/id/OIG.MScRbcNm04kmR5C28zmE',
		// 'https://tse1.mm.bing.net/th/id/OIG.MScRbcNm04kmR5C28zmE',
		// 'https://tse1.mm.bing.net/th/id/OIG.MScRbcNm04kmR5C28zmE',
		// 'https://tse1.mm.bing.net/th/id/OIG.MScRbcNm04kmR5C28zmE',
		// 'https://tse1.mm.bing.net/th/id/OIG.MScRbcNm04kmR5C28zmE',
		// 'https://tse1.mm.bing.net/th/id/OIG.MScRbcNm04kmR5C28zmE',
		// 'https://tse1.mm.bing.net/th/id/OIG.MScRbcNm04kmR5C28zmE',
		// 'https://tse1.mm.bing.net/th/id/OIG.MScRbcNm04kmR5C28zmE',
		// 'https://tse1.mm.bing.net/th/id/OIG.MScRbcNm04kmR5C28zmE',
		// 'https://tse1.mm.bing.net/th/id/OIG.MScRbcNm04kmR5C28zmE',
		// 'https://tse1.mm.bing.net/th/id/OIG.MScRbcNm04kmR5C28zmE',
	])
	const [filteredUrlArray, setFilteredUrlArray] = useState([])
	const [prompt, setPrompt] = useState('')
	const [generatingCount, setGeneratingCount] = useState(0)
	const [doFilter, setDoFilter] = useState(false)
	const [isGenerating, setIsGenerating] = useState(false)
	const [user, setUser] = useState(null)
	const [accounts, setAccounts] = useState([])

	useEffect(() => {
		const userQuery = query(ref(db, `users/${userUid}`))
		onValue(userQuery, (snapshot) => {
			if (!snapshot.exists) {
				console.log(`user doesnt exist. (this messsage shouldnt appear)`)
				return
			}
			console.log(`user was set:`, snapshot.val())
			setUser(snapshot.val())
		})
	}, [])

	const curRef = 'testing'

	const errorImages = [
		'https://tse1.mm.bing.net/th/id/OIG.MScRbcNm04kmR5C28zmE', // Sad robot - blocked by bing
		'https://tse4.mm.bing.net/th/id/OIG.H0s1rsgj0HtBWeUq3i5S', // Skull - account expired / banned
		'https://tse2.mm.bing.net/th/id/OIG.bri9oao3CDK8wMHi87jP', // Question mark - idk, shouldn't appear
	]

	useEffect(() => {
		window.addEventListener('beforeunload', handleUnload)

		return () => {
			window.removeEventListener('beforeunload', handleUnload)
		}
	}, [])

	useEffect(() => {
		const filteredUrls = urlArray.filter((image) => !errorImages.includes(image))
		// Set isGenerating to true either if there's a good image, or 50% of accounts has finished generating
		if (filteredUrls.length > 0) setIsGenerating(false)
		if (generatingCount <= parseInt(accounts.length * 0.5)) setIsGenerating(false)
		setFilteredUrlArray(filteredUrls)
	}, [urlArray])

	let curApiServer

	const handleGenerate = () => {
		if (!prompt) return
		setUrlArray([])
		setIsGenerating(true)
		for (let index = 0; index < accounts.length; index++) {
			const account = accounts[index] // Get the account
			if (getIsGenerating(account.auth_cookie)) {
				console.log(`${account.auth_cookie.slice(0, 5)} is still generating. skipping it`)
				continue // Skip this iteration if the account is already generating
			}

			updateGeneratingStatus(account.auth_cookie, true) // Set "isGenerating" to true for that account
			setGeneratingCount((prev) => prev + 1)
			curApiServer = apiServers[index % apiServers.length]
			console.log(`sending request from ${account.auth_cookie.slice(0, 5)} to ${curApiServer}`)
			axios
				.post(`${curApiServer}/generate-images`, { prompt, account })
				.then((response) => {
					updateGeneratingStatus(account.auth_cookie, false)
					setGeneratingCount((prev) => prev - 1)
					let newUrls = response.data[account.auth_cookie]
					console.log(`${account.auth_cookie.slice(0, 5)} generated ${[newUrls]}`)

					if (!newUrls || newUrls === undefined) {
						console.log('returning - going outside the function')
						return
					}
					setUrlArray((prevUrlArray) => [...prevUrlArray, ...response.data[account.auth_cookie]])
				})
				.catch((error) => {
					updateGeneratingStatus(account.auth_cookie, false)
					setGeneratingCount((prev) => prev - 1)
					console.error(`Error for ${account.auth_cookie.slice(0, 5)}: ${error}`)
				})
		}
	}

	function updateGeneratingStatus(authCookie, isGenerating) {
		if (authCookie === undefined || authCookie === '') return
		// Define the account data
		const updatedAccountData = {
			isGenerating: isGenerating,
		}

		const newAccountRef = ref(db, `${curRef}/` + authCookie)
		update(newAccountRef, updatedAccountData)
	}

	function getIsGenerating(cookie) {
    const account = accounts.find(acc => acc.cookie === cookie)
    return account.isGenerating

		// const queryRef = query(ref(db, `${curRef}/${authCookie}`))
		// let generating
		// onValue(queryRef, (snapshot) => {
		// 	if (!snapshot.exists()) {
		// 		console.log("Snapshot doesn't exist")
		// 		return
		// 	}
		// 	generating = snapshot.val().isGenerating
		// })
		// return generating
	}

	// Set all accounts' isGenerating to false when exiting a page
	function handleUnload() {
		accounts.forEach((account) => {
			updateGeneratingStatus(account.auth_cookie, false)
		})
	}

	function pingApiServers() {
		const pingRequests = apiServers.map(async (server) => {
			return axios
				.get(`${server}/ping`)
				.then((response) => {
					if (response.status === 200) {
						console.log(`${server} is alive.`)
					} else {
						console.log(`${server} returned status ${response.status}.`)
					}
				})
				.catch((error) => {
					console.error(`Error while pinging ${server}: ${error}`)
				})
		})

		// Wait for all ping requests to complete
		Promise.all(pingRequests)
			.then(() => {
				alert('All servers are currently up!')
			})
			.catch((error) => {
				alert('An error occurred while pinging servers:', error)
			})
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

	return (
		<>
			{/* Title and prompt section */}
			<section className="container-fluid p-3 pt-0 p-md-4 pt-md-0 px-lg-5 pb-2 pb-lg-3">
				<div className="row mb-3 mb-lg-4 position-relative">
					<p className="col-12 fs-6 position-absolute mt-3">
						{user ? `Hello ${user.name}` : ''}{' '}
						<a style={{ cursor: 'pointer', color: 'lightblue' }} onClick={() => setIsLoggedIn(false)}>
							Log out
						</a>
					</p>
					<h1 className="text-center display-4 fw-bold mx-auto pt-3 pt-md-2 mt-4 mt-md-2 col-12">Super Dalle-3</h1>
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
								<button className="btn btn-primary btn-lg d-none d-sm-inline" style={{ width: '175px' }} disabled>
									<span className="spinner-border spinner-size me-2" role="status" aria-hidden="true"></span>
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
							<button onClick={handleGenerate} disabled className="btn btn-primary btn-lg w-100 d-sm-none">
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
						<button className="btn btn-danger d-none w-100 d-md-block" onClick={pingApiServers}>
							Ping Api Servers
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
					<button className="btn btn-success w-100" data-bs-toggle="modal" data-bs-target="#accounts-modal">
						Browse Accounts
					</button>
				</div>
				{/* Ping button - Small */}
				<button className="btn btn-danger mb-2 col-12 d-md-none" onClick={pingApiServers}>
					Ping Api Servers
				</button>
				{/* Accounts / images / Checkbox */}
				<div className="row">
					<div className="col-xl-4 col-md-6 mb-md-2 d-flex justify-content-center justify-content-md-end justify-content-xl-center">
						<div className="fs-4 text-center">
							Accounts generating: {generatingCount} / {accounts.length}
						</div>
					</div>
					<div className="col-xl-4 col-md-6 d-flex justify-content-center justify-content-md-start justify-content-xl-center">
						<div className="fs-4 text-center">Successful images: {filteredUrlArray.length}</div>
					</div>

					<div className="col-xl-4">
						<div className="form-check form-switch d-flex justify-content-center align-items-center">
							<input
								className="form-check-input me-2 me-lg-3 switch-size"
								type="checkbox"
								role="switch"
								checked={doFilter}
								onChange={() => setDoFilter((prev) => !prev)}
								id="imageFilterSwitch"
							/>
							<label className="form-check-label fs-4" htmlFor="imageFilterSwitch">
								Filter Bad Images
							</label>
						</div>
					</div>
				</div>
			</section>

			{/* Result images section, Shows either all images or only successful ones (depending if filter's true) */}
			<section>
				<div className="container-fluid px-2 px-md-5">
					<div className="row justify-content-center">
						{doFilter
							? filteredUrlArray.map((url, index) => {
									return (
										<img
											key={index}
											src={url}
											alt={url}
											className="img-fluid generated-image p-2 m-0"
											onClick={() => window.open(url, '_blank')}
											style={{ cursor: 'pointer' }}
										/>
									)
							  })
							: urlArray.map((url, index) => {
									return (
										<img
											key={index}
											src={url}
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
			<div>
				<button className="btn btn-warning" data-bs-toggle="modal" data-bs-target="#accounts-modal">
					open modal
				</button>
				<AccountsModal userUid={userUid} accounts={accounts} setAccounts={setAccounts} />
			</div>
			<button onClick={() => printUser(userUid)}>print user</button>
		</>
	)
}

export default Homepage
