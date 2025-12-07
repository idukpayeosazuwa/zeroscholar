import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#2240AF] text-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">ScholarAI</h3>
            <p className="text-white/80">Find your perfect scholarship powered by AI.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-white/80">
              <li><a href="#" className="hover:text-white transition">Finder</a></li>
              <li><a href="#" className="hover:text-white transition">Test Prep</a></li>
              <li><a href="#" className="hover:text-white transition">Community</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Learn</h4>
            <ul className="space-y-2 text-white/80">
              <li><a href="#" className="hover:text-white transition">About</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-white/80">
              <li><a href="#" className="hover:text-white transition">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/80 mb-4 md:mb-0">
              © 2025 ScholarAI. All rights reserved. Trained on 181 verified scholarships.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-white/80 hover:text-white transition">Twitter</a>
              <a href="#" className="text-white/80 hover:text-white transition">LinkedIn</a>
              <a href="#" className="text-white/80 hover:text-white transition">Instagram</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
