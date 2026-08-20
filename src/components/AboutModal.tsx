import React from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200/80 flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#E8442C] via-[#DC3820] to-[#C93A24] text-white p-6 md:p-8 rounded-t-3xl relative flex items-start justify-between gap-4">
          <div className="space-y-2 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider">
              Founder's Note & Team Recognition
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
              The Story Behind SamplePilot
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 shrink-0"
            title="Close modal"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-8 text-slate-700 text-sm md:text-base leading-relaxed">
          {/* Narrative Paragraphs */}
          <div className="space-y-4 text-slate-600 text-sm md:text-base leading-relaxed">
            <p>
              This project started as an idea and grew into a working application through experimentation, learning, and collaboration.
            </p>
            <p>
              Building is rarely a solo effort. I'm grateful to everyone who contributed, challenged ideas, offered feedback, and helped turn it into something real.
            </p>
          </div>

          {/* Special Credit Spotlight Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#FFF8F6] to-orange-50/60 border border-orange-200/80 rounded-2xl p-6 shadow-sm">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-orange-200/30 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-[#E8442C] text-white shadow-xs shrink-0">
                <span className="material-symbols-outlined text-xl">workspace_premium</span>
              </div>
              <div className="space-y-1.5">
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#E8442C]">
                  Team Recognition & Special Credit
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  Special Credit to Team Saffron
                </h4>
                <p className="text-slate-700 text-sm leading-relaxed pt-0.5">
                  I’d like to give special credit to the <span className="font-bold text-slate-900">TL</span> and everyone from <span className="font-extrabold text-[#E8442C]">Team Saffron</span>, whose ideas, support, feedback, and contributions played an important role in bringing this project together.
                </p>
              </div>
            </div>
          </div>


          {/* Feedback & Contact Section */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-md">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#E8442C]">rate_review</span>
                  We’d Love Your Feedback
                </h4>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                  Have an idea, suggestion, or even a small thought about how we can make this better?
                </p>
                <p className="text-xs md:text-sm font-semibold text-[#E8442C] pt-2 leading-relaxed flex items-center gap-1.5">
                  <span>Go for it, we're eager to read everything!</span>
                </p>
              </div>

              <a
                href="mailto:Shadabhussain9786@gmail.com"
                className="w-full md:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#E8442C] hover:bg-[#C93A24] text-white font-bold text-sm rounded-xl transition-all shadow-sm hover:shadow active:scale-95 group"
              >
                <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">mail</span>
                <span>Contact the Creator</span>
              </a>
            </div>

            <div className="text-center text-xs text-slate-400 font-medium">
              Direct Email: <a href="mailto:Shadabhussain9786@gmail.com" className="text-slate-600 hover:text-[#E8442C] underline">Shadabhussain9786@gmail.com</a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 rounded-b-3xl flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            SamplePilot Operations Platform
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
