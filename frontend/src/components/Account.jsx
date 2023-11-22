import React from 'react'

function Account({ cookie, timeTillExpire = '14 Days', removeAccount }) {
	return (
		<div className="d-flex align-items-center bg-secondary rounded my-3 py-1 px-2">
			<div className="col-6 text-truncate me-1">{cookie}</div>
			<div className="col-4 text-center">{}</div>
			<div className="col-2 justify-content-end d-flex">
				<i className="bi bi-x fs-4 me-1" style={{ cursor: 'pointer' }} onClick={() => removeAccount(cookie)}></i>
				{/* <i className="bi bi-pencil-square fs-5" style={{cursor: "pointer"}}></i> */}
			</div>
		</div>
	)
}

export default Account