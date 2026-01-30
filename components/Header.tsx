'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Logo } from './Logo';
import { LINKS } from '@/lib/config';
import { useState, useEffect } from 'react';

export function Header() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Only render wallet info after component mounts (client-side)
  useEffect(() => {
    setMounted(true);
  }, []);

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#2a2a3a] bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Logo size="sm" />

          {/* Navigation Links - Hidden on mobile */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href={LINKS.dexscreener}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-cyan-400 transition-colors text-sm font-medium"
            >
              Chart
            </a>
            <a
              href={LINKS.basescan}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-cyan-400 transition-colors text-sm font-medium"
            >
              Contract
            </a>
            <a
              href={LINKS.clanker}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-cyan-400 transition-colors text-sm font-medium"
            >
              Clanker
            </a>
          </nav>

          {/* Wallet Connection - Only render after mount to avoid hydration mismatch */}
          <div className="flex items-center gap-2">
            {!mounted ? (
              // Placeholder during SSR
              <div className="btn-primary !py-2 !px-4 !text-sm opacity-50">
                Loading...
              </div>
            ) : isConnected ? (
              <>
                <span className="text-sm text-cyan-400 font-mono">{shortAddress}</span>
                <button
                  onClick={() => disconnect()}
                  className="btn-secondary !py-2 !px-3 !text-sm"
                >
                  Disconnect
                </button>
              </>
            ) : (
              connectors.slice(0, 2).map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  className="btn-primary !py-2 !px-4 !text-sm"
                >
                  {connector.name === 'Coinbase Wallet' ? 'Coinbase' : 
                   connector.name === 'Injected' ? 'MetaMask' : connector.name}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
