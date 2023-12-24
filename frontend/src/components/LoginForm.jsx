import React, { useState } from 'react'
import { auth, db } from '../firebaseConfig'
import { ref, get } from 'firebase/database'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useDispatch } from 'react-redux'
import { setAccounts } from '../redux/accountsSlice'

function LoginForm({ setShowLogin, setIsLoggedIn, setUserUid }) {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [message, setMessage] = useState('')
	const dispatch = useDispatch()

	const fetchAccounts = async (userUid) => {
		const accountsRef = ref(db, `users/${userUid}/accounts`)
		const expirationLength = 1000 * 60 * 60 * 24 * 14 // 14 days
		try {
			const snapshot = await get(accountsRef)
			if (snapshot.exists()) {
				const allAccounts = snapshot.val()

				// Get all unexpired accounts
				const unexpiredAccounts = allAccounts.filter((account) => {
					const isExpired = account.creationDate + expirationLength < Date.now()
					return !isExpired
				})
				dispatch(setAccounts(unexpiredAccounts))
			}
		} catch (error) {
			console.error('Error fetching accounts: ', error)
		}
	}

	async function handleLogin(e) {
		e.preventDefault()

		try {
			const userCred = await signInWithEmailAndPassword(auth, email, password)
			const user = userCred.user
			console.log(`user signed in: `, user)
			setUserUid(user.uid)
			await fetchAccounts(user.uid)
			setIsLoggedIn(true)
		} catch (error) {
			setMessage('Incorrect login credentials. Please verify your email and password')
			console.log('crashed because of ', error)
		}
	}

	return (
		<div className="container position-absolute top-50 start-50 translate-middle">
			<form className="col-lg-6 mx-auto p-3 p-sm-4 border rounded-3 bg-body-tertiary">
				<div className="display-6 d-flex fw-bold mb-3 mb-sm-4 text-center justify-content-center h-100">
					Login to Super Dalle-3
				</div>
				<div className="form-floating mb-3">
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="form-control form-control-lg"
						id="floatingInput"
						placeholder=""
					/>
					<label htmlFor="floatingInput">Email</label>
				</div>
				<div className="form-floating mb-3">
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="form-control form-control-lg"
						id="floatingPassword"
						placeholder=""
					/>
					<label htmlFor="floatingPassword">Password</label>
				</div>
				<button
					className="w-100 btn btn-lg btn-primary"
					type="submit"
					onClick={(e) => handleLogin(e)}
				>
					Login
				</button>
				<hr className="my-3" />
				{message && <p className="alert alert-danger p-2 px-3 mb-2">{message}</p>}
				<small className="text-body-secondary fs-6">
					Don't have an account?{' '}
					<a style={{ cursor: 'pointer', color: 'lightblue' }} onClick={() => setShowLogin(false)}>
						Click here
					</a>
				</small>
			</form>
		</div>
	)
}

export default LoginForm
