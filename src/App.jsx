import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'
import { AuthProvider } from './contexts/AuthContext'

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Employees = lazy(() => import('./pages/Employees'))
const GradingPage = lazy(() => import('./pages/GradingPage'))
const Tasks = lazy(() => import('./pages/Tasks'))
const CalendarPage = lazy(() => import('./pages/Calendar'))
const LeavesPage = lazy(() => import('./pages/Leaves'))
const Organization = lazy(() => import('./pages/Organization'))
const SettingsPage = lazy(() => import('./pages/Settings'))
const Library = lazy(() => import('./pages/Library'))
const Reports = lazy(() => import('./pages/Reports'))
const UserManagement = lazy(() => import('./pages/UserManagement'))
const Login = lazy(() => import('./pages/Login'))
const Profile = lazy(() => import('./pages/Profile'))
const EmployeeImport = lazy(() => import('./pages/EmployeeImport'))
const TeamDiscussion = lazy(() => import('./pages/TeamDiscussion'))



function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/employees" element={<Employees />} />
                  <Route path="/cham-diem" element={<GradingPage />} />
                  <Route path="/cong-viec" element={<Tasks />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/leaves" element={<LeavesPage />} />
                  <Route path="/to-chuc" element={<Organization />} />
                  <Route path="/thu-vien" element={<Library />} />
                  <Route path="/bao-cao" element={<Reports />} />
                  <Route path="/quan-ly-nv" element={<UserManagement />} />
                  <Route path="/tai-khoan" element={<Profile />} />
                  <Route path="/import-nhan-vien" element={<EmployeeImport />} />
                  <Route path="/cai-dat" element={<SettingsPage />} />
                  <Route path="/thao-luan" element={<TeamDiscussion />} />
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
