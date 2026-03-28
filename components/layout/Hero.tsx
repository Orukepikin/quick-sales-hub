"use client";

interface HeroProps {
  onPostAd: () => void;
}

export default function Hero({ onPostAd }: HeroProps) {
  return (
    <div className="hero-gradient rounded-3xl px-8 sm:px-10 py-10 sm:py-12 mb-7 relative overflow-hidden text-white">
      {/* Decorative shapes */}
      <div className="absolute -top-[40%] -right-[10%] w-1/2 h-[180%] bg-brand-yellow rounded-[40px] rotate-[-15deg] opacity-15" />
      <div className="absolute -bottom-[20%] right-[5%] w-[30%] h-[120%] bg-brand-yellow rounded-[30px] rotate-[-20deg] opacity-[0.08]" />

      <h1 className="font-display text-3xl sm:text-[38px] font-extrabold leading-[1.15] mb-3 relative z-10">
        Buy & Sell <span className="text-brand-yellow">Anything</span>
        <br />
        In Minutes.
      </h1>
      <p className="text-base opacity-85 max-w-[480px] leading-relaxed mb-6 relative z-10">
        Nigeria&apos;s fastest growing marketplace. Join thousands of hustlers buying
        and selling everything from phones to fashion.
      </p>
      <button
        onClick={onPostAd}
        className="px-7 py-3.5 bg-brand-yellow text-gray-900 rounded-xl font-display font-bold text-[15px] transition-all hover:bg-brand-yellow-dark hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,184,0,0.4)] relative z-10"
      >
        Start Selling — Free
      </button>
    </div>
  );
}
