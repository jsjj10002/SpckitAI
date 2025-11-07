"use client";

import React from "react";

export const BackgroundStars: React.FC = () => {
  return (
    <div className="w-[1920px] h-[1099px] left-0 top-0 absolute overflow-hidden">
      {/* Grid Pattern - 디자인 이미지의 배경 그리드 (50x50px) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(51, 51, 51, 1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(51, 51, 51, 1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          opacity: 1
        }}
      />

      {/* Large Glow Effect - 중앙 하단 (디자인 이미지 기준) */}
      <div className="w-[661.12px] h-[661.12px] left-[638px] top-[993px] absolute bg-orange-100 blur-[312px]" />

      {/* Stars with Glow - 디자인 이미지 기준 정확한 위치와 크기 */}
      {/* Left Top Small - (354px, 463.5px) */}
      <div className="absolute left-[354px] top-[463.50px] overflow-hidden">
        <div className="w-3.5 h-3.5 left-0 top-0 absolute bg-stone-300" />
        <div className="w-36 h-40 left-[287px] top-[393px] absolute bg-orange-100/50 border border-black blur-3xl" />
      </div>

      {/* Left Bottom Medium - (133.5px, 769.5px) */}
      <div className="absolute left-[133.50px] top-[769.50px] overflow-hidden">
        <div className="w-5 h-5 left-0 top-0 absolute bg-stone-300" />
        <div className="w-36 h-40 left-[70px] top-[703px] absolute bg-orange-100/50 blur-[85px]" />
      </div>

      {/* Center Top - (611.94px, 221px) */}
      <div className="absolute left-[611.94px] top-[221px] overflow-hidden">
        <div className="w-7 h-7 left-0 top-0 absolute bg-stone-300" />
        <div className="w-36 h-40 left-[552px] top-[158px] absolute bg-orange-100/50 blur-[100px]" />
      </div>

      {/* Left Top Very Small - (122.09px, 130.09px) */}
      <div className="absolute left-[122.09px] top-[130.09px] overflow-hidden">
        <div className="w-4 h-4 left-0 top-0 absolute bg-stone-300" />
        <div className="w-24 h-28 left-[79px] top-[85px] absolute bg-orange-100/50 blur-[55px]" />
      </div>

      {/* Right Center - (1794px, 440px) */}
      <div className="absolute left-[1794px] top-[440px] overflow-hidden">
        <div className="w-7 h-7 left-0 top-0 absolute bg-stone-300" />
        <div className="w-44 h-44 left-[1722px] top-[363px] absolute bg-orange-100/50 blur-[90px]" />
      </div>

      {/* Right Top - (1300.84px, 205px) */}
      <div className="absolute left-[1300.84px] top-[205px] overflow-hidden">
        <div className="w-3.5 h-3.5 left-0 top-0 absolute bg-stone-300" />
        <div className="w-32 h-36 left-[1241px] top-[141px] absolute bg-orange-100/50 blur-3xl" />
      </div>

      {/* Right Bottom - (1653px, 898px) */}
      <div className="absolute left-[1653px] top-[898px] overflow-hidden">
        <div className="w-3.5 h-3.5 left-0 top-0 absolute bg-stone-300" />
        <div className="w-44 h-48 left-[1571px] top-[811px] absolute bg-orange-100/50 blur-[100px]" />
      </div>
    </div>
  );
};
