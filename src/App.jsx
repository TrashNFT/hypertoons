import React from 'react'
import WalletChecker from './components/WalletChecker'

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center p-2 md:p-4 relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 opacity-75"
        style={{ backgroundImage: 'url(/images/background.png)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-pink-200/30 to-purple-300/30 backdrop-blur-sm"></div>
      </div>

      {/* Floating elements - Responsive positioning */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
        <div className="absolute top-[10%] left-[5%] md:top-10 md:left-10 w-16 md:w-20 h-16 md:h-20 bg-pink-300 rounded-full opacity-20 animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-[20%] right-[5%] md:top-32 md:right-20 w-12 md:w-16 h-12 md:h-16 bg-purple-300 rounded-full opacity-30 animate-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-[15%] left-[20%] md:bottom-20 md:left-1/4 w-10 md:w-12 h-10 md:h-12 bg-blue-300 rounded-full opacity-25 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-[25%] right-[25%] md:bottom-32 md:right-1/3 w-20 md:w-24 h-20 md:h-24 bg-yellow-300 rounded-full opacity-20 animate-float" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-[40%] left-[10%] md:top-1/2 md:left-20 w-14 md:w-16 h-14 md:h-16 bg-green-300 rounded-full opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-xl bg-white/90 backdrop-blur-lg rounded-3xl shadow-[0_0_40px_rgba(255,182,255,0.3)] overflow-hidden border-4 border-pink-400 relative z-20 transition-transform duration-300 hover:scale-[1.01]">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-400 to-purple-400 px-6 py-4 border-b-4 border-pink-400 relative overflow-hidden">
          {/* Sparkle effects */}
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-white rounded-full animate-sparkle"></div>
            <div className="absolute top-1/3 left-1/2 w-1 h-1 bg-white rounded-full animate-sparkle" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-2/3 left-3/4 w-1 h-1 bg-white rounded-full animate-sparkle" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="flex items-center justify-center relative">
            <img 
              src="/images/logo.jpg" 
              alt="Hypertoons Logo" 
              className="w-12 h-12 rounded-full border-2 border-white mr-3 animate-pulse-gentle"
            />
            <h1 className="font-black text-white text-2xl md:text-3xl tracking-tight drop-shadow-lg">
              Hypertoons
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <WalletChecker />
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes sparkle {
          0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1) rotate(180deg); opacity: 1; }
        }
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
        @keyframes pulse-gentle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-pulse-gentle {
          animation: pulse-gentle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default App 