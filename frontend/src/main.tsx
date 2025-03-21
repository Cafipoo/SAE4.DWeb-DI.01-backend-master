import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import ProtectedRoute from './components/ProtectedRoute'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    </BrowserRouter>
  </React.StrictMode>,
)
