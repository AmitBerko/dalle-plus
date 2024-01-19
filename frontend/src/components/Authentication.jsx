import React, { useEffect, useState } from 'react'
import SignupForm from './SignupForm'
import LoginForm from './LoginForm'
import Homepage from '../pages/Homepage'
import { auth, db } from '../firebaseConfig'
import { onAuthStateChanged } from 'firebase/auth'
import { ref, get, update } from 'firebase/database'
import { setAccounts } from '../redux/accountsSlice'
import { useDispatch } from 'react-redux'

function Authentication() {
	const dispatch = useDispatch()
	const [showLogin, setShowLogin] = useState(true)
	const [userData, setUserData] = useState({})
	const [hasLoaded, setHasLoaded] = useState(false)
	const expirationLength = 1000 * 60 * 60 * 24 * 14

	useEffect(() => {
		const getUserData = async (currentUser) => {
			try {
				if (!currentUser) {
					setUserData({})
					return
				}

				const userRef = ref(db, `users/${currentUser.uid}`)
				const snapshot = await get(userRef)

				if (snapshot.exists()) {
					let snapshotVal = await snapshot.val()
					const unexpiredAccounts = snapshotVal.accounts ? snapshotVal.accounts.filter((account) => {
						const isExpired = account.creationDate + expirationLength < Date.now()
						return !isExpired
					}) : []

					update(userRef, { accounts: unexpiredAccounts })

					const newUserData = {
						uid: currentUser.uid,
						name: snapshotVal.name,
						accounts: unexpiredAccounts,
					}

					setUserData(newUserData)
					dispatch(setAccounts(newUserData.accounts))
				}
			} catch (error) {
				console.log(`Failed to fetch user data: ${error}`)
        console.log(error)
			} finally {
				setHasLoaded(true)
			}
		}

		const handleAuthChange = (currentUser) => {
			getUserData(currentUser)
		}

		const unsubscribe = onAuthStateChanged(auth, handleAuthChange)

		return () => unsubscribe() // Remove the subscription when the component unmounts
	}, [])

	return (
		<>
			{hasLoaded ? (
				auth.currentUser ? (
					<Homepage userData={userData} />
				) : showLogin ? (
					<LoginForm setShowLogin={setShowLogin} />
				) : (
					<SignupForm setShowLogin={setShowLogin} />
				)
			) : (
				// Display loading spinner if data hasn't loaded yet
				<div className="loading-spinner-container">
					<div className="spinner-border loading-spinner">
						<span className="visually-hidden">Loading...</span>
					</div>
				</div>
			)}
		</>
	)
}

export default Authentication
