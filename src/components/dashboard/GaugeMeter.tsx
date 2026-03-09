'use client';

interface GaugeMeterProps {
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  label?: string;
}

export default function GaugeMeter({ 
  value, 
  min = 0, 
  max = 100, 
  unit = '',
  label = 'Value' 
}: GaugeMeterProps) {
  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
  const angle = (percentage / 100) * 180 - 90; // -90 a 90 grados

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-24">
        <svg viewBox="0 0 200 100" className="w-full h-full">
          {/* Arco de fondo */}
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
          />
          {/* Arco de valor */}
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="12"
            strokeDasharray={`${(percentage / 100) * 502.65} 502.65`}
            strokeDashoffset="0"
            strokeLinecap="round"
          />
          {/* Aguja */}
          <line
            x1="100"
            y1="80"
            x2={100 + 70 * Math.cos((angle * Math.PI) / 180)}
            y2={80 + 70 * Math.sin((angle * Math.PI) / 180)}
            stroke="#ef4444"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="mt-2 text-center">
        <div className="text-2xl font-bold">
          {value.toFixed(1)} {unit}
        </div>
        <div className="text-sm text-gray-600">{label}</div>
      </div>
    </div>
  );
}
