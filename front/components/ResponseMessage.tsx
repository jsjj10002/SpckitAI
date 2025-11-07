"use client";

import React from "react";

interface ResponseMessageProps {
  content: string;
  className?: string;
}

export const ResponseMessage: React.FC<ResponseMessageProps> = ({
  content,
  className = "",
}) => {
  return (
    <div className={`w-[880px] h-[620px] relative overflow-hidden ${className}`}>
      <div className="w-[880px] h-[600px] left-0 top-[10px] absolute bg-zinc-800 rounded-[50px] shadow-[inset_12px_12px_24px_0px_rgba(30,30,30,1.00)] shadow-[inset_-12px_-12px_24px_0px_rgba(62,62,62,1.00)]" />
      <div className="w-[797px] h-[531px] left-[41px] top-[55px] absolute justify-center">
        <span className="text-zinc-100 text-2xl font-normal font-['Noto_Sans_KR'] leading-10 tracking-wide" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </div>
  );
};

