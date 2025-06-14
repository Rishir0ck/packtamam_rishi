import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuthGuard } from '../Firebase/hooks/useAuthGuard' // Import the auth hook
// Import the logo from assets folder
import logoImage from '../assets/pack tamam.png'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuthGuard() // Use the auth hook

  // Redirect if already authenticated
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     console.log('✅ User already authenticated, redirecting to dashboard')
  //     navigate('/dashboard');
  // } else {
  //   navigate('/login');
  //   console.log('🔒 User not authenticated, staying on login page')
  //   }
  // }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('🔐 Starting login process...')
      
      // Call the login function from useAuthGuard
      const result = await login(email, password)
      
      if (result.success) {
        console.log('✅ Login successful, navigating to dashboard')
        // Navigation will be handled by the useEffect when isAuthenticated changes
        // But we can also navigate here as a fallback
        // navigate('/dashboard', { replace: true })
        window.location.href = '/dashboard' // Use window.location.href to ensure full reload
      } else {
        console.log('❌ Login failed:', result.error)
        setError(result.error || 'Login failed. Please try again.')
      }
    } catch (err) {
      console.error('❌ Login error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Image Section (60% width) */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden" style={{ backgroundColor: '#c49373' }}>
        {/* Background Gradient */}
        <div className="absolute inset-0" style={{ 
          background: 'linear-gradient(135deg, #c49373 0%, #b8865f 50%, #a67c5a 100%)' 
        }}></div>
        
        {/* Main Content - Centered */}
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <div className="text-center max-w-lg">
            <h1 className="text-5xl font-bold mb-6 leading-tight text-white">
              Premium
              <span className="block" style={{ color: '#4a3728' }}>Cutlery</span>
              <span className="block text-white">Delivered</span>
            </h1>
            <p className="text-xl mb-8 leading-relaxed text-white opacity-90">
              Quality disposable cutlery, paper dishes, and serving essentials for your business needs
            </p>
            <div className="flex justify-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: '#4a3728' }}>1000+</div>
                <div className="text-sm text-white opacity-75">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: '#4a3728' }}>24/7</div>
                <div className="text-sm text-white opacity-75">Support</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: '#4a3728' }}>Fast</div>
                <div className="text-sm text-white opacity-75">Delivery</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form (40% width) */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-xl shadow-lg flex items-center justify-center bg-white border border-gray-200">
              {/* Logo Image from assets folder */}
              <img 
                src={logoImage} 
                alt="Pack Tamam Logo" 
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  // Show fallback text if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback when image is not available */}
              <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#4a3728', display: 'none' }}>
                <span className="text-2xl font-bold text-white">PT</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#4a3728' }}>Welcome Back</h2>
            <p className="text-gray-600">Sign in to Pack Tamam Dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: '#4a3728' }}>
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    '--tw-ring-color': '#c49373',
                    focusRingColor: '#c49373'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#c49373'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: '#4a3728' }}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onFocus={(e) => e.target.style.borderColor = '#c49373'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:opacity-50"
                >
                  {showPassword ? 
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" /> : 
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  }
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{ 
                backgroundColor: '#c49373',
                '--tw-ring-color': '#c49373'
              }}
              onMouseEnter={(e) => !isLoading && (e.target.style.backgroundColor = '#b8865f')}
              onMouseLeave={(e) => !isLoading && (e.target.style.backgroundColor = '#c49373')}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              © 2025 Pack Tamam. Professional cutlery solutions.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile View - Show logo on small screens */}
      <div className="lg:hidden absolute top-8 left-8 z-20">
        <div className="w-12 h-12 rounded-lg shadow-lg flex items-center justify-center bg-white border border-gray-200">
          <img 
            src={logoImage} 
            alt="Pack Tamam Logo" 
            className="w-10 h-10 object-contain"
            onError={(e) => {
              // Show fallback text if image fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          {/* Fallback when image is not available */}
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#4a3728', display: 'none' }}>
            <span className="text-sm font-bold text-white">PT</span>
          </div>
        </div>
      </div>
    </div>
  )
}