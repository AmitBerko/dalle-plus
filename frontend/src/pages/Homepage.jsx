import React, { useState } from 'react'
import axios from 'axios'
import { accounts, apiServers } from '../accounts'
import { db } from '../index'
import { ref, set, onValue, push, update, query, equalTo, orderByChild } from 'firebase/database'

function Homepage() {
	const [urlArray, setUrlArray] = useState([])
	const [prompt, setPrompt] = useState('')
	const [brokenAccounts, setBrokenAccounts] = useState(['test'])
	const [isGenerating, setIsGenerating] = useState([]) // Prevents letting an account generate more than once at a time
	const accountsRef = ref(db, 'accounts')

	let curApiServer
	const handleGenerate = () => {
		if (!prompt) return
		setUrlArray([])
		for (let index = 0; index < accounts.length; index++) {
			const account = accounts[index]

			if (isGenerating[account.auth_cookie.slice(0, 5)]) {
				console.log(`${account.auth_cookie.slice(0, 5)} is still generating. skipping it`)
				continue // Skip this iteration if the account is already generating
			}

			// isGenerating[account.auth_cookie] = true
			setIsGenerating((prev) => ({ ...prev, [account.auth_cookie.slice(0, 5)]: true }))
			curApiServer = apiServers[index % apiServers.length]
			console.log(`sending request from ${account.auth_cookie.slice(0, 5)} to ${curApiServer}`)
			axios
				.post(`${curApiServer}/generate-images`, { prompt, account })
				.then((response) => {
					// isGenerating[account.auth_cookie] = false
					setIsGenerating((prev) => ({ ...prev, [account.auth_cookie.slice(0, 5)]: false }))
					let newUrls = response.data[account.auth_cookie]
					console.log(`${account.auth_cookie.slice(0, 5)} generated ${[newUrls]}`)
					if (newUrls.length === 0) {
						// Delete this after
						setBrokenAccounts((prev) => [...prev, account.auth_cookie.slice(0, 5)])
					}
					// console.log(newUrls)
					if (!newUrls || newUrls === undefined) {
						console.log('returning - going outside the function')
						return
					}
					setUrlArray((prevUrlArray) => [...prevUrlArray, ...response.data[account.auth_cookie]])
				})
				.catch((error) => {
					console.error(`Error for ${account.auth_cookie.slice(0, 5)}: ${error}`)
				})
		}
	}

	function updateAccount(authCookie, isGenerating) {
		// Define the account data
		const newAccountData = {
			isGenerating: isGenerating,
		}

		const newAccountRef = ref(db, 'accounts/' + authCookie)
		set(newAccountRef, newAccountData)
	}

	function getIsGenerating(authCookie) {
		const queryRef = query(ref(db, `accounts/${authCookie}`))
		onValue(queryRef, (snapshot) => {
			if (!snapshot.exists()) {
				console.log('Snapshot doesnt exist')
				return
			}
			console.log(snapshot.val().isGenerating) // good
      return snapshot.val().isGenerating
		})
	}

	return (
		<>
			{/* Title and prompt section */}
			<section className="p-3 p-lg-4 px-lg-5">
				<h1 className="text-center mb-3 display-5 fw-bold">Image Creator</h1>
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
				</div>
			</section>
			<div>{brokenAccounts}</div>
			<div>{Object.entries(isGenerating)}</div>

			{/* Result images section */}
			<section>
				<div className="container-fluid px-2 px-md-5">
					<div className="row d-flex justify-content-center p">
						{urlArray.map((url, index) => {
							// Try maybe to use <a> instead
							return (
								<img
									key={index}
									src={url}
									alt={url}
									className="img-fluid generated-image px-3 mb-3 p-sm-2 mb-sm-0"
									onClick={() => window.open(url, '_blank')}
									style={{ cursor: 'pointer' }}
								/>
							)
						})}
					</div>
				</div>
			</section>
			<button onClick={() => updateAccount('gilbasim', false)}>add account</button>
			<button onClick={() => getIsGenerating('gilbasimtest')}>test</button>
		</>
	)
}

export default Homepage
