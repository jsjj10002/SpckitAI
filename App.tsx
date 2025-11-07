import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ChatInput } from './components/ChatInput';
import { LandingView } from './components/LandingView';
import { ResultsView } from './components/ResultsView';
import { Background } from './components/Background';
import { getPCBuildRecommendation } from './services/geminiService';
import type { AiResponse } from './types';

export default function App() {
  const [view, setView] = useState<'landing' | 'results'>('landing');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<AiResponse | null>(null);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([]);

  const handleGoHome = useCallback(() => {
    setView('landing');
    setAiResponse(null);
    setChatHistory([]);
    setError(null);
    setIsLoading(false);
  }, []);

  const handleSendMessage = useCallback(async (message: string) => {
    setIsLoading(true);
    setError(null);
    const updatedHistory = [...chatHistory, { role: 'user' as const, text: message }];
    setChatHistory(updatedHistory);
    setAiResponse(null); // Clear previous results

    if (view === 'landing') {
      setView('results');
    }

    try {
      const response = await getPCBuildRecommendation(message);
      setAiResponse(response);
      setChatHistory(prev => [...prev, { role: 'model' as const, text: response.analysis }]);
    } catch (err) {
      console.error(err);
      const errorMessage = 'AI로부터 응답을 받는데 실패했습니다. 잠시 후 다시 시도해주세요.';
      setError(errorMessage);
      setChatHistory(prev => [...prev, { role: 'model' as const, text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  }, [view, chatHistory]);


  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col h-screen overflow-hidden">
      <Background />
      <Header onGoHome={handleGoHome} />
      <main className="flex-grow flex flex-col pt-20 pb-4 relative z-10">
        {view === 'landing' ? (
          <div className="flex-grow flex flex-col items-center justify-center">
            <div className="flex flex-col items-center space-y-12 w-full">
               <LandingView />
               <div className="w-full max-w-5xl px-4">
                   <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
               </div>
            </div>
          </div>
        ) : (
           <div className="flex-grow flex items-center justify-center overflow-hidden p-4">
              <div className="w-full h-full relative">
                <ResultsView
                    response={aiResponse}
                    isLoading={isLoading}
                    error={error}
                    chatHistory={chatHistory}
                    onSendMessage={handleSendMessage}
                />
              </div>
           </div>
        )}
      </main>
    </div>
  );
}