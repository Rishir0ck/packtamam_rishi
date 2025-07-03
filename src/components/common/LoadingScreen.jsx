import React from 'react'
import { Package, Utensils, Coffee } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#cca883] flex items-center justify-center overflow-hidden">
      <div className="relative">
        {/* Floating 3D Elements */}
        <div className="absolute -top-20 -left-20 animate-float">
          <div className="w-16 h-16 bg-[#423527] rounded-xl shadow-2xl transform rotate-12 animate-pulse3d flex items-center justify-center">
            <Package className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="absolute -top-10 -right-24 animate-float" style={{ animationDelay: '2s' }}>
          <div className="w-12 h-12 bg-white rounded-full shadow-2xl animate-pulse3d flex items-center justify-center">
            <Utensils className="w-6 h-6 text-[#c79e73]" />
          </div>
        </div>
        
        <div className="absolute -bottom-16 -right-16 animate-float" style={{ animationDelay: '4s' }}>
          <div className="w-14 h-14 bg-[#423527] rounded-lg shadow-2xl transform -rotate-12 animate-pulse3d flex items-center justify-center">
            <Coffee className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Main Loading Container */}
        <div className="bg-[#423527] backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/20">
          <div className="text-center">
            {/* 3D Logo Container */}
            <div className="relative mb-8">
              <div className="w-24 h-24 mx-auto bg-[#f5ad60] rounded-2xl shadow-2xl animate-rotate3d flex items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center">
                  <img
                    src="/favicon.ico"
                    alt="PT Icon"
                    className="w-8 h-8"
                  />
                </div>
              </div>
            </div>

            {/* Brand Name */}
            <h1 className="text-4xl font-bold text-white mb-2">Pack Tamam</h1>
            <p className="text-xl text-white/80 mb-8">Food Inventory Management</p>

            {/* 3D Loading Animation */}
            <div className="flex justify-center space-x-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 bg-[#ffffff] rounded-full animate-pulse3d shadow-lg"
                  style={{ animationDelay: `${i * 0.5}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Background Floating Elements */}
        <div className="absolute inset-0 -z-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
