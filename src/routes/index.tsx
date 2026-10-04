import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'
import { AdminLayout, RequireAdmin } from '@/components/admin/AdminShell'
import RequireAuth from './RequireAuth'

const Dresses = lazy(() => import('@/pages/Dresses'))
const DressDetails = lazy(() => import('@/pages/DressDetails'))
const Collections = lazy(() => import('@/pages/Collections'))
const Cart = lazy(() => import('@/pages/Cart'))
const Checkout = lazy(() => import('@/pages/Checkout'))
const Confirmation = lazy(() => import('@/pages/Confirmation'))
const Login = lazy(() => import('@/pages/Login'))
const ForgotPassword = lazy(() => import('@/pages/Login/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/Login/ResetPassword'))
const Register = lazy(() => import('@/pages/Register'))
const Account = lazy(() => import('@/pages/Account'))
const Rentals = lazy(() => import('@/pages/Rentals'))
const RentalDetail = lazy(() => import('@/pages/Rentals/RentalDetail'))
const Wishlist = lazy(() => import('@/pages/Wishlist'))
const Fitting = lazy(() => import('@/pages/Fitting'))
const HowItWorks = lazy(() => import('@/pages/HowItWorks'))
const AdminRentals = lazy(() => import('@/pages/Admin/AdminRentals'))
const AdminRentalDetail = lazy(() => import('@/pages/Admin/AdminRentalDetail'))
const AdminFittings = lazy(() => import('@/pages/Admin/AdminFittings'))
const AdminUsers = lazy(() => import('@/pages/Admin/AdminUsers'))
const DressList = lazy(() => import('@/pages/Admin/DressList'))
const DressForm = lazy(() => import('@/pages/Admin/DressForm'))
const SizeGuideEditor = lazy(() => import('@/pages/Admin/SettingEditors').then((m) => ({ default: m.SizeGuideEditor })))
const HeroEditor = lazy(() => import('@/pages/Admin/SettingEditors').then((m) => ({ default: m.HeroEditor })))
const HowItWorksEditor = lazy(() => import('@/pages/Admin/SettingEditors').then((m) => ({ default: m.HowItWorksEditor })))
const NotFound = lazy(() => import('@/pages/NotFound'))

export default function AppRoutes() {
  return (
    <Suspense fallback={null}>
    <Routes>
      <Route path="admin" element={<RequireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminRentals />} />
          <Route path="rentals/:id" element={<AdminRentalDetail />} />
          <Route path="dresses" element={<DressList />} />
          <Route path="fittings" element={<AdminFittings />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="dresses/:id" element={<DressForm />} />
          <Route path="hero" element={<HeroEditor />} />
          <Route path="size-guide" element={<SizeGuideEditor />} />
          <Route path="how-it-works" element={<HowItWorksEditor />} />
        </Route>
      </Route>
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
        <Route path="reset-password" element={<ResetPassword />} />
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
    </Suspense>
  )
}
