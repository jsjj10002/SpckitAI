"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { BackgroundStars } from "@/components/BackgroundStars";
import { ChatInput } from "@/components/ChatInput";

export default function LandingPage() {
  const router = useRouter();

  const handleSubmit = (message: string) => {
    if (!message.trim()) return;
    router.push(`/layout?question=${encodeURIComponent(message)}`);
  };

  return (
    <div className="w-[1920px] h-[1099px] relative overflow-hidden">
      <BackgroundStars />
      <div className="w-[1920px] h-[1099px] left-0 top-0 absolute inline-flex flex-col justify-start items-center gap-56">
        <div className="py-4 bg-zinc-950/0 border-b border-white/20 backdrop-blur-[142px] flex flex-col justify-start items-start">
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
        <div className="w-[878px] flex flex-col justify-start items-center gap-36">
          <div className="self-stretch flex flex-col justify-start items-center gap-7">
            <div className="flex flex-col justify-start items-center gap-2">
              <div className="justify-start text-white text-4xl font-extralight font-['Noto_Sans']">Spckit AI</div>
              <div className="w-[674.68px] text-center justify-start text-white text-6xl font-['Noto_Sans_KR'] leading-[74px]">최고의 견적을 맞추세요</div>
            </div>
          </div>
          <ChatInput 
            placeholder="주로 컴퓨터로 어떤 일을 하세요?"
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
