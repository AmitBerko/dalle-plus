import React, { useState } from 'react'
import { auth } from '../firebaseConfig'
import { signInWithEmailAndPassword } from 'firebase/auth'

function LoginForm({ setShowLogin, setIsLoggedIn, setUserUid, setUserName }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleLogin(e) {
    e.preventDefault()

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password)
      const user = userCred.user
      console.log(`user signed in: `, user)
      setUserUid(user.uid)
      // setUserName(user.email.slice(0, user.email.indexOf('@')).replaceAll('.', ' ').replace(/[0-9]/g, ''))
      setIsLoggedIn(true)
    } catch (error) {
      console.log('crashed because of ', error)
    }
  }

  return (
    <div className="container position-absolute top-50 start-50 translate-middle">
      <form className="col-lg-6 mx-auto p-4 pb-md-4 p-md-5 pt-0 pt-md-0 border rounded-3 bg-body-tertiary">
        <div className="display-6 d-flex fw-bold my-4 text-center justify-content-center h-100">
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
        <button className="w-100 btn btn-lg btn-primary" type="submit" onClick={(e) => handleLogin(e)}>
          Login
        </button>
        <hr className="my-3" />
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
