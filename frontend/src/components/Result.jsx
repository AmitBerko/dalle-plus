import React from 'react'
import { useNavigate } from 'react-router-dom'

function Result({prompt, exportId, imagesCount}) {
  const navigate = useNavigate()
  
  function handleViewResults() {
    navigate(`/export/${exportId}`)
  }

  return (
		<div className="d-flex align-items-center bg-secondary rounded my-3 py-1 px-2">
			<div className="col-6 col-sm-7 text-truncate me-1">{prompt}</div>
			<div className="col-3 text-center">{imagesCount}</div>
			<button
				className="col-3 col-sm-2 justify-content-center d-flex btn btn-primary"
				data-bs-dismiss="modal"
				onClick={handleViewResults}
			>
				View
			</button>
		</div>
	)
}

export default Result