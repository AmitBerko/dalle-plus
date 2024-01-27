import { ref, get } from 'firebase/database'
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db } from '../firebaseConfig'
import toastr from '../toastrConfig'
import Images from '../components/Images'
import JSZip from 'jszip'

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

	function handleCopy() {
		navigator.clipboard.writeText(prompt)
		toastr.success('Prompt has been copied', 'Success')
	}

	async function handleDownload() {
    if (!images) return // Just incase
		const zip = new JSZip()

    const downloads = images.map(async (imageUrl, index) => {
      try {
        const image = await fetch(imageUrl)
        const imageBlob = await image.blob()
        zip.file(`image_${index + 1}.jpg`, imageBlob)

      } catch (error) {
        console.log(`Error downloading the images: `, error)
      }
    })

		await Promise.all(downloads)

		const content = await zip.generateAsync({ type: 'blob' })
		const zipURL = URL.createObjectURL(content)

		const link = document.createElement('a')
		link.href = zipURL
		link.download = 'images.zip' // Might change the name later
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
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
							<div className="col-12 col-lg-12 my-2">
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

						<div className="row d-flex justify-content-center my-2">
							<div className="col-12 col-md-6">
								<button className="btn btn-success w-100 mb-2 mb-md-0" onClick={handleCopy}>
									Copy Prompt
								</button>
							</div>

							<div className="col-12 col-md-6 order-md-first">
								<button className="btn btn-danger w-100" onClick={handleDownload}>
									Download All As Zip
								</button>
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
