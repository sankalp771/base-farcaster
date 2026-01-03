
import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, base, baseSepolia } from '@reown/appkit/networks'

// Get projectId from https://dashboard.reown.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'b56e804e29b05f2b308e07c8ba0c96f8' // Using a public testing ID or yours

if (!projectId) {
  console.warn('Project ID is not defined, using fallback')
}

export const networks = [baseSepolia, base, mainnet, arbitrum]

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks,
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'), // Back to standard
    [base.id]: http(),
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
  }
})

export const config = wagmiAdapter.wagmiConfig