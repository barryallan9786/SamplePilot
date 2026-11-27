import React, { useState } from 'react';

interface ViewCalculationProps {
  formula: string;
  substitution: string;
  unrounded?: string | number | null;
  finalResult: string | number;
  notes?: string;
  className?: string;
  align?: 'left' | 'right';
}

export const ViewCalculation: React.FC<ViewCalculationProps> = ({
  formula,
  substitution,
  unrounded,
  finalResult,
  notes,
  className = '',
  align = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`mt-1.5 ${className}`}>
      <div className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E8442C] hover:text-[#C93A24] transition-colors focus:outline-none select-none cursor-pointer py-0.5"
          aria-expanded={isOpen}
        >
          <span
            className="material-symbols-outlined text-[15px] transition-transform duration-200"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
          >
            expand_more
          </span>
          <span>{isOpen ? 'Hide Calculation' : 'View Calculation'}</span>
        </button>
      </div>

      {isOpen && (
        <div className="mt-2 p-3 rounded-xl bg-gray-50/95 border border-gray-200 text-xs text-gray-700 space-y-2 text-left shadow-sm">
          <div>
            <span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider block">
              Mathematical Formula
            </span>
            <div className="font-mono text-[11px] text-gray-900 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 mt-1 font-semibold leading-relaxed">
              {formula}
            </div>
          </div>

          <div>
            <span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider block">
              Substituted Values
            </span>
            <div className="font-mono text-[11px] text-gray-900 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 mt-1 leading-relaxed">
              {substitution}
            </div>
          </div>

          {unrounded !== undefined && unrounded !== null && unrounded !== '' && (
            <div className="flex items-center justify-between pt-1.5 border-t border-gray-200 text-[11px]">
              <span className="text-gray-500 font-medium">Calculated (before rounding):</span>
              <span className="font-mono font-semibold text-gray-800">{unrounded}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1.5 border-t border-gray-200 text-[11px]">
            <span className="text-gray-700 font-bold">Final Displayed Result:</span>
            <span className="font-mono font-extrabold text-[#E8442C]">{finalResult}</span>
          </div>

          {notes && (
            <div className="text-[10px] text-gray-500 italic pt-1 border-t border-gray-200/60 leading-tight">
              * {notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
