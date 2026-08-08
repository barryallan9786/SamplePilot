import React from 'react';
import { MarginData, CpiPhase } from '../types';
import { calculateMarginResults, formatCurrency, formatNumber } from '../utils/calculations';
import { NumericInput } from './NumericInput';

interface MarginCalculatorProps {
  data: MarginData;
  onChange: (updated: MarginData) => void;
  onSaveScenario: () => void;
  onExport: () => void;
}

export const MarginCalculator: React.FC<MarginCalculatorProps> = ({
  data,
  onChange,
  onSaveScenario,
  onExport,
}) => {
  const results = calculateMarginResults(data);

  // Field update handlers with validation support
  const handleFieldChange = (field: keyof MarginData, value: number) => {
    onChange({
      ...data,
      [field]: isNaN(value) ? 0 : value,
    });
  };

  const handlePhaseChange = (id: string, field: keyof CpiPhase, value: string | number) => {
    const updatedPhases = data.phases.map((p) => {
      if (p.id === id) {
        if (field === 'phase') {
          return { ...p, phase: String(value) };
        } else {
          const num = typeof value === 'number' ? value : parseFloat(value);
          return { ...p, [field]: isNaN(num) ? 0 : num };
        }
      }
      return p;
    });
    onChange({ ...data, phases: updatedPhases });
  };

  const handleAddRow = () => {
    const newPhase: CpiPhase = {
      id: Date.now().toString(),
      phase: `Phase ${data.phases.length + 1}`,
      completes: 0,
      cpi: 0,
    };
    onChange({ ...data, phases: [...data.phases, newPhase] });
  };

  const handleDeleteRow = (id: string) => {
    if (data.phases.length <= 1) return; // Keep at least one row
    onChange({
      ...data,
      phases: data.phases.filter((p) => p.id !== id),
    });
  };

  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#2B2B2B] tracking-tight">
          Margin Calculator
        </h1>
        <p className="text-base md:text-lg text-[#2B2B2B]/80 max-w-3xl font-medium">
          Calculate CPI, profitability, and feasibility.
        </p>
      </div>

      {/* Assertion Error Alert (If ever triggered) */}
      {!results.assertionPassed && (
        <div className="bg-red-50 text-red-700 border-l-4 border-red-500 p-4 rounded-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-xl">error</span>
          <span className="text-sm font-semibold">
            Calculation Mismatch Detected: Project Revenue divided by Total Completes does not equal Client CPI.
          </span>
        </div>
      )}

      {/* Main Grid: Left Column Inputs + Right Column Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & CPI History */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Section 1: Project Details */}
          <section className="calc-card">
            <h2 className="text-xl font-bold text-[#2B2B2B] mb-6 border-b border-[#E5E5E5] pb-4">
              Project Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Total Completes Needed */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#2B2B2B]">
                  Total Completes Needed *
                </label>
                <NumericInput
                  className={`calc-input !px-4 font-medium text-base ${
                    results.validationErrors.totalCompletes ? 'border-red-500 bg-red-50/30' : ''
                  }`}
                  placeholder="0"
                  value={data.totalCompletes}
                  onFocus={(e) => e.target.select()}
                  onChange={(val) => handleFieldChange('totalCompletes', val)}
                  isDecimal={false}
                />
                {results.validationErrors.totalCompletes && (
                  <span className="text-xs font-semibold text-red-600">
                    {results.validationErrors.totalCompletes}
                  </span>
                )}
              </div>

              {/* BUG #2 FIX: Completes Collected (Auto-calculated, read-only) */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#2B2B2B]">
                    Completes Collected
                  </label>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Auto-summed
                  </span>
                </div>
                <div className="relative">
                  <input
                    className="calc-input !px-4 font-bold text-base bg-gray-100/80 text-gray-700 cursor-not-allowed border-gray-300"
                    type="text"
                    inputMode="numeric"
                    readOnly
                    value={results.incurredCompletes}
                  />
                </div>
                <span className="text-[11px] text-gray-500 font-medium">
                  Derived from sum of completes in CPI History table
                </span>
              </div>

              {/* Client CPI ($) */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#2B2B2B]" htmlFor="client_cpi">
                  Client CPI ($) *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[#2B2B2B] font-bold text-base pointer-events-none select-none z-10">$</span>
                  <NumericInput
                    id="client_cpi"
                    className={`calc-input !pl-10 !pr-4 font-medium text-base ${
                      results.validationErrors.clientCpi ? 'border-red-500 bg-red-50/30' : ''
                    }`}
                    placeholder="0.00"
                    value={data.clientCpi}
                    onFocus={(e) => e.target.select()}
                    onChange={(val) => handleFieldChange('clientCpi', val)}
                    isDecimal={true}
                  />
                </div>
                {results.validationErrors.clientCpi ? (
                  <span className="text-xs font-semibold text-red-600">
                    {results.validationErrors.clientCpi}
                  </span>
                ) : (
                  <span className="text-[11px] text-gray-500 font-medium">
                    Project Revenue: {formatCurrency(data.totalCompletes * data.clientCpi)}
                  </span>
                )}
              </div>

              {/* Target Margin (%) */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#2B2B2B]" htmlFor="target_margin">
                  Target Margin (%) *
                </label>
                <div className="relative flex items-center">
                  <NumericInput
                    id="target_margin"
                    className={`calc-input !pl-4 !pr-10 font-medium text-base ${
                      results.validationErrors.targetMargin ? 'border-red-500 bg-red-50/30' : ''
                    }`}
                    placeholder="0"
                    value={data.targetMargin}
                    onFocus={(e) => e.target.select()}
                    onChange={(val) => handleFieldChange('targetMargin', val)}
                    isDecimal={true}
                  />
                  <span className="absolute right-3.5 text-[#2B2B2B] font-bold text-base pointer-events-none select-none z-10">%</span>
                </div>
                {results.validationErrors.targetMargin && (
                  <span className="text-xs font-semibold text-red-600">
                    {results.validationErrors.targetMargin}
                  </span>
                )}
              </div>

              {/* Current Incidence Rate (%) */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#2B2B2B]" htmlFor="incidence_rate">
                  Current Incidence Rate (%) *
                </label>
                <div className="relative flex items-center max-w-md">
                  <NumericInput
                    id="incidence_rate"
                    className={`calc-input !pl-4 !pr-10 font-medium text-base ${
                      results.validationErrors.incidenceRate ? 'border-red-500 bg-red-50/30' : ''
                    }`}
                    placeholder="0"
                    value={data.incidenceRate}
                    onFocus={(e) => e.target.select()}
                    onChange={(val) => handleFieldChange('incidenceRate', val)}
                    isDecimal={true}
                  />
                  <span className="absolute right-3.5 text-[#2B2B2B] font-bold text-base pointer-events-none select-none z-10">%</span>
                </div>
                {results.validationErrors.incidenceRate ? (
                  <span className="text-xs font-semibold text-red-600">
                    {results.validationErrors.incidenceRate}
                  </span>
                ) : (
                  <span className="text-[11px] text-gray-500 font-medium">
                    Operational heuristic: Est. minimum supplier market CPI is{' '}
                    <strong>{formatCurrency(results.operationalFeasibility.estimatedMinMarketCpi)}</strong> at {data.incidenceRate}% IR.
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Section 2: CPI Change History */}
          <section className="calc-card">
            <div className="flex justify-between items-center mb-6 border-b border-[#E5E5E5] pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#2B2B2B]">CPI Change History</h2>
                <p className="text-xs text-gray-500 font-normal">
                  Track past field phases. Completes and Incurred Cost calculate automatically from this table.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddRow}
                className="text-[#E8442C] hover:text-[#C93A24] font-bold text-xs uppercase tracking-wider flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Add Row
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F4F4F4]">
                    <th className="p-3.5 text-xs font-bold uppercase tracking-wider text-[#2B2B2B] rounded-tl-lg">
                      Phase
                    </th>
                    <th className="p-3.5 text-xs font-bold uppercase tracking-wider text-[#2B2B2B]">
                      Completes
                    </th>
                    <th className="p-3.5 text-xs font-bold uppercase tracking-wider text-[#2B2B2B]">
                      CPI ($)
                    </th>
                    <th className="p-3.5 rounded-tr-lg w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.phases.map((p) => (
                    <tr key={p.id} className="border-b border-[#E5E5E5]">
                      <td className="p-3">
                        <input
                          className="calc-input py-2 px-3 text-sm font-medium"
                          type="text"
                          value={p.phase}
                          onChange={(e) => handlePhaseChange(p.id, 'phase', e.target.value)}
                        />
                      </td>
                      <td className="p-3">
                        <NumericInput
                          className={`calc-input py-2 !px-3 text-sm font-medium ${
                            p.completes < 0 ? 'border-red-500 bg-red-50/30' : ''
                          }`}
                          placeholder="0"
                          value={p.completes}
                          onFocus={(e) => e.target.select()}
                          onChange={(val) => handlePhaseChange(p.id, 'completes', val)}
                          isDecimal={false}
                        />
                      </td>
                      <td className="p-3">
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-gray-500 font-bold text-xs pointer-events-none select-none z-10">$</span>
                          <NumericInput
                            className={`calc-input py-2 !pl-8 !pr-3 text-sm font-medium ${
                              p.cpi < 0 ? 'border-red-500 bg-red-50/30' : ''
                            }`}
                            placeholder="0.00"
                            value={p.cpi}
                            onFocus={(e) => e.target.select()}
                            onChange={(val) => handlePhaseChange(p.id, 'cpi', val)}
                            isDecimal={true}
                          />
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(p.id)}
                          disabled={data.phases.length <= 1}
                          className={`p-1 transition-colors ${
                            data.phases.length <= 1
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-400 hover:text-[#C93A24]'
                          }`}
                          title={data.phases.length <= 1 ? "Cannot delete the last row" : "Delete row"}
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50/80 text-xs font-bold text-[#2B2B2B]">
                    <td className="p-3">Phase Totals:</td>
                    <td className="p-3">{formatNumber(results.incurredCompletes)} completes</td>
                    <td className="p-3">{formatCurrency(results.incurredCost)} spent</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* Bottom Actions */}
          <div className="flex gap-4 justify-end mt-2">
            <button
              onClick={onExport}
              className="bg-white text-[#2B2B2B] border border-[#E5E5E5] rounded-xl font-bold py-3 px-6 hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              Export
            </button>
            <button
              onClick={onSaveScenario}
              className="bg-gradient-to-r from-[#E8442C] to-[#C93A24] text-white font-bold rounded-xl py-3 px-6 hover:opacity-90 transition-opacity flex items-center gap-2 shadow-md"
            >
              <span className="material-symbols-outlined text-lg">save</span>
              Save Scenario
            </button>
          </div>
        </div>

        {/* Right Column: Results Dashboard */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Primary Output Highlight */}
          <div className="bg-[#FDF0EE] border-2 border-dashed border-[#E8442C] rounded-xl p-6 text-center relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#E8442C]"></div>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#E8442C] mb-2">
              Required Future CPI
            </h3>
            <div className="text-4xl md:text-5xl font-extrabold text-[#E8442C] tracking-tight">
              {formatCurrency(results.requiredFutureCpi)}
            </div>
            <p className="text-xs font-semibold text-[#2B2B2B] mt-3 leading-relaxed">
              To maintain {data.targetMargin}% margin on {formatNumber(results.remainingCompletes)} remaining completes.
            </p>
          </div>

          {/* FEATURE #1: Dual Feasibility Checks (Financial & Operational) */}
          <div className="bg-white rounded-xl p-5 border border-[#E5E5E5] shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#2B2B2B] pb-2 border-b border-gray-100 flex items-center justify-between">
              <span>Feasibility Assessment</span>
              <span className="text-[10px] text-gray-400 font-normal">Dual-Check</span>
            </h3>

            {/* Financial Feasibility */}
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border shrink-0 ${
                  results.financialFeasibility.isFeasible
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-red-50 text-red-600 border-red-200'
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {results.financialFeasibility.isFeasible ? 'check_circle' : 'cancel'}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2B2B2B]">Financial Feasibility</span>
                  <span
                    className={`text-[11px] font-extrabold px-2 py-0.5 rounded ${
                      results.financialFeasibility.isFeasible
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {results.financialFeasibility.status}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 font-medium leading-tight mt-1">
                  {results.financialFeasibility.reason}
                </p>
              </div>
            </div>

            {/* Operational Feasibility */}
            <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border shrink-0 ${
                  results.operationalFeasibility.isFeasible
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-red-50 text-red-600 border-red-200'
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {results.operationalFeasibility.isFeasible ? 'check_circle' : 'cancel'}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2B2B2B]">Operational Feasibility</span>
                  <span
                    className={`text-[11px] font-extrabold px-2 py-0.5 rounded ${
                      results.operationalFeasibility.isFeasible
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {results.operationalFeasibility.status}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 font-medium leading-tight mt-1">
                  {results.operationalFeasibility.reason}
                </p>
              </div>
            </div>
          </div>

          {/* KPI Grid (2x3) with FEATURE #3 Reference Numbers */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-3.5 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">
                Project Revenue
              </div>
              <div className="text-base font-bold text-[#2B2B2B]">
                {formatCurrency(results.projectRevenue)}
              </div>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded-xl p-3.5 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">
                Allowed Cost
              </div>
              <div className="text-base font-bold text-[#2B2B2B]">
                {formatCurrency(results.allowedCost)}
              </div>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded-xl p-3.5 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">
                Incurred Cost
              </div>
              <div className="text-base font-bold text-[#2B2B2B]">
                {formatCurrency(results.incurredCost)}
              </div>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded-xl p-3.5 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">
                Remaining Budget
              </div>
              <div
                className={`text-base font-bold ${
                  results.remainingBudget < 0 ? 'text-red-600' : 'text-[#2B2B2B]'
                }`}
              >
                {formatCurrency(results.remainingBudget)}
              </div>
            </div>

            {/* FEATURE #3: Breakeven CPI */}
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-3.5 shadow-sm col-span-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">
                Breakeven CPI (0% Margin)
              </div>
              <div className="text-base font-bold text-[#2B2B2B]">
                {formatCurrency(results.breakevenFutureCpi)}
              </div>
              <div className="text-[10px] text-gray-400 font-normal">Going forward</div>
            </div>

            {/* FEATURE #3: Blended Margin to Date */}
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-3.5 shadow-sm col-span-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">
                Blended Margin To Date
              </div>
              <div
                className={`text-base font-bold ${
                  results.blendedMarginToDate !== null && results.blendedMarginToDate < 0
                    ? 'text-red-600'
                    : 'text-emerald-700'
                }`}
              >
                {results.blendedMarginToDate !== null
                  ? `${results.blendedMarginToDate.toFixed(1)}%`
                  : 'N/A'}
              </div>
              <div className="text-[10px] text-gray-400 font-normal">Achieved so far</div>
            </div>
          </div>

          {/* FEATURE #2: Dynamic Numeric Smart Recommendations */}
          <div className="calc-card p-5">
            <h3 className="text-sm font-bold text-[#2B2B2B] mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#E8442C] text-lg">auto_awesome</span>
              Smart Recommendations
            </h3>
            <div className="space-y-3">
              {results.smartRecommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    rec.type === 'option_a' || rec.type === 'option_b'
                      ? 'bg-[#FDF0EE] border-[#E8442C]/20 text-[#2B2B2B]'
                      : rec.type === 'cushion'
                      ? 'bg-emerald-50/60 border-emerald-200 text-[#2B2B2B]'
                      : 'bg-gray-50 border-gray-200 text-[#2B2B2B]'
                  }`}
                >
                  {rec.title && (
                    <div className="font-bold text-[#E8442C] mb-1 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base shrink-0">{rec.icon}</span>
                      <span>{rec.title}</span>
                    </div>
                  )}
                  <p className="font-medium text-[11px] text-gray-700">{rec.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
