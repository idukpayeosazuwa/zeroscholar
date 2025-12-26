import React from 'react';
import Navbar from '../landing/components/Navbar';
import Hero from '../landing/components/Hero';
import Features from '../landing/components/Features';
import HowItWorks from '../landing/components/HowItWorks';
import Footer from '../landing/components/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white relative">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Footer />
    </div>
  );
}
