import React from 'react'

function Images({ urls }) {
	return (
		<section>
			<div className="container-fluid px-0">
				<div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-xl-5 row-cols-xxl-6 justify-content-center">
					{urls?.map((url, index) => (
						<div key={index} className="col p-1">
							<img
								src={url}
								alt={url}
								className="img-fluid p-sm-1 m-0"
								onClick={() => window.open(url, '_blank')}
								style={{ cursor: 'pointer' }}
							/>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}

export default Images
