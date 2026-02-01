import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'
import { AuthProvider } from './contexts/AuthContext'

// Lazy load pages
const Employees = lazy(() => import('./pages/Employees'))
const GradingPage = lazy(() => import('./pages/GradingPage'))
const Tasks = lazy(() => import('./pages/Tasks'))
const CalendarPage = lazy(() => import('./pages/Calendar'))
const LeavesPage = lazy(() => import('./pages/Leaves'))
const Organization = lazy(() => import('./pages/Organization'))
const SettingsPage = lazy(() => import('./pages/Settings'))



function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/employees" replace />} />
                  <Route path="/employees" element={<Employees />} />
                  <Route path="/cham-diem" element={<GradingPage />} />
                  <Route path="/cong-viec" element={<Tasks />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/leaves" element={<LeavesPage />} />
                  <Route path="/to-chuc" element={<Organization />} />
                  <Route path="/cai-dat" element={<SettingsPage />} />


                </Routes>
              </Layout>
            } />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
