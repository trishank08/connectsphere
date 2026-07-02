import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import BottomNav from '../components/BottomNav'
import { SocketProvider } from '../context/SocketContext'

export default function AppLayout() {
  return (
    <SocketProvider>
      <div className="min-h-screen bg-bg">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
          <Sidebar />
          <main className="flex-1 min-w-0 pb-20 lg:pb-6">
            <Outlet />
          </main>
        </div>
        <BottomNav />
      </div>
    </SocketProvider>
  )
}
