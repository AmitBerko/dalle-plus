import React, { useEffect, useState } from 'react'
import Account from './Account'
import { db } from '../firebaseConfig'
import { ref, get, onValue, query, update } from 'firebase/database'

function AccountsModal({ userUid, accounts, setAccounts }) {
	const [cookieInput, setCookieInput] = useState('')
  const expirationLength = 1000 * 60 * 60 * 24 * 14 // 14 days

	const userRef = ref(db, `users/${userUid}`)

	useEffect(() => {
    // Todo: Maybe combine them later
		const getAccounts = async () => {
			const snapshot = await get(userRef)
			const accounts = snapshot.val().accounts
			setAccounts(accounts ? accounts : [])
		}

    const removeExpiredAccounts = () => {
      // Each cookie expires after a maximum of 14 days
      if (!accounts || accounts.length === 0) return
      const unexpiredAccounts = accounts.filter((account) => {
        const isExpired = account.creationDate + expirationLength > Date.now()
        if (!isExpired) return account
      })
      setAccounts(unexpiredAccounts)
      update(userRef, { accounts: unexpiredAccounts })
    }

		getAccounts()
    removeExpiredAccounts()
	}, [])

	function removeAccount(cookie) {
		const result = accounts.filter((account) => account.cookie !== cookie)
		setAccounts(result)
		update(userRef, { accounts: result })
	}

	async function handleAddAccount() {
		if (cookieInput === '') return

		try {
      const creationDate = Date.now()
			const newAccounts = [{ cookie: cookieInput, isGenerating: false, creationDate }, ...(accounts ? accounts : [])]
			setAccounts(newAccounts)
      setCookieInput('')
			update(userRef, { accounts: newAccounts, })
		} catch (error) {
			console.log(`error is ${error}`)
		}
	}

	function printUser(userUid) {
		const userQuery = query(userRef)

		onValue(userQuery, (snapshot) => {
			if (!snapshot.exists) {
				console.log('snapshot doesnt exist')
				return
			}
			console.log(snapshot.val().accounts)
		})
	}

	return (
		<>
			<div className="modal p-2 py-5 fade" id="accounts-modal" tabIndex="-1">
				<div className="modal-dialog modal-dialog-scrollable modal-lg">
					<div className="modal-content">
						<div className="modal-header">
							<h1 className="modal-title fs-3">Accounts</h1>
							<button className="btn-close" data-bs-dismiss="modal"></button>
						</div>

						<div className="modal-body px-4 mb-1">
							<div className="row d-flex align-content-center">
								<div className="col-6 me-2">Cookie</div>
								<div className="col-3">asdadasdasda</div>

								{accounts
									? accounts.map((account, index) => {
											return <Account key={index} removeAccount={removeAccount} cookie={account.cookie} />
									  })
									: null}
							</div>
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
		</>
	)
}

export default AccountsModal
