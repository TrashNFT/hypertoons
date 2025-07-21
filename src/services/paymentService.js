// Payment Service for Contract Owner
import { ethers } from 'ethers'
import contractService from './contractService.js'
import { CONTRACT_CONFIG } from '../config/contract.js'
import analyticsService from './analyticsService.js'

class PaymentService {
  constructor() {
    this.isOwner = false
    this.contractBalance = '0'
    this.totalRevenue = '0'
    this.withdrawalHistory = []
  }

  // Check if connected wallet is contract owner
  async checkOwnership(walletAddress) {
    try {
      if (!contractService.contract || !walletAddress) return false

      const ownerAddress = await contractService.contract.owner()
      this.isOwner = ownerAddress.toLowerCase() === walletAddress.toLowerCase()
      
      console.log('Owner check:', { 
        wallet: walletAddress, 
        owner: ownerAddress, 
        isOwner: this.isOwner 
      })
      
      return this.isOwner
    } catch (error) {
      console.error('Failed to check contract ownership:', error)
      return false
    }
  }

  // Get contract balance
  async getContractBalance() {
    try {
      if (!contractService.contract) throw new Error('Contract not initialized')

      const balance = await contractService.contract.getBalance()
      this.contractBalance = ethers.formatEther(balance)
      
      return {
        wei: balance.toString(),
        eth: this.contractBalance,
        usd: await this.convertToUSD(this.contractBalance)
      }
    } catch (error) {
      console.error('Failed to get contract balance:', error)
      
      // Fallback: get balance via provider
      try {
        const balance = await contractService.provider.getBalance(
          contractService.contract.target || contractService.contract.address
        )
        this.contractBalance = ethers.formatEther(balance)
        return {
          wei: balance.toString(),
          eth: this.contractBalance,
          usd: await this.convertToUSD(this.contractBalance)
        }
      } catch (fallbackError) {
        console.error('Fallback balance check failed:', fallbackError)
        return { wei: '0', eth: '0', usd: '0' }
      }
    }
  }

  // Convert ETH to USD (using a price API)
  async convertToUSD(ethAmount) {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
      const data = await response.json()
      const ethPrice = data.ethereum?.usd || 0
      
      return (parseFloat(ethAmount) * ethPrice).toFixed(2)
    } catch (error) {
      console.warn('Failed to get ETH price:', error)
      return '0'
    }
  }

  // Withdraw all funds
  async withdrawAll() {
    if (!this.isOwner) {
      throw new Error('Only contract owner can withdraw funds')
    }

    try {
      if (!contractService.contract) throw new Error('Contract not initialized')

      // Get current balance before withdrawal
      const balanceBefore = await this.getContractBalance()
      
      console.log('Withdrawing all funds:', balanceBefore.eth, 'ETH')

      // Execute withdrawal
      const transaction = await contractService.contract.withdraw()
      
      // Track the transaction
      analyticsService.track('payment_withdrawal_initiated', {
        amount: balanceBefore.eth,
        amountUSD: balanceBefore.usd,
        txHash: transaction.hash,
        type: 'withdraw_all'
      })

      // Wait for confirmation
      const receipt = await transaction.wait()
      
      if (receipt.status === 1) {
        // Record successful withdrawal
        const withdrawal = {
          id: Date.now(),
          amount: balanceBefore.eth,
          amountUSD: balanceBefore.usd,
          txHash: transaction.hash,
          blockNumber: receipt.blockNumber,
          timestamp: new Date().toISOString(),
          type: 'withdraw_all',
          gasUsed: receipt.gasUsed.toString(),
          gasPrice: receipt.gasPrice?.toString() || '0'
        }
        
        this.withdrawalHistory.push(withdrawal)
        this.saveWithdrawalHistory()
        
        // Track successful withdrawal
        analyticsService.track('payment_withdrawal_success', {
          amount: balanceBefore.eth,
          amountUSD: balanceBefore.usd,
          txHash: transaction.hash,
          gasUsed: receipt.gasUsed.toString()
        })

        // Update balance
        await this.getContractBalance()

        return {
          success: true,
          amount: balanceBefore.eth,
          amountUSD: balanceBefore.usd,
          txHash: transaction.hash,
          withdrawal
        }
      } else {
        throw new Error('Transaction failed')
      }
    } catch (error) {
      console.error('Withdrawal failed:', error)
      
      analyticsService.track('payment_withdrawal_failed', {
        error: error.message,
        type: 'withdraw_all'
      })
      
      throw new Error(`Withdrawal failed: ${error.message}`)
    }
  }

  // Withdraw specific amount
  async withdrawAmount(amountETH) {
    if (!this.isOwner) {
      throw new Error('Only contract owner can withdraw funds')
    }

    try {
      if (!contractService.contract) throw new Error('Contract not initialized')

      const amountWei = ethers.parseEther(amountETH.toString())
      const amountUSD = await this.convertToUSD(amountETH.toString())
      
      console.log('Withdrawing amount:', amountETH, 'ETH')

      // Execute withdrawal
      const transaction = await contractService.contract.withdrawAmount(amountWei)
      
      // Track the transaction
      analyticsService.track('payment_withdrawal_initiated', {
        amount: amountETH.toString(),
        amountUSD,
        txHash: transaction.hash,
        type: 'withdraw_amount'
      })

      // Wait for confirmation
      const receipt = await transaction.wait()
      
      if (receipt.status === 1) {
        // Record successful withdrawal
        const withdrawal = {
          id: Date.now(),
          amount: amountETH.toString(),
          amountUSD,
          txHash: transaction.hash,
          blockNumber: receipt.blockNumber,
          timestamp: new Date().toISOString(),
          type: 'withdraw_amount',
          gasUsed: receipt.gasUsed.toString(),
          gasPrice: receipt.gasPrice?.toString() || '0'
        }
        
        this.withdrawalHistory.push(withdrawal)
        this.saveWithdrawalHistory()
        
        // Track successful withdrawal
        analyticsService.track('payment_withdrawal_success', {
          amount: amountETH.toString(),
          amountUSD,
          txHash: transaction.hash,
          gasUsed: receipt.gasUsed.toString()
        })

        // Update balance
        await this.getContractBalance()

        return {
          success: true,
          amount: amountETH.toString(),
          amountUSD,
          txHash: transaction.hash,
          withdrawal
        }
      } else {
        throw new Error('Transaction failed')
      }
    } catch (error) {
      console.error('Partial withdrawal failed:', error)
      
      analyticsService.track('payment_withdrawal_failed', {
        error: error.message,
        amount: amountETH.toString(),
        type: 'withdraw_amount'
      })
      
      throw new Error(`Withdrawal failed: ${error.message}`)
    }
  }

  // Get revenue analytics
  async getRevenueAnalytics() {
    try {
      const balance = await this.getContractBalance()
      const totalMints = await this.getTotalMints()
      const phaseRevenue = await this.getPhaseRevenue()
      
      return {
        currentBalance: balance,
        totalRevenue: this.calculateTotalRevenue(),
        totalWithdrawn: this.calculateTotalWithdrawn(),
        totalMints,
        phaseRevenue,
        averagePrice: this.calculateAveragePrice(totalMints),
        withdrawalHistory: this.withdrawalHistory.slice(-10), // Last 10 withdrawals
        projectedRevenue: this.calculateProjectedRevenue(totalMints)
      }
    } catch (error) {
      console.error('Failed to get revenue analytics:', error)
      return null
    }
  }

  // Calculate total revenue from contract events
  async getTotalMints() {
    try {
      if (!contractService.contract) return 0
      
      const mintEvents = await contractService.getMintEvents('0', 1000) // Get all events
      return mintEvents.length
    } catch (error) {
      console.error('Failed to get total mints:', error)
      return 0
    }
  }

  // Calculate revenue by phase
  async getPhaseRevenue() {
    // This would analyze mint events by phase
    const phases = CONTRACT_CONFIG.collection.phases
    const revenue = {}
    
    Object.keys(phases).forEach(phase => {
      revenue[phase] = {
        mints: 0,
        revenue: '0',
        price: phases[phase].priceETH
      }
    })
    
    return revenue
  }

  // Calculate total revenue
  calculateTotalRevenue() {
    const withdrawn = this.calculateTotalWithdrawn()
    const current = parseFloat(this.contractBalance)
    return (withdrawn + current).toFixed(4)
  }

  // Calculate total withdrawn
  calculateTotalWithdrawn() {
    return this.withdrawalHistory.reduce((total, withdrawal) => {
      return total + parseFloat(withdrawal.amount)
    }, 0)
  }

  // Calculate average mint price
  calculateAveragePrice(totalMints) {
    if (totalMints === 0) return '0'
    const totalRevenue = parseFloat(this.calculateTotalRevenue())
    return (totalRevenue / totalMints).toFixed(6)
  }

  // Calculate projected revenue
  calculateProjectedRevenue(currentMints) {
    const maxSupply = CONTRACT_CONFIG.collection.maxSupply
    const remaining = maxSupply - currentMints
    const avgPrice = parseFloat(this.calculateAveragePrice(currentMints))
    
    return {
      remaining,
      projectedAdditional: (remaining * avgPrice).toFixed(2),
      projectedTotal: (parseFloat(this.calculateTotalRevenue()) + (remaining * avgPrice)).toFixed(2)
    }
  }

  // Save withdrawal history to localStorage
  saveWithdrawalHistory() {
    try {
      localStorage.setItem('hypertoons_withdrawals', JSON.stringify(this.withdrawalHistory))
    } catch (error) {
      console.warn('Failed to save withdrawal history:', error)
    }
  }

  // Load withdrawal history from localStorage
  loadWithdrawalHistory() {
    try {
      const saved = localStorage.getItem('hypertoons_withdrawals')
      if (saved) {
        this.withdrawalHistory = JSON.parse(saved)
      }
    } catch (error) {
      console.warn('Failed to load withdrawal history:', error)
      this.withdrawalHistory = []
    }
  }

  // Export withdrawal history as CSV
  exportWithdrawalHistory() {
    const csvHeaders = ['Date', 'Amount (ETH)', 'Amount (USD)', 'Type', 'Transaction Hash', 'Gas Used']
    const csvRows = this.withdrawalHistory.map(w => [
      new Date(w.timestamp).toLocaleDateString(),
      w.amount,
      w.amountUSD,
      w.type,
      w.txHash,
      w.gasUsed
    ])
    
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.join(','))
      .join('\n')
    
    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hypertoons-withdrawals-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Initialize the service
  async initialize(walletAddress) {
    this.loadWithdrawalHistory()
    
    if (walletAddress) {
      await this.checkOwnership(walletAddress)
      if (this.isOwner) {
        await this.getContractBalance()
      }
    }
  }
}

// Export singleton instance
export default new PaymentService() 