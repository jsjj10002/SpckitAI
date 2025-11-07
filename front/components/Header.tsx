"use client";

import React from "react";

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = "" }) => {
  return (
    <div className={`py-4 bg-zinc-950/0 border-b border-white/20 backdrop-blur-[142px] flex flex-col justify-start items-start ${className}`}>
      <div className="flex flex-col justify-start items-start">
        <div className="w-[1920px] px-80 py-4 inline-flex justify-between items-center">
          <div className="w-[1811px] flex justify-between items-center">
            <div className="flex justify-start items-center gap-3.5">
              <div className="w-8 h-8 bg-white" />
              <div className="px-3 py-0.5 flex justify-center items-center gap-2.5">
                <div className="w-32 text-center justify-start text-white text-2xl font-extralight font-['Noto_Sans']">Spckit AI</div>
              </div>
            </div>
            <div className="h-10 flex justify-center items-center gap-6">
              <div className="px-8 py-3.5 bg-white rounded-[55px] flex justify-center items-center">
                <div className="text-center justify-start text-black text-base font-medium font-['Poppins']">login</div>
              </div>
              <div className="px-8 py-3.5 bg-white rounded-[55px] flex justify-center items-center">
                <div className="text-center justify-start text-black text-base font-medium font-['Poppins']">Sign up</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

