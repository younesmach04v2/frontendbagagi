import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bagagi_user")) } catch { return null }
  })

  function login(userData, token) {
    localStorage.setItem("bagagi_token", token)
    localStorage.setItem("bagagi_user",  JSON.stringify(userData))
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem("bagagi_token")
    localStorage.removeItem("bagagi_user")
    setUser(null)
  }

  function updateUser(userData) {
    localStorage.setItem("bagagi_user", JSON.stringify(userData))
    setUser(userData)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
