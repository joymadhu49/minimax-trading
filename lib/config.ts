import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet, injected } from 'wagmi/connectors';

// MINI Token Configuration
export const MINI_TOKEN = {
  name: 'MiniMaxClawd',
  symbol: 'MINI',
  address: '0x16a629C8F227c705893683dfDc0bD6f8F2717B07' as `0x${string}`,
  decimals: 18,
  image: '',
  chainId: 8453, // Base
};

// WETH on Base
export const WETH_TOKEN = {
  name: 'Wrapped Ether',
  symbol: 'WETH',
  address: '0x4200000000000000000000000000000000000006' as `0x${string}`,
  decimals: 18,
  chainId: 8453,
};

// Wagmi Config - simplified, no WalletConnect needed
export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: 'MiniMaxClawd Trading',
    }),
    injected(), // MetaMask and other injected wallets
  ],
  transports: {
    [base.id]: http(),
  },
});

// External Links
export const LINKS = {
  dexscreener: 'https://dexscreener.com/base/0x16a629C8F227c705893683dfDc0bD6f8F2717B07',
  basescan: 'https://basescan.org/token/0x16a629C8F227c705893683dfDc0bD6f8F2717B07',
  uniswap: `https://app.uniswap.org/swap?outputCurrency=0x16a629C8F227c705893683dfDc0bD6f8F2717B07&chain=base`,
  clanker: 'https://www.clanker.world/clanker/0x16a629C8F227c705893683dfDc0bD6f8F2717b07',
};
