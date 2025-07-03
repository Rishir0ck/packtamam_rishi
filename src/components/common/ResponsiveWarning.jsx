import React from 'react'
import { Monitor, Tablet } from 'lucide-react'

export default function ResponsiveWarning() {
  return (
    <div className="min-h-screen bg-[#cca883] flex items-center justify-center p-4">
      <div className="bg-[#423527] backdrop-blur-lg rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-white/20">
        <div className="mb-6">
          <div className="flex justify-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-[#cca883] rounded-xl flex items-center justify-center animate-pulse3d">
              <Monitor className="w-8 h-8 text-white" />
            </div>
            <div className="w-16 h-16 bg-[#cca883] rounded-xl flex items-center justify-center animate-pulse3d" style={{ animationDelay: '1s' }}>
              <Tablet className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Pack Tamam</h1>
        </div>
        
        <h2 className="text-xl font-semibold text-white mb-4">Screen Size Not Supported</h2>
        <p className="text-white/90 mb-6 leading-relaxed">
          Please use a bigger screen to access Pack Tamam dashboard. 
          Supported devices include desktop computers, laptops, and tablets in landscape mode.
        </p>
        
        <div className="bg-[#cca883] rounded-xl p-4 border border-white/20">
          <p className="text-sm text-white">
            For the best experience, please rotate your tablet to landscape mode or use a desktop/laptop computer.
          </p>
        </div>
      </div>
    </div>
  )
}