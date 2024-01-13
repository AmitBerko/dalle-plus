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
	const [showLogin, setShowLogin] = useState(true) // Will show login form as default
	const [userData, setUserData] = useState({})
	const [hasLoaded, setHasLoaded] = useState(false)
	const expirationLength = 1000 * 60 * 60 * 24 * 14 // 14 days
	// const [user, setUser] = useState(null)

	useEffect(() => {
		const getUserData = async (currentUser) => {
			console.log('the account is: ', currentUser)

			if (!currentUser) {
				console.log('current user is not defined')
				setUserData({})
				setHasLoaded(true)
				return
			}

			const userRef = ref(db, `users/${currentUser.uid}`)
			try {
				const snapshot = await get(userRef)
				if (snapshot.exists()) {
					let snapshotVal = await snapshot.val()
					const unexpiredAccounts = snapshotVal.accounts.filter((account) => {
						const isExpired = account.creationDate + expirationLength < Date.now()
						return !isExpired
					})
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
			} finally {
        setHasLoaded(true)
      }
		}

		const handleAuthChange = (currentUser) => {
			// setUser(currentUser)
			getUserData(currentUser)
		}

		onAuthStateChanged(auth, handleAuthChange)
	}, [])

	if (!hasLoaded) {
		return (
			<></>
		)
	}

	return (
		<>
			{auth.currentUser ? (
				<Homepage userData={userData} />
			) : showLogin ? (
				<LoginForm setShowLogin={setShowLogin} />
			) : (
				<SignupForm setShowLogin={setShowLogin} />
			)}
		</>
	)
}

export default Authentication
