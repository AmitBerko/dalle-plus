import React from 'react'

function Account({ cookie, timeTillExpire = 'testing', removeAccount }) {
	return (
		<div className="d-flex align-items-center bg-secondary rounded my-2 py-1">
			<div className="col-6 text-truncate">{cookie}</div>
			<div className="col-4 text-center">{timeTillExpire}</div>
			<div className="col-2 justify-content-end d-flex">
				<i className="bi bi-x fs-4" style={{ cursor: 'pointer' }} onClick={() => removeAccount(cookie)}></i>
				{/* <i className="bi bi-pencil-square fs-5" style={{cursor: "pointer"}}></i> */}
			</div>
		</div>
	)
}

export default Account
