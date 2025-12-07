import React, { useState, useEffect, useContext } from 'react';
import { authContext } from '../../Router';

function AnimatedNumber({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [end, duration]);

  return <>{count.toLocaleString()}{suffix}</>;
}

export default function Hero({ onGetStarted }: { onGetStarted?: () => void }) {
  const authCtx = useContext(authContext);

  const handleGetStarted = () => {
    authCtx.forceAuthPage();
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#2240AF] via-[#5B85AA] to-[#414770] text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Find Your Perfect Scholarship with <span className="text-yellow-300">AI</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-4 max-w-2xl mx-auto">
            Intelligent scholarship matching powered by advanced AI. Discover opportunities tailored to your profile.
          </p>

          {/* Badge */}
          <div className="bg-yellow-300/20 border border-yellow-300/40 rounded-lg p-4 mb-8 max-w-2xl mx-auto inline-block">
            <p className="text-yellow-100 font-semibold">
              🎓 <span className="text-yellow-300">181 Active Scholarships</span> from 2025 • AI-Trained & Verified
            </p>
          </div>

          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Our AI has been trained on 181 verified scholarship opportunities from 2025, ensuring you get the most accurate and up-to-date matches.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="px-8 py-3 bg-yellow-300 text-[#2240AF] font-bold rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Get Started Free
            </button>
            <a
              href="#features"
              className="px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Hero stats with animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">
              <AnimatedNumber end={181} duration={2000} />
            </div>
            <p className="text-white/80">Active Scholarships from 2025</p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">
              ₦<AnimatedNumber end={22755010} duration={2500} />
            </div>
            <p className="text-white/80">Potential Value from 2025</p>
          </div>
        </div>
      </div>
    </section>
  );
}
