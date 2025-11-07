"use client";

import React from "react";

interface ChatMessageProps {
  message: string;
  className?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  className = "",
}) => {
  return (
    <div className={`w-[577px] h-40 relative overflow-hidden ${className}`}>
      <div className="w-[577px] h-36 left-0 top-[10px] absolute bg-zinc-800 rounded-[50px] shadow-[inset_12px_12px_24px_0px_rgba(30,30,30,1.00)] shadow-[inset_-12px_-12px_24px_0px_rgba(62,62,62,1.00)]" />
      <div className="w-[515px] h-28 left-[31px] top-[27px] absolute justify-center text-zinc-100/95 text-2xl font-normal font-['Noto_Sans_KR'] leading-10 tracking-wide">
        {message}
      </div>
    </div>
  );
};

