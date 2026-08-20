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

        {/* Stage 3 — Completes Progress So Far Card */}
        <section className="calc-card shadow-md">
          <div className="flex items-center gap-4 mb-6 border-b border-[#E5E5E5] pb-4">
            <div className="w-8 h-8 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm">
              3
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#2B2B2B]">Completes Progress So Far</h2>
              <p className="text-xs text-gray-500 font-medium">Track completes achieved against your target.</p>
            </div>
          </div>

          {/* Validation Warnings */}
          {Object.keys(results.validationErrors).length > 0 && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex flex-col gap-1 text-sm font-medium">
              {Object.values(results.validationErrors).map((err, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">warning</span>
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}

          {/* Completes Achieved So Far - Single Editable Input */}
          <div className="mb-8 max-w-md">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600" htmlFor="completes_achieved">
                Completes Achieved So Far *
              </label>
              <NumericInput
                id="completes_achieved"
                className={`calc-input !px-4 font-medium text-base ${
                  results.validationErrors.completesAchievedExceedsTarget
                    ? 'border-red-500 bg-red-50/30'
                    : ''
                }`}
                placeholder="0"
                value={data.completesAchieved}
                onFocus={(e) => e.target.select()}
                onChange={(val) => handleFieldChange('completesAchieved', val)}
                isDecimal={false}
              />
            </div>
          </div>

          {/* Derived Metrics Grid & Progress Bar */}
          <div className="border-t border-[#E5E5E5] pt-6 flex flex-col gap-6">
            {/* Row 1: Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Estimated Invitations Sent So Far */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200/80 flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estimated Invitations Sent So Far</span>
                <span className="text-3xl font-extrabold text-[#2B2B2B]">
                  {results.estimatedInvitesSent !== null ? formatNumber(results.estimatedInvitesSent) : '—'}
                </span>
                <span className="text-[11px] text-gray-500 font-medium pt-1">
                  Based on planned yield rate
                </span>
              </div>

              {/* Progress Percentage */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200/80 flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress %</span>
                <span className="text-3xl font-extrabold text-[#2B2B2B]">
                  {results.progressPercentage.toFixed(1)}%
                </span>
                <span className="text-[11px] text-gray-500 font-medium pt-1">
                  Achieved ({formatNumber(data.completesAchieved)}) ÷ Target ({formatNumber(data.targetCompletes)})
                </span>
              </div>
            </div>

            {/* Progress Bar Container */}
            <div className="flex flex-col gap-2.5 bg-gray-50 rounded-xl p-5 border border-gray-200/80">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-600">Completion Progress</span>
                <span className="text-xs font-extrabold text-[#2B2B2B]">{results.progressPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-[#E8442C] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${results.progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-gray-500 font-medium pt-0.5">
                <span>{formatNumber(data.completesAchieved)} completes achieved</span>
                <span>{formatNumber(data.targetCompletes)} target</span>
              </div>
            </div>
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
