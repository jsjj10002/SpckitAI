import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PlusIcon, SendIcon } from './icons';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disableTypingAnimation?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, disableTypingAnimation }) => {
  const [message, setMessage] = useState('');
  const [placeholder, setPlaceholder] = useState('');

  const examplePrompts = useMemo(() => [
    "주로 컴퓨터로 어떤 일을 하세요?",
    "150만원 예산으로 게이밍 PC를 맞추고 싶어요.",
    "4K 영상 편집용 워크스테이션이 필요해요.",
    "디자인 작업을 위한 최고의 그래픽 카드는 무엇인가요?",
    "화이트 톤으로 깔끔한 PC를 구성하고 싶어요.",
    "VR 게임을 원활하게 돌릴 수 있는 사양을 알려주세요.",
    "코딩과 가상머신을 위한 컴퓨터 견적을 내주세요."
  ], []);

  const stateRef = useRef({
    promptIndex: 0,
    charIndex: 0,
    isDeleting: false,
    timeoutId: null as number | null,
  });

  useEffect(() => {
    if (disableTypingAnimation) return;

    const type = () => {
      const s = stateRef.current;
      const currentPrompt = examplePrompts[s.promptIndex];
      let speed = 120;
      let nextText: string;

      if (s.isDeleting) {
        nextText = currentPrompt.substring(0, s.charIndex--);
        speed = 60;
      } else {
        nextText = currentPrompt.substring(0, s.charIndex++);
      }
      setPlaceholder(nextText);

      if (!s.isDeleting && s.charIndex === currentPrompt.length + 2) {
        s.isDeleting = true;
        speed = 2000; // Pause at end
      } else if (s.isDeleting && s.charIndex === -1) {
        s.isDeleting = false;
        s.promptIndex = (s.promptIndex + 1) % examplePrompts.length;
        speed = 500; // Pause before new sentence
      }
      
      s.timeoutId = window.setTimeout(type, speed);
    };
    
    if (!isLoading) {
      // Start typing animation
      stateRef.current.timeoutId = window.setTimeout(type, 500);
    } else {
      // Clear animation and placeholder when loading
      if (stateRef.current.timeoutId) clearTimeout(stateRef.current.timeoutId);
      setPlaceholder('');
    }

    return () => {
      if (stateRef.current.timeoutId) {
        clearTimeout(stateRef.current.timeoutId);
      }
    };
  }, [examplePrompts, isLoading, disableTypingAnimation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const getPlaceholderText = () => {
    if (isLoading) return "AI가 생각 중입니다...";
    if (disableTypingAnimation) return "AI에게 추가로 물어보세요...";
    return "";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#b7b7b7]/85 backdrop-blur-xl border border-white/20 rounded-2xl p-2 flex items-center shadow-lg h-16"
    >
      <button type="button" className="p-3 text-zinc-300 hover:text-white transition-colors">
        <PlusIcon />
      </button>
      <div className="relative flex-grow h-full">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={getPlaceholderText()}
          className="w-full h-full bg-transparent text-white placeholder-zinc-400 focus:outline-none px-2"
          disabled={isLoading}
        />
        {!isLoading && message.length === 0 && !disableTypingAnimation && (
          <div className="absolute inset-0 flex items-center px-2 pointer-events-none">
            <span className="text-zinc-100">{placeholder}</span>
            <span className="text-zinc-100 animate-pulse ml-px">|</span>
          </div>
        )}
      </div>
      <button
        type="submit"
        className="p-3 text-zinc-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading || !message.trim()}
      >
        {isLoading ? (
          <div className="w-6 h-6 border-2 border-zinc-400 border-t-white rounded-full animate-spin"></div>
        ) : (
          <SendIcon />
        )}
      </button>
    </form>
  );
};