import React from 'react'
import ReactDOM from 'react-dom/client'
import Authentication from './components/Authentication'
import { Provider } from 'react-redux'
import accountsReducer from './redux/accountsSlice'
import { configureStore } from '@reduxjs/toolkit'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './assets/styles.css'
import Homepage from './pages/Homepage'

const store = configureStore({
	reducer: {
		accounts: accountsReducer,
	},
})

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
	<React.StrictMode>
		<Provider store={store}>
			{/* <Homepage userUid={'zwC3U9vXq1dzDvGBM1exS4VwTzI3'} /> */}
			<Authentication />
		</Provider>
	</React.StrictMode>
)
