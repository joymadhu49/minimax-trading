import { Header, Logo, TokenInfo, SwapWidget, PriceChart } from '@/components';
import { LINKS } from '@/lib/config';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="animate-float">
              <Logo size="lg" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="gradient-text">Trade MINI</span>
            <br />
            <span className="text-white">on Base</span>
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
            The official trading platform for MiniMaxClawd ecosystem. 
            Swap ETH for MINI tokens directly on Base network.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#trade" className="btn-primary">
              Start Trading
            </a>
            <a
              href={LINKS.dexscreener}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              View Chart →
            </a>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 border-y border-[#2a2a3a] bg-[#0d0d15]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Network</p>
              <p className="text-xl font-bold text-cyan-400">Base</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">DEX</p>
              <p className="text-xl font-bold text-white">Uniswap V4</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Supply</p>
              <p className="text-xl font-bold text-white">100B</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Security</p>
              <p className="text-xl font-bold text-green-400">Verified ✓</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trading Section */}
      <section id="trade" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Swap Widget + Token Info */}
            <div className="space-y-6">
              <SwapWidget />
              <TokenInfo />
            </div>
            
            {/* Right: Price Chart */}
            <div>
              <PriceChart />
            </div>
          </div>
        </div>
      </section>

      {/* How to Buy Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#0d0d15]/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 gradient-text">
            How to Buy MINI
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold glow-cyan">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Connect Wallet</h3>
              <p className="text-gray-400 text-sm">
                Connect your Coinbase Wallet, MetaMask, or any Web3 wallet
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold glow-cyan">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Have ETH on Base</h3>
              <p className="text-gray-400 text-sm">
                Make sure you have ETH on Base network for the swap
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold glow-cyan">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Swap for MINI</h3>
              <p className="text-gray-400 text-sm">
                Enter the amount and click swap to get your MINI tokens
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-[#2a2a3a]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <div className="flex items-center gap-6">
            <a
              href={LINKS.dexscreener}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
            >
              DEXScreener
            </a>
            <a
              href={LINKS.basescan}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
            >
              Basescan
            </a>
            <a
              href={LINKS.clanker}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
            >
              Clanker
            </a>
          </div>
          <p className="text-gray-500 text-sm">
            Built on Base
          </p>
        </div>
      </footer>
    </main>
  );
}
