import React, { useState } from 'react'
import axios from 'axios'
import { accounts, apiServer } from '../accounts'

function Homepage() {
	const [urlArray, setUrlArray] = useState([])
	const [prompt, setPrompt] = useState('')

	    const handleGenerate = () => {
				if (!prompt) return
				setUrlArray([])
				accounts.forEach((account) => {
					axios
						.post(`${apiServer}/generate-images`, { prompt, account })
						.then((response) => {
							console.log(`Image generation started for ${account.auth_cookie.slice(0, 5)}`)
              let newUrls = response.data[account.auth_cookie]
              console.log(newUrls)
              if (!newUrls || newUrls === undefined) {
                console.log('returning - going outside the function')
                return
              }
								setUrlArray((prevUrlArray) => [...prevUrlArray, ...response.data[account.auth_cookie]])
						})
						.catch((error) => {
							console.error(`Error for ${account.auth_cookie.slice(0, 5)}: ${error}`)
						})
				})
			}

			// useEffect(() => {
			// 	const eventSource = new EventSource(`${apiServer}/sse`)

			// 	eventSource.onmessage = (event) => {
			// 		const data = JSON.parse(event.data)
			// 		if (data.links && data.links.length > 0) {
			// 			setUrlArray((prevUrlArray) => {
			// 				// Use a Set to ensure uniqueness
			// 				const uniqueUrls = new Set([...prevUrlArray, ...data.links])
			// 				return Array.from(uniqueUrls)
			// 			})
			// 		} else {
			// 			console.error('data.links is not iterable:', data.links)
			// 		}
			// 	}

			// 	return () => {
			// 		eventSource.close()
			// 	}
			// }, [])

	// const socket = io('http://127.0.0.1:8080', {
	// 	transports: ['websocket'], // Specify the transport
	// 	upgrade: false, // Set upgrade to false to prevent WebSocket issues
	// 	reconnection: true, // Enable reconnection if the connection is dropped
	// })
	//////////////
	// const [urlArray, setUrlArray] = useState([])
	// const [prompt, setPrompt] = useState('')

	// const socket = io('127.0.0.1:8080', {
	// 	transports: ['websocket'],
	// 	upgrade: false,
	// 	reconnection: true,
	// 	readyState: 1,
	// })

	// useEffect(() => {
	// 	const handleImageUrls = (data) => {
	// 		console.log(data)
	// 		setUrlArray((prevUrlsArray) => [...prevUrlsArray, ...data.links])
	// 	}

	// 	socket.on('image_urls', handleImageUrls)

	// 	return () => {
	// 		socket.off('image_urls', handleImageUrls)
	// 	}
	// }, [socket])

	// const handleGenerate = () => {
	// 	if (prompt === '' || prompt === undefined) return

	// 	setUrlArray([])
	// 	socket.emit('generate-images', { prompt })

	// 	// Close the socket here
	// 	socket.disconnect()
	// }

	// const [urlArray, setUrlArray] = useState([])
	// const [prompt, setPrompt] = useState('')

	// const handleGenerate = async () => {
	// 	if (prompt === '' || prompt === undefined) return

	// 	// Clear the current URLs
	// 	setUrlArray([])

	// 	try {
	// 		// Send a request to the server to generate images using Axios
	// 		const response = await axios.get(`http://127.0.0.1:8080/get-images`, {
	// 			params: { prompt }, // Pass the prompt as a query parameter
	// 		})

	// 		if (response.status === 200) {
	// 			const data = response.data
	// 			console.log('Received data from server:', data)

	// 			if (data && data.links) {
	// 				console.log('Updating urlArray with', data.links)
	// 				setUrlArray(data.links)
	// 			}
	// 		} else {
	// 			console.error('Failed to retrieve images')
	// 		}
	// 	} catch (error) {
	// 		console.error('An error occurred while fetching images:', error)
	// 	}
	// }

	return (
		<>
			{/* Title and prompt section */}
			<section className="p-3 p-lg-4 px-lg-5">
				<h1 className="text-center mb-3 display-5 fw-bold">Image Creator</h1>
				<div className="container-fluid">
					<div className="row">
						<div className="col-12">
							<div className="input-group">
								<input
									maxLength="480"
									type="text"
									value={prompt}
									onChange={(event) => setPrompt(event.target.value)}
									className="form-control fs-6 d-none d-sm-block"
								></input>
								<textarea
									maxLength="480"
									type="text"
									value={prompt}
									onChange={(event) => setPrompt(event.target.value)}
									className="form-control fs-6 d-sm-none"
									rows="3"
								></textarea>
								<button onClick={handleGenerate} className="btn btn-primary btn-lg d-none d-sm-inline">
									Generate
								</button>
							</div>
						</div>
						<div className="col-12 mt-2 mt-lg-0">
							<button onClick={handleGenerate} className="btn btn-primary btn-lg w-100 d-sm-none">
								Generate
							</button>
						</div>
					</div>
				</div>
			</section>

			{/* Result images section */}
			<section>
				<div className="container-fluid px-2 px-md-5">
					<div className="row d-flex justify-content-center p">
						{urlArray.map((url, index) => {
							// Try maybe to use <a> instead
							return (
								<img
									key={index}
									src={url}
									alt={url}
									className="img-fluid generated-image px-3 mb-3 p-sm-2 mb-sm-0"
									onClick={() => window.open(url, '_blank')}
									style={{ cursor: 'pointer' }}
								/>
							)
						})}
					</div>
				</div>
			</section>
		</>
	)
}

export default Homepage
