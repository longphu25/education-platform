/**
 * Utility functions for formatting blockchain addresses
 */

import type { Address } from 'gill'

/**
 * Format an address for display by showing first and last characters
 * Handles both string addresses and gill Address types
 */
export function formatAddress(
  address: string | Address | unknown,
  startChars: number = 8,
  endChars: number = 8
): string {
  if (!address) return ''
  
  // Convert to string - handles Address type, PublicKey, and regular strings
  let addressStr: string
  
  if (typeof address === 'string') {
    addressStr = address
  } else if (address && typeof address === 'object') {
    // Handle gill Address type or Solana PublicKey
    if ('toString' in address && typeof address.toString === 'function') {
      addressStr = address.toString()
    } else {
      // Fallback: try to get the address value
      addressStr = String(address)
    }
  } else {
    addressStr = String(address)
  }

  // If conversion failed or resulted in [object Object], return empty
  if (addressStr.includes('[object') || addressStr.length < startChars + endChars) {
    return addressStr
  }

  return `${addressStr.slice(0, startChars)}...${addressStr.slice(-endChars)}`
}

/**
 * Get the full address string from various address types
 */
export function getAddressString(address: string | Address | unknown): string {
  if (!address) return ''
  
  if (typeof address === 'string') {
    return address
  }
  
  if (address && typeof address === 'object' && 'toString' in address) {
    return (address as { toString: () => string }).toString()
  }
  
  return String(address)
}
