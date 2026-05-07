import { Routes, Route } from 'react-router-dom'
import { DataProvider }  from './context/DataContext'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider }  from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute    from './components/ProtectedRoute'
import Navbar  from './components/Navbar'
import Footer  from './components/Footer'
import Toast   from './components/Toast'
import Home    from './pages/Home'
import Login   from './pages/Login'
import Student from './pages/Student'
import Driver  from './pages/Driver'
import Messages from './pages/Messages'
import Returns from './pages/Returns'
import Admin   from './pages/Admin'

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <DataProvider>
        <ToastProvider>
          <Navbar />
          <main id="app">
            <Routes>
              <Route path="/"       element={<Home />} />
              <Route path="/login"  element={<Login />} />
              <Route path="/returns" element={<Returns />} />

              <Route path="/student" element={
                <ProtectedRoute roles={['etudiant']}>
                  <Student />
                </ProtectedRoute>
              } />

              <Route path="/driver" element={
                <ProtectedRoute roles={['chauffeur']}>
                  <Driver />
                </ProtectedRoute>
              } />

              <Route path="/messages" element={
                <ProtectedRoute roles={['etudiant', 'chauffeur']}>
                  <Messages />
                </ProtectedRoute>
              } />

              <Route path="/admin" element={
                <ProtectedRoute roles={['admin']}>
                  <Admin />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
          <Toast />
        </ToastProvider>
      </DataProvider>
    </AuthProvider>
    </ThemeProvider>
  )
}
