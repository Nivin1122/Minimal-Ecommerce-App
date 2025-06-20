import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Login from './routes/Login'
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import Signup from './routes/Signup'
import Dashboard from './routes/Dashboard'
import PrivateRoute from './privateRoutes/PrivateRoute'



function App() {
  

  return (
    <>
        <Router>
          <Routes>
            <Route path='/login' element={<Login />}/>
            <Route path='/signup' element={<Signup />}/>
            <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }

        />
          </Routes>
        </Router>
    </>
  )
}

export default App
