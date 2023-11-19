import React from 'react'
import ReactDOM from 'react-dom/client'
import Authentication from './components/Authentication'
import Homepage from './pages/Homepage';
import 'bootstrap-icons/font/bootstrap-icons.css'
import './assets/styles.css'


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Authentication />
    {/* <Homepage /> */}
  </React.StrictMode>
)