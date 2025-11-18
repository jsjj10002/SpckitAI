
import React, { useMemo } from 'react';

const Sparkle: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div className="absolute" style={style}>
    <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_2px_#fff] animate-pulse"></div>
  </div>
);

export const Background: React.FC = () => {
  const sparkles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => {
      const style = {
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${2 + Math.random() * 3}s`,
      };
      return <Sparkle key={i} style={style} />;
    });
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:2rem_2rem]"></div>
      <div className="absolute inset-0">
        {sparkles}
      </div>
    </div>
  );
};
