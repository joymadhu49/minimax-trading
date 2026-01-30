'use client';

import { MINI_TOKEN, LINKS } from '@/lib/config';

export function TokenInfo() {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold gradient-text">{MINI_TOKEN.name}</h2>
          <p className="text-gray-400 mt-1">${MINI_TOKEN.symbol} on Base</p>
        </div>
        <div className="flex gap-2">
          <a
            href={LINKS.dexscreener}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-[#1a1a25] hover:bg-[#252535] transition-colors"
            title="View on DEXScreener"
          >
            <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3.5 18.5l6-6 4 4 8-8M14 6h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </a>
          <a
            href={LINKS.basescan}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-[#1a1a25] hover:bg-[#252535] transition-colors"
            title="View on Basescan"
          >
            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* Token Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1a1a25] rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Network</p>
          <p className="font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Base
          </p>
        </div>
        <div className="bg-[#1a1a25] rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Supply</p>
          <p className="font-semibold text-white">100B</p>
        </div>
      </div>

      {/* Contract Address */}
      <div className="mt-4 bg-[#1a1a25] rounded-xl p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Contract Address</p>
        <div className="flex items-center gap-2">
          <code className="text-sm text-cyan-400 font-mono truncate flex-1">
            {MINI_TOKEN.address}
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(MINI_TOKEN.address);
            }}
            className="p-2 rounded-lg hover:bg-[#252535] transition-colors"
            title="Copy address"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
