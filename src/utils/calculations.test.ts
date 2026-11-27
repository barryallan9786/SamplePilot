import { calculateInvitationResults, calculateMarginResults, formatNumber, formatCurrency } from './calculations';
import { InvitationData, MarginData } from '../types';

function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      failed++;
    }
  }

  function assertEqual(actual: any, expected: any, message: string) {
    if (actual === expected) {
      console.log(`✓ PASS: ${message} (Expected: ${expected}, Got: ${actual})`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message} (Expected: ${expected}, Got: ${actual})`);
      failed++;
    }
  }

  function assertApprox(actual: number, expected: number, tolerance = 0.01, message: string) {
    if (Math.abs(actual - expected) <= tolerance) {
      console.log(`✓ PASS: ${message} (Expected: ~${expected}, Got: ${actual})`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message} (Expected: ~${expected}, Got: ${actual})`);
      failed++;
    }
  }

  console.log('=== TEST SUITE: SAMPLE PILOT QUANTITATIVE METHODOLOGY ===\n');

  // 1. SPECIFICATION VALIDATION EXAMPLE (Section 9)
  console.log('--- Test Group 1: Benchmark Specification Example ---');
  const benchmarkInput: InvitationData = {
    targetCompletes: 500,
    bidIr: 50,
    infieldIr: 12,
    panelResponseRate: 15,
    validCompletionRate: 100,
    completesAchieved: 0,
    outstandingInvitations: 0,
    invitationBuffer: 0,
  };

  const res1 = calculateInvitationResults(benchmarkInput);
  assertEqual(res1.bidParticipants, 1000, 'Bid Survey Participants must equal 1,000');
  assertEqual(res1.bidInvites, 6667, 'Bid Invitations must equal 6,667');
  assertApprox(res1.liveParticipantsExact, 4166.67, 0.01, 'Live Survey Participants must equal ~4,166.67');
  assertEqual(res1.liveInvites, 27778, 'Live Additional Invitations must equal 27,778');
  assertEqual(res1.baselineAdditionalInvites, 27778, 'Baseline Additional Invitations must equal 27,778');

  // 2. PARTIAL COMPLETION FIELDWORK
  console.log('\n--- Test Group 2: Partial Fieldwork Completion ---');
  const partialInput: InvitationData = {
    ...benchmarkInput,
    completesAchieved: 200,
  };
  const res2 = calculateInvitationResults(partialInput);
  assertEqual(res2.remainingCompletes, 300, 'Remaining completes should be 300 (500 - 200)');
  assertEqual(res2.baselineAdditionalInvites, 16667, 'Baseline Additional Invitations for remaining 300 completes is ⌈300 / 0.018⌉ = 16,667');
  assertEqual(res2.bidInvites, 6667, 'Bid estimate remains immutable at 6,667');

  // 3. OUTSTANDING INVITATIONS IN FIELD
  console.log('\n--- Test Group 3: Outstanding Invitations Pending ---');
  const pendingInput: InvitationData = {
    ...benchmarkInput,
    outstandingInvitations: 2000,
  };
  const res3 = calculateInvitationResults(pendingInput);
  // 2000 * 0.018 = 36 completes expected from pending invites
  assertApprox(res3.expectedPendingCompletes, 36, 0.001, 'Expected pending completes from 2000 invites = 36');
  assertEqual(res3.remainingCompletesAfterPending, 464, 'Remaining completes after pending conversions = 500 - 36 = 464');
  // 464 / 0.018 = 25,777.777... -> 25,778
  assertEqual(res3.baselineAdditionalInvites, 25778, 'Baseline Additional Invitations should be ⌈464 / 0.018⌉ = 25,778');

  // 4. OPERATIONAL BUFFER APPLICATION
  console.log('\n--- Test Group 4: Operational Buffer ---');
  const bufferInput: InvitationData = {
    ...benchmarkInput,
    invitationBuffer: 10, // 10% buffer
  };
  const res4 = calculateInvitationResults(bufferInput);
  assertEqual(res4.baselineAdditionalInvites, 27778, 'Baseline remains 27,778');
  // 27,778 * 1.10 = 30,555.8 -> Math.ceil = 30,556
  assertEqual(res4.bufferedAdditionalInvites, 30556, 'Buffered Additional Invitations (10% buffer) = 30,556');
  assertEqual(res4.liveInvites, 30556, 'liveInvites reports buffered requirement');

  // 5. VALID COMPLETION RATE DROP (QUALITY LOSS)
  console.log('\n--- Test Group 5: Valid Completion Rate (Quality Screen) ---');
  const vcrInput: InvitationData = {
    ...benchmarkInput,
    validCompletionRate: 80, // 80% valid completion rate
  };
  const res5 = calculateInvitationResults(vcrInput);
  // Yield = 0.15 * 0.12 * 0.80 = 0.0144
  // Invitations = ⌈500 / 0.0144⌉ = ⌈34,722.22⌉ = 34,723
  assertEqual(res5.liveInvites, 34723, 'Invitations at 80% valid completion rate = 34,723');

  // 6. OVERACHIEVEMENT / TARGET REACHED
  console.log('\n--- Test Group 6: Target Met / Overachievement ---');
  const completedInput: InvitationData = {
    ...benchmarkInput,
    completesAchieved: 550, // exceeded 500 target
  };
  const res6 = calculateInvitationResults(completedInput);
  assertEqual(res6.remainingCompletes, 0, 'Remaining completes should be 0');
  assertEqual(res6.baselineAdditionalInvites, 0, 'Baseline additional invites should be 0');
  assertEqual(res6.bufferedAdditionalInvites, 0, 'Buffered additional invites should be 0');

  // 7. INFIELD IR DROP
  console.log('\n--- Test Group 7: Infield IR Decline ---');
  const halfIrInput: InvitationData = {
    ...benchmarkInput,
    infieldIr: 6, // halved from 12% to 6%
  };
  const res7 = calculateInvitationResults(halfIrInput);
  // Yield = 0.15 * 0.06 = 0.009
  // Invitations = ⌈500 / 0.009⌉ = 55,556 (doubles)
  assertEqual(res7.liveInvites, 55556, 'Invitations when IR drops to 6% should double to 55,556');

  // 8. PROGRESS TRACKER CALCULATIONS (Stage 3)
  console.log('\n--- Test Group 8: Progress Tracker (Stage 3) ---');
  const entrantsProgress: InvitationData = {
    ...benchmarkInput,
    trackProgressBy: 'entrants',
    totalEntrantsSoFar: 1500,
  };
  const res8a = calculateInvitationResults(entrantsProgress);
  // 1500 / 0.15 = 10,000 invites
  assertEqual(res8a.progressInvitationsSent, 10000, 'Invitations by entrants = 1,500 ÷ 0.15 = 10,000');

  const completesProgress: InvitationData = {
    ...benchmarkInput,
    trackProgressBy: 'completes',
    completesSoFar: 180,
  };
  const res8b = calculateInvitationResults(completesProgress);
  // (180 / 0.12) / 0.15 = 1500 / 0.15 = 10,000 invites
  assertEqual(res8b.progressInvitationsSent, 10000, 'Invitations by completes = (180 ÷ 0.12) ÷ 0.15 = 10,000');

  // 9. FINANCIAL CPI MODEL & SAFEGUARDS
  console.log('\n--- Test Group 9: Required Future CPI & Financial Safeguards ---');
  const marginBase: MarginData = {
    totalCompletes: 1000,
    clientCpi: 6.00,
    targetMargin: 20, // Allowed cost = 1000 * 6.00 * 0.80 = $4,800
    incidenceRate: 15,
    phases: [
      { id: '1', phase: 'Soft Launch', completes: 200, cpi: 2.00 }, // $400
      { id: '2', phase: 'Main Run', completes: 300, cpi: 3.00 },   // $900 -> Total spent: $1,300 on 500 completes
    ],
  };

  const mRes1 = calculateMarginResults(marginBase);
  assertEqual(mRes1.projectRevenue, 6000, 'Project Revenue = 1000 × $6.00 = $6,000');
  assertEqual(mRes1.allowedCost, 4800, 'Allowed Cost (20% margin) = $4,800');
  assertEqual(mRes1.incurredCost, 1300, 'Incurred Cost = $1,300');
  assertEqual(mRes1.remainingBudget, 3500, 'Remaining Budget = $4,800 - $1,300 = $3,500');
  assertEqual(mRes1.remainingCompletes, 500, 'Remaining Completes = 1000 - 500 = 500');
  assertEqual(mRes1.requiredFutureCpi, 7.00, 'Required Future CPI = $3,500 / 500 = $7.00');

  // Financial Safeguard: Budget Exhausted / Deficit
  const marginExhausted: MarginData = {
    ...marginBase,
    phases: [
      { id: '1', phase: 'Overspent Run', completes: 600, cpi: 9.00 }, // Incurred $5,400 > $4,800 allowed
    ],
  };
  const mRes2 = calculateMarginResults(marginExhausted);
  assertEqual(mRes2.remainingBudget, -600, 'Remaining Budget is -$600');
  assert(mRes2.isBudgetExhausted === true, 'isBudgetExhausted must be true');
  assertEqual(mRes2.budgetDeficit, 600, 'Budget deficit must equal $600');
  assertEqual(mRes2.financialFeasibility.isFeasible, false, 'Financial feasibility must be Unfeasible');

  // Financial Safeguard: All Completes Collected (0 Remaining)
  const marginComplete: MarginData = {
    ...marginBase,
    phases: [
      { id: '1', phase: 'Completed', completes: 1000, cpi: 3.50 },
    ],
  };
  const mRes3 = calculateMarginResults(marginComplete);
  assertEqual(mRes3.remainingCompletes, 0, 'Remaining Completes = 0');
  assertEqual(mRes3.requiredFutureCpi, 0, 'Required Future CPI = $0 when remaining completes is 0');
  assertEqual(mRes3.financialFeasibility.isFeasible, true, 'Feasible when completed');

  // 10. STAGE 3 PROGRESS TRACKER: ACTUAL VS ESTIMATED & VCR CONSISTENCY
  console.log('\n--- Test Group 10: Stage 3 Actual vs Estimated & VCR Consistency ---');
  // Scenario 10A: When actual invitationsAlreadySent is provided, Stage 3 reports actual count
  const recordedProgressInput: InvitationData = {
    ...benchmarkInput,
    invitationsAlreadySent: 15400,
    trackProgressBy: 'completes',
    completesSoFar: 180,
  };
  const res10a = calculateInvitationResults(recordedProgressInput);
  assertEqual(res10a.progressIsActual, true, 'progressIsActual must be true when invitationsAlreadySent > 0');
  assertEqual(res10a.progressInvitationsRecorded, 15400, 'Recorded invitations must equal 15,400');
  assertEqual(res10a.progressInvitationsSent, 15400, 'Primary progress output uses recorded actual count (15,400)');
  assertEqual(res10a.progressInvitationsEstimated, 10000, 'Theoretical estimate is preserved at 10,000 for comparison');

  // Scenario 10B: When VCR is 80%, Stage 3 tracking by completes uses consistent Stage 2 conversion rate
  const vcrProgressInput: InvitationData = {
    ...benchmarkInput,
    validCompletionRate: 80,
    trackProgressBy: 'completes',
    completesSoFar: 180,
  };
  const res10b = calculateInvitationResults(vcrProgressInput);
  // Yield = 0.15 * 0.12 * 0.80 = 0.0144
  // 180 / 0.0144 = 12,500
  assertEqual(res10b.progressInvitationsSent, 12500, 'Invitations at 80% VCR = ⌈180 ÷ (0.15 × 0.12 × 0.80)⌉ = 12,500');
  assert(res10b.progressFormulaNote.includes('Valid Completion Rate'), 'Formula note includes Valid Completion Rate when VCR < 100%');

  // 11. SURVEY PARTICIPANTS SPLIT (FULL PROJECT VS ADDITIONAL NEEDED)
  console.log('\n--- Test Group 11: Survey Participants Split (Full vs Additional) ---');
  const splitInput: InvitationData = {
    ...benchmarkInput,
    completesAchieved: 200,
    outstandingInvitations: 2000, // generates 36 expected completes
  };
  const res11 = calculateInvitationResults(splitInput);
  // Full project participants: 500 / 0.12 = 4166.67
  assertApprox(res11.liveParticipantsExact, 4166.67, 0.01, 'Full project participants = 500 / 0.12 = ~4,166.67');
  // Remaining completes after pending = 500 - 200 - 36 = 264
  // Additional participants needed = 264 / 0.12 = 2,200
  assertEqual(res11.additionalParticipantsNeeded, 2200, 'Additional participants needed for remaining target = 264 ÷ 0.12 = 2,200');

  // 12. PRECISION & INTERMEDIATE ROUNDING VERIFICATION (FRACTIONAL PENDING COMPUTES)
  console.log('\n--- Test Group 12: Precision & Intermediate Rounding Verification ---');
  const fractionalInput: InvitationData = {
    ...benchmarkInput,
    completesAchieved: 200, // 300 completes remaining
    outstandingInvitations: 50, // 50 * 0.018 = 0.9 fractional completes
  };
  const res12 = calculateInvitationResults(fractionalInput);
  assertApprox(res12.expectedPendingCompletes, 0.9, 0.0001, 'Expected pending completes = 50 × 0.018 = 0.9 (fractional)');
  assertApprox(res12.remainingCompletesAfterPending, 299.1, 0.0001, 'Remaining completes after pending = 300 - 0.9 = 299.1 (exact)');
  // 299.1 / 0.018 = 16,616.6666... -> ceil = 16,617
  assertEqual(res12.baselineAdditionalInvites, 16617, 'Intermediate floating point precision preserved: ⌈299.1 ÷ 0.018⌉ = 16,617');

  // 13. ZERO CONVERSION RATES HANDLING
  console.log('\n--- Test Group 13: Zero Conversion Rates Handling ---');
  // Scenario 13A: Observed Panel Response Rate = 0%
  const zeroResponseInput: InvitationData = {
    ...benchmarkInput,
    panelResponseRate: 0,
  };
  const res13a = calculateInvitationResults(zeroResponseInput);
  assertEqual(res13a.isEstimateUnavailable, true, 'isEstimateUnavailable must be true when Response Rate is 0%');
  assertEqual(res13a.expectedValidCompletesPerInvite, 0, 'Yield must be 0 when Response Rate is 0%');
  assertEqual(res13a.baselineAdditionalInvites, 0, 'Baseline invites must be 0 (unavailable), not fabricated from assumed positive rate');

  // Scenario 13B: Infield IR = 0%
  const zeroIrInput: InvitationData = {
    ...benchmarkInput,
    infieldIr: 0,
  };
  const res13b = calculateInvitationResults(zeroIrInput);
  assertEqual(res13b.isEstimateUnavailable, true, 'isEstimateUnavailable must be true when Infield IR is 0%');
  assertEqual(res13b.liveParticipantsExact, 0, 'Participants must be 0 when Infield IR is 0%');

  // 14. COMPLETION-LOSS DOUBLE COUNTING SAFEGUARD
  console.log('\n--- Test Group 14: Completion-Loss Double Counting Safeguard ---');
  // Scenario 14A: When Infield IR measures accepted completes / starts (e.g. 12%), VCR is 100% (default)
  const defaultVcr = calculateInvitationResults(benchmarkInput);
  assertEqual(defaultVcr.expectedValidCompletesPerInvite, 0.018, 'Default yield = 15% × 12% × 100% = 0.018');

  // Scenario 14B: When Infield IR measures screener eligibility (15%) and survey completion is 80%
  const twoTierInput: InvitationData = {
    ...benchmarkInput,
    infieldIr: 15,
    validCompletionRate: 80,
  };
  const res14b = calculateInvitationResults(twoTierInput);
  // Yield = 0.15 * 0.15 * 0.80 = 0.018
  assertApprox(res14b.expectedValidCompletesPerInvite, 0.018, 0.0001, 'Screener IR (15%) × 80% VCR yields identical net 0.018 yield');
  assertEqual(res14b.liveInvites, 27778, 'Identical net invitation requirement (27,778) when mathematically equivalent');

  // 15. TARGETED REGRESSION: VCR TIERS (100%, 80%, 50%) & PARTICIPANT SCALING
  console.log('\n--- Test Group 15: VCR Tiers (100%, 80%, 50%) & Participant Scaling ---');
  // Scenario 15A: VCR = 100% (Target 500, IR 12%, Response 15%)
  const vcr100Input: InvitationData = {
    ...benchmarkInput,
    validCompletionRate: 100,
  };
  const resVcr100 = calculateInvitationResults(vcr100Input);
  // Full project participants = 500 / (0.12 * 1.0) = 4,166.67 -> ceil = 4,167
  assertEqual(resVcr100.liveParticipants, 4167, 'VCR 100%: Full Project Participants = ⌈500 ÷ (0.12 × 1.0)⌉ = 4,167');
  // Bid participants = 500 / (0.50 * 1.0) = 1,000
  assertEqual(resVcr100.bidParticipants, 1000, 'VCR 100%: Bid Participants = ⌈500 ÷ 0.50⌉ = 1,000');
  // Additional invites = ⌈500 ÷ (0.15 * 0.12 * 1.0)⌉ = 27,778
  assertEqual(resVcr100.liveInvites, 27778, 'VCR 100%: Live Invites = 27,778');

  // Scenario 15B: VCR = 80% (Target 500, IR 12%, Response 15%)
  const vcr80Input: InvitationData = {
    ...benchmarkInput,
    validCompletionRate: 80,
  };
  const resVcr80 = calculateInvitationResults(vcr80Input);
  // Yield = 0.12 * 0.80 = 0.096
  // Full project participants = 500 / 0.096 = 5,208.33 -> ceil = 5,209
  assertEqual(resVcr80.liveParticipants, 5209, 'VCR 80%: Full Project Participants = ⌈500 ÷ (0.12 × 0.80)⌉ = 5,209');
  // Bid participants = 500 / (0.50 * 0.80) = 500 / 0.40 = 1,250
  assertEqual(resVcr80.bidParticipants, 1250, 'VCR 80%: Bid Participants = ⌈500 ÷ (0.50 × 0.80)⌉ = 1,250');
  // Expected completes per invite = 0.15 * 0.096 = 0.0144
  // Live invites = ⌈500 ÷ 0.0144⌉ = 34,723
  assertEqual(resVcr80.liveInvites, 34723, 'VCR 80%: Live Invites = 34,723');

  // Scenario 15C: VCR = 50% (Target 500, IR 12%, Response 15%)
  const vcr50Input: InvitationData = {
    ...benchmarkInput,
    validCompletionRate: 50,
  };
  const resVcr50 = calculateInvitationResults(vcr50Input);
  // Yield = 0.12 * 0.50 = 0.06
  // Full project participants = 500 / 0.06 = 8,333.33 -> ceil = 8,334
  assertEqual(resVcr50.liveParticipants, 8334, 'VCR 50%: Full Project Participants = ⌈500 ÷ (0.12 × 0.50)⌉ = 8,334');
  // Bid participants = 500 / (0.50 * 0.50) = 500 / 0.25 = 2,000
  assertEqual(resVcr50.bidParticipants, 2000, 'VCR 50%: Bid Participants = ⌈500 ÷ (0.50 × 0.50)⌉ = 2,000');
  // Expected completes per invite = 0.15 * 0.06 = 0.009
  // Live invites = ⌈500 ÷ 0.009⌉ = 55,556
  assertEqual(resVcr50.liveInvites, 55556, 'VCR 50%: Live Invites = 55,556');

  // 16. QUALIFICATION IR VS EFFECTIVE IR EQUIVALENCE (NO DOUBLE COUNTING)
  console.log('\n--- Test Group 16: Qualification IR vs Effective IR Equivalence ---');
  // Model A: Qualification IR = 20%, VCR = 50% -> Net Effective Yield = 10%
  const qualIrInput: InvitationData = {
    targetCompletes: 1000,
    bidIr: 25,
    infieldIr: 20,
    panelResponseRate: 10,
    validCompletionRate: 50,
    completesAchieved: 0,
    outstandingInvitations: 0,
    invitationsAlreadySent: 0,
    invitationBuffer: 0,
  };
  const resQual = calculateInvitationResults(qualIrInput);

  // Model B: Effective IR = 10%, VCR = 100% -> Net Effective Yield = 10%
  const effIrInput: InvitationData = {
    targetCompletes: 1000,
    bidIr: 25,
    infieldIr: 10,
    panelResponseRate: 10,
    validCompletionRate: 100,
    completesAchieved: 0,
    outstandingInvitations: 0,
    invitationsAlreadySent: 0,
    invitationBuffer: 0,
  };
  const resEff = calculateInvitationResults(effIrInput);

  assertEqual(resQual.liveParticipants, 10000, 'Model A (20% Qual IR × 50% VCR): Full Project Participants = 10,000');
  assertEqual(resEff.liveParticipants, 10000, 'Model B (10% Eff IR × 100% VCR): Full Project Participants = 10,000');
  assertEqual(resQual.liveInvites, resEff.liveInvites, 'Model A and Model B require identical invitations (100,000)');

  // 17. FINANCIAL MODEL: COMMITTED & FIXED COSTS WITH BUDGET SAFEGUARDS
  console.log('\n--- Test Group 17: Committed & Fixed Costs with Budget Safeguards ---');
  // Scenario 17A: Multi-tier cost structure within budget
  const marginMultiCost: MarginData = {
    totalCompletes: 1000,
    clientCpi: 6.00, // Revenue = $6,000
    targetMargin: 20, // Allowed cost = $4,800
    incidenceRate: 15,
    phases: [
      { id: '1', phase: 'Soft Launch', completes: 300, cpi: 2.00 }, // $600 variable cost
    ],
    committedCost: 400, // $400 committed supplier allocation
    fixedCost: 300, // $300 platform & programming
  };
  const resMarginCost = calculateMarginResults(marginMultiCost);
  assertEqual(resMarginCost.incurredVariableCost, 600, 'Incurred Variable Cost = $600');
  assertEqual(resMarginCost.committedCost, 400, 'Committed Cost = $400');
  assertEqual(resMarginCost.fixedCost, 300, 'Fixed Cost = $300');
  assertEqual(resMarginCost.totalRecognizedCosts, 1300, 'Total Recognized Costs = $600 + $400 + $300 = $1,300');
  assertEqual(resMarginCost.remainingBudget, 3500, 'Remaining Budget = $4,800 - $1,300 = $3,500');
  assertEqual(resMarginCost.remainingCompletes, 700, 'Remaining Completes = 1,000 - 300 = 700');
  assertEqual(resMarginCost.requiredFutureCpi, 5.00, 'Maximum Allowable Future CPI = $3,500 ÷ 700 = $5.00');

  // Scenario 17B: Budget exhausted due to committed & fixed costs
  const marginExhaustedMultiCost: MarginData = {
    totalCompletes: 1000,
    clientCpi: 6.00, // Revenue = $6,000
    targetMargin: 20, // Allowed cost = $4,800
    incidenceRate: 15,
    phases: [
      { id: '1', phase: 'Phase 1', completes: 800, cpi: 5.00 }, // $4,000 variable
    ],
    committedCost: 800, // $800 committed
    fixedCost: 500, // $500 fixed
  };
  const resMarginExhausted = calculateMarginResults(marginExhaustedMultiCost);
  // Total recognized = 4,000 + 800 + 500 = $5,300
  // Allowed = $4,800 -> Remaining Budget = -$500
  assertEqual(resMarginExhausted.totalRecognizedCosts, 5300, 'Total Recognized Costs = $5,300');
  assertEqual(resMarginExhausted.remainingBudget, -500, 'Remaining Budget = -$500');
  assertEqual(resMarginExhausted.isBudgetExhausted, true, 'isBudgetExhausted must be true');
  assertEqual(resMarginExhausted.budgetDeficit, 500, 'Budget Deficit = $500');
  assertEqual(resMarginExhausted.requiredFutureCpi, 0, 'Required Future CPI capped at $0.00 when exhausted');
  assertEqual(resMarginExhausted.financialFeasibility.isFeasible, false, 'Financial feasibility is Unfeasible');

  // 18. FORMULA DISPLAY DATA ("VIEW CALCULATION") INTEGRITY
  console.log('\n--- Test Group 18: Formula Display ("View Calculation") Integrity ---');
  // Verify calculationDetails exist and match engine outputs
  assert(resVcr80.calculationDetails !== undefined, 'calculationDetails must be present on InvitationResults');
  const details = resVcr80.calculationDetails!;
  assertEqual(details.bidParticipants.finalResult, formatNumber(resVcr80.bidParticipants), 'bidParticipants display matches engine output');
  assertEqual(details.bidInvites.finalResult, formatNumber(resVcr80.bidInvites), 'bidInvites display matches engine output');
  assertEqual(details.fullProjectParticipants.finalResult, formatNumber(resVcr80.liveParticipants), 'fullProjectParticipants display matches engine output');
  assertEqual(details.additionalParticipants.finalResult, formatNumber(resVcr80.additionalParticipantsNeeded), 'additionalParticipants display matches engine output');
  assertEqual(details.liveInvites.finalResult, formatNumber(resVcr80.bufferedAdditionalInvites), 'liveInvites display matches engine output');

  assert(resMarginCost.calculationDetails !== undefined, 'calculationDetails must be present on MarginResults');
  const marginDetails = resMarginCost.calculationDetails!;
  assertEqual(marginDetails.projectRevenue.finalResult, formatCurrency(resMarginCost.projectRevenue), 'projectRevenue display matches engine');
  assertEqual(marginDetails.allowedCost.finalResult, formatCurrency(resMarginCost.allowedCost), 'allowedCost display matches engine');
  assertEqual(marginDetails.incurredCost.finalResult, formatCurrency(resMarginCost.totalRecognizedCosts), 'total recognized cost display matches engine');
  assertEqual(marginDetails.remainingBudget.finalResult, formatCurrency(resMarginCost.remainingBudget), 'remainingBudget display matches engine');
  assertEqual(marginDetails.requiredFutureCpi.finalResult, formatCurrency(resMarginCost.requiredFutureCpi), 'requiredFutureCpi display matches engine');

  console.log(`\n========================================`);
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
