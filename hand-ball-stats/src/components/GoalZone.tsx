import React from 'react';

interface GoalZoneProps {
  selectedZone: number | null;
  onSelectZone: (zone: number) => void;
}

export const GoalZone: React.FC<GoalZoneProps> = ({ selectedZone, onSelectZone }) => {
  return (
    <div className="relative w-full aspect-[3/2] bg-gray-100 rounded-t-lg border-8 border-b-0 border-red-500 overflow-hidden flex flex-col shadow-inner">
      {/* Background net pattern */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(45deg, #000 1px, transparent 1px), linear-gradient(-45deg, #000 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>

      {/* Grid */}
      <div className="relative z-10 flex-1 flex">
        <button onClick={() => onSelectZone(1)} className={`flex-1 border-r border-b border-gray-400 hover:bg-black/10 transition-colors ${selectedZone === 1 ? 'bg-blue-500/60' : ''}`}><span className="text-gray-600 font-bold mix-blend-difference">Z1</span></button>
        <button onClick={() => onSelectZone(2)} className={`flex-1 border-r border-b border-gray-400 hover:bg-black/10 transition-colors ${selectedZone === 2 ? 'bg-blue-500/60' : ''}`}><span className="text-gray-600 font-bold mix-blend-difference">Z2</span></button>
        <button onClick={() => onSelectZone(3)} className={`flex-1 border-b border-gray-400 hover:bg-black/10 transition-colors ${selectedZone === 3 ? 'bg-blue-500/60' : ''}`}><span className="text-gray-600 font-bold mix-blend-difference">Z3</span></button>
      </div>
      <div className="relative z-10 flex-1 flex">
        <button onClick={() => onSelectZone(4)} className={`flex-1 border-r border-b border-gray-400 hover:bg-black/10 transition-colors ${selectedZone === 4 ? 'bg-blue-500/60' : ''}`}><span className="text-gray-600 font-bold mix-blend-difference">Z4</span></button>
        <button onClick={() => onSelectZone(5)} className={`flex-1 border-r border-b border-gray-400 hover:bg-black/10 transition-colors ${selectedZone === 5 ? 'bg-blue-500/60' : ''}`}><span className="text-gray-600 font-bold mix-blend-difference">Z5</span></button>
        <button onClick={() => onSelectZone(6)} className={`flex-1 border-b border-gray-400 hover:bg-black/10 transition-colors ${selectedZone === 6 ? 'bg-blue-500/60' : ''}`}><span className="text-gray-600 font-bold mix-blend-difference">Z6</span></button>
      </div>
      <div className="relative z-10 flex-1 flex">
        <button onClick={() => onSelectZone(7)} className={`flex-1 border-r border-gray-400 hover:bg-black/10 transition-colors ${selectedZone === 7 ? 'bg-blue-500/60' : ''}`}><span className="text-gray-600 font-bold mix-blend-difference">Z7</span></button>
        <button onClick={() => onSelectZone(8)} className={`flex-1 border-r border-gray-400 hover:bg-black/10 transition-colors ${selectedZone === 8 ? 'bg-blue-500/60' : ''}`}><span className="text-gray-600 font-bold mix-blend-difference">Z8</span></button>
        <button onClick={() => onSelectZone(9)} className={`flex-1 border-gray-400 hover:bg-black/10 transition-colors ${selectedZone === 9 ? 'bg-blue-500/60' : ''}`}><span className="text-gray-600 font-bold mix-blend-difference">Z9</span></button>
      </div>
    </div>
  );
};
