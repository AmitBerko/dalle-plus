import React from 'react'
import ReactDOM from 'react-dom/client'
import Homepage from './pages/Homepage';

import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import firebaseConfig from './firebaseConfig'
import './assets/styles.css'

const firebaseApp = initializeApp(firebaseConfig)
const db = getDatabase(firebaseApp) // Initialize the Realtime Database

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Homepage />
  </React.StrictMode>
)

export { db }