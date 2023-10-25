import React, { useEffect, useState } from 'react'
import axios from 'axios'

function Homepage() {
	const [urlArray, setUrlArray] = useState([])

	const [prompt, setPrompt] = useState('')

      useEffect(() => {
				const eventSource = new EventSource('https://amit-flask-app-fd7c608866ab.herokuapp.com/sse')
				eventSource.onmessage = (event) => {
					const data = JSON.parse(event.data)
					setUrlArray((prevUrlArray) => [...prevUrlArray, ...data.links])
				}

				return () => {
					eventSource.close()
				}
			}, [])

    const handleGenerate = () => {
      setUrlArray([])
			axios
				.post('https://amit-flask-app-fd7c608866ab.herokuapp.com/generate-images', { prompt })
				.then(() => {
					console.log('Image generation started')
				})
				.catch((error) => {
					console.error(`Error: ${error}`)
				})
		}

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
									type="text"
									value={prompt}
									onChange={(event) => setPrompt(event.target.value)}
									className="form-control fs-6 d-none d-sm-block"
								></input>
								<textarea
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
							<button className="btn btn-primary btn-lg w-100 d-sm-none">Generate</button>
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
