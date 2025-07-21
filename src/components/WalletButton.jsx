import React from 'react'
import { Wallet, Loader2, AlertCircle } from 'lucide-react'

const WalletButton = ({ 
  isConnected, 
  account, 
  isConnecting, 
  error, 
  onConnect, 
  onDisconnect 
}) => {
  const formatAddress = (address) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isConnected && account) {
    return (
      <div className="flex items-center gap-3">
        <div className="gaming-card px-4 py-2 flex items-center gap-2">
          <div className="w-3 h-3 bg-gaming-green rounded-full animate-pulse-gaming"></div>
          <span className="text-sm font-medium text-slate-200">
            {formatAddress(account)}
          </span>
        </div>
        <button
          onClick={onDisconnect}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onConnect}
        disabled={isConnecting}
        className="gaming-button flex items-center gap-2 min-w-[200px] justify-center"
      >
        {isConnecting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </>
        )}
      </button>
      
      {error && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-900/50 border border-red-500/30 rounded-lg text-red-300 text-sm max-w-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export default WalletButton 