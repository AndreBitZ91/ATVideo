import React from 'react';

interface FieldZoneProps {
  selectedZone: number | null;
  onSelectZone: (zone: number) => void;
}

export const FieldZone: React.FC<FieldZoneProps> = ({ selectedZone, onSelectZone }) => {
  return (
    <div className="relative w-full aspect-[2/1] bg-[#e6c280] rounded-lg border-2 border-white overflow-hidden" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      {/* 6m Line Area (Zones 1, 2, 3, 4) */}
      <div className="absolute top-0 bottom-0 left-0 w-1/3 border-r-2 border-white flex flex-col">
        {/* Zone 1 & 2 */}
        <div className="flex-1 flex border-b border-white/30">
          <button onClick={() => onSelectZone(1)} className={`flex-1 border-r border-white/30 hover:bg-white/20 transition-colors ${selectedZone === 1 ? 'bg-blue-500/60' : ''}`}><span className="text-white/70 font-bold">Z1</span></button>
          <button onClick={() => onSelectZone(2)} className={`flex-1 hover:bg-white/20 transition-colors ${selectedZone === 2 ? 'bg-blue-500/60' : ''}`}><span className="text-white/70 font-bold">Z2</span></button>
        </div>
        {/* Zone 3 & 4 */}
        <div className="flex-1 flex">
          <button onClick={() => onSelectZone(3)} className={`flex-1 border-r border-white/30 hover:bg-white/20 transition-colors ${selectedZone === 3 ? 'bg-blue-500/60' : ''}`}><span className="text-white/70 font-bold">Z3</span></button>
          <button onClick={() => onSelectZone(4)} className={`flex-1 hover:bg-white/20 transition-colors ${selectedZone === 4 ? 'bg-blue-500/60' : ''}`}><span className="text-white/70 font-bold">Z4</span></button>
        </div>
      </div>

      {/* 9m Line Area (Zones 5, 6, 7, 8) */}
      <div className="absolute top-0 bottom-0 left-1/3 right-0 flex flex-col">
         <div className="flex-1 flex border-b border-white/30">
          <button onClick={() => onSelectZone(5)} className={`flex-1 border-r border-white/30 hover:bg-white/20 transition-colors ${selectedZone === 5 ? 'bg-blue-500/60' : ''}`}><span className="text-white/70 font-bold">Z5</span></button>
          <button onClick={() => onSelectZone(6)} className={`flex-1 hover:bg-white/20 transition-colors ${selectedZone === 6 ? 'bg-blue-500/60' : ''}`}><span className="text-white/70 font-bold">Z6</span></button>
        </div>
        <div className="flex-1 flex">
          <button onClick={() => onSelectZone(7)} className={`flex-1 border-r border-white/30 hover:bg-white/20 transition-colors ${selectedZone === 7 ? 'bg-blue-500/60' : ''}`}><span className="text-white/70 font-bold">Z7</span></button>
          <button onClick={() => onSelectZone(8)} className={`flex-1 hover:bg-white/20 transition-colors ${selectedZone === 8 ? 'bg-blue-500/60' : ''}`}><span className="text-white/70 font-bold">Z8</span></button>
        </div>
      </div>

      {/* Center Line */}
      <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white"></div>
    </div>
  );
};
