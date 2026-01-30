'use client';

import { MINI_TOKEN } from '@/lib/config';
import { useState, useEffect, useCallback } from 'react';
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther, formatUnits } from 'viem';

const ONE_INCH_API = 'https://api.1inch.dev/swap/v6.0/8453';
const CHAIN_ID = 8453; // Base

// 1Inch API key - using public key (rate limited but works for testing)
const API_KEY = 'K2C-22BsSdcRGLybBxS9LVZ2w4rRyKWc';

interface OneInchQuote {
  toTokenAmount: string;
  fromTokenAmount: string;
  protocols: { name: string; part: number }[][][];
  estimatedGas: number;
}

interface OneInchSwap {
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gasPrice: string;
    gas: number;
  };
}

export function SwapWidget() {
  const [mounted, setMounted] = useState(false);
  const [ethAmount, setEthAmount] = useState('');
  const [estimatedMini, setEstimatedMini] = useState('0');
  const [quote, setQuote] = useState<OneInchQuote | null>(null);
  const [swapData, setSwapData] = useState<OneInchSwap | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { data: ethBalance } = useBalance({ address });
  const { data: miniBalance, refetch: refetchMini } = useBalance({
    address,
    token: MINI_TOKEN.address,
  });

  const { sendTransaction, data: txHash, isPending, isError, reset } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: txSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => { setMounted(true); }, []);

  // Handle transaction states
  useEffect(() => {
    if (isError) {
      setIsSwapping(false);
      setError('Transaction cancelled');
      setTimeout(() => setError(''), 3000);
      reset();
    }
  }, [isError, reset]);

  useEffect(() => {
    if (txSuccess) {
      setIsSwapping(false);
      setSuccess(true);
      refetchMini();
      setTimeout(() => {
        setSuccess(false);
        setEthAmount('');
        setEstimatedMini('0');
        setQuote(null);
        setSwapData(null);
        reset();
      }, 4000);
    }
  }, [txSuccess, refetchMini, reset]);

  useEffect(() => {
    if (isPending || isConfirming) setIsSwapping(true);
  }, [isPending, isConfirming]);

  // Fetch quote from 1inch
  const fetchQuote = useCallback(async () => {
    if (!ethAmount || parseFloat(ethAmount) <= 0 || !address) {
      setQuote(null);
      setEstimatedMini('0');
      return;
    }

    setIsLoadingQuote(true);
    setError('');

    try {
      const amountIn = parseEther(ethAmount).toString();
      
      // 1inch quote API
      const quoteUrl = new URL(`${ONE_INCH_API}/quote`);
      quoteUrl.searchParams.set('fromTokenAddress', '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE');
      quoteUrl.searchParams.set('toTokenAddress', MINI_TOKEN.address);
      quoteUrl.searchParams.set('amount', amountIn);
      quoteUrl.searchParams.set('fromAddress', address);
      quoteUrl.searchParams.set('slippage', '5');

      const quoteRes = await fetch(quoteUrl.toString(), {
        headers: { 'Authorization': `Bearer ${API_KEY}` },
      });

      if (!quoteRes.ok) {
        throw new Error('Quote failed');
      }

      const quoteData: OneInchQuote = await quoteRes.json();
      setQuote(quoteData);

      const outAmount = formatUnits(BigInt(quoteData.toTokenAmount), 18);
      setEstimatedMini(parseFloat(outAmount).toLocaleString(undefined, { maximumFractionDigits: 0 }));

      // Now get the swap transaction
      const swapUrl = new URL(`${ONE_INCH_API}/swap`);
      swapUrl.searchParams.set('fromTokenAddress', '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE');
      swapUrl.searchParams.set('toTokenAddress', MINI_TOKEN.address);
      swapUrl.searchParams.set('amount', amountIn);
      swapUrl.searchParams.set('fromAddress', address);
      swapUrl.searchParams.set('slippage', '5');
      swapUrl.searchParams.set('allowPartialFill', 'true');

      const swapRes = await fetch(swapUrl.toString(), {
        headers: { 'Authorization': `Bearer ${API_KEY}` },
      });

      if (swapRes.ok) {
        const swapResult: OneInchSwap = await swapRes.json();
        setSwapData(swapResult);
      }
    } catch (err) {
      console.error('Quote error:', err);
      // Fallback to price estimate
      try {
        const priceRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${MINI_TOKEN.address}`);
        const priceData = await priceRes.json();
        if (priceData.pairs?.[0]) {
          const miniPrice = parseFloat(priceData.pairs[0].priceNative);
          const miniAmount = parseFloat(ethAmount) / miniPrice;
          setEstimatedMini(miniAmount.toLocaleString(undefined, { maximumFractionDigits: 0 }));
        }
      } catch {}
      setQuote(null);
      setSwapData(null);
    } finally {
      setIsLoadingQuote(false);
    }
  }, [ethAmount, address]);

  // Debounced quote fetch
  useEffect(() => {
    const timer = setTimeout(fetchQuote, 800);
    return () => clearTimeout(timer);
  }, [fetchQuote]);

  // Execute swap
  const handleSwap = async () => {
    if (!swapData || !address) {
      setError('No swap available');
      return;
    }

    setIsSwapping(true);
    setError('');

    try {
      const tx = swapData.tx;
      sendTransaction({
        to: tx.to as `0x${string}`,
        data: tx.data as `0x${string}`,
        value: BigInt(tx.value),
      });
    } catch (err) {
      console.error('Swap error:', err);
      setIsSwapping(false);
      setError('Swap failed - try again');
    }
  };

  const quickAmounts = ['0.01', '0.05', '0.1', '0.25'];
  
  const getButtonText = () => {
    if (!mounted) return 'Loading...';
    if (!isConnected) return 'Connect Wallet';
    if (!ethAmount || parseFloat(ethAmount) <= 0) return 'Enter Amount';
    if (isLoadingQuote) return 'Getting Quote...';
    if (success) return '✓ Success!';
    if (isSwapping) return 'Swapping...';
    if (!swapData) return 'No Route Found';
    return '🔄 Swap Now';
  };

  const canSwap = mounted && isConnected && ethAmount && parseFloat(ethAmount) > 0 && swapData && !isSwapping && !success && !isLoadingQuote;

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

      {success && (
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-center">
          ✓ Swap successful! MINI added to wallet.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
          {error}
        </div>
      )}

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
            disabled={isSwapping}
            className="flex-1 bg-transparent text-2xl font-bold text-white outline-none placeholder-gray-600 disabled:opacity-50"
          />
          <div className="flex items-center gap-2 bg-[#252535] px-3 py-2 rounded-lg">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs">Ξ</div>
            <span className="font-semibold">ETH</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-2">
        {quickAmounts.map((amt) => (
          <button key={amt} onClick={() => setEthAmount(amt)} disabled={isSwapping}
            className="flex-1 py-1.5 text-xs bg-[#1a1a25] hover:bg-[#252535] rounded-lg text-gray-400 hover:text-white transition-colors disabled:opacity-50">
            {amt}
          </button>
        ))}
      </div>

      <div className="flex justify-center my-3">
        <div className={`w-10 h-10 rounded-xl bg-[#1a1a25] flex items-center justify-center border border-[#2a2a3a] ${isLoadingQuote ? 'animate-pulse' : ''}`}>
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      <div className="bg-[#1a1a25] rounded-xl p-4 mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-xs text-gray-500">You receive {swapData ? '' : '(est.)'}</span>
          {mounted && isConnected && <span className="text-xs text-gray-500">Balance: {miniBal} MINI</span>}
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex-1 text-2xl font-bold gradient-text ${isLoadingQuote ? 'opacity-50' : ''}`}>
            {isLoadingQuote ? '...' : estimatedMini || '0'}
          </span>
          <div className="flex items-center gap-2 bg-[#252535] px-3 py-2 rounded-lg">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-xs font-bold">M</div>
            <span className="font-semibold">MINI</span>
          </div>
        </div>
      </div>

      <button onClick={handleSwap} disabled={!canSwap}
        className={`w-full text-lg py-4 rounded-xl font-semibold transition-all ${
          success ? 'bg-green-500 text-white' : isSwapping ? 'bg-cyan-500/50 text-white' : 'btn-primary glow-cyan'
        } disabled:opacity-50 disabled:cursor-not-allowed`}>
        {isSwapping && <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>}
        {getButtonText()}
      </button>

      {txHash && (
        <div className="mt-3 text-center">
          <a href={`https://basescan.org/tx/${txHash}`} target="_blank" className="text-xs text-cyan-400 hover:text-cyan-300">
            View on Basescan →
          </a>
        </div>
      )}

      <div className="mt-4 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">Network</span>
          <span className="text-white">● Base</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Router</span>
          <span className="text-white">1inch (Best Rate)</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Slippage</span>
          <span className="text-white">5%</span>
        </div>
      </div>
    </div>
  );
}
