import { type PrivyClientConfig } from '@privy-io/react-auth';
// import { createSolanaRpc, createSolanaRpcSubscriptions } from '@privy-io/react-auth/solana';

const SOLANA_NETWORK = (process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? 'devnet') as 'devnet' | 'testnet' | 'mainnet-beta'

const SOLANA_CHAIN_IDS: Record<typeof SOLANA_NETWORK, 'solana:devnet' | 'solana:testnet' | 'solana:mainnet'> = {
  devnet: 'solana:devnet',
  testnet: 'solana:testnet',
  'mainnet-beta': 'solana:mainnet',
}

/**
 * Get Privy App ID from environment
 */
export const getPrivyAppId = () => {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
  
  if (!appId) {
    console.warn('NEXT_PUBLIC_PRIVY_APP_ID not found in environment variables')
    console.warn('Please add your Privy App ID to .env.local')
  }
  
  return appId
}

/**
 * Get configured Solana chain based on environment
 */
export const getConfiguredSolanaChain = () => SOLANA_CHAIN_IDS[SOLANA_NETWORK] ?? 'solana:devnet'

/**
 * Get RPC URL for the configured network
 */
export function getRpcUrl(): string {
  const network = process.env.NEXT_PUBLIC_SOLANA_CLUSTER
  if (network === 'mainnet-beta') {
    return process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL || 'https://api.mainnet-beta.solana.com'
  }
  return 'https://api.devnet.solana.com'
}

/**
 * Get WebSocket URL for the configured network  
 */
export function getWsUrl(): string {
  const rpcUrl = getRpcUrl()
  return rpcUrl.replace('https://', 'wss://').replace('http://', 'ws://')
}

export const getPrivyAppSecret = () => {
  return process.env.PRIVY_APP_SECRET
}

/**
 * Validation helpers
 */
export const validatePrivyConfig = () => {
  const appId = getPrivyAppId()
  
  if (!appId) {
    throw new Error('Privy App ID is required. Please check your environment configuration.')
  }
  
  return true
}

/**
 * Wallet connection debugging helper
 */
export const debugWalletConnection = () => {
  console.group('🔍 Privy Wallet Connection Debug')
  
  if (typeof window !== 'undefined') {
    // Check if Phantom is installed
    const windowWithWallets = window as unknown as {
      solana?: { isPhantom?: boolean }
      solflare?: unknown
      solong?: unknown
    }
    
    const isPhantomInstalled = windowWithWallets.solana?.isPhantom
    console.log('Phantom installed:', isPhantomInstalled)
    
    // Check for other Solana wallets
    const hasSolflare = !!windowWithWallets.solflare
    const hasSolongWallet = !!windowWithWallets.solong
    console.log('Solflare installed:', hasSolflare)
    console.log('Solong installed:', hasSolongWallet)
  }
  
  // Check Privy App ID
  const appId = getPrivyAppId()
  console.log('Privy App ID configured:', !!appId)
  console.log('App ID value:', appId?.slice(0, 10) + '...')
  console.log('Target Solana chain:', getConfiguredSolanaChain())
  
  // Check current URL
  if (typeof window !== 'undefined') {
    console.log('Current URL:', window.location.href)
    console.log('Is HTTPS:', window.location.protocol === 'https:')
    console.log('Is localhost:', window.location.hostname === 'localhost')
  }
  
  console.groupEnd()
}

export const privyConfig: PrivyClientConfig = {
  appearance: {
    theme: 'light',
    accentColor: '#676FFF',
    logo: 'https://your-logo-url.com/logo.png',
  },
  // embeddedWallets: {
  //   createOnLogin: 'users-without-wallets',
  // },
  // solana: {
  //   rpcs: {
  //     'solana:mainnet': {
  //       rpc: createSolanaRpc('https://api.mainnet-beta.solana.com'),
  //       rpcSubscriptions: createSolanaRpcSubscriptions('wss://api.mainnet-beta.solana.com')
  //     },
  //     'solana:devnet': {
  //       rpc: createSolanaRpc('https://api.devnet.solana.com'),
  //       rpcSubscriptions: createSolanaRpcSubscriptions('wss://api.devnet.solana.com')
  //     }
  //   }
  // }
};