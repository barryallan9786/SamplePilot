import React from 'react';
import { ActiveTab } from '../types';

interface FooterProps {
  setActiveTab?: (tab: ActiveTab) => void;
  onOpenAbout?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAbout }) => {
  return (
    <footer className="bg-white border-t border-[#E5E5E5] mt-auto shadow-[0px_-4px_20px_rgba(0,0,0,0.02)]">
      <div className="flex flex-col md:flex-row justify-between items-center py-8 px-4 md:px-8 w-full max-w-[1120px] mx-auto gap-4 md:gap-0">
        <div className="font-bold text-xl md:text-2xl text-[#2B2B2B]">
          SamplePilot
        </div>

        {onOpenAbout && (
          <div className="flex flex-wrap justify-center gap-6 text-xs font-bold uppercase tracking-wider text-[#2B2B2B]">
            <button 
              onClick={onOpenAbout} 
              className="text-[#E8442C] hover:underline transition-colors"
            >
              About SamplePilot
            </button>
          </div>
        )}

        <div className="text-xs text-[#2B2B2B]/70 font-medium">
          © 2026 SamplePilot. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
