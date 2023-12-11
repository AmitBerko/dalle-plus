import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { ref, get, set, onValue, query, remove } from 'firebase/database'
import { getAuth } from 'firebase/auth'

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

// const curRef = 'users'

// // Schedule account deletion every 1 hour
// setInterval(async () => {
// 	checkAccount()
// }, 1000 * 60 * 60)

// function checkAccount() {
// 	// Check if the account has expired, if so, delete it
// 	const queryRef = query(ref(db, curRef))

// 	onValue(queryRef, (snapshot) => {
// 		if (!snapshot.exists()) {
// 			console.log("Snapshot doesn't exist")
// 			return
// 		}
//     const accounts = snapshot.val()
//     console.log('accounts is:', accounts)

// 		for (const accountCookie in accounts) {
// 			let creationTime = accounts[accountCookie].creationTime

// 			if (!creationTime || creationTime === '') {
// 				continue // Skip to the next iteration if creationTime is not valid
// 			}

// 			// let timeTillExpire = 1000 * 60 * 60 * 24 * 14 // Expires after 14 days
//       let timeTillExpire = 1000 * 10 // 10 seconds

// 			if (creationTime + timeTillExpire <= Date.now()) {
// 				remove(ref(db, `${curRef}/${accountCookie}`))
// 			}
// 		}
// 	})
// }
export { db, auth }
