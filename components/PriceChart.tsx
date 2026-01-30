'use client';

import { MINI_TOKEN, LINKS } from '@/lib/config';

export function PriceChart() {
  // DEXScreener embed URL for the MINI/WETH pair
  const embedUrl = `https://dexscreener.com/base/${MINI_TOKEN.address}?embed=1&theme=dark&trades=0&info=0`;

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-[#2a2a3a] flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Price Chart</h2>
        <a
          href={LINKS.dexscreener}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
        >
          Open in DEXScreener
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
      <div className="relative" style={{ height: '400px' }}>
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full border-0"
          title="MINI Price Chart"
          allow="clipboard-write"
        />
      </div>
    </div>
  );
}
