'use client';

import { MINI_TOKEN } from '@/lib/config';
import { useState, useEffect } from 'react';
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther, formatUnits, encodeFunctionData } from 'viem';

// Uniswap V4 contracts on Base
const UNIVERSAL_ROUTER = '0x6ff5693b99212da76ad316178a184ab56d299b43' as `0x${string}`;
const WETH = '0x4200000000000000000000000000000000000006' as `0x${string}`;

// V4SwapRouter ABI
const V4_ROUTER_ABI = [{
  type: 'function',
  name: 'exactInputSingle',
  stateMutability: 'payable',
  inputs: [{
    name: 'params',
    type: 'tuple',
    components: [
      { name: 'tokenIn', type: 'address' },
      { name: 'tokenOut', type: 'address' },
      { name: 'fee', type: 'uint24' },
      { name: 'tickSpacing', type: 'int24' },
      { name: 'recipient', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMinimum', type: 'uint256' },
      { name: 'sqrtPriceLimitX96', type: 'uint160' },
    ],
  }],
  outputs: [{ name: 'amountOut', type: 'uint256' }],
}] as const;

// Common V4 fee tiers
const FEE_TIERS = [
  { fee: 100, tickSpacing: 1, label: '0.01%' },
  { fee: 500, tickSpacing: 10, label: '0.05%' },
  { fee: 1000, tickSpacing: 50, label: '0.1%' },
  { fee: 3000, tickSpacing: 60, label: '0.3%' },
  { fee: 10000, tickSpacing: 200, label: '1%' },
];

export function SwapWidget() {
  const [mounted, setMounted] = useState(false);
  const [ethAmount, setEthAmount] = useState('');
  const [estimatedMini, setEstimatedMini] = useState('0');
  const [miniPrice, setMiniPrice] = useState<number | null>(null);
  const [selectedTier, setSelectedTier] = useState(1);
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [lastTxFee, setLastTxFee] = useState<number | null>(null);
  
  const { address, isConnected } = useAccount();
  const { data: ethBalance } = useBalance({ address });
  const { data: miniBalance, refetch: refetchMini } = useBalance({
    address,
    token: MINI_TOKEN.address,
  });

  const { sendTransaction, data: txHash, isPending, isError, reset, error: txError } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: txSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isError && txError) {
      setIsSwapping(false);
      const errMsg = txError.message || 'Transaction failed';
      // Extract fee tier from error if present
      if (errMsg.includes('fee') || errMsg.includes('tick')) {
        setError(`Wrong fee tier. Try a different one.`);
      } else {
        setError('Transaction cancelled or failed');
      }
      setTimeout(() => { setError(''); }, 4000);
      reset();
    }
  }, [isError, txError, reset]);

  useEffect(() => {
    if (txSuccess) {
      setIsSwapping(false);
      setSuccess(true);
      refetchMini();
      setTimeout(() => {
        setSuccess(false);
        setEthAmount('');
        setEstimatedMini('0');
        setLastTxFee(null);
        reset();
      }, 4000);
    }
  }, [txSuccess, refetchMini, reset]);

  useEffect(() => {
    if (isPending || isConfirming) setIsSwapping(true);
  }, [isPending, isConfirming]);

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

  const handleSwap = async () => {
    if (!address || !ethAmount || parseFloat(ethAmount) <= 0 || !miniPrice) return;
    
    setIsSwapping(true);
    setError('');

    try {
      const amountIn = parseEther(ethAmount);
      const expectedOut = parseEther(ethAmount) / BigInt(Math.floor(miniPrice * 1e18)) * BigInt(1e18);
      const amountOutMinimum = expectedOut * 85n / 100n; // 15% slippage

      const tier = FEE_TIERS[selectedTier];
      
      const swapData = encodeFunctionData({
        abi: V4_ROUTER_ABI,
        functionName: 'exactInputSingle',
        args: [{
          tokenIn: WETH,
          tokenOut: MINI_TOKEN.address,
          fee: tier.fee,
          tickSpacing: tier.tickSpacing,
          recipient: address,
          amountIn: amountIn,
          amountOutMinimum: amountOutMinimum,
          sqrtPriceLimitX96: BigInt(0),
        }],
      });

      setLastTxFee(tier.fee);

      sendTransaction({
        to: UNIVERSAL_ROUTER,
        data: swapData as `0x${string}`,
        value: amountIn,
      });
    } catch (err) {
      console.error('Swap error:', err);
      setIsSwapping(false);
      setError('Failed to prepare swap');
    }
  };

  const quickAmounts = ['0.01', '0.05', '0.1', '0.25'];
  
  const getButtonText = () => {
    if (!mounted) return 'Loading...';
    if (!isConnected) return 'Connect Wallet';
    if (!ethAmount || parseFloat(ethAmount) <= 0) return 'Enter Amount';
    if (success) return '✓ Success!';
    if (isSwapping) return 'Swapping...';
    return `🔄 Swap (${FEE_TIERS[selectedTier].label})`;
  };

  const canSwap = mounted && isConnected && ethAmount && parseFloat(ethAmount) > 0 && !isSwapping && !success;

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

      <div className="flex gap-2 mb-3">
        {quickAmounts.map((amt) => (
          <button key={amt} onClick={() => setEthAmount(amt)} disabled={isSwapping}
            className="flex-1 py-1.5 text-xs bg-[#1a1a25] hover:bg-[#252535] rounded-lg text-gray-400 hover:text-white transition-colors disabled:opacity-50">
            {amt}
          </button>
        ))}
      </div>

      {/* Fee tier selector */}
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-2">Fee tier (try different if swap fails):</p>
        <div className="flex flex-wrap gap-2">
          {FEE_TIERS.map((tier, idx) => (
            <button
              key={tier.fee}
              onClick={() => setSelectedTier(idx)}
              disabled={isSwapping}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                selectedTier === idx 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' 
                  : 'bg-[#1a1a25] text-gray-400 hover:bg-[#252535]'
              } disabled:opacity-50`}
            >
              {tier.label}
            </button>
          ))}
        </div>
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
            View on Basescan {lastTxFee && `(fee: ${FEE_TIERS.find(t => t.fee === lastTxFee)?.label})`} →
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
          <span className="text-white">Uniswap V4</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Slippage</span>
          <span className="text-white">15%</span>
        </div>
      </div>
    </div>
  );
}
