"use client";

import React, { useState } from "react";

interface ChatInputProps {
  placeholder?: string;
  onSubmit?: (message: string) => void;
  className?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  placeholder = "질문을 입력하세요",
  onSubmit,
  className = "",
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && onSubmit) {
      onSubmit(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <div className={`w-[880px] h-44 relative ${className}`} style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '50px',
      boxShadow: `
        inset 1px 1.5px 4px 0px rgba(0,0,0,0.10),
        inset 1px 1.5px 4px 0px rgba(0,0,0,0.08),
        inset 0px -0.5px 1px 0px rgba(255,255,255,0.25),
        inset 0px -0.5px 1px 0px rgba(255,255,255,0.30)
      `
    }}>
      {/* Blur layers */}
      <div className="w-[932px] h-52 relative rounded-[50px]">
        <div className="w-[1032px] h-72 left-[-50px] top-[-50px] absolute bg-white">
          <div className="w-[880px] h-36 left-[76px] top-[76px] absolute bg-black rounded-[34px]" />
        </div>
        <div className="w-[880px] h-36 left-[26px] top-[31px] absolute bg-blend-hard-light bg-black/10 rounded-[34px] blur-[20px] backdrop-blur-2xl" />
      </div>
      <div className="w-[880px] h-44 left-0 top-0 absolute opacity-70 bg-white/5 rounded-[50px]" />
      <div className="w-[880px] h-44 left-0 top-0 absolute bg-black/0 rounded-[50px]" />
      
      {/* Input Form */}
      <form 
        onSubmit={handleSubmit}
        className="absolute inset-0 z-10"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="absolute left-[56px] top-[42px] w-[748px] bg-transparent border-none outline-none text-neutral-600 text-xl font-medium font-['Noto_Sans_KR'] leading-5 placeholder:text-neutral-600"
        />
        <div className="w-[800px] left-[43px] top-[102px] absolute rounded-[100px] inline-flex justify-start items-center gap-[720px] pointer-events-none">
          <div className="w-9 h-9 relative overflow-hidden">
            <div className="w-7 h-7 left-[3.50px] top-[3px] absolute outline outline-[3px] outline-offset-[-1.50px] outline-[#6B6B6B]" />
          </div>
          <div className="w-8 h-8 relative overflow-hidden">
            <div className="w-7 h-7 left-0 top-0 absolute bg-zinc-400" />
          </div>
        </div>
      </form>
    </div>
  );
};

