import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Header from './Header'
import Sidebar from './Sidebar'
import TopNavBar from './TopNavBar'

function Layout({ children }) {
  const { user, loading } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileMenuOpen])

  if (loading) {
    return <div>Đang tải...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div>
      <Header onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      <TopNavBar />
      <div className="container">
        <Sidebar 
          className={isMobileMenuOpen ? 'mobile-open' : ''} 
          onLinkClick={() => setIsMobileMenuOpen(false)}
        />
        {isMobileMenuOpen && (
          <div 
            className="mobile-overlay"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        <main className={`main ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout

