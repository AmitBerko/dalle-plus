const BingApi = require('./BingApi')
const { createServer } = require('http')
const { Server } = require('socket.io')
const express = require('express')
const app = express()
const server = createServer(app)
const PORT = process.env.PORT || 8080
const cors = require('cors')

// Firebase
require('dotenv').config()
const admin = require('firebase-admin')
const serviceAccount = {
	type: process.env.TYPE,
	project_id: process.env.PROJECT_ID,
	private_key_id: process.env.PRIVATE_KEY_ID,
	private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
	client_email: process.env.CLIENT_EMAIL,
	client_id: process.env.CLIENT_ID,
	auth_uri: process.env.AUTH_URI,
	token_uri: process.env.TOKEN_URI,
	auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
	client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
	universe_domain: process.env.UNIVERSE_DOMAIN,
}

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: process.env.REALTIME_DATABASE,
})

const db = admin.database()

// Middlewares
app.use(cors())
app.use(express.json())

// Routes
app.get('/', (req, res) => {
	res.send('Hello World')
})

// SocketIO
const io = new Server(server, {
	cors: {
		origin: ['http://localhost:3000', 'https://super-dalle-3.web.app'],
	},
})

io.on('connection', (socket) => {
	console.log('user joined')

	let allUrls = []

	socket.on('clearImages', async (data) => {
		// Clear the user's images
		const { userUid } = data
		const imagesRef = db.ref(`/users/${userUid}/generatedImages`)

		imagesRef.set([])
		allUrls = []
	})

	socket.on('generateImages', async (data) => {
		// Get the request's parameters
		const { prompt, accounts, isSlowMode, userUid } = data
		const imagesRef = db.ref(`/users/${userUid}/generatedImages`)
		const imagesSnapshot = await imagesRef.once('value')

		allUrls = []

		// Get the previous images so they won't get deleted
		if (imagesSnapshot.exists()) {
			allUrls = imagesSnapshot.val()
			console.log(`the val is`, allUrls)
		}

		// Loop through every account
		const requests = accounts.map(async (account) => {
			const accountRef = db.ref(`users/${userUid}/accounts/${account.originalIndex}`)
			try {
				console.log(`${account.cookie.slice(0, 5)} has started generating`)
				// Set the account's generating status to true
				await accountRef.update({ isGenerating: true })
				const bingApi = new BingApi(account.cookie)
				const credits = await bingApi.getCredits()
				console.log(`${account.cookie.slice(0, 5)} credits are ${credits}`)

				// Emit a warning if an account has 0 credits
				if (credits === '0' && !isSlowMode) {
					socket.emit('warningToast', {
						warningMessage: `Account "${account.cookie.slice(0, 8)}"
          has ran out of credits. Expect delay in their results`,
					})
				}
				// Create the images
				const urls = await bingApi.createImages(prompt, isSlowMode, credits)
				allUrls.push(...urls)

				// Update the db with the new images
				await imagesRef.set(allUrls)
				console.log(`${account.cookie.slice(0, 5)} has generated ${urls.length} images`)
			} catch (errorMessage) {
				if (errorMessage === 'Invalid cookie') {
					// Show the first 8 letters of the cookie. add ".." if its longer than 8
					errorMessage = `"${account.cookie.slice(0, 8)}${
						account.cookie.length > 8 ? '..' : ''
					}" is an invalid cookie`
				}

				socket.emit('errorToast', { errorMessage })
			} finally {
				await accountRef.update({ isGenerating: false })
			}
		})

		Promise.all(requests)
			.then(() => {
				console.log('All accounts have finished generating')
			})
			.catch((error) => {
				console.log('error is ', error)
			})
	})
})

// Listen to port
server.listen(PORT, '0.0.0.0', () => {
	console.log(`Server is running on port ${PORT}`)
})
