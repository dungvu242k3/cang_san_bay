import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Header from './Header'
import Sidebar from './Sidebar'
import TopNavBar from './TopNavBar'

function Layout({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Đang tải...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div>
      <Header />
      <TopNavBar />
      <div className="container">
        <Sidebar />
        <main className="main">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout

