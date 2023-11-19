import React, { useState } from 'react'
import SignupForm from './SignupForm'
import LoginForm from './LoginForm'
import Homepage from '../pages/Homepage'

function Authentication() {
	const [showLogin, setShowLogin] = useState(true) // Will show login form as default
	const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userUid, setUserUid] = useState(null)
  const [userName, setUserName] = useState(null)

	return (
    <>
      {isLoggedIn ? (
        <Homepage userName={userName} userUid={userUid} setIsLoggedIn={setIsLoggedIn} />
      ) : showLogin ? (
        <LoginForm
          setShowLogin={setShowLogin}
          setIsLoggedIn={setIsLoggedIn}
          setUserUid={setUserUid}
          setUserName={setUserName}
        />
      ) : (
        <SignupForm setShowLogin={setShowLogin} />
      )}
    </>
  )
}

export default Authentication
