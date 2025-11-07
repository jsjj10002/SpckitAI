import React from 'react';
import { LogoIcon } from './icons';

interface HeaderProps {
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onGoHome }) => {
  return (
    <header className="fixed top-0 left-0 right-0 p-4 z-20">
      <div className="container mx-auto flex justify-between items-center">
        <button onClick={onGoHome} className="flex items-center space-x-2 text-white transition-opacity hover:opacity-80">
          <LogoIcon />
          <span className="text-lg font-bold">Spckit AI</span>
        </button>
        <div className="flex items-center space-x-2">
          <button className="bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-700 transition-colors">
            login
          </button>
          <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">
            Sign up
          </button>
        </div>
      </div>
    </header>
  );
};