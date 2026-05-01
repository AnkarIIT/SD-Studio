import { useEffect, useState } from 'react';

interface StatCounterProps {
  value: string;
  label: string;
  className?: string;
}

const StatCounter = ({ value, label, className = "" }: StatCounterProps) => {
  const [count, setCount] = useState(0);
  
  // Extract the main number (handles integers and decimals)
  const numericMatch = value.match(/(\d+\.?\d*)/);
  const numericValue = numericMatch ? parseFloat(numericMatch[0]) : 0;
  
  // Extract suffix (everything after the first number)
  const suffix = value.split(numericMatch ? numericMatch[0] : '')[1] || '';
  const prefix = value.split(numericMatch ? numericMatch[0] : '')[0] || '';

  useEffect(() => {
    let start = 0;
    const end = numericValue;
    const duration = 2000;
    const frameRate = 16;
    const totalFrames = duration / frameRate;
    const increment = end / totalFrames;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [numericValue]);

  return (
    <div className={`space-y-1 min-w-[120px] ${className}`}>
      <p className="text-4xl font-bold text-gray-900 tracking-tighter">
        {prefix}{value.includes('.') ? count.toFixed(1) : Math.floor(count).toLocaleString()}{suffix}
      </p>
      <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">{label}</p>
    </div>
  );
};

export default StatCounter;
