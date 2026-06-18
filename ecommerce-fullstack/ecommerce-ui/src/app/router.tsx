import { AdminRoute } from '@/app/AdminRoute'
import { ProtectedRoute } from '@/app/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { ProfilePage } from '@/features/account/pages/ProfilePage'
import { SettingsPage } from '@/features/account/pages/SettingsPage'
import { AdminLayout } from '@/features/admin/components/AdminLayout'
import { FavoritesPage } from '@/features/favorites/pages/FavoritesPage'
import { OrderDetailPage } from '@/features/orders/pages/OrderDetailPage'
import { OrdersPage } from '@/features/orders/pages/OrdersPage'
import { ProductDetailPage } from '@/features/products/pages/ProductDetailPage'
import { ProductsPage } from '@/features/products/pages/ProductsPage'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { Suspense, lazy } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'

const AdminDashboardPage = lazy(() =>
  import('@/features/admin/pages/AdminDashboardPage').then((module) => ({
    default: module.AdminDashboardPage,
  })),
)
const AdminProductsPage = lazy(() =>
  import('@/features/admin/pages/AdminProductsPage').then((module) => ({
    default: module.AdminProductsPage,
  })),
)
const AdminUsersPage = lazy(() =>
  import('@/features/admin/pages/AdminUsersPage').then((module) => ({
    default: module.AdminUsersPage,
  })),
)
const AdminOrdersPage = lazy(() =>
  import('@/features/admin/pages/AdminOrdersPage').then((module) => ({
    default: module.AdminOrdersPage,
  })),
)
const AdminAssistantPage = lazy(() =>
  import('@/features/admin/pages/AdminAssistantPage').then((module) => ({
    default: module.AdminAssistantPage,
  })),
)

function AdminPageFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
      Carregando painel...
    </div>
  )
}

function withAdminSuspense(element: React.ReactNode) {
  return <Suspense fallback={<AdminPageFallback />}>{element}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'produtos', element: <ProductsPage /> },
      { path: 'favoritos', element: <FavoritesPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'conta/perfil', element: <ProfilePage /> },
          { path: 'conta/configuracoes', element: <SettingsPage /> },
          { path: 'pedidos', element: <OrdersPage /> },
          { path: 'pedidos/:id', element: <OrderDetailPage /> },
        ],
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          {
            path: 'dashboard',
            element: withAdminSuspense(<AdminDashboardPage />),
          },
          {
            path: 'produtos',
            element: withAdminSuspense(<AdminProductsPage />),
          },
          {
            path: 'usuarios',
            element: withAdminSuspense(<AdminUsersPage />),
          },
          {
            path: 'pedidos',
            element: withAdminSuspense(<AdminOrdersPage />),
          },
          {
            path: 'assistente',
            element: withAdminSuspense(<AdminAssistantPage />),
          },
        ],
      },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '*', element: <Navigate to="/" replace /> },
])
