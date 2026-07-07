import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "../Components/Layout/Dashboard";
import LandingLayout from "../Components/Layout/Landing";

// ============================================================================
// LAZY LOADED PAGES
// ============================================================================

const HomePage = lazy(() => import("../Page/Landing/HomePage"));
const AuthPage = lazy(() => import("../Page/Auth/AuthPage"));
const SuperAdminLoginPage = lazy(() => import("../Page/Auth/SuperAdminLoginPage"));
const NotFoundPage = lazy(() => import("../Page/Common/NotFoundPage"));

// Portal Dashboard Pages
const SuperAdminDashboard = lazy(() => import("../Page/Dashboard/SuperAdmin/DashboardPage"));
const TenantDashboard = lazy(() => import("../Page/Dashboard/Tenant/DashboardPage"));
const LinkedLaundriesPage = lazy(() => import("../Page/Dashboard/Tenant/LinkedLaundriesPage"));
const CategoriesPage = lazy(() => import("../Page/Dashboard/Tenant/CategoriesPage"));
const LaundryDashboard = lazy(() => import("../Page/Dashboard/Laundry/DashboardPage"));

//Tenant 
const AssetsPage = lazy(() => import("../Page/Dashboard/Tenant/AssetsPage"));
const AssetDetailsPage = lazy(() => import("../Page/Dashboard/Tenant/AssetDetailsPage"));
const ScannersPage = lazy(() => import("../Page/Dashboard/Tenant/ScannersPage"));

// ============================================================================
// ROUTE CONFIGURATION
// ============================================================================

const AppRoutes = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        {/* Auth Routes without landing header/footer */}
        <Route path="/login" element={<Navigate to="/business/login" replace />} />
        <Route path="/signup" element={<Navigate to="/business/signup" replace />} />
        <Route path="/superadmin/login" element={<SuperAdminLoginPage />} />
        <Route path="/business/login" element={<AuthPage defaultMode="login" defaultRole="business" />} />
        <Route path="/business/signup" element={<AuthPage defaultMode="signup" defaultRole="business" />} />
        <Route path="/laundry/login" element={<AuthPage defaultMode="login" defaultRole="laundry" />} />
        <Route path="/laundry/signup" element={<AuthPage defaultMode="signup" defaultRole="laundry" />} />

        {/* Landing Routes */}
        <Route element={<LandingLayout />} path="/">
          <Route index element={<HomePage />} />
        </Route>

        {/* Portal Routes with DashboardLayout */}
        <Route element={<DashboardLayout />}>
          {/* Default redirect to superadmin dashboard */}
          <Route
            path="/"
            element={<Navigate to="/superadmin/dashboard" replace />}
          />

          {/* Super Admin Portal */}
          <Route path="/superadmin" element={<Navigate to="/superadmin/dashboard" replace />} />
          <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />

          {/* Business/Tenant Portal */}
          <Route path="/business" element={<Navigate to="/business/dashboard" replace />} />
          <Route path="/business/dashboard" element={<TenantDashboard />} />
          <Route path="/business/linked-laundries" element={<LinkedLaundriesPage />} />
          <Route path="/business/categories" element={<CategoriesPage />} />
          <Route path="/business/assets" element={<AssetsPage />} />
          <Route path="/business/assets/:id" element={<AssetDetailsPage />} />
          <Route path="/business/scanners" element={<ScannersPage />} />

          {/* Laundry Portal */}
          <Route path="/laundry" element={<Navigate to="/laundry/dashboard" replace />} />
          <Route path="/laundry/dashboard" element={<LaundryDashboard />} />
        </Route>

        {/* Error Routes */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
