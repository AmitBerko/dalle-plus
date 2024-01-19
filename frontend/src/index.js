import React from 'react'
import ReactDOM from 'react-dom/client'
import Authentication from './components/Authentication'
import ResultsPage from './pages/ResultsPage'
import { Provider } from 'react-redux'
import accountsReducer from './redux/accountsSlice'
import { configureStore } from '@reduxjs/toolkit'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './assets/styles.css'

const store = configureStore({
	reducer: {
		accounts: accountsReducer,
	},
})

const router = createBrowserRouter([
	{
		path: '/',
		element: <Authentication />,
	},
	{
		path: '/export/:exportId',
		element: <ResultsPage />,
	},
])

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
	<React.StrictMode>
		<Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
	</React.StrictMode>
)
