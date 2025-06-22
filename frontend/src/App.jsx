import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
// import Login from './routes/Login'
import Login from './userscomponents/auth/Login'
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import Signup from './userscomponents/auth/Signup'
import Dashboard from './userscomponents/pages/Dashboard'
import PrivateRoute from './privateRoutes/PrivateRoute'
// import AdminLogin from './admincomponents/AdminLogin'
import AdminLogin from './admincomponents/auth/AdminLogin'
import AdminDashboard from './admincomponents/pages/AdminDashboard'
import AdminPrivateRoute from './privateRoutes/AdminPrivateRoute'
import AdminAddProduct from './admincomponents/products/AdminAddProduct'
import AdminProductList from './admincomponents/products/AdminProductList'
import AdminEditProduct from './admincomponents/products/AdminEditProduct'
import UserProductList from './userscomponents/products/UserProductList'
import UserCart from './userscomponents/products/UserCart'
import UserAddress from './userscomponents/products/UserAddress'


function App() {

  return (
    <>
        <Router>
          <Routes>
            {/* users */}
            <Route path='/login' element={<Login />}/>
            <Route path='/signup' element={<Signup />}/>
            <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
            }/>
            <Route path="/products"element={
              <PrivateRoute>
                <UserProductList />
              </PrivateRoute>
            }/>

            <Route path="/cart" element={
              <PrivateRoute>
                <UserCart />
              </PrivateRoute>
            }/>

            
            <Route path="/user/addresses" element={
              <PrivateRoute>
                <UserAddress />
              </PrivateRoute>
              }/>
      

            {/* admin */}
            <Route path='admin/login' element={<AdminLogin />}/>
            <Route path="/admin/dashboard" element={
              <AdminPrivateRoute>
                <AdminDashboard />
              </AdminPrivateRoute>
            }/>

            <Route path="/admin/add-product" element={
              <AdminPrivateRoute>
                <AdminAddProduct />
              </AdminPrivateRoute>
            }/>

            <Route path="/admin/products" element={
                <AdminPrivateRoute>
                  <AdminProductList />
                </AdminPrivateRoute>
              }/>

            <Route path="/admin/products/edit/:id" element={
                <AdminPrivateRoute>
                  <AdminEditProduct />
                </AdminPrivateRoute>
              }/>
        
          </Routes>
        </Router>
    </>
  )
}

export default App