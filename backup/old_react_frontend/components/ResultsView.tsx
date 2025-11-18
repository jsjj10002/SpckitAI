import React, { useEffect, useRef, useState } from 'react';
import type { AiResponse, PCComponent } from '../types';
import { ChatInput } from './ChatInput';

interface ResultsViewProps {
  response: AiResponse | null;
  isLoading: boolean;
  error: string | null;
  chatHistory: { role: 'user' | 'model'; text: string }[];
  onSendMessage: (message: string) => void;
}

const ComponentCard: React.FC<{ component: PCComponent }> = ({ component }) => (
    <div className="bg-[#333333] shadow-[inset_2px_2px_5px_#1a1a1a,inset_-2px_-2px_5px_#454545] p-3 rounded-xl flex items-center gap-4 transition-all hover:bg-[#3a3a3a]">
        <div className="w-10 h-10 bg-zinc-800/50 rounded-md flex items-center justify-center font-bold text-xs text-zinc-400 shrink-0">
            {component.category.substring(0, 4).toUpperCase()}
        </div>
        <div className="flex-grow">
            <p className="font-semibold text-white text-sm">{component.name}</p>
            <div className="flex gap-2 mt-1.5 flex-wrap">
                {component.features.map((feature, idx) => (
                    <span key={idx} className="text-xs bg-zinc-700 text-zinc-200 px-2 py-0.5 rounded-full">{feature}</span>
                ))}
            </div>
        </div>
        <p className="ml-auto text-sm text-zinc-300 font-medium text-right shrink-0">{component.price}</p>
    </div>
);

export const ResultsView: React.FC<ResultsViewProps> = ({ response, isLoading, error, chatHistory, onSendMessage }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [displayedText, setDisplayedText] = useState('');
  const [displayedComponents, setDisplayedComponents] = useState<PCComponent[]>([]);
  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
        setIsEntering(true);
    });
  }, []);

  const lastMessage = chatHistory[chatHistory.length - 1];

  useEffect(() => {
    if (lastMessage?.role === 'model' && !isLoading) {
      let charIndex = 0;
      setDisplayedText(''); 
      const text = lastMessage.text;
      const intervalId = setInterval(() => {
        if (charIndex < text.length) {
          setDisplayedText(prev => text.substring(0, prev.length + 1));
          charIndex++;
        } else {
          clearInterval(intervalId);
        }
      }, 10);
      return () => clearInterval(intervalId);
    }
  }, [lastMessage, isLoading]);

  useEffect(() => {
    if (response?.components && !isLoading) {
        setDisplayedComponents([]);
        const components = response.components;
        let i = 0;
        const intervalId = setInterval(() => {
            if (i < components.length) {
                setDisplayedComponents(prev => [...prev, components[i]]);
                i++;
            } else {
                clearInterval(intervalId);
            }
        }, 100);
        return () => clearInterval(intervalId);
    }
  }, [response, isLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, displayedText, displayedComponents, isLoading]);


  return (
    <div className="absolute -top-1 -bottom-9 -left-9 -right-9">
      <div className="w-full h-full flex gap-4">
        {/* Left Column */}
        <div className={`w-1/2 h-full transform transition-transform duration-500 ease-out ${isEntering ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-full bg-[#333333]/85 backdrop-blur-xl border border-white/20 rounded-3xl p-6 pl-12 flex flex-col min-h-0">
            <div className="flex-grow overflow-y-auto space-y-6 pr-2 -mr-2">
              {chatHistory.map((message, index) => {
                const isLastMessage = index === chatHistory.length - 1;
                const isModel = message.role === 'model';
                const isError = isModel && error && message.text === error;
                
                const currentText = (isLastMessage && isModel && !isLoading && !isError) ? displayedText : message.text;
                const showCursor = (isLastMessage && isModel && !isLoading && !isError) && displayedText.length < message.text.length;

                if (isError) {
                   return (
                      <div key={index} className="flex justify-start">
                          <div className="max-w-xl p-4 rounded-xl bg-red-900/50 border border-red-700 text-red-300">
                              <p className="font-bold mb-1">오류</p>
                              <p className="text-sm">{message.text}</p>
                          </div>
                      </div>
                   )
                }

                return (
                   <div key={index} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-xl p-4 rounded-xl text-zinc-200 bg-[#333333] shadow-[inset_2px_2px_5px_#1a1a1a,inset_-2px_-2px_5px_#454545]`}>
                      <p className="whitespace-pre-wrap">{currentText}{showCursor && <span className="animate-pulse">▋</span>}</p>
                    </div>
                  </div>
                )
              })}
              {isLoading && chatHistory.length > 0 && chatHistory[chatHistory.length -1].role === 'user' && (
                <div className="flex justify-start">
                  <div className="p-4">
                    <div className="w-8 h-8 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin"></div>
                  </div>
                </div>
              )}
               <div ref={messagesEndRef} />
            </div>
            <div className="mt-4 shrink-0">
              <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} disableTypingAnimation />
            </div>
          </div>
        </div>

        {/* Right Column: Viewer and Components */}
        <div className="w-1/2 h-full flex flex-col gap-4">
          <div className={`h-3/5 bg-[#b7b7b7]/85 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center justify-center text-zinc-500 transform transition-transform duration-500 ease-out delay-75 pr-8 ${isEntering ? 'translate-x-0' : 'translate-x-full'}`}>
            <p className="text-black/50 font-semibold">3D Viewer Placeholder</p>
          </div>
          <div className={`h-2/5 bg-[#6b6b6b]/85 backdrop-blur-xl border border-white/20 rounded-3xl p-6 pr-12 pb-12 flex flex-col min-h-0 transform transition-transform duration-500 ease-out delay-150 ${isEntering ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            <p className="font-bold text-lg mb-3 px-1 shrink-0 text-white">추천 부품</p>
            <div className="overflow-y-auto pr-2 -mr-4 space-y-2">
              {displayedComponents.map((comp, index) => {
                if (!comp) return null; // Prevent crashes from invalid data
                return <ComponentCard key={index} component={comp} />;
              })}
              {!response && isLoading && (
                 Array.from({length: 5}).map((_, i) => (
                    <div key={i} className="bg-[#333333]/50 h-[68px] rounded-xl animate-pulse"></div>
                 ))
              )}
              {!response && !isLoading && chatHistory.length > 0 && (
                <div className="text-center text-white/50 pt-8">
                    <p>AI의 추천을 기다리고 있습니다...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};