import { ref, get } from 'firebase/database'
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db } from '../firebaseConfig'
import Images from '../components/Images'

function ResultsPage() {
	const { exportId } = useParams()
	const [images, setImages] = useState([])
	const [doesExist, setDoesExist] = useState(true)
	const [prompt, setPrompt] = useState('')
  const [hasLoaded, setHasLoaded] = useState(false)
	const navigate = useNavigate()

	useEffect(() => {
		const fetchImages = async () => {
			try {
				const snapshot = await get(ref(db, `exportedResults/${exportId}`))
				if (!snapshot.exists) {
					throw "Url doesn't exist"
				}
				const { prompt, urls } = await snapshot.val()
				setPrompt(prompt)
				setImages(urls)
        setHasLoaded(true)
			} catch (error) {
				console.log(`error getting exported images: `, error)
				setDoesExist(false)
			}
		}

		fetchImages()
	}, [exportId])

	function goHomepage() {
		navigate('/')
	}

	return (
		<>
			{doesExist ? (
				hasLoaded ? (
					<section className="container-fluid p-3 pt-0 p-md-4 pt-md-0 px-lg-5 pb-2 pb-lg-3">
						<div className="row mb-1 mb-lg-2 position-relative">
							<p className="col-12 fs-5 position-absolute mt-2 mt-sm-3">
								<a style={{ cursor: 'pointer', color: 'lightblue' }} onClick={goHomepage}>
									Homepage
								</a>
							</p>
							<h1 className="text-center display-4 fw-bold mx-auto pt-3 pt-sm-4 mt-4 mt-md-2 col-12">
								Results for the prompt:
							</h1>
						</div>
						<div className="row justify-content-center mt-2">
							<div className="col-12 col-lg-10 my-2">
								<input
									disabled
									readOnly
									maxLength="480"
									type="text"
									value={prompt}
									className="form-control fs-5 d-none d-sm-block"
								></input>
								<textarea
									disabled
									maxLength="480"
									type="text"
									value={prompt}
									className="form-control fs-5 d-sm-none"
									rows="3"
								></textarea>
							</div>
						</div>
            
						<Images urls={images} />
					</section>
				) : (
					// Display loading spinner if data hasn't loaded yet
					<div className="loading-spinner-container">
						<div className="spinner-border loading-spinner">
							<span className="visually-hidden">Loading...</span>
						</div>
					</div>
				)
			) : (
				<div>Page not found</div>
			)}
		</>
	)
}

export default ResultsPage
