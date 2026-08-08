import React, { useState } from 'react';
import { SavedItem, MarginData, InvitationData } from '../types';

interface HistoryViewProps {
  items: SavedItem[];
  onLoadMargin: (data: MarginData) => void;
  onLoadInvitation: (data: InvitationData) => void;
  onDeleteItem: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  items,
  onLoadMargin,
  onLoadInvitation,
  onDeleteItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'margin' | 'invitation'>('all');

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#E5E5E5] pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#2B2B2B]">
            Scenario & Report History
          </h1>
          <p className="text-sm text-gray-600 font-medium mt-1">
            Browse, manage, and reload your previously saved fieldwork calculations.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2 bg-white border border-[#E5E5E5] p-1 rounded-xl shadow-sm">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filterType === 'all' ? 'bg-[#E8442C] text-white' : 'text-[#2B2B2B] hover:bg-gray-100'
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setFilterType('margin')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filterType === 'margin' ? 'bg-[#E8442C] text-white' : 'text-[#2B2B2B] hover:bg-gray-100'
            }`}
          >
            Margin Calcs
          </button>
          <button
            onClick={() => setFilterType('invitation')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              filterType === 'invitation' ? 'bg-[#E8442C] text-white' : 'text-[#2B2B2B] hover:bg-gray-100'
            }`}
          >
            Invitation Calcs
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          search
        </span>
        <input
          type="text"
          placeholder="Search by project title or notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="calc-input pl-10 text-sm font-medium"
        />
      </div>

      {/* List Grid */}
      {filteredItems.length === 0 ? (
        <div className="calc-card p-12 text-center text-gray-500">
          <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">folder_open</span>
          <p className="text-base font-bold">No saved scenarios found</p>
          <p className="text-xs text-gray-400 mt-1">Try resetting your search or save a new calculation from the calculator tabs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="calc-card p-6 flex flex-col justify-between hover:border-[#E8442C]/50 transition-all shadow-sm group"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span
                    className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full ${
                      item.type === 'margin'
                        ? 'bg-[#FDF0EE] text-[#E8442C] border border-[#E8442C]/20'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {item.type === 'margin' ? 'Margin Calculator' : 'Invitation Calculator'}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">{item.timestamp}</span>
                </div>

                <h3 className="text-lg font-bold text-[#2B2B2B] mb-2 leading-snug group-hover:text-[#E8442C] transition-colors">
                  {item.title}
                </h3>

                <div className="bg-gray-50 rounded-lg p-3 my-3 border border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Key Output</span>
                  <span className="text-sm font-extrabold text-[#E8442C]">{item.keyMetric}</span>
                </div>

                {item.notes && (
                  <p className="text-xs text-gray-600 font-medium mb-4 italic line-clamp-2">
                    "{item.notes}"
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-2">
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="text-gray-400 hover:text-red-600 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                  Delete
                </button>

                <button
                  onClick={() => {
                    if (item.type === 'margin' && item.marginData) {
                      onLoadMargin(item.marginData);
                    } else if (item.type === 'invitation' && item.invitationData) {
                      onLoadInvitation(item.invitationData);
                    }
                  }}
                  className="bg-[#E8442C] text-white hover:bg-[#C93A24] text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-base">tune</span>
                  Load in Calculator
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
