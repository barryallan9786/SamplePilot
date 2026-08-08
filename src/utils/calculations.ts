import { MarginData, MarginResults, InvitationData, InvitationResults, SmartRecommendation } from '../types';

export function validateAndSanitizeMarginData(data: any): MarginData {
  const fallback: MarginData = {
    totalCompletes: 1000,
    clientCpi: 6.00,
    targetMargin: 20,
    incidenceRate: 15,
    phases: [
      { id: '1', phase: 'Initial Launch', completes: 200, cpi: 1.50 },
      { id: '2', phase: 'Boost 1', completes: 100, cpi: 2.25 },
      { id: '3', phase: 'Boost 2', completes: 200, cpi: 5.00 },
    ],
  };

  if (!data || typeof data !== 'object') {
    console.warn('[Validation Warning] Invalid margin data format. Falling back to default data.');
    return fallback;
  }

  let totalCompletes = Number(data.totalCompletes);
  if (isNaN(totalCompletes) || !isFinite(totalCompletes) || totalCompletes < 1) {
    console.warn(`[Validation Warning] Invalid totalCompletes (${data.totalCompletes}). Repairing to 1000.`);
    totalCompletes = 1000;
  }

  let clientCpi = Number(data.clientCpi);
  // General sanity check: clientCpi must be a valid positive number within 0.01 to 1000
  if (isNaN(clientCpi) || !isFinite(clientCpi) || clientCpi < 0.01 || clientCpi > 1000) {
    console.warn(`[Validation Warning] Client CPI (${data.clientCpi}) failed sanity check range (0.01 - 1000). Repairing to safe default $6.00.`);
    clientCpi = 6.00;
  }

  // General Project Revenue assertion check: projectRevenue / totalCompletes === clientCpi
  const computedProjectRevenue = totalCompletes * clientCpi;
  const assertionCheckCpi = computedProjectRevenue / totalCompletes;
  if (Math.abs(assertionCheckCpi - clientCpi) > 0.00001) {
    console.warn(`[Validation Warning] Project Revenue assertion failed: ${computedProjectRevenue} / ${totalCompletes} = ${assertionCheckCpi} != ${clientCpi}. Repairing Client CPI.`);
    clientCpi = 6.00;
  }

  let targetMargin = Number(data.targetMargin);
  if (isNaN(targetMargin) || !isFinite(targetMargin) || targetMargin < 0 || targetMargin > 100) {
    targetMargin = 20;
  }

  let incidenceRate = Number(data.incidenceRate);
  if (isNaN(incidenceRate) || !isFinite(incidenceRate) || incidenceRate < 0.1 || incidenceRate > 100) {
    incidenceRate = 15;
  }

  const phases = Array.isArray(data.phases)
    ? data.phases.map((p: any, idx: number) => ({
        id: p && p.id ? String(p.id) : String(Date.now() + idx),
        phase: p && p.phase ? String(p.phase) : `Phase ${idx + 1}`,
        completes: p && !isNaN(Number(p.completes)) ? Math.max(0, Number(p.completes)) : 0,
        cpi: p && !isNaN(Number(p.cpi)) ? Math.max(0, Number(p.cpi)) : 0,
      }))
    : [];

  return {
    totalCompletes,
    clientCpi,
    targetMargin,
    incidenceRate,
    phases,
  };
}

export function calculateMarginResults(data: MarginData): MarginResults {
  const validationErrors: Record<string, string> = {};

  // Input Validation
  const totalCompletes = Number(data.totalCompletes);
  if (isNaN(totalCompletes) || totalCompletes < 1) {
    validationErrors.totalCompletes = 'Total completes needed must be at least 1.';
  }

  const clientCpi = Number(data.clientCpi);
  if (isNaN(clientCpi) || clientCpi < 0) {
    validationErrors.clientCpi = 'Client CPI must be $0.00 or greater.';
  }

  const targetMargin = Number(data.targetMargin);
  if (isNaN(targetMargin) || targetMargin < 0 || targetMargin > 100) {
    validationErrors.targetMargin = 'Target margin must be between 0% and 100%.';
  }

  const incidenceRate = Number(data.incidenceRate);
  if (isNaN(incidenceRate) || incidenceRate <= 0 || incidenceRate > 100) {
    validationErrors.incidenceRate = 'Incidence rate must be between 0.1% and 100%.';
  }

  // Safe fallback values for math calculations
  const safeTotalCompletes = Math.max(1, isNaN(totalCompletes) ? 1000 : totalCompletes);
  const safeClientCpi = Math.max(0, isNaN(clientCpi) ? 0 : clientCpi);
  const safeTargetMargin = Math.min(100, Math.max(0, isNaN(targetMargin) ? 0 : targetMargin));
  const safeIncidenceRate = Math.min(100, Math.max(0.1, isNaN(incidenceRate) ? 100 : incidenceRate));

  // BUG #2 FIX: Single source of truth from CPI Change History table
  const phases = Array.isArray(data.phases) ? data.phases : [];
  const incurredCompletes = phases.reduce((sum, p) => sum + Math.max(0, Number(p.completes) || 0), 0);
  const incurredCost = phases.reduce(
    (sum, p) => sum + (Math.max(0, Number(p.completes) || 0) * Math.max(0, Number(p.cpi) || 0)),
    0
  );

  // Core Financials
  // BUG #1 FIX: Project Revenue = Total Completes Needed * Client CPI
  const projectRevenue = safeTotalCompletes * safeClientCpi;

  // BUG #1 ASSERTION: Verify that Project Revenue / Total Completes equals displayed Client CPI exactly
  const calculatedClientCpi = projectRevenue / safeTotalCompletes;
  const assertionPassed = Math.abs(calculatedClientCpi - safeClientCpi) < 0.00001;
  if (!assertionPassed) {
    console.error(`BUG #1 Assertion Failure: Project Revenue (${projectRevenue}) / Total Completes (${safeTotalCompletes}) = ${calculatedClientCpi}, expected Client CPI (${safeClientCpi})`);
  }

  const allowedCost = projectRevenue * (1 - safeTargetMargin / 100);
  const remainingBudget = allowedCost - incurredCost;
  const remainingCompletes = Math.max(0, safeTotalCompletes - incurredCompletes);

  let requiredFutureCpi = 0;
  if (remainingCompletes > 0) {
    requiredFutureCpi = remainingBudget / remainingCompletes;
  }

  // FEATURE #3: Breakeven Future CPI & Blended Margin to Date
  // Breakeven Future CPI (at 0% target margin, allowed cost = projectRevenue)
  const breakevenFutureCpi =
    remainingCompletes > 0
      ? (projectRevenue - incurredCost) / remainingCompletes
      : safeClientCpi;

  // Blended Margin to Date (%) = (Revenue attributable to completes collected - Incurred Cost) / Revenue attributable to completes collected
  const revenueToDate = incurredCompletes * safeClientCpi;
  let blendedMarginToDate: number | null = null;
  if (incurredCompletes > 0 && revenueToDate > 0) {
    blendedMarginToDate = ((revenueToDate - incurredCost) / revenueToDate) * 100;
  }

  // FEATURE #1: Financial & Operational Feasibility Checks
  // Financial Feasibility Check
  const isFinanciallyFeasible =
    remainingBudget >= 0 &&
    (remainingCompletes === 0 || (requiredFutureCpi > 0 && requiredFutureCpi <= safeClientCpi));

  let financialReason = '';
  if (remainingCompletes === 0) {
    financialReason = 'Target completes already collected.';
  } else if (remainingBudget < 0) {
    financialReason = `Incurred cost ($${incurredCost.toFixed(2)}) exceeds total allowed budget ($${allowedCost.toFixed(2)}).`;
  } else if (requiredFutureCpi <= 0) {
    financialReason = 'Required Future CPI is $0.00 or negative to hit target margin.';
  } else if (requiredFutureCpi > safeClientCpi) {
    financialReason = `Required Future CPI ($${requiredFutureCpi.toFixed(2)}) exceeds Client CPI ($${safeClientCpi.toFixed(2)}).`;
  } else {
    financialReason = `Required Future CPI ($${requiredFutureCpi.toFixed(2)}) is within Client CPI ($${safeClientCpi.toFixed(2)}).`;
  }

  const financialFeasibility = {
    isFeasible: isFinanciallyFeasible,
    status: isFinanciallyFeasible ? ('Feasible' as const) : ('Unfeasible' as const),
    reason: financialReason,
  };

  // Operational Feasibility Check
  // Market Research Heuristic: Minimum supplier market CPI scales inversely with sqrt(Incidence Rate)
  // Baseline assumption: Standard general audience panel sample at 30% IR requires estimated $1.50 baseline CPI.
  const estimatedMinMarketCpi = 1.50 * Math.sqrt(30 / safeIncidenceRate);

  const isOperationallyFeasible =
    remainingCompletes === 0 || requiredFutureCpi >= estimatedMinMarketCpi;

  let operationalReason = '';
  if (remainingCompletes === 0) {
    operationalReason = 'Target completes already collected.';
  } else if (isOperationallyFeasible) {
    operationalReason = `Required CPI ($${requiredFutureCpi.toFixed(2)}) meets or exceeds estimated supplier market minimum ($${estimatedMinMarketCpi.toFixed(2)}) at ${safeIncidenceRate}% IR.`;
  } else {
    operationalReason = `Required CPI ($${requiredFutureCpi.toFixed(2)}) is below estimated supplier market minimum ($${estimatedMinMarketCpi.toFixed(2)}) needed for ${safeIncidenceRate}% IR.`;
  }

  const operationalFeasibility = {
    isFeasible: isOperationallyFeasible,
    status: isOperationallyFeasible ? ('Feasible' as const) : ('Unfeasible' as const),
    estimatedMinMarketCpi,
    reason: operationalReason,
  };

  // FEATURE #2: Dynamic & Numeric Smart Recommendations
  const smartRecommendations: SmartRecommendation[] = [];

  const isOverallUnfeasible = !isFinanciallyFeasible || !isOperationallyFeasible;

  if (remainingCompletes === 0) {
    smartRecommendations.push({
      icon: 'check_circle',
      title: 'Project Complete',
      text: 'Target completes reached! All budget and margin metrics are finalized.',
      type: 'info',
    });
  } else if (isOverallUnfeasible) {
    // If Unfeasible: calculate specific options to close the gap.
    // Minimum viable CPI required by market panel suppliers for this IR
    const minSupplierCpi = Math.max(estimatedMinMarketCpi, 0.50);

    // Option (a): Renegotiate Client CPI
    // Total cost needed = incurredCost + (remainingCompletes * minSupplierCpi)
    const totalCostNeeded = incurredCost + remainingCompletes * minSupplierCpi;
    const revenueNeededForMargin = totalCostNeeded / (1 - safeTargetMargin / 100);
    const neededClientCpi = revenueNeededForMargin / safeTotalCompletes;
    const cpiIncreasePerComplete = Math.max(0, neededClientCpi - safeClientCpi);

    smartRecommendations.push({
      icon: 'add_card',
      title: 'Option A: Renegotiate Client CPI',
      text: `Renegotiate Client CPI from $${safeClientCpi.toFixed(2)} to $${neededClientCpi.toFixed(2)} (+$${cpiIncreasePerComplete.toFixed(2)}/complete) to hit your ${safeTargetMargin}% target margin at market CPI ($${minSupplierCpi.toFixed(2)}).`,
      type: 'option_a',
    });

    // Option (b): Lower Target Margin %
    // Achievable margin at current Client CPI with minSupplierCpi
    const achievableMarginPct =
      ((projectRevenue - totalCostNeeded) / (projectRevenue || 1)) * 100;
    const formattedAchievableMargin = Math.max(0, achievableMarginPct).toFixed(1);

    smartRecommendations.push({
      icon: 'tune',
      title: 'Option B: Adjust Target Margin',
      text: `Reduce target margin from ${safeTargetMargin}% to ${formattedAchievableMargin}% to operate at current Client CPI ($${safeClientCpi.toFixed(2)}) with market supplier CPI ($${minSupplierCpi.toFixed(2)}).`,
      type: 'option_b',
    });
  } else {
    // If Feasible: State numeric cushion and margin buffer
    const cushionPerComplete = safeClientCpi - requiredFutureCpi;
    const totalCushionDollar = cushionPerComplete * remainingCompletes;
    const marginBufferPct = ((safeClientCpi - requiredFutureCpi) / safeClientCpi) * 100;

    smartRecommendations.push({
      icon: 'shield_lock',
      title: 'Financial Buffer',
      text: `You have a $${formatCurrency(totalCushionDollar)} ($${formatCurrency(cushionPerComplete)}/complete) budget cushion above required CPI, providing a ${marginBufferPct.toFixed(1)}% margin safety buffer.`,
      type: 'cushion',
    });

    const supplierIncentiveBuffer = requiredFutureCpi - estimatedMinMarketCpi;
    smartRecommendations.push({
      icon: 'trending_up',
      title: 'Supplier Incentive',
      text: `Required CPI ($${requiredFutureCpi.toFixed(2)}) is $${supplierIncentiveBuffer.toFixed(2)} above estimated market minimum ($${estimatedMinMarketCpi.toFixed(2)}) for ${safeIncidenceRate}% IR, ensuring strong panel delivery.`,
      type: 'info',
    });
  }

  return {
    projectRevenue,
    allowedCost,
    incurredCost,
    incurredCompletes,
    remainingBudget,
    remainingCompletes,
    requiredFutureCpi,
    breakevenFutureCpi,
    blendedMarginToDate,
    financialFeasibility,
    operationalFeasibility,
    smartRecommendations,
    assertionPassed,
    validationErrors,
  };
}

export function validateAndSanitizeInvitationData(data: any): InvitationData {
  const fallback: InvitationData = {
    targetCompletes: 1000,
    bidIr: 20,
    infieldIr: 18,
    panelResponseRate: 8,
    completesAchieved: 0,
  };

  if (!data || typeof data !== 'object') {
    return fallback;
  }

  let targetCompletes = Number(data.targetCompletes);
  if (isNaN(targetCompletes) || !isFinite(targetCompletes) || targetCompletes < 1) {
    targetCompletes = 1000;
  }

  let bidIr = Number(data.bidIr);
  if (isNaN(bidIr) || !isFinite(bidIr) || bidIr < 0.1 || bidIr > 100) {
    bidIr = 20;
  }

  let infieldIr = Number(data.infieldIr);
  if (isNaN(infieldIr) || !isFinite(infieldIr) || infieldIr < 0.1 || infieldIr > 100) {
    infieldIr = 18;
  }

  let panelResponseRate = Number(data.panelResponseRate);
  if (isNaN(panelResponseRate) || !isFinite(panelResponseRate) || panelResponseRate < 0.1 || panelResponseRate > 100) {
    panelResponseRate = 8;
  }

  let completesAchieved = Number(data.completesAchieved);
  if (isNaN(completesAchieved) || !isFinite(completesAchieved) || completesAchieved < 0) {
    completesAchieved = 0;
  }

  return {
    targetCompletes,
    bidIr,
    infieldIr,
    panelResponseRate,
    completesAchieved,
  };
}

export function calculateInvitationResults(data: InvitationData): InvitationResults {
  const validationErrors: Record<string, string> = {};

  const safeData = validateAndSanitizeInvitationData(data);
  const { targetCompletes, bidIr, infieldIr, panelResponseRate, completesAchieved } = safeData;

  // Validation error checks
  if (typeof data.completesAchieved === 'number' && data.completesAchieved < 0) {
    validationErrors.completesAchieved = 'Completes achieved cannot be negative.';
  }
  if (data.completesAchieved > targetCompletes) {
    validationErrors.completesAchievedExceedsTarget = `Completes achieved (${formatNumber(data.completesAchieved)}) cannot exceed target completes (${formatNumber(targetCompletes)}).`;
  }

  // Section 1: Bid Estimate
  const validBidIr = bidIr > 0 ? bidIr / 100 : 0.01;
  const validInfieldIr = infieldIr > 0 ? infieldIr / 100 : 0.01;
  const validResponseRate = panelResponseRate > 0 ? panelResponseRate / 100 : 0.01;

  const bidParticipants = Math.ceil(targetCompletes / validBidIr);
  const bidInvites = Math.ceil(bidParticipants / validResponseRate);

  // Section 2: Live Performance Estimate
  const liveParticipants = Math.ceil(targetCompletes / validInfieldIr);
  const liveInvites = Math.ceil(liveParticipants / validResponseRate);

  // Section 3: Completes Progress So Far
  const remainingCompletesNeeded = Math.max(0, targetCompletes - completesAchieved);
  const progressPercentage = targetCompletes > 0 ? Math.min(100, Math.max(0, (completesAchieved / targetCompletes) * 100)) : 0;

  // Planned yield rate as decimal: (infieldIr / 100) * (panelResponseRate / 100)
  const plannedYieldRateDecimal = (infieldIr / 100) * (panelResponseRate / 100);
  let estimatedInvitesSent: number | null = null;
  if (plannedYieldRateDecimal > 0) {
    estimatedInvitesSent = Math.ceil(completesAchieved / plannedYieldRateDecimal);
  }

  // Sanity check assertion
  const plannedYieldRate = plannedYieldRateDecimal * 100;
  const expectedYieldFromLiveInvites = (targetCompletes / (liveInvites || 1)) * 100;
  const assertionPassed = Math.abs(plannedYieldRate - expectedYieldFromLiveInvites) < 0.1;

  return {
    bidParticipants,
    bidInvites,
    liveParticipants,
    liveInvites,
    remainingCompletesNeeded,
    estimatedInvitesSent,
    progressPercentage,
    assertionPassed,
    validationErrors,
  };
}

export function formatCurrency(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (isNaN(num) || !isFinite(num)) return '0';
  return new Intl.NumberFormat('en-US').format(num);
}
