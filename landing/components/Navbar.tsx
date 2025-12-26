import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogoIcon } from '../../components/icons/LogoIcon';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="absolute top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <LogoIcon className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">ScholarAI</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="bg-white text-[#2240AF] px-5 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
