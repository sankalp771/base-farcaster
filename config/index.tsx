import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, base, baseSepolia, type AppKitNetwork } from '@reown/appkit/networks'

// Get projectId from https://dashboard.reown.com
// Defaulting to a dummy ID to allow UI development without env vars
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '00000000000000000000000000000000'

if (!projectId) {
  console.warn('Project ID is not defined, using fallback')
}

// Include Base so the app supports connecting on the Base network
export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [baseSepolia, base, mainnet, arbitrum]

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig