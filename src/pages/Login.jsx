import React, { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, Package, Utensils, Coffee, ShoppingCart } from 'lucide-react'
import useAuth from '../hooks/useAuth'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (login(email, password)) {
      setError('')
    } else {
      setError('Invalid credentials. Use admin@packtamam.com / admin123')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Floating 3D Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 animate-float">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl shadow-2xl transform rotate-12 animate-pulse3d flex items-center justify-center">
            <Package className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <div className="absolute top-40 right-32 animate-float" style={{ animationDelay: '1s' }}>
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-2xl animate-pulse3d flex items-center justify-center">
            <Utensils className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="absolute bottom-32 left-32 animate-float" style={{ animationDelay: '2s' }}>
          <div className="w-18 h-18 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-2xl transform -rotate-12 animate-pulse3d flex items-center justify-center">
            <Coffee className="w-9 h-9 text-white" />
          </div>
        </div>
        
        <div className="absolute bottom-20 right-20 animate-float" style={{ animationDelay: '3s' }}>
          <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-2xl animate-pulse3d flex items-center justify-center">
            <ShoppingCart className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl shadow-2xl flex items-center justify-center animate-pulse3d">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">PT</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Pack Tamam</h1>
            <p className="text-white/70">Food Inventory Dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-white/60" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Email address"
                required
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-white/60" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                {showPassword ? 
                  <EyeOff className="h-5 w-5 text-white/60 hover:text-white transition-colors" /> : 
                  <Eye className="h-5 w-5 text-white/60 hover:text-white transition-colors" />
                }
              </button>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-200 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl shadow-2xl hover:shadow-orange-500/25 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-transparent"
            >
              Sign In
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 text-center">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-xs text-white/60 mb-2">Demo Credentials:</p>
              <p className="text-sm text-white/80">admin@packtamam.com</p>
              <p className="text-sm text-white/80">admin123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}