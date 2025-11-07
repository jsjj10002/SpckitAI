"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { BackgroundStars } from "@/components/BackgroundStars";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { ResponseMessage } from "@/components/ResponseMessage";
import { Render3D } from "@/components/Render3D";
import { ProductList } from "@/components/ProductList";

interface Product {
  id: string;
  name: string;
  price: string;
  feature1: string;
  feature2: string;
  imageUrl?: string;
}

function LayoutContent() {
  const searchParams = useSearchParams();
  const initialQuestion = searchParams.get("question") || "";
  
  const [question, setQuestion] = useState(initialQuestion);
  const [showPanels, setShowPanels] = useState(false);
  const [response, setResponse] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (initialQuestion) {
      // 질문이 있으면 패널 표시
      setTimeout(() => {
        setShowPanels(true);
        // 예시 응답 데이터 설정
        setResponse(
          `1. 핵심 고려사항 (디자인 워크플로우):<br/>2D 디자인 (포토샵, 일러스트): 위 사양으로 매우 쾌적하게 작업할 수 있습니다. CPU 성능과 RAM 용량이 중요하며, 16GB RAM은 대부분의 작업을 소화합니다.<br/>3D 및 영상 (블렌더, 프리미어 프로): RTX 4060은 엔트리급 3D 작업 및 FHD 영상 편집 가속에 효율적입니다. 하지만 복잡한 3D 렌더링이나 4K 편집 시에는 VRAM(8GB)의 한계와 렌더링 시간 증가를 체감할 수 있습니다.<br/>2. 예산 관련 조언:<br/>예산 조정 (100만원 이하): GPU를 한 단계 낮추거나 (예: RTX 3050 8GB), SSD 용량을 512GB로 줄여야 합니다. 하지만 그래픽 작업의 핵심인 GPU 성능 저하는 권장하지 않습니다.`
        );
        setProducts([
          {
            id: "1",
            name: "AMD 라이젠7-6세대 9700X",
            price: "가격",
            feature1: "내용",
            feature2: "내용",
          },
          {
            id: "2",
            name: "AMD 라이젠7-5세대 7800X3D",
            price: "가격",
            feature1: "내용",
            feature2: "내용",
          },
        ]);
      }, 300);
    }
  }, [initialQuestion]);

  const handleSubmit = (message: string) => {
    setQuestion(message);
    setShowPanels(false);
    // 애니메이션을 위해 약간의 지연 후 패널 표시
    setTimeout(() => {
      setShowPanels(true);
      // 실제로는 API 호출로 응답 받아야 함
      setResponse("응답이 여기에 표시됩니다.");
      setProducts([]);
    }, 300);
  };

  return (
    <div className="w-[1920px] h-[1099px] relative overflow-hidden">
      <BackgroundStars />
      <div className="w-[1920px] left-0 top-0 absolute inline-flex flex-col justify-start items-start overflow-hidden">
        <Header />
        <div className="w-[1920px] h-[994px] inline-flex justify-between items-center overflow-hidden">
          {/* 왼쪽 패널 - 대화창 */}
          <div className="w-[960px] h-[994px] px-10 pt-10 relative inline-flex flex-col justify-start items-end gap-3.5">
            {/* 대화창 배경 */}
            <div className="w-[1026px] h-[1051px] left-[-61px] top-[15px] absolute">
              <div className="w-[1078px] h-[1103px] left-[-26px] top-[-26px] absolute">
                <div className="w-[1178px] h-[1203px] left-[-50px] top-[-50px] absolute bg-white">
                  <div className="w-[1026px] h-[1051px] left-[76px] top-[76px] absolute bg-black rounded-[34px]" />
                </div>
                <div className="w-[1026px] h-[1051px] left-[26px] top-[31px] absolute bg-blend-hard-light bg-black/10 rounded-[34px] blur-[20px] backdrop-blur-2xl" />
              </div>
              <div className="w-[1026px] h-[1051px] left-0 top-0 absolute opacity-70 bg-white/5 rounded-[50px]" />
              <div className="w-[1026px] h-[1051px] left-0 top-0 absolute bg-black/0 rounded-[50px]" />
            </div>
            
            {/* 대화 내용 */}
            <div className="relative z-10 w-full flex flex-col items-end gap-3.5 flex-1 overflow-y-auto pr-4">
              {question && (
                <ChatMessage
                  message={question}
                  className="transition-opacity duration-500"
                />
              )}

              {showPanels && response && (
                <ResponseMessage
                  content={response}
                  className="transition-opacity duration-500"
                />
              )}
            </div>

            {/* 입력 필드 */}
            <div className="relative z-10 w-[880px] h-28 py-2.5 left-[40px] top-[852px] absolute flex flex-col justify-center items-center gap-2.5 overflow-hidden">
              <ChatInput
                placeholder="질문을 입력하세요"
                onSubmit={handleSubmit}
              />
            </div>
          </div>

          {/* 오른쪽 패널 - 정보패널 */}
          <div className="w-[960px] h-[994px] inline-flex flex-col justify-start items-start overflow-hidden">
            {/* 3D 렌더링 창 */}
            <div 
              className={`w-[960px] h-[580px] px-3.5 pt-3.5 relative flex flex-col justify-center items-center overflow-hidden transition-all duration-700 ease-out ${
                showPanels ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
              }`}
            >
              <div className="w-[1063px] h-[565px] left-[15px] top-[15px] absolute">
                <div className="w-[1115px] h-[617px] left-[-26px] top-[-26px] absolute">
                  <div className="w-[1215px] h-[717px] left-[-50px] top-[-50px] absolute bg-white">
                    <div className="w-[1063px] h-[565px] left-[76px] top-[76px] absolute bg-black rounded-[34px]" />
                  </div>
                  <div className="w-[1063px] h-[565px] left-[26px] top-[31px] absolute bg-blend-hard-light bg-black/10 rounded-[34px] blur-[20px] backdrop-blur-2xl" />
                </div>
                <div className="w-[1063px] h-[565px] left-0 top-0 absolute opacity-70 bg-white/5 rounded-tl-[50px] rounded-tr-[50px] rounded-bl-[10px] rounded-br-[50px]" />
                <div className="w-[1063px] h-[565px] left-0 top-0 absolute bg-black/0 rounded-[50px]" />
                <div className="w-[536px] h-12 left-[212px] top-[443px] absolute">
                  <div className="w-[536px] h-12 left-0 top-0 absolute bg-zinc-800 rounded-full blur-[30px]" />
                </div>
              </div>
              {showPanels && <Render3D isVisible={showPanels} />}
            </div>

            {/* 제품 정보 창 */}
            <div 
              className={`w-[960px] h-96 pl-3.5 pr-6 pt-3.5 pb-4 relative flex flex-col justify-start items-start gap-2.5 overflow-hidden transition-all duration-700 ease-out ${
                showPanels && products.length > 0
                  ? "translate-y-0 opacity-100"
                  : "translate-y-full opacity-0"
              }`}
            >
              <div className="w-[1066px] h-[458px] left-[15px] top-[15px] absolute">
                <div className="w-[1118px] h-[510px] left-[-26px] top-[-26px] absolute">
                  <div className="w-[1218px] h-[610px] left-[-50px] top-[-50px] absolute bg-white">
                    <div className="w-[1066px] h-[458px] left-[76px] top-[76px] absolute bg-black rounded-[34px]" />
                  </div>
                  <div className="w-[1066px] h-[458px] left-[26px] top-[31px] absolute bg-blend-hard-light bg-black/10 rounded-[34px] blur-[20px] backdrop-blur-2xl" />
                </div>
                <div className="w-[1066px] h-[458px] left-0 top-0 absolute opacity-70 bg-white/5 rounded-[10px]" />
                <div className="w-[1066px] h-[458px] left-0 top-0 absolute bg-black/0 rounded-[10px]" />
              </div>
              <div className="relative z-10 w-[940px]">
                {showPanels && products.length > 0 && (
                  <ProductList products={products} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LayoutPage() {
  return (
    <Suspense fallback={<div className="w-screen h-screen bg-zinc-950 flex items-center justify-center text-white">로딩 중...</div>}>
      <LayoutContent />
    </Suspense>
  );
}

