import React, { useState } from 'react'
import Result from './Result'

function ResultsHistoryModal({ resultsHistory }) {
	// const userRef = ref(db, `users/${userUid}`)

	return (
		<>
			<div
				className="modal fade p-2 py-5"
				id="results-history-modal"
				tabIndex="-1"
				data-bs-backdrop="static"
			>
				<div className="modal-dialog modal-dialog-scrollable modal-lg">
					<div className="modal-content">
						<div className="modal-header">
							<h1 className="modal-title fs-3">Results History</h1>
							<button className="btn-close" data-bs-dismiss="modal"></button>
						</div>

						<div className="modal-body mb-3 px-3">
							<div className="row align-items-center">
								<div className="col-6 col-sm-7 ps-3 text-start fs-5">Prompt</div>
								<div className="col-3 fs-5 text-center px-0">Images Count</div>
							</div>

							{resultsHistory
								? resultsHistory.map((result, index) => {
										return (
											<Result
												key={index}
												prompt={result.prompt}
												exportId={result.exportId}
												imagesCount={result.imagesCount}
											/>
										)
								  })
								: null}
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default ResultsHistoryModal
