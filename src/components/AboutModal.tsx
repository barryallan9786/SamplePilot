import React from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-xl w-full max-h-[94vh] overflow-hidden border border-slate-200 flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-[#D83B25] text-white px-5 py-4 sm:px-6 sm:py-4.5 rounded-t-2xl sm:rounded-t-3xl relative flex items-center justify-between gap-4 shrink-0">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-tight">
            The People Behind The Pixels
          </h2>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 shrink-0"
            title="Close modal"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
          {/* The People Behind The Pixels Container */}
          <div className="bg-[#FFF9F5] border border-[#FDE5D4] rounded-2xl p-3.5 sm:p-4.5 space-y-3">
            {/* Card 1: Team Saffron */}
            <div className="bg-white border border-[#F3E5DC] rounded-xl p-3.5 sm:p-4 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FCEBE6] text-[#B83E26] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 tracking-tight">
                TS
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="font-bold text-[#1F242D] text-sm">
                  Team Saffron
                </h4>
                <p className="text-xs sm:text-[12.5px] text-[#2D323C] leading-relaxed">
                  To Navdeep, Neeraj and the entire team — this project carries a piece of each of you in it. Your ideas sparked directions I hadn't considered, your feedback sharpened rough edges into something solid, and your support kept the momentum going when it mattered most.
                </p>
              </div>
            </div>

            {/* Card 2: Mohit */}
            <div className="bg-white border border-[#F3E5DC] rounded-xl p-3.5 sm:p-4 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FEF3C7] text-[#92400E] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                M
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="font-bold text-[#1F242D] text-sm">
                  Mohit
                </h4>
                <p className="text-xs sm:text-[12.5px] text-[#2D323C] leading-relaxed">
                  My dearest friend, who always pushes me to embrace my creative side and stays a constant source of positivity and encouragement.
                </p>
              </div>
            </div>

            {/* Card 3: In loving memory of Payal */}
            <div className="bg-white border border-[#F3E5DC] rounded-xl p-3.5 sm:p-4 shadow-xs flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#EDE9FE] text-[#7C3AED] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[17px]">ac_unit</span>
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="font-bold text-[#1F242D] text-sm">
                  In loving memory of Payal
                </h4>
                <p className="text-xs sm:text-[12.5px] text-[#2D323C] leading-relaxed">
                  The curious mind who never stopped asking "what if" and "how does this work?" Every question you brought to me about Excel became a small discovery for both of us. A little bit of that curiosity lives inside this tool, and always will.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200/80 pt-1"></div>

          {/* Feedback & Contact Section */}
          <div className="bg-[#FFF9F5] rounded-2xl p-4 sm:p-5 border border-[#FDE5D4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm sm:text-base font-bold text-[#1F242D] flex items-center gap-1.5">
                <span className="text-base">✏️</span>
                We'd love your feedback
              </h4>
              <p className="text-xs text-[#2D323C] leading-relaxed">
                Have an idea, suggestion, or even a small thought about how we can make this better?
              </p>
              <p className="text-xs font-bold text-[#D83B25] pt-1 leading-relaxed">
                Go for it, we're eager to read everything!
              </p>
            </div>

            <a
              href="mailto:Shadabhussain9786@gmail.com"
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#D83B25] hover:bg-[#C2311D] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs hover:shadow active:scale-95 group"
            >
              <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform">mail</span>
              <span>Contact the Creator</span>
            </a>
          </div>

          {/* Direct Email Footer Link */}
          <div className="pt-0.5 pb-0.5 text-center flex flex-col items-center justify-center gap-1">
            <span className="text-xs text-slate-500 font-medium">
              Reach the creator directly
            </span>
            <a
              href="mailto:Shadabhussain9786@gmail.com"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#D83B25] hover:text-[#B82E1A] transition-colors"
            >
              <span className="material-symbols-outlined text-sm sm:text-base">mail</span>
              <span>Shadabhussain9786@gmail.com</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

