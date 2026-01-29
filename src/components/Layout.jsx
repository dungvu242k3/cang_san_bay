import Header from './Header'
import Sidebar from './Sidebar'
import TopNavBar from './TopNavBar'

function Layout({ children }) {
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

