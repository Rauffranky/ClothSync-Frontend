import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "../Components/Layout/Dashboard";
import LandingLayout from "../Components/Layout/Landing";
import PermissionRoute from "./PermissionRoute";

// ============================================================================
// LAZY LOADED PAGES
// ============================================================================

const HomePage = lazy(() => import("../Page/Landing/HomePage"));
const AuthPage = lazy(() => import("../Page/Auth/AuthPage"));
const StaffEmailVerificationPage = lazy(() => import("../Page/Auth/StaffEmailVerificationPage"));
const LaundryStaffEmailVerificationPage = lazy(() => import("../Page/Auth/LaundryStaffEmailVerificationPage"));
const LaundryInvitationPage = lazy(() => import("../Page/Auth/LaundryInvitationPage"));
const SuperAdminLoginPage = lazy(() => import("../Page/Auth/SuperAdminLoginPage"));
const NotFoundPage = lazy(() => import("../Page/Common/NotFoundPage"));

// Portal Dashboard Pages
const SuperAdminDashboard = lazy(() => import("../Page/Dashboard/SuperAdmin/DashboardPage"));
const TenantDashboard = lazy(() => import("../Page/Dashboard/Tenant/DashboardPage"));
const LinkedLaundriesPage = lazy(() => import("../Page/Dashboard/Tenant/LinkedLaundriesPage"));
const LinkedLaundryDetailsPage = lazy(() => import("../Page/Dashboard/Tenant/LinkedLaundryDetailsPage"));
const CategoriesPage = lazy(() => import("../Page/Dashboard/Tenant/CategoriesPage"));
const CategoryDetailsPage = lazy(() => import("../Page/Dashboard/Tenant/CategoryDetailsPage"));
const LaundryDashboard = lazy(() => import("../Page/Dashboard/Laundry/DashboardPage"));
const LaundryLinkedBusinessesPage = lazy(() => import("../Page/Dashboard/Laundry/LinkedBusinessesPage"));
const LaundryLinkedBusinessDetailsPage = lazy(() => import("../Page/Dashboard/Laundry/LinkedBusinessDetailsPage"));
const LaundryStaffPage = lazy(() => import("../Page/Dashboard/Laundry/StaffPage"));
const LaundryStaffRolesPage = lazy(() => import("../Page/Dashboard/Laundry/StaffRolesPage"));
const LaundrySettingsPage = lazy(() => import("../Page/Dashboard/Laundry/SettingsPage"));

//Tenant 
const AssetsPage = lazy(() => import("../Page/Dashboard/Tenant/AssetsPage"));
const AssetDetailsPage = lazy(() => import("../Page/Dashboard/Tenant/AssetDetailsPage"));
const ScannersPage = lazy(() => import("../Page/Dashboard/Tenant/ScannersPage"));
const ScannerWarningsPage = lazy(() => import("../Page/Dashboard/Tenant/ScannerWarningsPage"));
const ScannerDetailsPage = lazy(() => import("../Page/Dashboard/Tenant/ScannerDetailsPage"));
const StaffPage = lazy(() => import("../Page/Dashboard/Tenant/StaffPage"));
const StaffRolesPage = lazy(() => import("../Page/Dashboard/Tenant/StaffRolesPage"));
const TagsPage = lazy(() => import("../Page/Dashboard/Tenant/TagsPage"));
const TagDetailsPage = lazy(() => import("../Page/Dashboard/Tenant/TagDetailsPage"));
const SettingsPage = lazy(() => import("../Page/Dashboard/Tenant/SettingsPage"));
const ReportAnalyticsPage = lazy(() => import("../Page/Dashboard/Tenant/Report&AnalyticsPage"));

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
        <Route path="/business/staff/verify-email" element={<StaffEmailVerificationPage />} />
        <Route path="/laundry/login" element={<AuthPage defaultMode="login" defaultRole="laundry" />} />
        <Route path="/laundry/signup" element={<AuthPage defaultMode="signup" defaultRole="laundry" />} />
        <Route path="/laundry/staff/verify-email" element={<LaundryStaffEmailVerificationPage />} />
        <Route path="/laundry/invite" element={<LaundryInvitationPage />} />
        <Route path="/laundry/handle-invite" element={<LaundryInvitationPage />} />

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
          <Route path="/business/linked-laundries/:id" element={<LinkedLaundryDetailsPage />} />
          <Route path="/business/categories" element={<CategoriesPage />} />
          <Route path="/business/categories/:id" element={<CategoryDetailsPage />} />
          <Route path="/business/assets" element={<AssetsPage />} />
          <Route path="/business/assets/:id" element={<AssetDetailsPage />} />
          <Route path="/business/scanners" element={<ScannersPage />} />
          <Route path="/business/scanners/warnings" element={<ScannerWarningsPage />} />
          <Route path="/business/scanners/:id" element={<ScannerDetailsPage />} />
          <Route path="/business/staff" element={<StaffPage />} />
          <Route path="/business/staff-roles" element={<StaffRolesPage />} />
          <Route path="/business/tags" element={<TagsPage />} />
          <Route path="/business/tags/:id" element={<TagDetailsPage />} />
          <Route path="/business/settings" element={<SettingsPage />} />
          <Route path="/business/reports-analytics" element={<ReportAnalyticsPage />} />

          {/* Laundry Portal */}
          <Route path="/laundry" element={<Navigate to="/laundry/dashboard" replace />} />
          <Route
            path="/laundry/dashboard"
            element={
              <PermissionRoute permissionKey="dashboard">
                <LaundryDashboard />
              </PermissionRoute>
            }
          />
          <Route
            path="/laundry/linked-businesses"
            element={
              <PermissionRoute permissionKey="linked_tenants">
                <LaundryLinkedBusinessesPage />
              </PermissionRoute>
            }
          />
          <Route
            path="/laundry/linked-businesses/:id"
            element={
              <PermissionRoute permissionKey="linked_tenants">
                <LaundryLinkedBusinessDetailsPage />
              </PermissionRoute>
            }
          />
          <Route
            path="/laundry/staff"
            element={
              <PermissionRoute permissionKey="staff">
                <LaundryStaffPage />
              </PermissionRoute>
            }
          />
          <Route
            path="/laundry/staff-roles"
            element={
              <PermissionRoute permissionKey="staff">
                <LaundryStaffRolesPage />
              </PermissionRoute>
            }
          />
          <Route
            path="/laundry/settings"
            element={
              <PermissionRoute permissionKey="settings">
                <LaundrySettingsPage />
              </PermissionRoute>
            }
          />
        </Route>

        {/* Error Routes */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
