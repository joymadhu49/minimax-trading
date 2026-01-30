'use client';

import { MINI_TOKEN } from '@/lib/config';
import { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { formatEther, formatUnits } from 'viem';

// LI.FI Widget configuration
const LIFI_WIDGET_URL = 'https://li.finance/widget';

export function SwapWidget() {
  const [mounted, setMounted] = useState(false);
  const [ethAmount, setEthAmount] = useState('');
  const [estimatedMini, setEstimatedMini] = useState('0');
  const [miniPrice, setMiniPrice] = useState<number | null>(null);
  
  const { address, isConnected } = useAccount();
  const { data: ethBalance } = useBalance({ address });
  const { data: miniBalance } = useBalance({
    address,
    token: MINI_TOKEN.address,
  });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${MINI_TOKEN.address}`);
        const data = await res.json();
        if (data.pairs?.[0]) {
          setMiniPrice(parseFloat(data.pairs[0].priceNative));
        }
      } catch {}
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!ethAmount || parseFloat(ethAmount) <= 0 || !miniPrice) {
      setEstimatedMini('0');
      return;
    }
    const miniAmount = parseFloat(ethAmount) / miniPrice;
    setEstimatedMini(miniAmount.toLocaleString(undefined, { maximumFractionDigits: 0 }));
  }, [ethAmount, miniPrice]);

  // Build LI.FI widget URL
  const getWidgetUrl = () => {
    const baseUrl = 'https://li.finance/widget';
    const params = new URLSearchParams({
      fromChain: '8453',
      toChain: '8453',
      fromToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      toToken: MINI_TOKEN.address,
      fromAddress: address || '',
      amount: ethAmount || '0.01',
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const quickAmounts = ['0.01', '0.05', '0.1', '0.25'];

  const ethBal = mounted && ethBalance ? parseFloat(formatEther(ethBalance.value)).toFixed(4) : '0.0000';
  const miniBal = mounted && miniBalance ? parseFloat(formatUnits(miniBalance.value, 18)).toLocaleString() : '0';

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Buy MINI</h2>
        <span className="text-xs bg-green-500/10 text-green-400 px-3 py-1 rounded-full flex items-center gap-1">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          Live
        </span>
      </div>

      <div className="bg-[#1a1a25] rounded-xl p-4 mb-2">
        <div className="flex justify-between mb-2">
          <span className="text-xs text-gray-500">You pay</span>
          {mounted && isConnected && (
            <button onClick={() => ethBalance && setEthAmount(formatEther(ethBalance.value * BigInt(90) / BigInt(100)))}
              className="text-xs text-cyan-400 hover:text-cyan-300">
              Balance: {ethBal} ETH
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={ethAmount}
            onChange={(e) => setEthAmount(e.target.value)}
            placeholder="0.0"
            className="flex-1 bg-transparent text-2xl font-bold text-white outline-none placeholder-gray-600"
          />
          <div className="flex items-center gap-2 bg-[#252535] px-3 py-2 rounded-lg">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs">Ξ</div>
            <span className="font-semibold">ETH</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        {quickAmounts.map((amt) => (
          <button key={amt} onClick={() => setEthAmount(amt)}
            className="flex-1 py-1.5 text-xs bg-[#1a1a25] hover:bg-[#252535] rounded-lg text-gray-400 hover:text-white transition-colors">
            {amt}
          </button>
        ))}
      </div>

      <div className="flex justify-center my-3">
        <div className="w-10 h-10 rounded-xl bg-[#1a1a25] flex items-center justify-center border border-[#2a2a3a]">
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      <div className="bg-[#1a1a25] rounded-xl p-4 mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-xs text-gray-500">You receive (est.)</span>
          {mounted && isConnected && <span className="text-xs text-gray-500">Balance: {miniBal} MINI</span>}
        </div>
        <div className="flex items-center gap-3">
          <span className="flex-1 text-2xl font-bold gradient-text">{estimatedMini || '0'}</span>
          <div className="flex items-center gap-2 bg-[#252535] px-3 py-2 rounded-lg">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xs font-bold">M</div>
            <span className="font-semibold">MINI</span>
          </div>
        </div>
      </div>

      {/* LI.FI embedded widget */}
      <div className="relative" style={{ height: '500px' }}>
        <iframe
          src={getWidgetUrl()}
          className="absolute inset-0 w-full h-full border-0 rounded-xl"
          title="LI.FI Swap Widget"
          allow="clipboard-write; web-share"
        />
      </div>

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">Network</span>
          <span className="text-white">● Base</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Aggregator</span>
          <span className="text-white">LI.FI</span>
        </div>
      </div>
    </div>
  );
}
