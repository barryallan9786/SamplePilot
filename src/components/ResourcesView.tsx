import React from 'react';

export const ResourcesView: React.FC = () => {
  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 md:px-8 py-8 flex flex-col gap-10">
      <div className="border-b border-[#E5E5E5] pb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#2B2B2B]">
          Fieldwork Resources & Methodology Guide
        </h1>
        <p className="text-sm text-gray-600 font-medium mt-1 max-w-2xl">
          Comprehensive documentation of underlying mathematical models, fieldwork sampling guidelines, and operational standards.
        </p>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Methodology */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Methodology Guide Card */}
          <section className="calc-card space-y-6">
            <div className="flex items-center gap-3 border-b border-[#E5E5E5] pb-4">
              <span className="material-symbols-outlined text-2xl text-[#E8442C]">menu_book</span>
              <div>
                <h2 className="text-xl font-bold text-[#2B2B2B]">Calculation Methodology & Operational Framework</h2>
                <p className="text-xs text-gray-500 font-medium">Audited quantitative models for sampling volume, yield rates, and margin protection</p>
              </div>
            </div>

            <div className="space-y-6 text-sm text-[#2B2B2B] leading-relaxed">
              {/* Metric Definitions */}
              <div>
                <h3 className="font-bold text-base text-[#E8442C] mb-1">1. Three-Tier Conversion Rate Architecture</h3>
                <p className="text-gray-600 mb-2">
                  Sample Pilot explicitly separates the sampling conversion funnel into three mathematically distinct probability rates (converted to decimals before calculation):
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-2">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="font-bold text-xs text-[#2B2B2B] uppercase">Panel Response Rate</div>
                    <div className="text-xs text-gray-600 mt-1">
                      The percentage of delivered invitations that generate actual survey entrants (link clicks & screener starts). Must be &gt; 0% (no arbitrary positive rates are assumed if 0%).
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="font-bold text-xs text-[#2B2B2B] uppercase">Incidence Rate (IR)</div>
                    <div className="text-xs text-gray-600 mt-1">
                      The percentage of survey entrants who qualify based on target screening criteria. If your reported IR already measures accepted completes divided by starts, leave Valid Completion Rate at 100% to avoid double-counting.
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="font-bold text-xs text-[#2B2B2B] uppercase">Valid Completion Rate</div>
                    <div className="text-xs text-gray-600 mt-1">
                      The percentage of qualified respondents who generate accepted completes (default: 100%). Adjust below 100% only if Infield IR measures screener qualification only.
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 my-2 font-mono text-xs text-gray-800 space-y-1">
                  <div><strong>Expected Valid Completes per Invitation</strong> = Response Rate × Incidence Rate × Valid Completion Rate</div>
                  <div className="text-gray-500 text-[11px]">* All percentages are converted to decimal fractions (Rate ÷ 100) prior to multiplication.</div>
                </div>
              </div>

              {/* Stage 1 Bid Estimate */}
              <div>
                <h3 className="font-bold text-base text-[#E8442C] mb-1">2. Bid Estimate (Quoting Reference Model)</h3>
                <p className="text-gray-600">
                  Maintained as an immutable historical benchmark based on the client's original shared Bid IR, assuming zero completes have been collected.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 my-2 font-mono text-xs text-gray-800 space-y-1">
                  <div>Bid Survey Participants = ⌈ Target Completes ÷ (Bid IR × Valid Completion Rate) ⌉</div>
                  <div><strong>Bid Invitations = ⌈ Target Completes ÷ (Bid IR × Panel Response Rate × Valid Completion Rate) ⌉</strong></div>
                </div>
                <p className="text-xs text-gray-500">
                  Full floating-point precision is preserved throughout all intermediate calculations. Only the final whole invitation count is rounded up using ceiling (<code className="text-[#E8442C]">⌈ ⌉</code>). Participants are not prematurely rounded before calculating invitation dispatches.
                </p>
              </div>

              {/* Stage 2 Live Performance Estimate */}
              <div>
                <h3 className="font-bold text-base text-[#E8442C] mb-1">3. Live Performance Model (Additional Invitations Required)</h3>
                <p className="text-gray-600">
                  Calculates the <em>additional</em> invitations needed to fulfill the remaining project quota, rather than recalculating the entire project from scratch. It accounts for valid completes achieved, pending conversions from delivered invitations currently in-field, and an optional operational buffer.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 my-2 font-mono text-xs text-gray-800 space-y-1">
                  <div>Remaining Completes = Max(Target Completes − Valid Completes Achieved, 0)</div>
                  <div>Expected Pending Completes = Outstanding In-Field Invitations × (Response Rate × Infield IR × Valid Completion Rate)</div>
                  <div>Net Completes Needed = Max(Remaining Completes − Expected Pending Completes, 0)</div>
                  <div>Additional Participants Needed = ⌈ Net Completes Needed ÷ (Infield IR × Valid Completion Rate) ⌉</div>
                  <div>Full Project Participants = ⌈ Target Completes ÷ (Infield IR × Valid Completion Rate) ⌉</div>
                  <div><strong>Baseline Additional Invitations = ⌈ Net Completes Needed ÷ Expected Valid Completes per Invitation ⌉</strong></div>
                  <div><strong>Buffered Additional Invitations = ⌈ Baseline Additional Invitations × (1 + Buffer %) ⌉</strong></div>
                </div>
                <p className="text-xs text-gray-500 space-y-1">
                  <div><strong>Outstanding Invitations Pending:</strong> Must represent genuinely pending invitations currently in the field that have not already yielded recorded completes. Because invitation decay varies across panels and survey topics, Sample Pilot forecasts pending completes from unexpired active invitations using the observed conversion rate without arbitrarily expiring invitations.</div>
                  <div><strong>Dispatch Pacing vs Total Requirement:</strong> The estimated additional invitations figure represents the cumulative requirement to finish fieldwork, not an invitation blast recommendation. Controlled waves protect against quota overfill.</div>
                  <div><strong>Total Projected Project Invitations:</strong> When cumulative invitations sent is tracked, Total Projected Invitations = Invitations Already Sent + Estimated Additional Invitations Needed.</div>
                </p>
              </div>

              {/* Infield vs Bid Variance */}
              <div>
                <h3 className="font-bold text-base text-[#E8442C] mb-1">4. Infield vs. Bid IR Variance Dynamics</h3>
                <p className="text-gray-600">
                  Because invitations required scale inversely with observed Incidence Rate (<code className="text-gray-800">Invites ∝ 1 / Infield IR</code>), any decrease in qualifying incidence rate produces an accelerated demand for survey entrants. For example, if Infield IR drops from 50% to 12%, each delivered invitation yields 76% fewer completes, requiring a 4.17× expansion in invitation volume to fulfill field targets.
                </p>
              </div>

              {/* Operational Buffer */}
              <div>
                <h3 className="font-bold text-base text-[#E8442C] mb-1">5. Operational Uncertainty Buffer (0% – 50%)</h3>
                <p className="text-gray-600">
                  An operational contingency buffer can be applied (default 0%, up to 50%) to absorb unexpected screener attrition, panel fatigue, or delayed survey opens. The buffer is an operational allowance for in-field uncertainty and does not guarantee quota completion.
                </p>
              </div>

              {/* Required Future CPI */}
              <div>
                <h3 className="font-bold text-base text-[#E8442C] mb-1">6. Required Future CPI & Financial Safeguards</h3>
                <p className="text-gray-600">
                  Determines the maximum allowable average Cost Per Interview (CPI) for all remaining uncollected completes to achieve your contracted gross margin percentage.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 my-2 font-mono text-xs text-gray-800 space-y-1">
                  <div>Project Revenue = Total Contracted Completes × Client CPI</div>
                  <div>Allowed Total Cost = Project Revenue × (1 − Target Gross Margin %)</div>
                  <div>Total Recognized Costs = Incurred Variable Cost + Committed Costs + Fixed Costs</div>
                  <div>Remaining Budget = Allowed Total Cost − Total Recognized Costs</div>
                  <div><strong>Maximum Allowable Future CPI = Remaining Budget ÷ Remaining Completes</strong></div>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div><strong>Cost Categories Recognized:</strong></div>
                  <ul className="list-disc list-inside space-y-0.5 text-gray-500">
                    <li><strong>Incurred Variable Costs:</strong> Calculated directly from recorded phase completes × phase CPI in the CPI Change History table.</li>
                    <li><strong>Committed Supplier Costs:</strong> Unpaid purchase order obligations or vendor minimums.</li>
                    <li><strong>Fixed Project Costs:</strong> Survey programming, platform hosting, translation, or project management overhead.</li>
                  </ul>
                  <div className="mt-2"><strong>Safeguards & Boundary Conditions:</strong></div>
                  <ul className="list-disc list-inside space-y-0.5 text-gray-500">
                    <li><strong>Target Completes Reached (0 Remaining):</strong> Required Future CPI is $0.00; project metrics are finalized.</li>
                    <li><strong>Exhausted Budget (Remaining Budget &lt; 0):</strong> The engine never silently treats a negative budget as an allowable positive CPI. When recognized costs exceed allowed cost, allowable future CPI is capped at $0.00, and the exact deficit amount is highlighted with an unfeasibility alert.</li>
                  </ul>
                </div>
              </div>

              {/* Stage 3 Progress Tracker */}
              <div>
                <h3 className="font-bold text-base text-[#E8442C] mb-1">7. Progress Tracker (Fielding Verification)</h3>
                <p className="text-gray-600">
                  Tracks cumulative invitations dispatched during fieldwork. When recorded actual cumulative invitations sent are available, the actual count is displayed as the primary figure. Theoretical invitations are estimated separately using consistent Stage 2 conversion assumptions:
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 my-2 font-mono text-xs text-gray-800 space-y-1">
                  <div>Tracking by Entrants: Theoretical Invitations = ⌈ Total Entrants ÷ Panel Response Rate ⌉</div>
                  <div>Tracking by Completes: Theoretical Invitations = ⌈ Completes ÷ (Infield IR × Panel Response Rate × Valid Completion Rate) ⌉</div>
                </div>
              </div>
            </div>
          </section>

          {/* Practical Guidance Card */}
          <section className="calc-card space-y-6">
            <div className="flex items-center gap-3 border-b border-[#E5E5E5] pb-4">
              <span className="material-symbols-outlined text-2xl text-[#E8442C]">verified</span>
              <h2 className="text-xl font-bold text-[#2B2B2B]">Practical Fieldwork Guidance</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-gray-700">
              <div className="p-4 rounded-xl bg-[#FDF0EE] border border-[#E8442C]/20 space-y-1">
                <h4 className="font-bold text-sm text-[#E8442C]">Soft Launch Pacing</h4>
                <p className="leading-normal">
                  Release 10-15% of target invitations in wave 1 to measure true infield IR before scaling full sample dispatches.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <h4 className="font-bold text-sm text-[#2B2B2B]">Incentive Calibration</h4>
                <p className="leading-normal">
                  If IR is under 10%, consider boosting respondent incentive early to avoid panel fatigue and maintain survey speed.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                <h4 className="font-bold text-sm text-[#2B2B2B]">Quota Management</h4>
                <p className="leading-normal">
                  Track demographic nested quotas closely. Adjust CPI per subgroup if hard-to-reach cells require higher payout.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FDF0EE] border border-[#E8442C]/20 space-y-1">
                <h4 className="font-bold text-sm text-[#E8442C]">Data Quality Guardrails</h4>
                <p className="leading-normal">
                  Budget for a 5-8% overage to account for speeder cleans, straightliners, and open-end quality rejections.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Legal & Privacy */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="calc-card p-6 space-y-4">
            <h3 className="font-bold text-base text-[#2B2B2B] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#E8442C]">gavel</span>
              Legal & Privacy Policies
            </h3>
            <div className="text-xs text-gray-600 space-y-4 font-medium leading-relaxed">
              <div>
                <div className="font-bold text-[#2B2B2B] mb-1">Terms of Service</div>
                <p>
                  Built for smart decision-making. SamplePilot gives you data-driven estimates tailored to real project variables like panel mix, screener design, and timing, so you always have a strong operational baseline to work from.
                </p>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <div className="font-bold text-[#2B2B2B] mb-1">Privacy Policy</div>
                <p>
                  Your data never leaves your browser. Every project metric, CPI quote, and sample size you enter is calculated locally and lives only in your session. Close the tab, and it's gone. No servers, no storage, no tracking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
