'use client';

interface TimeRangeSelectorProps {
  selected: string;
  onSelect: (range: string) => void;
}

export default function TimeRangeSelector({ selected, onSelect }: TimeRangeSelectorProps) {
  const ranges = [
    { value: 'LIVE', label: 'LIVE' },
    { value: '1H', label: '1H' },
    { value: '1D', label: '1D' },
    { value: '7D', label: '7D' },
    { value: '15D', label: '15D' },
  ];

  return (
    <div className="flex gap-2 mb-4">
      {ranges.map((range) => (
        <button
          key={range.value}
          onClick={() => onSelect(range.value)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selected === range.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
