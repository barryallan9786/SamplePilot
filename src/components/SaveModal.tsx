import React, { useState } from 'react';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculatorType: 'margin' | 'invitation';
  defaultTitle: string;
  onConfirmSave: (title: string, notes: string) => void;
}

export const SaveModal: React.FC<SaveModalProps> = ({
  isOpen,
  onClose,
  calculatorType,
  defaultTitle,
  onConfirmSave,
}) => {
  const [title, setTitle] = useState(defaultTitle || '');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onConfirmSave(title.trim(), notes.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E5E5]">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <h3 className="font-bold text-lg text-[#2B2B2B] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#E8442C]">save</span>
            Save {calculatorType === 'margin' ? 'Margin Scenario' : 'Invitation Report'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1">
              Title / Scenario Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Midfield CPI Adjustment - Batch A"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="calc-input text-sm font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1">
              Field Notes & Observations (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add key insights, client constraints, or field timeline notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="calc-input text-sm font-medium resize-none"
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
              Save to History
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
