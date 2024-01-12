import React, { useEffect, useState } from 'react'
import SignupForm from './SignupForm'
import LoginForm from './LoginForm'
import Homepage from '../pages/Homepage'
import { auth, db } from '../firebaseConfig'
import { onAuthStateChanged } from 'firebase/auth'
import { ref, get } from 'firebase/database'
import { setAccounts } from '../redux/accountsSlice'
import { useDispatch } from 'react-redux'

function Authentication() {
	const dispatch = useDispatch()
	const [showLogin, setShowLogin] = useState(true) // Will show login form as default
	const [userData, setUserData] = useState({})
  const [hasLoaded, setHasLoaded] = useState(false)
  const [user, setUser] = useState(null)

	useEffect(() => {
		const getUserData = () =>
			onAuthStateChanged(auth, async (currentUser) => {
        if (!showLogin) {
          return
        }
        setUser(currentUser)
        console.log(`the account for some reason is:`, currentUser)

				if (!currentUser) {
					setUserData({})
          setHasLoaded(true)
					return
				}
				const userRef = ref(db, `users/${currentUser.uid}`)
				try {
					const snapshot = await get(userRef)
					if (snapshot.exists()) {
						let snapshotVal = await snapshot.val()
						const newUserData = {
							uid: currentUser.uid,
							name: snapshotVal.name,
							accounts: snapshotVal.accounts,
						}
						setUserData(newUserData)
						dispatch(setAccounts(newUserData.accounts))
            setHasLoaded(true)
					}
				} catch (error) {
					console.log(`Failed to fetch user data: ${error}`)
				}
			})

		getUserData()
	}, [])

  if (!hasLoaded) {
		return <></>
	}

	return (
		<>
			{userData.uid && hasLoaded ? (
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
