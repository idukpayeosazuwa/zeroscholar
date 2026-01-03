import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#2240AF] text-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-white/80">
            © 2025 ScholarAI. All rights reserved. 
            {' · '}
            <Link to="/privacy" className="hover:text-white underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
