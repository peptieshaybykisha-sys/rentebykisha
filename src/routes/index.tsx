import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'
import RequireAuth from './RequireAuth'

const Dresses = lazy(() => import('@/pages/Dresses'))
const DressDetails = lazy(() => import('@/pages/DressDetails'))
const Collections = lazy(() => import('@/pages/Collections'))
const Cart = lazy(() => import('@/pages/Cart'))
const Checkout = lazy(() => import('@/pages/Checkout'))
const Confirmation = lazy(() => import('@/pages/Confirmation'))
const Login = lazy(() => import('@/pages/Login'))
const ForgotPassword = lazy(() => import('@/pages/Login/ForgotPassword'))
const Register = lazy(() => import('@/pages/Register'))
const Account = lazy(() => import('@/pages/Account'))
const Rentals = lazy(() => import('@/pages/Rentals'))
const RentalDetail = lazy(() => import('@/pages/Rentals/RentalDetail'))
const Wishlist = lazy(() => import('@/pages/Wishlist'))
const Fitting = lazy(() => import('@/pages/Fitting'))
const HowItWorks = lazy(() => import('@/pages/HowItWorks'))
const NotFound = lazy(() => import('@/pages/NotFound'))

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="dresses" element={<Dresses />} />
        <Route path="dresses/:id" element={<DressDetails />} />
        <Route path="collections" element={<Collections />} />
        <Route path="cart" element={<Cart />} />
        <Route path="wishlist" element={<Wishlist />} />
        <Route path="fitting" element={<Fitting />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="register" element={<Register />} />
        <Route element={<RequireAuth />}>
          <Route path="checkout" element={<Checkout />} />
          <Route path="confirmation/:id" element={<Confirmation />} />
          <Route path="account" element={<Account />} />
          <Route path="rentals" element={<Rentals />} />
          <Route path="rentals/:id" element={<RentalDetail />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
