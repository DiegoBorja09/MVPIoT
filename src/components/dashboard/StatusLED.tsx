'use client';

interface StatusLEDProps {
  status: boolean;
  label?: string;
}

export default function StatusLED({ status, label = 'Status' }: StatusLEDProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-8 h-8 rounded-full transition-all ${
          status
            ? 'bg-green-500 shadow-lg shadow-green-500/50'
            : 'bg-gray-300'
        }`}
      />
      <span className="text-sm font-medium">{label}</span>
      <span className="text-xs text-gray-600">{status ? 'ON' : 'OFF'}</span>
    </div>
  );
}
