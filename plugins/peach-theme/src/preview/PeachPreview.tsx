import React from 'react';

export function PeachPreview() {
  return (
    <div className="w-full p-3 space-y-2" style={{backgroundColor: '#FFF8F0'}}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-4 h-4 rounded" style={{backgroundColor: '#FF8C42'}} />
        <div className="w-3 h-3 rounded" style={{backgroundColor: '#FF6B6B'}} />
        <div className="w-3 h-3 rounded" style={{backgroundColor: '#4A9A8A'}} />
        <div className="w-3 h-3 rounded" style={{backgroundColor: '#D4956A'}} />
      </div>
      <div className="h-2 rounded-full w-2/3" style={{backgroundColor: '#2D1B00', opacity: 0.8}} />
      <div className="h-1.5 rounded-full w-1/2" style={{backgroundColor: '#6B5A4A', opacity: 0.5}} />
      <div className="flex gap-2 mt-2">
        <div className="h-3 rounded px-3 text-white text-[5px] font-black uppercase flex items-center" style={{backgroundColor: '#FF8C42'}}>
          Button
        </div>
        <div className="h-3 rounded border text-[5px] font-black uppercase flex items-center px-2" style={{borderColor: '#FF8C42', color: '#FF8C42'}}>
          Outline
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5 mt-2">
        <div className="h-6 rounded border" style={{backgroundColor: 'rgba(255,255,255,0.9)', borderColor: '#E8D8C8', borderTopColor: '#FF8C42', borderTopWidth: 2}} />
        <div className="h-6 rounded border" style={{backgroundColor: 'rgba(255,255,255,0.9)', borderColor: '#E8D8C8', borderTopColor: '#FF8C42', borderTopWidth: 2}} />
      </div>
    </div>
  );
}