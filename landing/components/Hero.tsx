import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

export default function Hero() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
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
          <h1 className="text-3xl md:text-6xl font-bold mb-6 leading-tight">
            Find Your Perfect Scholarship with <span className="text-yellow-300">AI</span>
          </h1>

            <p>Every year students miss out millions in scholarships</p>
        </div>

        {/* Hero stats with animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-3">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">
              <AnimatedNumber end={181} duration={8000} />
            </div>
            <p className="text-white/80">Active Scholarships from 2025</p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">
              ₦<AnimatedNumber end={42755010} duration={8500} />
            </div>
            <p className="text-white/80"> Value from 2025</p>
          </div>
        </div>
      </div>
    </section>
  );
}
