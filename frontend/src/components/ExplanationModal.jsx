import React from 'react'

function ExplanationModal() {
	return (
		<div className="modal fade p-0 py-5" id="explanation-modal" tabIndex="-1">
			<div className="modal-dialog modal-dialog-scrollable modal-lg">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title fs-3">Adding an Account</h5>
						<button
							type="button"
							className="btn-close"
							data-bs-dismiss="modal"
							aria-label="Close"
						></button>
					</div>
					<div className="modal-body fs-5">
						<p className="fs-4 mb-4">
							Each account can be accessed by using a cookie. In order to add an account to Super
							Dalle-3, follow these steps:
						</p>

						<p>
							<strong>1. Obtain the `_U` Cookie:</strong>
						</p>
						<ul>
							<li>
								Log in to{' '}
								<a href="https://bing.com/create" target="_blank">
									Bing Image Creator
								</a>
							</li>
							<li>Right-click on the page and select "Inspect."</li>
							<li>Navigate to the "Applications" tab.</li>
							<li>
								Click on <strong>Cookies</strong>, then search and copy the value of the `_U`
								cookie.
							</li>
						</ul>

						<p>
							<strong>2. Add the Account:</strong>
						</p>
						<ul>
							<li>Click on the "Browse Accounts" button</li>
							<li>
								Paste the copied `_U` cookie inside the "Add Account" textbox and add the cookie to
								your accounts list
							</li>
						</ul>

						<p>
							<strong>3. Notes:</strong>
						</p>
						<ul>
							<li>
								Browsers: In different browsers, you may find it in different locations, such as the
								"Storage" tab instead.
							</li>
							<li>Expiration: Each cookie has a lifespan of 14 days.</li>
						</ul>
					</div>
					<div className="modal-footer">
						<button
							type="button"
							className="btn btn-primary"
							data-bs-dismiss="modal"
							data-bs-toggle="modal"
							data-bs-target="#accounts-modal"
						>
							Understood
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ExplanationModal
