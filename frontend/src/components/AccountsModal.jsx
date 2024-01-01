import React, { useState } from 'react'
import Account from './Account'
import { db } from '../firebaseConfig'
import { ref, update } from 'firebase/database'
import { useSelector, useDispatch } from 'react-redux'
import { removeAccount, addAccount } from '../redux/accountsSlice'
import ExplanationModal from './ExplanationModal'

function AccountsModal({ userUid }) {
	const accounts = useSelector((state) => state.accounts.value)
	const dispatch = useDispatch()
	const [cookieInput, setCookieInput] = useState('')
	const expirationLength = 1000 * 60 * 60 * 24 * 14 // 14 days
	const userRef = ref(db, `users/${userUid}`)

	const updateDb = async (updatedAccounts) => {
		try {
			await update(userRef, { accounts: updatedAccounts })
		} catch (error) {
			console.error(`error when updating db: `, error)
		}
	}

	async function handleAddAccount() {
		if (cookieInput === '') return

		try {
			const creationDate = Date.now()
			const match = cookieInput.match(/_U\s*(.*?)(?=\s*-{3,})/) // Just to save myself time
			const cookie = match ? match[1] : cookieInput
			if (accounts && accounts.some((account) => account.cookie === cookie)) {
				console.log('cookie already exists')
				return
			}

			const newAccount = { cookie, isGenerating: false, creationDate }
			dispatch(addAccount(newAccount))
			updateDb([...(accounts || []), newAccount])
			setCookieInput('')
		} catch (error) {
			console.log(`error is ${error}`)
		}
	}

	// function printUser(userUid) {
	// 	const userQuery = query(userRef)

	// 	onValue(userQuery, (snapshot) => {
	// 		if (!snapshot.exists) {
	// 			console.log('snapshot doesnt exist')
	// 			return
	// 		}
	// 		console.log(snapshot.val().accounts)
	// 	})
	// }

	function getExpiresIn(creationDate) {
		let expiresIn = expirationLength - (Date.now() - creationDate)
		let expiresInDays = parseInt(expiresIn / (1000 * 60 * 60 * 24))

		// Either show days or hours
		if (expiresInDays > 1) {
			return `${expiresInDays} Days`
		} else if (expiresInDays > 1) {
			return `${expiresInDays * 24} Hours`
		} else {
			return `${expiresInDays * 24 * 60} Minutes`
		}
		// return expiresInDays > 1 ? `${expiresInDays} Days` : `${expiresInDays / 24} Hours`
	}

	function handleRemoveAccount(cookie) {
		dispatch(removeAccount(cookie))
		const updatedAccounts = accounts.filter((account) => account.cookie !== cookie)
		updateDb(updatedAccounts)
	}

	return (
		<>
			<div className="modal fade p-2 py-5" id="accounts-modal" tabIndex="-1" data-bs-backdrop="static">
				<div className="modal-dialog modal-dialog-scrollable modal-lg">
					<div className="modal-content">
						<div className="modal-header">
							<h1 className="modal-title fs-3">Accounts</h1>
							<button className="btn-close" data-bs-dismiss="modal"></button>
						</div>

						<div className="modal-body px-3 px-sm-4 mb-1">
							<div className="row d-flex align-items-center">
								<div className="col-6 text-center fs-5">Cookie</div>
								<div className="col-4 fs-5 text-center ps-0 no-wrap">Expires in</div>
								<div className="col-2 d-flex justify-content-end p-0">
									<i
										className="bi bi-info-circle accounts-info py-1 px-2"

										data-bs-target="#explanation-modal"
										data-bs-toggle="modal"
									></i>
								</div>
							</div>

							{accounts
								? accounts
										.slice()
										.reverse()
										.map((account, index) => {
											return (
												<Account
													key={index}
													handleRemoveAccount={handleRemoveAccount}
													timeTillExpire={getExpiresIn(account.creationDate)}
													cookie={account.cookie}
												/>
											)
										})
								: null}
						</div>

						<div className="modal-footer">
							<div className="col-12">
								<input
									className="form-control"
									type="text"
									value={cookieInput}
									onChange={(e) => setCookieInput(e.target.value)}
								/>
							</div>

							<div className="col-12 d-flex justify-content-end">
								<button className="btn btn-success w-100 me-2" onClick={() => handleAddAccount()}>
									Add Account
								</button>
								<button className="btn btn-secondary" data-bs-dismiss="modal">
									Close
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
      <ExplanationModal /> 
		</>
	)
}

export default AccountsModal
