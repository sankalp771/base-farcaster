
import { createConfig, http, cookieStorage, createStorage } from 'wagmi'
import { baseSepolia, base } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '8127cc9c014d299de9cd4367a8a32e25'

export const config = createConfig({
  chains: [baseSepolia, base],
  connectors: [
    injected(), // MetaMask
  ],
  transports: {
    [baseSepolia.id]: http("https://base-sepolia-rpc.publicnode.com"),
    [base.id]: http(),
  },
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
})