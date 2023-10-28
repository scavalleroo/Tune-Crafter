import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './scss/style.scss'
import ReactGA from 'react-ga4';

const TRACKING_ID = "G-J108BT7PYF"; // OUR_TRACKING_ID
ReactGA.initialize(TRACKING_ID);


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
