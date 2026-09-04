import React from 'react';
import { InvitationData } from '../types';
import { calculateInvitationResults, formatNumber } from '../utils/calculations';
import { NumericInput } from './NumericInput';

interface InvitationCalculatorProps {
  data: InvitationData;
  onChange: (updated: InvitationData) => void;
  onExport: () => void;
}

export const InvitationCalculator: React.FC<InvitationCalculatorProps> = ({
  data,
  onChange,
  onExport,
}) => {
  const results = calculateInvitationResults(data);

  const handleFieldChange = (field: keyof InvitationData, value: number) => {
    onChange({
      ...data,
      [field]: isNaN(value) ? 0 : value,
    });
  };

  const trackBy = data.trackProgressBy || 'entrants';

  // Input states allowing smooth numeric typing & clean empty detection
  const [entrantsInput, setEntrantsInput] = React.useState<string>(() =>
    data.totalEntrantsSoFar !== undefined && data.totalEntrantsSoFar !== null
      ? String(data.totalEntrantsSoFar)
      : ''
  );
  const [completesInput, setCompletesInput] = React.useState<string>(() =>
    data.completesSoFar !== undefined && data.completesSoFar !== null
      ? String(data.completesSoFar)
      : ''
  );

  // Synchronize when data prop changes from outside
  React.useEffect(() => {
    const nextVal =
      data.totalEntrantsSoFar !== undefined && data.totalEntrantsSoFar !== null
        ? String(data.totalEntrantsSoFar)
        : '';
    setEntrantsInput((prev) => (prev !== nextVal ? nextVal : prev));
  }, [data.totalEntrantsSoFar]);

  React.useEffect(() => {
    const nextVal =
      data.completesSoFar !== undefined && data.completesSoFar !== null
        ? String(data.completesSoFar)
        : '';
    setCompletesInput((prev) => (prev !== nextVal ? nextVal : prev));
  }, [data.completesSoFar]);

  const handleTrackByChange = (val: 'entrants' | 'completes') => {
    onChange({
      ...data,
      trackProgressBy: val,
    });
  };

  const handleEntrantsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const sanitized = raw.replace(/[^\d]/g, '');
    setEntrantsInput(sanitized);
    onChange({
      ...data,
      totalEntrantsSoFar: sanitized === '' ? null : parseInt(sanitized, 10),
    });
  };

  const handleCompletesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const sanitized = raw.replace(/[^\d]/g, '');
    setCompletesInput(sanitized);
    onChange({
      ...data,
      completesSoFar: sanitized === '' ? null : parseInt(sanitized, 10),
    });
  };

  // Check if current active required input field is empty
  const isEntrants = trackBy === 'entrants';
  const activeInputString = isEntrants ? entrantsInput.trim() : completesInput.trim();
  const isInputEmpty = activeInputString === '';

  // Calculate Invitations Sent So Far
  // If tracking by Entrants: Total Entrants ÷ (Panel Response Rate ÷ 100)
  // If tracking by Completes: (Completes ÷ (Infield IR ÷ 100)) ÷ (Panel Response Rate ÷ 100)
  const panelResponseRateDecimal = data.panelResponseRate > 0 ? data.panelResponseRate / 100 : 0;
  const infieldIrDecimal = data.infieldIr > 0 ? data.infieldIr / 100 : 0;

  let invitationsSentResult: number | null = null;
  if (!isInputEmpty) {
    if (isEntrants) {
      const entrantsNum = parseInt(activeInputString, 10);
      if (!isNaN(entrantsNum) && panelResponseRateDecimal > 0) {
        invitationsSentResult = Math.ceil(entrantsNum / panelResponseRateDecimal);
      }
    } else {
      const completesNum = parseInt(activeInputString, 10);
      if (!isNaN(completesNum) && infieldIrDecimal > 0 && panelResponseRateDecimal > 0) {
        invitationsSentResult = Math.ceil((completesNum / infieldIrDecimal) / panelResponseRateDecimal);
      }
    }
  }

  const formulaNoteText = isEntrants
    ? 'Total Entrants ÷ Panel Response Rate'
    : 'Completes ÷ Infield IR ÷ Panel Response Rate';

  return (
    <div className="w-full">
      {/* Header Banner with Diagonal Red Gradient */}
      <header className="w-full bg-gradient-to-br from-[#E8442C] to-[#C93A24] py-12 px-6">
        <div className="max-w-[880px] mx-auto flex flex-col items-start gap-3">
          <span className="bg-white/20 text-white backdrop-blur-sm px-3.5 py-1 rounded-full font-bold text-xs uppercase tracking-wider">
            Fieldwork Reference
          </span>
          <h1 className="text-white text-3xl md:text-4xl font-extrabold tracking-tight">
            Invitation Calculator
          </h1>
          <p className="text-white/90 text-sm md:text-base max-w-xl font-medium leading-relaxed">
            Calculate sample and invitation volume requirements.
          </p>
        </div>
      </header>

      {/* Centered Calculator Container */}
      <div className="max-w-[880px] mx-auto px-4 md:px-6 -mt-6 relative z-10 pb-20 flex flex-col gap-8">
        {/* Project Parameters Card */}
        <section className="calc-card shadow-md">
          <h2 className="text-xl font-bold text-[#2B2B2B] mb-6 border-b border-[#E5E5E5] pb-4">
            Project Parameters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Target Completes */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600" htmlFor="target_completes">
                Target Completes *
              </label>
              <NumericInput
                id="target_completes"
                className="calc-input !px-4 font-medium text-base"
                placeholder="0"
                value={data.targetCompletes}
                onFocus={(e) => e.target.select()}
                onChange={(val) => handleFieldChange('targetCompletes', val)}
                isDecimal={false}
              />
            </div>

            {/* Bid IR (client-shared) */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600" htmlFor="bid_ir">
                Bid IR (client-shared) *
              </label>
              <div className="relative flex items-center">
                <NumericInput
                  id="bid_ir"
                  className="calc-input !pl-4 !pr-10 font-medium text-base"
                  placeholder="0"
                  value={data.bidIr}
                  onFocus={(e) => e.target.select()}
                  onChange={(val) => handleFieldChange('bidIr', val)}
                  isDecimal={true}
                />
                <span className="absolute right-3.5 text-gray-500 font-bold text-base pointer-events-none select-none z-10">%</span>
              </div>
            </div>

            {/* Infield IR (actual performance) */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600" htmlFor="infield_ir">
                Infield IR (actual performance)
              </label>
              <div className="relative flex items-center">
                <NumericInput
                  id="infield_ir"
                  className="calc-input !pl-4 !pr-10 font-medium text-base"
                  placeholder="0"
                  value={data.infieldIr}
                  onFocus={(e) => e.target.select()}
                  onChange={(val) => handleFieldChange('infieldIr', val)}
                  isDecimal={true}
                />
                <span className="absolute right-3.5 text-gray-500 font-bold text-base pointer-events-none select-none z-10">%</span>
              </div>
            </div>

            {/* Panel Response Rate */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600" htmlFor="panel_response_rate">
                Panel Response Rate *
              </label>
              <div className="relative flex items-center">
                <NumericInput
                  id="panel_response_rate"
                  className="calc-input !pl-4 !pr-10 font-medium text-base"
                  placeholder="0"
                  value={data.panelResponseRate}
                  onFocus={(e) => e.target.select()}
                  onChange={(val) => handleFieldChange('panelResponseRate', val)}
                  isDecimal={true}
                />
                <span className="absolute right-3.5 text-gray-500 font-bold text-base pointer-events-none select-none z-10">%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stage 1 — Bid Estimate Card */}
        <section className="calc-card shadow-md">
          <div className="flex items-center gap-4 mb-6 border-b border-[#E5E5E5] pb-4">
            <div className="w-8 h-8 rounded-full bg-gray-100 text-[#2B2B2B] flex items-center justify-center font-extrabold text-sm shrink-0 border border-gray-200">
              1
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#2B2B2B]">Bid Estimate</h2>
              <p className="text-xs text-gray-500 font-medium">Reference figure — what the client quoted at bid stage</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center py-2">
              <div className="flex flex-col">
                <span className="text-base font-semibold text-[#2B2B2B]">Survey participants needed</span>
                <span className="text-xs text-gray-500 font-medium">Target ÷ Bid IR</span>
              </div>
              <span className="text-xl md:text-2xl font-bold text-[#2B2B2B]">
                {formatNumber(results.bidParticipants)}
              </span>
            </div>

            <div className="w-full h-px bg-[#E5E5E5]"></div>

            <div className="flex justify-between items-center py-2">
              <div className="flex flex-col">
                <span className="text-base font-semibold text-[#2B2B2B]">Estimated invites (reference only)</span>
                <span className="text-xs text-gray-500 font-medium">Participants ÷ Panel Response Rate</span>
              </div>
              <span className="text-xl md:text-2xl font-bold text-[#2B2B2B]">
                {formatNumber(results.bidInvites)}
              </span>
            </div>
          </div>
        </section>

        {/* Stage 2 — Live Performance Estimate Card */}
        <section className="bg-[#FDF0EE] rounded-2xl p-6 md:p-8 border border-[#E8442C]/30 shadow-md">
          <div className="flex items-center gap-4 mb-6 border-b border-[#E8442C]/20 pb-4">
            <div className="w-8 h-8 rounded-full bg-[#E8442C] text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm">
              2
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#2B2B2B]">Live Performance Estimate</h2>
              <p className="text-xs text-gray-600 font-medium">Working number — based on actual infield IR once fielding starts</p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-base font-semibold text-[#2B2B2B]">Survey participants expected</span>
                <span className="text-xs text-gray-600 font-medium">Target ÷ Infield IR</span>
              </div>
              <span className="text-xl md:text-2xl font-bold text-[#2B2B2B]">
                {formatNumber(results.liveParticipants)}
              </span>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-[#E8442C] border-dashed flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-[#E8442C]">Invites to release</span>
                <span className="text-xs text-gray-500 font-medium">Participants ÷ Panel Response Rate</span>
              </div>
              <span className="text-3xl md:text-4xl font-extrabold text-[#E8442C] tracking-tight">
                {formatNumber(results.liveInvites)}
              </span>
            </div>
          </div>
        </section>

        {/* Stage 3 — Progress Tracker Card */}
        <section
          className={`calc-card shadow-md transition-all duration-200 ${
            isInputEmpty ? 'opacity-75' : ''
          }`}
        >
          <div className="flex items-center gap-4 mb-6 border-b border-[#E5E5E5] pb-4">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 border transition-colors ${
                isInputEmpty
                  ? 'bg-gray-100 text-gray-400 border-gray-200'
                  : 'bg-gray-100 text-[#2B2B2B] border-gray-200'
              }`}
            >
              3
            </div>
            <div>
              <h2
                className={`text-xl font-bold transition-colors ${
                  isInputEmpty ? 'text-[#2B2B2B]/80' : 'text-[#2B2B2B]'
                }`}
              >
                Progress Tracker
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Track estimated invitations sent based on fielding progress to date
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Track progress by dropdown */}
            <div className="flex flex-col gap-2">
              <label
                className="text-xs font-bold uppercase tracking-wider text-gray-600"
                htmlFor="track_progress_by"
              >
                Track progress by
              </label>
              <div className="relative flex items-center">
                <select
                  id="track_progress_by"
                  value={trackBy}
                  onChange={(e) => handleTrackByChange(e.target.value as 'entrants' | 'completes')}
                  className="calc-input appearance-none !px-4 !pr-10 font-medium text-base bg-white cursor-pointer focus:outline-none focus:border-[#E8442C] focus:ring-1 focus:ring-[#E8442C]"
                >
                  <option value="entrants">Total Entrants So Far</option>
                  <option value="completes">Completes So Far</option>
                </select>
                <span className="absolute right-3.5 text-gray-500 pointer-events-none select-none material-symbols-outlined text-xl">
                  expand_more
                </span>
              </div>
            </div>

            {/* Dynamic single input based on selection */}
            {isEntrants ? (
              <div className="flex flex-col gap-2">
                <label
                  className="text-xs font-bold uppercase tracking-wider text-gray-600"
                  htmlFor="total_entrants_so_far"
                >
                  Total Entrants Into Survey So Far *
                </label>
                <input
                  id="total_entrants_so_far"
                  type="text"
                  inputMode="numeric"
                  className="calc-input !px-4 font-medium text-base focus:outline-none focus:border-[#E8442C] focus:ring-1 focus:ring-[#E8442C]"
                  placeholder="0"
                  value={entrantsInput}
                  onChange={handleEntrantsChange}
                  onFocus={(e) => e.target.select()}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <label
                  className="text-xs font-bold uppercase tracking-wider text-gray-600"
                  htmlFor="completes_so_far"
                >
                  Completes So Far *
                </label>
                <input
                  id="completes_so_far"
                  type="text"
                  inputMode="numeric"
                  className="calc-input !px-4 font-medium text-base focus:outline-none focus:border-[#E8442C] focus:ring-1 focus:ring-[#E8442C]"
                  placeholder="0"
                  value={completesInput}
                  onChange={handleCompletesChange}
                  onFocus={(e) => e.target.select()}
                />
              </div>
            )}
          </div>

          {/* Divider line */}
          <div className="w-full h-px bg-[#E5E5E5] my-6"></div>

          {/* Large, bold result with formula note underneath */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-2">
            <div className="flex flex-col">
              <span
                className={`text-base font-semibold transition-colors ${
                  isInputEmpty ? 'text-gray-400' : 'text-[#2B2B2B]'
                }`}
              >
                Invitations sent so far (estimate)
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {formulaNoteText}
              </span>
            </div>
            <span
              className={`text-3xl md:text-4xl font-extrabold tracking-tight transition-colors ${
                isInputEmpty ? 'text-gray-300' : 'text-[#2B2B2B]'
              }`}
            >
              {isInputEmpty || invitationsSentResult === null ? '—' : formatNumber(invitationsSentResult)}
            </span>
          </div>
        </section>

        {/* Footnote */}
        <p className="text-center text-xs text-gray-500 font-medium mt-2 max-w-xl mx-auto leading-relaxed">
          All invite figures are rounded up to the nearest whole number. Fields marked * are required for that stage's calculation.
        </p>

        {/* Bottom Actions */}
        <div className="flex gap-4 justify-end mt-4">
          <button
            onClick={onExport}
            className="bg-[#E8442C] text-white rounded-xl font-bold py-3 px-6 hover:bg-[#C93A24] transition-colors flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
};
