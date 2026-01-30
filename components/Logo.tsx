'use client';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { icon: 32, text: 'text-xl' },
    md: { icon: 48, text: 'text-3xl' },
    lg: { icon: 64, text: 'text-5xl' },
  };

  const { icon, text } = sizes[size];

  return (
    <div className="flex items-center gap-3">
      {/* Logo Icon - Stylized M with circuit/AI aesthetic */}
      <div
        className="relative flex items-center justify-center rounded-xl glow-cyan"
        style={{
          width: icon,
          height: icon,
          background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 50%, #7c3aed 100%)',
        }}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: icon * 0.7, height: icon * 0.7 }}
        >
          {/* M shape with circuit nodes */}
          <path
            d="M6 24V10L12 18L16 12L20 18L26 10V24"
            stroke="#0a0a0f"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Circuit dots */}
          <circle cx="6" cy="10" r="2" fill="#0a0a0f" />
          <circle cx="16" cy="12" r="2" fill="#0a0a0f" />
          <circle cx="26" cy="10" r="2" fill="#0a0a0f" />
        </svg>
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
      </div>
      
      {/* Text */}
      <div className="flex flex-col">
        <span className={`${text} font-bold gradient-text leading-none`}>
          MiniMax
        </span>
        <span className="text-sm text-cyan-400 font-medium tracking-widest">
          CLAWD
        </span>
      </div>
    </div>
  );
}
