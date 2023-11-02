import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { accounts, apiServers } from '../accounts'
import { db } from '../index'
import { ref, set, onValue, query } from 'firebase/database'

function Homepage() {
	const [urlArray, setUrlArray] = useState([])
	const [prompt, setPrompt] = useState('')
	const [generatingCount, setGeneratingCount] = useState(0)
	const [newAccount, setNewAccount] = useState('')

	useEffect(() => {
		window.addEventListener('beforeunload', handleUnload)

		return () => {
			window.removeEventListener('beforeunload', handleUnload)
		}
	}, [])

	let curApiServer
	const handleGenerate = () => {
		if (!prompt) return
		setUrlArray([])
		for (let index = 0; index < accounts.length; index++) {
			const account = accounts[index] // Get the account
			if (getIsGenerating(account.auth_cookie)) {
				console.log(`${account.auth_cookie.slice(0, 5)} is still generating. skipping it`)
				continue // Skip this iteration if the account is already generating
			}

			updateAccount(account.auth_cookie, true) // Set "isGenerating" to true for that account
			setGeneratingCount((prev) => prev + 1)
			curApiServer = apiServers[index % apiServers.length]
			console.log(`sending request from ${account.auth_cookie.slice(0, 5)} to ${curApiServer}`)
			axios
				.post(`${curApiServer}/generate-images`, { prompt, account })
				.then((response) => {
					updateAccount(account.auth_cookie, false)
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
					updateAccount(account.auth_cookie, false)
					setGeneratingCount((prev) => prev - 1)
					console.error(`Error for ${account.auth_cookie.slice(0, 5)}: ${error}`)
				})
		}
	}

	function updateAccount(authCookie, isGenerating) {
		if (authCookie === undefined || authCookie === '') return
		// Define the account data
		const newAccountData = {
			isGenerating: isGenerating,
		}

		const newAccountRef = ref(db, 'accounts/' + authCookie)
		set(newAccountRef, newAccountData)
	}

	function getIsGenerating(authCookie) {
		const queryRef = query(ref(db, `accounts/${authCookie}`))
    let generating
		onValue(queryRef, (snapshot) => {
			if (!snapshot.exists()) {
				console.log('Snapshot doesnt exist')
				return
			}
      generating = snapshot.val().isGenerating
		})
    return generating
	}

	// Set all accounts' isGenerating to false when exiting a page
	function handleUnload() {
		accounts.forEach((account) => {
			updateAccount(account.auth_cookie, false)
		})
	}

	return (
		<>
			{/* Title and prompt section */}
			<section className="p-3 p-lg-4 px-lg-5 pb-2 pb-lg-3">
				<h1 className="text-center mb-3 mb-lg-4 display-4 fw-bold">Super Dalle-3</h1>
				<div className="container-fluid">
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
								<button onClick={handleGenerate} className="btn btn-primary btn-lg d-none d-sm-inline">
									Generate
								</button>
							</div>
						</div>
						<div className="col-12 mt-2 mt-lg-0">
							<button onClick={handleGenerate} className="btn btn-primary btn-lg w-100 d-sm-none">
								Generate
							</button>
						</div>
					</div>
          {/* Big screens */}
					<div className="input-group mt-3 mb-2 w-50 mx-auto d-none d-sm-flex">
						<button className="btn btn-success" onClick={() => updateAccount(newAccount, false)}>
							Add Account
						</button>
						<input
							className="form-control"
							type="text"
							value={newAccount}
							onChange={(e) => setNewAccount(e.target.value)}
						></input>
					</div>
          {/* Small screens */}
					<div className="mt-4 mb-2 d-sm-none">
						<button className="btn btn-success w-100 mb-2" onClick={() => updateAccount(newAccount, false)}>
							Add Account
						</button>
						<input
							className="form-control "
							type="text"
							value={newAccount}
							onChange={(e) => setNewAccount(e.target.value)}
						></input>
					</div>
					<div className="text-center fs-4">
						Accounts generating: {generatingCount} / {accounts.length}
					</div>
				</div>
			</section>

			{/* Result images section */}
			<section>
				<div className="container-fluid px-2 px-md-5">
					<div className="row justify-content-center">
						{urlArray.map((url, index) => {
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
		</>
	)
}

export default Homepage
