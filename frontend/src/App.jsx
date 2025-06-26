import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
// import Login from './routes/Login'
import Login from './userscomponents/auth/Login'
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'
import Signup from './userscomponents/auth/Signup'
import Dashboard from './userscomponents/pages/Dashboard'
import HomePage from './userscomponents/pages/HomePage'
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
import UserAddress from './userscomponents/orders/UserAddress'
import UserCheckout from './userscomponents/orders/UserCheckout'
import UserOrders from './userscomponents/orders/UserOrders'
import PaymentResult from './userscomponents/orders/PaymentResult'
import AdminAddCategory from './admincomponents/category/AdminAddCategory'
import AdminCategoryList from './admincomponents/category/AdminCategoryList'
import AdminEditCategory from './admincomponents/category/AdminEditCategory'
import AdminOrders from './admincomponents/orders/AdminOrders'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Navbar from './userscomponents/pages/Navbar'
import AdminLayout from './admincomponents/layout/AdminLayout'      
import UserProductDetail from './userscomponents/products/UserProductDetail'


// Layout component for user pages with navbar
const UserLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        {children}
      </main>
    </div>
  );
};

function App() {

  return (
    <>
      <GoogleOAuthProvider clientId="894699383557-mklh0dl7fdhu5sbqffcj6oqkuklseef0.apps.googleusercontent.com">
        <Router>
          <Routes>
            {/* users */}
            <Route path='/login' element={<Login />}/>
            <Route path='/signup' element={<Signup />}/>
            <Route path="/" element={
            <PrivateRoute>
              <UserLayout>
                <HomePage />
              </UserLayout>
            </PrivateRoute>
            }/>
            <Route path="/products/:id" element={<UserProductDetail />} />
            <Route path="/dashboard" element={
            <PrivateRoute>
              <UserLayout>
                <Dashboard />
              </UserLayout>
            </PrivateRoute>
            }/>
            <Route path="/products"element={
              <PrivateRoute>
                <UserLayout>
                  <UserProductList />
                </UserLayout>
              </PrivateRoute>
            }/>

            <Route path="/cart" element={
              <PrivateRoute>
                <UserLayout>
                  <UserCart />
                </UserLayout>
              </PrivateRoute>
            }/>

            
            <Route path="/user/addresses" element={
              <PrivateRoute>
                <UserLayout>
                  <UserAddress />
                </UserLayout>
              </PrivateRoute>
              }/>

            <Route path="/user/checkout" element={
              <PrivateRoute>
                <UserLayout>
                  <UserCheckout />
                </UserLayout>
              </PrivateRoute>
              } />

            <Route path="/user/orders" element={
              <PrivateRoute>
                <UserLayout>
                  <UserOrders />
                </UserLayout>
              </PrivateRoute>
              }/>
            
            <Route path="/payment-result" element={
              <PrivateRoute>
                <UserLayout>
                  <PaymentResult />
                </UserLayout>
              </PrivateRoute>
            }/>

            <Route path="/payment-success" element={<PaymentResult  />} />
            <Route path="/payment-cancel" element={<PaymentResult />} />



            {/* admin */}
            <Route path='admin/login' element={<AdminLogin />}/>
            <Route path="/admin/dashboard" element={
              <AdminPrivateRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </AdminPrivateRoute>
            }/>

            <Route path="/admin/add-product" element={
              <AdminPrivateRoute>
                <AdminLayout>
                  <AdminAddProduct />
                </AdminLayout>
              </AdminPrivateRoute>
            }/>

            <Route path="/admin/products" element={
              <AdminPrivateRoute>
                <AdminLayout>
                  <AdminProductList />
                </AdminLayout>
              </AdminPrivateRoute>
            }/>

            <Route path="/admin/products/edit/:id" element={
              <AdminPrivateRoute>
                <AdminLayout>
                  <AdminEditProduct />
                </AdminLayout>
              </AdminPrivateRoute>
            }/>

            <Route path="/admin/add-category" element={
              <AdminPrivateRoute>
                <AdminLayout>
                  <AdminAddCategory />
                </AdminLayout>
              </AdminPrivateRoute>
            }/>

            <Route path="/admin/category/list" element={
              <AdminPrivateRoute>
                <AdminLayout>
                  <AdminCategoryList />
                </AdminLayout>
              </AdminPrivateRoute>
            }/>
        
            <Route path="/admin/category/edit/:id" element={
              <AdminPrivateRoute>
                <AdminLayout>
                  <AdminEditCategory />
                </AdminLayout>
              </AdminPrivateRoute>
            }/>

              <Route path="/admin/orders" element={
                <AdminPrivateRoute>
                  <AdminLayout>
                    <AdminOrders />
                  </AdminLayout>
                </AdminPrivateRoute>
                }/>


          </Routes>
        </Router>
        </GoogleOAuthProvider>
    </>
  )
}

export default App