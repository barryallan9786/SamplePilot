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
              <h2 className="text-xl font-bold text-[#2B2B2B]">Calculation Methodology</h2>
            </div>

            <div className="space-y-6 text-sm text-[#2B2B2B] leading-relaxed">
              <div>
                <h3 className="font-bold text-base text-[#E8442C] mb-1">1. Required Future CPI Model</h3>
                <p className="text-gray-600">
                  Calculates the maximum Cost Per Interview (CPI) allowable for remaining completes while preserving your target gross margin.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 my-2 font-mono text-xs text-gray-800 space-y-1">
                  <div>Project Revenue = Total Completes Needed × Client CPI</div>
                  <div>Allowed Cost = Project Revenue × (1 - Target Margin %)</div>
                  <div>Remaining Budget = Allowed Cost - Incurred Cost</div>
                  <div><strong>Required Future CPI = Remaining Budget ÷ Remaining Completes</strong></div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-base text-[#E8442C] mb-1">2. Invitation Release Volume Model</h3>
                <p className="text-gray-600">
                  Translates target completes into initial panel invitation batch dispatches, factoring in screening conversion (Incidence Rate) and response rates.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 my-2 font-mono text-xs text-gray-800 space-y-1">
                  <div>Survey Participants Expected = Target Completes ÷ Infield IR %</div>
                  <div><strong>Invites to Release = ⌈ Survey Participants Expected ÷ Panel Response Rate % ⌉</strong></div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-base text-[#E8442C] mb-1">3. Infield vs Bid IR Variance Handling</h3>
                <p className="text-gray-600">
                  Bid IR reflects initial project quoting assumptions. When actual infield IR drops below bid IR, panel invitation volume expands proportionally to maintain completion rates within field timelines.
                </p>
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
