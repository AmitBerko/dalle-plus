import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth'

const firebaseConfig = {
	apiKey: process.env.REACT_APP_API_KEY,
	authDomain: process.env.REACT_APP_DOMAIN,
	databaseURL: process.env.REACT_APP_DATABASE,
	projectId: process.env.REACT_APP_PROJECT_ID,
	storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
	messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER,
	appId: process.env.REACT_APP_ID,
}

const firebaseApp = initializeApp(firebaseConfig)
const db = getDatabase(firebaseApp) // Initialize the Realtime Database
const auth = getAuth(firebaseApp)
setPersistence(auth, browserLocalPersistence)

export { db, auth }
