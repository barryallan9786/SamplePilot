import React, { useState } from 'react';
import { ActiveTab } from '../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (type: 'margin' | 'invitation', title: string) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [projectType, setProjectType] = useState<'margin' | 'invitation'>('margin');
  const [projectTitle, setProjectTitle] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;
    onCreateProject(projectType, projectTitle.trim());
    setProjectTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E5E5] animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <h3 className="font-bold text-lg text-[#2B2B2B] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#E8442C]">add_circle</span>
            Start New Project
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-2">
              Select Calculator Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProjectType('margin')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  projectType === 'margin'
                    ? 'border-[#E8442C] bg-[#FDF0EE] text-[#E8442C]'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span className="material-symbols-outlined text-2xl mb-1 block">calculate</span>
                <div className="font-bold text-sm">Margin Calculator</div>
                <div className="text-[11px] opacity-80 font-normal">CPI & Profitability</div>
              </button>

              <button
                type="button"
                onClick={() => setProjectType('invitation')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  projectType === 'invitation'
                    ? 'border-[#E8442C] bg-[#FDF0EE] text-[#E8442C]'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span className="material-symbols-outlined text-2xl mb-1 block">mail</span>
                <div className="font-bold text-sm">Invitation Calc</div>
                <div className="text-[11px] opacity-80 font-normal">Sample & Invites</div>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1">
              Project Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Healthcare Tracker Q3 - Wave 1"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="calc-input text-sm font-medium"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#E8442C] text-white font-bold text-xs hover:bg-[#C93A24] shadow-sm"
            >
              Initialize Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
