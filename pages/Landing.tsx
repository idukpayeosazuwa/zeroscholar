import React, { useContext }from 'react';
import Hero from '../landing/components/Hero';
import Features from '../landing/components/Features';
import HowItWorks from '../landing/components/HowItWorks';
import Footer from '../landing/components/Footer';
import { authContext } from '../Router';

export default function Landing() {
  return (
    <div onGetStarted={() => useContext(authContext).forceAuthPage()} className="min-h-screen bg-white">
      <Hero onGetStarted={() => useContext(authContext).forceAuthPage()} />
      <Features />
      <HowItWorks />
      <Footer />
    </div>
  );
}
