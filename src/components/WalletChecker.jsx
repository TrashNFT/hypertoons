import { useState, useEffect } from 'react'
import ogAllowlist from '../data/og-allowlist.json'
import wlAllowlist from '../data/wl-allowlist.json'

const WalletChecker = () => {
  const [walletAddress, setWalletAddress] = useState('')
  const [status, setStatus] = useState(null)
  const [isChecking, setIsChecking] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showConfetti])

  const checkWalletStatus = () => {
    if (!walletAddress.trim()) {
      setStatus({
        type: 'error',
        message: '❌ Oops!',
        description: 'Please enter a wallet address',
        emoji: '🤔'
      })
      setShowResult(true)
      return
    }

    setIsChecking(true)
    setShowResult(false)
    
    setTimeout(() => {
      const normalizedAddress = walletAddress.toLowerCase()

      // Check OG list
      const isOG = ogAllowlist.og_addresses.some(
        addr => addr.toLowerCase() === normalizedAddress
      )

      // Check WL list
      const isWL = wlAllowlist.wl_addresses.some(
        addr => addr.toLowerCase() === normalizedAddress
      )

      if (isOG) {
        setStatus({
          type: 'og',
          message: '⭐ Congratulations!',
          description: 'You have exclusive OG-FREEMINT access!',
          emoji: '🎉'
        })
        setShowConfetti(true)
      } else if (isWL) {
        setStatus({
          type: 'wl',
          message: '🎯 Great news!',
          description: 'You have Whitelist privileges!',
          emoji: '🌟'
        })
        setShowConfetti(true)
      } else {
        setStatus({
          type: 'none',
          message: '❌ Not Found',
          description: 'This wallet is not on any list',
          emoji: '😢'
        })
      }
      
      setIsChecking(false)
      setTimeout(() => setShowResult(true), 100)
    }, 1000)
  }

  const getStatusStyles = () => {
    const baseStyles = 'mt-6 p-6 border-2 rounded-2xl transition-all duration-500 transform'
    switch (status?.type) {
      case 'og':
        return `${baseStyles} bg-yellow-50 border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.2)]`
      case 'wl':
        return `${baseStyles} bg-green-50 border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.2)]`
      case 'none':
        return `${baseStyles} bg-red-50 border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.2)]`
      case 'error':
        return `${baseStyles} bg-orange-50 border-orange-400 shadow-[0_0_30px_rgba(251,146,60,0.2)]`
      default:
        return ''
    }
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Wallet Checker</h2>
      <p className="text-gray-600 mb-8">Check if your wallet is on our OG or Whitelist!</p>
      
      {/* Input with Tooltip */}
      <div className="relative mb-6 group">
        <div className="relative">
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => {
              setWalletAddress(e.target.value)
              if (status?.type === 'error') {
                setStatus(null)
                setShowResult(false)
              }
            }}
            placeholder="Paste your HL wallet address (0x...)"
            className={`
              w-full px-6 py-4 border-2 rounded-xl 
              focus:outline-none focus:ring-2 focus:ring-pink-200 
              transition-all duration-200 text-gray-700 
              placeholder-gray-400 pr-12
              ${status?.type === 'error' ? 'border-orange-400' : 'border-pink-200 focus:border-pink-400'}
            `}
          />
          <div className="absolute inset-y-0 right-4 flex items-center">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              ❔
            </button>
          </div>
        </div>
        
        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap z-10">
            Paste your HyperLiquid wallet address
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
          </div>
        )}
      </div>

      {/* Check Button */}
      <button
        onClick={checkWalletStatus}
        disabled={isChecking}
        className={`
          w-full bg-gradient-to-r from-pink-400 to-purple-400 
          text-white py-4 px-6 rounded-xl font-bold text-lg 
          hover:from-pink-500 hover:to-purple-500 
          transform hover:scale-105 active:scale-95
          transition-all duration-200 
          disabled:opacity-50 disabled:cursor-not-allowed 
          shadow-lg hover:shadow-xl
          ${isChecking ? 'animate-pulse' : ''}
        `}
      >
        {isChecking ? '🔍 Checking...' : '✨ Check Wallet Status'}
      </button>

      {/* Result Card with Slide Up Animation */}
      {status && (
        <div 
          className={`
            ${getStatusStyles()}
            ${showResult ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          <div className="text-4xl mb-4">{status.emoji}</div>
          <div className="text-xl font-bold mb-2">{status.message}</div>
          <div className="text-gray-600">{status.description}</div>
        </div>
      )}

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-confetti-1">🎉</div>
            <div className="animate-confetti-2">✨</div>
            <div className="animate-confetti-3">🌟</div>
            <div className="animate-confetti-4">⭐</div>
          </div>
        </div>
      )}

      {/* Cute Mascot */}
      <div className="mt-8 flex justify-center space-x-4 text-2xl">
        <div className={`transition-transform duration-300 ${status?.type === 'og' || status?.type === 'wl' ? 'animate-bounce' : status?.type === 'error' ? 'animate-shake' : 'animate-wobble'}`}>
          {status?.type === 'og' || status?.type === 'wl' ? '🎊' : status?.type === 'error' ? '🤔' : status?.type === 'none' ? '🥺' : '🤗'}
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-1000px) rotate(720deg); opacity: 0; }
        }
        .animate-confetti-1 { animation: confetti 3s ease-out forwards; }
        .animate-confetti-2 { animation: confetti 3s ease-out 0.2s forwards; }
        .animate-confetti-3 { animation: confetti 3s ease-out 0.4s forwards; }
        .animate-confetti-4 { animation: confetti 3s ease-out 0.6s forwards; }
        @keyframes wobble {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        .animate-wobble {
          animation: wobble 2s ease-in-out infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default WalletChecker 