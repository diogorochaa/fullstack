import { OrderNotification } from '@/components/layout/OrderNotification'
import { ChatWidget } from '@/features/assistant/components/ChatWidget'
import { CartFeedback } from '@/features/cart/components/CartFeedback'
import { CartSidebar } from '@/features/cart/components/CartSidebar'
import { Footer } from '@/features/home/components/Footer'
import { Header } from '@/features/home/components/Header'
import { TopBar } from '@/features/home/components/TopBar'
import { Outlet } from 'react-router-dom'

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <Header />
      <OrderNotification />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
      <CartFeedback />
      <CartSidebar />
    </div>
  )
}
