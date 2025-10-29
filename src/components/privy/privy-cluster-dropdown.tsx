'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSolana } from '@/components/solana/use-solana'

type SolanaClusterId = 'devnet' | 'testnet' | 'mainnet-beta'

interface ClusterInfo {
  id: SolanaClusterId
  label: string
  endpoint: string
}

const clusters: ClusterInfo[] = [
  {
    id: 'devnet',
    label: 'Devnet',
    endpoint: 'https://api.devnet.solana.com'
  },
  {
    id: 'testnet', 
    label: 'Testnet',
    endpoint: 'https://api.testnet.solana.com'
  },
  {
    id: 'mainnet-beta',
    label: 'Mainnet',
    endpoint: 'https://api.mainnet-beta.solana.com'
  }
]

export function PrivyClusterDropdown() {
  const { cluster, setCluster } = useSolana()
  
  // Default to devnet if cluster is not set
  const currentCluster = clusters.find(c => c.id === cluster) || clusters[0]

  const handleClusterChange = (clusterId: string) => {
    setCluster(clusterId as SolanaClusterId)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{currentCluster.label}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuRadioGroup 
          value={currentCluster.id} 
          onValueChange={handleClusterChange}
        >
          {clusters.map((cluster) => (
            <DropdownMenuRadioItem key={cluster.id} value={cluster.id}>
              {cluster.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}