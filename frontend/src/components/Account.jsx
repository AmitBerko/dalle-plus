import React from 'react'

function Account({ cookie, timeTillExpire, handleRemoveAccount }) {
	return (
		<div className="d-flex align-items-center bg-secondary rounded my-3 py-1 px-2">
			<div className="col-6 text-truncate me-1">{cookie}</div>
			<div className="col-4 text-center">{timeTillExpire}</div>
			<div className="col-2 justify-content-end d-flex">
				<i
					className="bi bi-x fs-4 me-1"
					style={{ cursor: 'pointer' }}
					onClick={() => handleRemoveAccount(cookie)}
				></i>
			</div>
		</div>
	)
}

export default Account
