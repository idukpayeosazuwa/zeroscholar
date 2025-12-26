
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tab } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import { UserIcon } from './icons/UserIcon';
import { ToolsIcon } from './icons/ToolsIcon';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
  const activeClasses = 'text-blue-600';
  const inactiveClasses = 'text-gray-500';

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};


const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleFinderClick = () => {
    setActiveTab('finder');
    navigate('/app');
  };

  const handleProfileClick = () => {
    navigate('/app/edit-profile');
  };

  const handleToolsClick = () => {
    navigate('/app/tools');
  };

  const isOnEditProfile = location.pathname.includes('/edit-profile');
  const isOnTools = location.pathname.includes('/tools');
  const isOnFinder = !isOnEditProfile && !isOnTools;

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_5px_-1px_rgba(0,0,0,0.1)] z-20">
      <div className="max-w-md mx-auto h-16 flex justify-around items-center">
        <NavItem
          icon={<SearchIcon className="h-6 w-6 mb-1" />}
          label="Finder"
          isActive={isOnFinder}
          onClick={handleFinderClick}
        />
        <NavItem
          icon={<ToolsIcon className="h-6 w-6 mb-1" />}
          label="Tools"
          isActive={isOnTools}
          onClick={handleToolsClick}
        />
        <NavItem
          icon={<UserIcon className="h-6 w-6 mb-1" />}
          label="Profile"
          isActive={isOnEditProfile}
          onClick={handleProfileClick}
        />
      </div>
    </footer>
  );
};

export default BottomNav;
