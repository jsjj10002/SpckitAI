"use client";

import React from "react";

interface Product {
  id: string;
  name: string;
  price: string;
  feature1: string;
  feature2: string;
  imageUrl?: string;
}

interface ProductListProps {
  products: Product[];
  className?: string;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  className = "",
}) => {
  return (
    <div className={`w-full flex flex-col justify-start items-start gap-2.5 overflow-hidden ${className}`}>
      {products.map((product, index) => (
        <React.Fragment key={product.id}>
          <div className="self-stretch h-24 inline-flex justify-start items-center gap-2.5 overflow-hidden">
            <div className="w-24 h-24 opacity-90 bg-[#E0E0E0] rounded-[10px] flex justify-center items-center gap-5 overflow-hidden">
              {product.imageUrl ? (
                <img className="w-20 h-20" src={product.imageUrl} alt={product.name} />
              ) : (
                <div className="w-20 h-20 bg-[#C8C8C8] rounded" />
              )}
            </div>
            <div className="flex-1 h-24 flex justify-start items-start gap-[5px] overflow-hidden">
              <div className="px-[5px] pt-0.5 inline-flex flex-col justify-start items-center gap-0.5 overflow-hidden flex-[2]">
                <div className="w-full inline-flex justify-start items-start overflow-hidden">
                  <div className="text-center justify-start text-[#E0E0E0] text-xl font-bold font-noto-sans-kr tracking-widest">
                    제품명
                  </div>
                </div>
                <div className="w-full py-0.5 flex flex-col justify-start items-start gap-[5px] overflow-hidden">
                  <div className="w-full justify-start text-[#E0E0E0] text-xl font-normal font-noto-sans-kr tracking-widest">
                    {product.name}
                  </div>
                </div>
              </div>
              <div className="px-[5px] inline-flex flex-col justify-start items-center gap-[5px] overflow-hidden flex-[0.5]">
                <div className="w-full inline-flex justify-start items-start overflow-hidden">
                  <div className="justify-start text-white text-xl font-bold font-noto-sans-kr tracking-widest">
                    가격
                  </div>
                </div>
                <div className="w-full py-0.5 flex flex-col justify-start items-start gap-2.5 overflow-hidden">
                  <div className="justify-start text-white text-xl font-normal font-noto-sans-kr tracking-widest">
                    {product.price}
                  </div>
                </div>
              </div>
              <div className="px-[5px] inline-flex flex-col justify-start items-center gap-[5px] overflow-hidden flex-1">
                <div className="inline-flex justify-start items-center overflow-hidden">
                  <div className="justify-start text-white text-xl font-bold font-noto-sans-kr tracking-widest">
                    특징 1
                  </div>
                </div>
                <div className="py-0.5 flex flex-col justify-start items-start gap-2.5 overflow-hidden">
                  <div className="justify-start text-white text-xl font-light font-noto-sans-kr tracking-widest">
                    {product.feature1}
                  </div>
                </div>
              </div>
              <div className="px-[5px] inline-flex flex-col justify-start items-center gap-[5px] overflow-hidden flex-1">
                <div className="inline-flex justify-start items-center gap-2.5 overflow-hidden">
                  <div className="justify-start text-white text-xl font-bold font-noto-sans-kr tracking-widest">
                    특징 2
                  </div>
                </div>
                <div className="py-0.5 flex flex-col justify-start items-start gap-2.5 overflow-hidden">
                  <div className="justify-start text-white text-xl font-light font-noto-sans-kr tracking-widest">
                    {product.feature2}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {index < products.length - 1 && (
            <div className="self-stretch h-0 outline outline-[3px] outline-offset-[-1.50px] outline-[#E0E0E0]"></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

