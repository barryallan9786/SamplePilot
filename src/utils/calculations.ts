import { MarginData, MarginResults, InvitationData, InvitationResults, SmartRecommendation, CalculationDetail } from '../types';

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
    committedCost: 0,
    fixedCost: 0,
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

  let committedCost = 0;
  if (data.committedCost !== undefined && data.committedCost !== null && data.committedCost !== '') {
    const parsedCommitted = Number(data.committedCost);
    if (!isNaN(parsedCommitted) && isFinite(parsedCommitted) && parsedCommitted >= 0) {
      committedCost = parsedCommitted;
    }
  }

  let fixedCost = 0;
  if (data.fixedCost !== undefined && data.fixedCost !== null && data.fixedCost !== '') {
    const parsedFixed = Number(data.fixedCost);
    if (!isNaN(parsedFixed) && isFinite(parsedFixed) && parsedFixed >= 0) {
      fixedCost = parsedFixed;
    }
  }

  return {
    totalCompletes,
    clientCpi,
    targetMargin,
    incidenceRate,
    phases,
    committedCost,
    fixedCost,
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

  // Single source of truth from CPI Change History table
  const phases = Array.isArray(data.phases) ? data.phases : [];
  const incurredCompletes = phases.reduce((sum, p) => sum + Math.max(0, Number(p.completes) || 0), 0);
  const incurredVariableCost = phases.reduce(
    (sum, p) => sum + (Math.max(0, Number(p.completes) || 0) * Math.max(0, Number(p.cpi) || 0)),
    0
  );

  // Financial Model Extension: Committed but unpaid costs & Fixed project costs
  const committedCost = Math.max(0, Number(data.committedCost) || 0);
  const fixedCost = Math.max(0, Number(data.fixedCost) || 0);
  const totalRecognizedCosts = incurredVariableCost + committedCost + fixedCost;
  const incurredCost = totalRecognizedCosts; // Primary financial exposure

  // Core Financials
  // Project Revenue = Total Completes Needed * Client CPI
  const projectRevenue = safeTotalCompletes * safeClientCpi;

  // Project Revenue assertion check: projectRevenue / totalCompletes === clientCpi
  const calculatedClientCpi = projectRevenue / safeTotalCompletes;
  const assertionPassed = Math.abs(calculatedClientCpi - safeClientCpi) < 0.00001;
  if (!assertionPassed) {
    console.error(`Project Revenue assertion failed: ${projectRevenue} / ${safeTotalCompletes} = ${calculatedClientCpi} != ${safeClientCpi}`);
  }

  const allowedCost = projectRevenue * (1 - safeTargetMargin / 100);
  const remainingBudget = allowedCost - totalRecognizedCosts;
  const remainingCompletes = Math.max(0, safeTotalCompletes - incurredCompletes);

  // Safeguards for zero remaining completes, exhausted budgets, and negative remaining budgets
  const isBudgetExhausted = remainingBudget < 0;
  const budgetDeficit = Math.max(0, -remainingBudget);

  let requiredFutureCpi = 0;
  if (remainingCompletes > 0 && remainingBudget > 0) {
    requiredFutureCpi = remainingBudget / remainingCompletes;
  }

  // Breakeven Future CPI (at 0% target margin, allowed cost = projectRevenue)
  const breakevenFutureCpi =
    remainingCompletes > 0
      ? (projectRevenue - totalRecognizedCosts) / remainingCompletes
      : safeClientCpi;

  // Blended Margin to Date (%)
  const revenueToDate = incurredCompletes * safeClientCpi;
  let blendedMarginToDate: number | null = null;
  if (incurredCompletes > 0 && revenueToDate > 0) {
    blendedMarginToDate = ((revenueToDate - totalRecognizedCosts) / revenueToDate) * 100;
  }

  // Financial Feasibility Check
  const isFinanciallyFeasible =
    remainingBudget >= 0 &&
    (remainingCompletes === 0 || (requiredFutureCpi > 0 && requiredFutureCpi <= safeClientCpi));

  let financialReason = '';
  if (remainingCompletes === 0) {
    financialReason = 'Target completes already collected.';
  } else if (remainingBudget < 0) {
    financialReason = `Total recognized cost ($${totalRecognizedCosts.toFixed(2)}) exceeds total allowed budget ($${allowedCost.toFixed(2)}) by $${budgetDeficit.toFixed(2)} deficit. Zero budget remains for future completes.`;
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
  const estimatedMinMarketCpi = 1.50 * Math.sqrt(30 / safeIncidenceRate);

  const isOperationallyFeasible =
    remainingCompletes === 0 || requiredFutureCpi >= estimatedMinMarketCpi;

  let operationalReason = '';
  if (remainingCompletes === 0) {
    operationalReason = 'Target completes already collected.';
  } else if (isBudgetExhausted) {
    operationalReason = `Allowed budget is exhausted ($${budgetDeficit.toFixed(2)} deficit). Cannot purchase remaining completes at market rate ($${estimatedMinMarketCpi.toFixed(2)}).`;
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

  // Dynamic & Numeric Smart Recommendations
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
    const minSupplierCpi = Math.max(estimatedMinMarketCpi, 0.50);
    const totalCostNeeded = totalRecognizedCosts + remainingCompletes * minSupplierCpi;
    const revenueNeededForMargin = totalCostNeeded / (1 - safeTargetMargin / 100);
    const neededClientCpi = revenueNeededForMargin / safeTotalCompletes;
    const cpiIncreasePerComplete = Math.max(0, neededClientCpi - safeClientCpi);

    smartRecommendations.push({
      icon: 'add_card',
      title: 'Option A: Renegotiate Client CPI',
      text: `Renegotiate Client CPI from $${safeClientCpi.toFixed(2)} to $${neededClientCpi.toFixed(2)} (+$${cpiIncreasePerComplete.toFixed(2)}/complete) to hit your ${safeTargetMargin}% target margin at market CPI ($${minSupplierCpi.toFixed(2)}).`,
      type: 'option_a',
    });

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

  // Centralized Formula Transparency Metadata
  const calculationDetails: Record<string, CalculationDetail> = {
    projectRevenue: {
      formula: 'Project Revenue = Total Completes Needed × Client CPI',
      substitution: `${formatNumber(safeTotalCompletes)} × ${formatCurrency(safeClientCpi)}`,
      finalResult: formatCurrency(projectRevenue),
    },
    allowedCost: {
      formula: 'Allowed Cost = Project Revenue × (1 − Target Gross Margin %)',
      substitution: `${formatCurrency(projectRevenue)} × (1 − ${(safeTargetMargin / 100).toFixed(2)}) = ${formatCurrency(projectRevenue)} × ${(1 - safeTargetMargin / 100).toFixed(2)}`,
      finalResult: formatCurrency(allowedCost),
    },
    incurredCost: {
      formula: 'Total Recognized Costs = Incurred Variable Cost + Committed Costs + Fixed Costs',
      substitution: `${formatCurrency(incurredVariableCost)} (Variable) + ${formatCurrency(committedCost)} (Committed) + ${formatCurrency(fixedCost)} (Fixed)`,
      finalResult: formatCurrency(totalRecognizedCosts),
    },
    remainingBudget: {
      formula: 'Remaining Budget = Allowed Cost − Total Recognized Costs',
      substitution: `${formatCurrency(allowedCost)} − ${formatCurrency(totalRecognizedCosts)}`,
      finalResult: formatCurrency(remainingBudget),
    },
    requiredFutureCpi: {
      formula: isBudgetExhausted
        ? 'Allowable Future CPI = Max(Remaining Budget ÷ Remaining Completes, 0)'
        : 'Maximum Allowable Future CPI = Remaining Budget ÷ Remaining Completes',
      substitution: remainingCompletes === 0
        ? '0 remaining completes. Project quota fulfilled.'
        : isBudgetExhausted
        ? `Max(${formatCurrency(remainingBudget)} ÷ ${formatNumber(remainingCompletes)}, 0) = Max(${(remainingBudget / remainingCompletes).toFixed(2)}, 0)`
        : `${formatCurrency(remainingBudget)} ÷ ${formatNumber(remainingCompletes)}`,
      unrounded: remainingCompletes > 0 ? formatCurrency(remainingBudget / remainingCompletes) : '$0.00',
      finalResult: isBudgetExhausted ? '$0.00 (Exhausted Budget Deficit)' : formatCurrency(requiredFutureCpi),
      notes: isBudgetExhausted
        ? 'Negative allowable CPI is prohibited; allowable future CPI is capped at $0.00 when in deficit.'
        : `Remaining Budget = Allowed Cost (${formatCurrency(allowedCost)}) − Total Recognized Costs (${formatCurrency(totalRecognizedCosts)}).`,
    },
    breakevenFutureCpi: {
      formula: 'Breakeven Future CPI = (Project Revenue − Total Recognized Costs) ÷ Remaining Completes',
      substitution: remainingCompletes > 0
        ? `(${formatCurrency(projectRevenue)} − ${formatCurrency(totalRecognizedCosts)}) ÷ ${formatNumber(remainingCompletes)} = ${formatCurrency(projectRevenue - totalRecognizedCosts)} ÷ ${formatNumber(remainingCompletes)}`
        : `${formatCurrency(safeClientCpi)} (Target completed)`,
      unrounded: remainingCompletes > 0 ? formatCurrency((projectRevenue - totalRecognizedCosts) / remainingCompletes) : formatCurrency(safeClientCpi),
      finalResult: formatCurrency(breakevenFutureCpi),
    },
    blendedMarginToDate: {
      formula: 'Blended Margin To Date = (Revenue to Date − Total Recognized Costs) ÷ Revenue to Date',
      substitution: revenueToDate > 0
        ? `(${formatCurrency(revenueToDate)} − ${formatCurrency(totalRecognizedCosts)}) ÷ ${formatCurrency(revenueToDate)}`
        : '0 completes collected to date.',
      unrounded: blendedMarginToDate !== null ? `${blendedMarginToDate.toFixed(3)}%` : 'N/A',
      finalResult: blendedMarginToDate !== null ? `${blendedMarginToDate.toFixed(1)}%` : 'N/A',
    },
  };

  return {
    projectRevenue,
    allowedCost,
    incurredCost: totalRecognizedCosts,
    incurredVariableCost,
    committedCost,
    fixedCost,
    totalRecognizedCosts,
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
    isBudgetExhausted,
    budgetDeficit,
    calculationDetails,
  };
}

export function validateAndSanitizeInvitationData(data: any): InvitationData {
  const fallback: InvitationData = {
    targetCompletes: 1000,
    bidIr: 20,
    infieldIr: 18,
    panelResponseRate: 8,
    validCompletionRate: 100,
    completesAchieved: 0,
    outstandingInvitations: 0,
    invitationsAlreadySent: 0,
    invitationBuffer: 0,
    trackProgressBy: 'entrants',
    totalEntrantsSoFar: null,
    completesSoFar: null,
  };

  if (!data || typeof data !== 'object') {
    return fallback;
  }

  let targetCompletes = Number(data.targetCompletes);
  if (isNaN(targetCompletes) || !isFinite(targetCompletes) || targetCompletes < 1) {
    targetCompletes = 1000;
  }

  let bidIr = Number(data.bidIr);
  if (isNaN(bidIr) || !isFinite(bidIr) || bidIr < 0 || bidIr > 100) {
    bidIr = 20;
  }

  let infieldIr = Number(data.infieldIr);
  if (isNaN(infieldIr) || !isFinite(infieldIr) || infieldIr < 0 || infieldIr > 100) {
    infieldIr = 18;
  }

  let panelResponseRate = Number(data.panelResponseRate);
  if (data.panelResponseRate === undefined || data.panelResponseRate === null || data.panelResponseRate === '' || isNaN(panelResponseRate) || !isFinite(panelResponseRate) || panelResponseRate < 0 || panelResponseRate > 100) {
    panelResponseRate = (data.panelResponseRate === 0 || Number(data.panelResponseRate) === 0) ? 0 : 8;
  }

  let validCompletionRate = 100;
  if (data.validCompletionRate !== undefined && data.validCompletionRate !== null && data.validCompletionRate !== '') {
    const parsedVcr = Number(data.validCompletionRate);
    if (!isNaN(parsedVcr) && isFinite(parsedVcr) && parsedVcr > 0 && parsedVcr <= 100) {
      validCompletionRate = parsedVcr;
    }
  }

  let completesAchieved = Number(data.completesAchieved);
  if (isNaN(completesAchieved) || !isFinite(completesAchieved) || completesAchieved < 0) {
    completesAchieved = 0;
  }

  let outstandingInvitations = 0;
  if (data.outstandingInvitations !== undefined && data.outstandingInvitations !== null && data.outstandingInvitations !== '') {
    const parsedOut = Number(data.outstandingInvitations);
    if (!isNaN(parsedOut) && isFinite(parsedOut) && parsedOut >= 0) {
      outstandingInvitations = Math.max(0, parsedOut);
    }
  }

  let invitationsAlreadySent = 0;
  if (data.invitationsAlreadySent !== undefined && data.invitationsAlreadySent !== null && data.invitationsAlreadySent !== '') {
    const parsedSent = Number(data.invitationsAlreadySent);
    if (!isNaN(parsedSent) && isFinite(parsedSent) && parsedSent >= 0) {
      invitationsAlreadySent = Math.max(0, parsedSent);
    }
  }

  let invitationBuffer = 0;
  if (data.invitationBuffer !== undefined && data.invitationBuffer !== null && data.invitationBuffer !== '') {
    const parsedBuffer = Number(data.invitationBuffer);
    if (!isNaN(parsedBuffer) && isFinite(parsedBuffer) && parsedBuffer >= 0 && parsedBuffer <= 50) {
      invitationBuffer = parsedBuffer;
    }
  }

  const trackProgressBy = data.trackProgressBy === 'completes' ? 'completes' : 'entrants';

  let totalEntrantsSoFar: number | string | null = null;
  if (data.totalEntrantsSoFar !== undefined && data.totalEntrantsSoFar !== null && data.totalEntrantsSoFar !== '') {
    const parsed = Number(data.totalEntrantsSoFar);
    if (!isNaN(parsed) && isFinite(parsed) && parsed >= 0) {
      totalEntrantsSoFar = parsed;
    }
  }

  let completesSoFar: number | string | null = null;
  if (data.completesSoFar !== undefined && data.completesSoFar !== null && data.completesSoFar !== '') {
    const parsed = Number(data.completesSoFar);
    if (!isNaN(parsed) && isFinite(parsed) && parsed >= 0) {
      completesSoFar = parsed;
    }
  }

  return {
    targetCompletes,
    bidIr,
    infieldIr,
    panelResponseRate,
    validCompletionRate,
    completesAchieved,
    outstandingInvitations,
    invitationsAlreadySent,
    invitationBuffer,
    trackProgressBy,
    totalEntrantsSoFar,
    completesSoFar,
  };
}

export function calculateInvitationResults(data: InvitationData): InvitationResults {
  const validationErrors: Record<string, string> = {};

  const safeData = validateAndSanitizeInvitationData(data);
  const {
    targetCompletes,
    bidIr,
    infieldIr,
    panelResponseRate,
    validCompletionRate = 100,
    completesAchieved,
    outstandingInvitations = 0,
    invitationsAlreadySent = 0,
    invitationBuffer = 0,
  } = safeData;

  // Input validation
  let isEstimateUnavailable = false;
  let unavailableReason = '';

  if (targetCompletes < 1) {
    validationErrors.targetCompletes = 'Target completes must be at least 1.';
  }
  if (bidIr <= 0) {
    validationErrors.bidIr = 'Bid IR must be greater than 0%.';
  }
  if (infieldIr <= 0) {
    validationErrors.infieldIr = 'Infield IR must be greater than 0%.';
    isEstimateUnavailable = true;
    unavailableReason = 'Infield IR must be greater than 0% to calculate live invitations.';
  }
  if (panelResponseRate <= 0) {
    validationErrors.panelResponseRate = 'Panel response rate must be greater than 0%.';
    isEstimateUnavailable = true;
    unavailableReason = 'Panel response rate must be greater than 0% to calculate invitations.';
  }
  if (validCompletionRate <= 0 || validCompletionRate > 100) {
    validationErrors.validCompletionRate = 'Valid completion rate must be between 0.1% and 100%.';
    isEstimateUnavailable = true;
    unavailableReason = 'Valid completion rate must be greater than 0% to calculate invitations.';
  }
  if (completesAchieved < 0) {
    validationErrors.completesAchieved = 'Completes achieved cannot be negative.';
  }
  if (completesAchieved > targetCompletes) {
    validationErrors.completesAchievedExceedsTarget = `Completes achieved (${formatNumber(completesAchieved)}) exceeds target completes (${formatNumber(targetCompletes)}). Target is fulfilled.`;
  }
  if (invitationBuffer < 0 || invitationBuffer > 50) {
    validationErrors.invitationBuffer = 'Buffer percentage must be between 0% and 50%.';
  }

  // METHODOLOGY CORRECTION: Convert all percentages into decimal values
  // Do not silently substitute positive rates if a rate is 0 or invalid
  const validBidIr = bidIr > 0 ? bidIr / 100 : 0;
  const validInfieldIr = infieldIr > 0 ? infieldIr / 100 : 0;
  const validResponseRate = panelResponseRate > 0 ? panelResponseRate / 100 : 0;
  const validCompletionRateDec = (validCompletionRate > 0 ? validCompletionRate : 100) / 100;

  // Effective Entrant Yield = Qualification IR × Valid Completion Rate
  // An entrant must qualify (IR) and complete validly (VCR) to produce an accepted complete.
  // When VCR is 100% (or IR already measures valid completes), yield equals IR.
  const effectiveEntrantYield = validInfieldIr * validCompletionRateDec;
  const effectiveBidEntrantYield = validBidIr * validCompletionRateDec;

  // ==========================================
  // SECTION 1: BID ESTIMATE (Reference Figure)
  // ==========================================
  // Bid Survey Participants = Target Completes ÷ (Bid IR × Valid Completion Rate)
  const bidParticipantsExact = effectiveBidEntrantYield > 0 ? targetCompletes / effectiveBidEntrantYield : 0;
  const bidParticipants = Math.ceil(bidParticipantsExact);

  // Expected valid completes per bid invitation = Response Rate × Bid IR × Valid Completion Rate
  const expectedCompletesPerInviteBid = validResponseRate * effectiveBidEntrantYield;
  // Bid Invitations = Target Completes ÷ (Bid IR × Panel Response Rate × Valid Completion Rate)
  // Round up (ceiling) only at final invitation count
  const bidInvites = expectedCompletesPerInviteBid > 0
    ? Math.ceil(targetCompletes / expectedCompletesPerInviteBid)
    : 0;

  // ==================================================
  // SECTION 2: LIVE PERFORMANCE ESTIMATE (Working Model)
  // ==================================================
  // Expected valid completes per infield invitation = Response Rate × Infield IR × Valid Completion Rate
  const expectedValidCompletesPerInvite = validResponseRate * effectiveEntrantYield;

  // Full-target survey participants expected for the full project: Target ÷ (Infield IR × Valid Completion Rate)
  const liveParticipantsExact = effectiveEntrantYield > 0 ? targetCompletes / effectiveEntrantYield : 0;
  const liveParticipants = Math.ceil(liveParticipantsExact);

  // Remaining Completes = Max(Target Completes - Valid Completes Achieved, 0)
  const remainingCompletes = Math.max(0, targetCompletes - completesAchieved);
  const liveParticipantsRemaining = effectiveEntrantYield > 0 ? remainingCompletes / effectiveEntrantYield : 0;

  // Forecast expected valid completes from outstanding invitations awaiting response
  const expectedPendingCompletes = outstandingInvitations * expectedValidCompletesPerInvite;

  // Remaining Completes After Expected Pending Conversions
  const remainingCompletesAfterPending = Math.max(0, remainingCompletes - expectedPendingCompletes);

  // Additional survey participants needed for remaining target (accounting for pending conversions)
  // Net Completes Needed ÷ (Infield IR × Valid Completion Rate)
  // Preserves full intermediate numerical precision and rounds only final whole-person output
  const additionalParticipantsNeededExact = (effectiveEntrantYield > 0 && remainingCompletesAfterPending > 0)
    ? remainingCompletesAfterPending / effectiveEntrantYield
    : 0;
  const additionalParticipantsNeeded = Math.ceil(additionalParticipantsNeededExact);

  // Baseline Additional Invitations Required = Remaining Completes After Pending ÷ Expected Completes per Invitation
  // Round up only at final whole-number invitation count
  let baselineAdditionalInvites = 0;
  if (remainingCompletesAfterPending > 0 && expectedValidCompletesPerInvite > 0) {
    baselineAdditionalInvites = Math.ceil(remainingCompletesAfterPending / expectedValidCompletesPerInvite);
  }

  // Operational buffer: 0% to 50%
  const bufferFraction = Math.min(0.50, Math.max(0, (invitationBuffer || 0) / 100));
  const bufferedAdditionalInvites = Math.ceil(baselineAdditionalInvites * (1 + bufferFraction));

  // The primary working live invitation estimate
  const liveInvites = bufferedAdditionalInvites;

  // Total projected project invitations (if invitations already sent is supplied)
  const totalProjectedInvites =
    invitationsAlreadySent > 0
      ? invitationsAlreadySent + bufferedAdditionalInvites
      : (completesAchieved === 0 && outstandingInvitations === 0 ? bufferedAdditionalInvites : null);

  // Legacy reference & progress metrics
  const remainingCompletesNeeded = remainingCompletes;
  const progressPercentage = targetCompletes > 0
    ? Math.min(100, Math.max(0, (completesAchieved / targetCompletes) * 100))
    : 0;

  let estimatedInvitesSent: number | null = null;
  if (expectedValidCompletesPerInvite > 0 && completesAchieved > 0) {
    estimatedInvitesSent = Math.ceil(completesAchieved / expectedValidCompletesPerInvite);
  }

  // ==========================================
  // SECTION 3: PROGRESS TRACKER CALCULATION
  // ==========================================
  const trackProgressBy = safeData.trackProgressBy === 'completes' ? 'completes' : 'entrants';
  let progressInvitationsEstimated: number | null = null;
  const progressInvitationsRecorded: number | null =
    safeData.invitationsAlreadySent !== undefined && safeData.invitationsAlreadySent !== null && safeData.invitationsAlreadySent > 0
      ? safeData.invitationsAlreadySent
      : null;

  const progressFormulaNote =
    trackProgressBy === 'completes'
      ? 'Completes ÷ (Infield IR × Panel Response Rate × Valid Completion Rate)'
      : 'Total Entrants ÷ Panel Response Rate';

  if (trackProgressBy === 'entrants') {
    if (safeData.totalEntrantsSoFar !== null && safeData.totalEntrantsSoFar !== undefined) {
      const entrants = Number(safeData.totalEntrantsSoFar);
      if (!isNaN(entrants) && validResponseRate > 0) {
        progressInvitationsEstimated = Math.ceil(entrants / validResponseRate);
      }
    }
  } else {
    if (safeData.completesSoFar !== null && safeData.completesSoFar !== undefined) {
      const completes = Number(safeData.completesSoFar);
      if (!isNaN(completes) && expectedValidCompletesPerInvite > 0) {
        // Consistent with Stage 2 conversion model including valid completion rate
        progressInvitationsEstimated = Math.ceil(completes / expectedValidCompletesPerInvite);
      }
    }
  }

  // If actual recorded invitations are available, use actual count rather than replacing it with theoretical estimate
  const progressIsActual = progressInvitationsRecorded !== null;
  const progressInvitationsSent = progressIsActual ? progressInvitationsRecorded : progressInvitationsEstimated;

  // Sanity check assertion
  const plannedYieldRate = expectedValidCompletesPerInvite * 100;
  const fullLifetimeInvites = expectedValidCompletesPerInvite > 0
    ? Math.ceil(targetCompletes / expectedValidCompletesPerInvite)
    : 1;
  const expectedYieldFromFullInvites = (targetCompletes / fullLifetimeInvites) * 100;
  const assertionPassed = Math.abs(plannedYieldRate - expectedYieldFromFullInvites) < 0.2;

  // Centralized Formula Transparency Metadata
  const calculationDetails: Record<string, CalculationDetail> = {
    bidParticipants: {
      formula: validCompletionRateDec < 1
        ? 'Bid Participants = ⌈ Target Completes ÷ (Bid IR × Valid Completion Rate) ⌉'
        : 'Bid Participants = ⌈ Target Completes ÷ Bid IR ⌉',
      substitution: validCompletionRateDec < 1
        ? `${formatNumber(targetCompletes)} ÷ (${(validBidIr).toFixed(4).replace(/\.?0+$/, '')} × ${(validCompletionRateDec).toFixed(4).replace(/\.?0+$/, '')}) = ${formatNumber(targetCompletes)} ÷ ${(effectiveBidEntrantYield).toFixed(6).replace(/\.?0+$/, '')}`
        : `${formatNumber(targetCompletes)} ÷ ${(validBidIr).toFixed(4).replace(/\.?0+$/, '')} (${bidIr}%)`,
      unrounded: effectiveBidEntrantYield > 0 ? (targetCompletes / effectiveBidEntrantYield).toFixed(2) : '0',
      finalResult: formatNumber(bidParticipants),
      notes: 'Preserves floating-point precision throughout intermediate calculations.',
    },
    bidInvites: {
      formula: 'Bid Invitations = ⌈ Target Completes ÷ (Bid IR × Response Rate × Valid Completion Rate) ⌉',
      substitution: `${formatNumber(targetCompletes)} ÷ (${(validBidIr).toFixed(4).replace(/\.?0+$/, '')} × ${(validResponseRate).toFixed(4).replace(/\.?0+$/, '')} × ${(validCompletionRateDec).toFixed(4).replace(/\.?0+$/, '')}) = ${formatNumber(targetCompletes)} ÷ ${(expectedCompletesPerInviteBid).toFixed(6).replace(/\.?0+$/, '')}`,
      unrounded: expectedCompletesPerInviteBid > 0 ? (targetCompletes / expectedCompletesPerInviteBid).toFixed(2) : '0',
      finalResult: formatNumber(bidInvites),
      notes: 'Ceiling rounding (⌈ ⌉) applied only to final whole-number count.',
    },
    remainingCompletes: {
      formula: 'Remaining Completes = Max(Target Completes − Valid Completes Achieved, 0)',
      substitution: `Max(${formatNumber(targetCompletes)} − ${formatNumber(completesAchieved)}, 0)`,
      finalResult: formatNumber(remainingCompletes),
    },
    expectedPendingCompletes: {
      formula: 'Pending Conversions = Outstanding Invitations × (Response Rate × Infield IR × Valid Completion Rate)',
      substitution: `${formatNumber(outstandingInvitations)} × (${(validResponseRate).toFixed(4).replace(/\.?0+$/, '')} × ${(validInfieldIr).toFixed(4).replace(/\.?0+$/, '')} × ${(validCompletionRateDec).toFixed(4).replace(/\.?0+$/, '')}) = ${formatNumber(outstandingInvitations)} × ${(expectedValidCompletesPerInvite).toFixed(6).replace(/\.?0+$/, '')}`,
      unrounded: expectedPendingCompletes.toFixed(3),
      finalResult: `~${expectedPendingCompletes > 0 ? (Math.round(expectedPendingCompletes * 10) / 10).toFixed(1) : '0'}`,
    },
    additionalParticipants: {
      formula: validCompletionRateDec < 1
        ? 'Additional Participants = ⌈ Net Completes Needed ÷ (Qualification IR × Valid Completion Rate) ⌉'
        : 'Additional Participants = ⌈ Net Completes Needed ÷ Qualification IR ⌉',
      substitution: isEstimateUnavailable
        ? `Estimate unavailable: ${unavailableReason}`
        : validCompletionRateDec < 1
        ? `${remainingCompletesAfterPending.toFixed(2)} ÷ (${(validInfieldIr).toFixed(4).replace(/\.?0+$/, '')} × ${(validCompletionRateDec).toFixed(4).replace(/\.?0+$/, '')}) = ${remainingCompletesAfterPending.toFixed(2)} ÷ ${(effectiveEntrantYield).toFixed(6).replace(/\.?0+$/, '')}`
        : `${remainingCompletesAfterPending.toFixed(2)} ÷ ${(validInfieldIr).toFixed(4).replace(/\.?0+$/, '')} (${infieldIr}%)`,
      unrounded: isEstimateUnavailable ? 'N/A' : additionalParticipantsNeededExact.toFixed(2),
      finalResult: isEstimateUnavailable ? '—' : formatNumber(additionalParticipantsNeeded),
      notes: 'Calculated from net completes needed after deducting expected pending conversions.',
    },
    fullProjectParticipants: {
      formula: validCompletionRateDec < 1
        ? 'Full Project Participants = ⌈ Target Completes ÷ (Qualification IR × Valid Completion Rate) ⌉'
        : 'Full Project Participants = ⌈ Target Completes ÷ Qualification IR ⌉',
      substitution: isEstimateUnavailable
        ? `Estimate unavailable: ${unavailableReason}`
        : validCompletionRateDec < 1
        ? `${formatNumber(targetCompletes)} ÷ (${(validInfieldIr).toFixed(4).replace(/\.?0+$/, '')} × ${(validCompletionRateDec).toFixed(4).replace(/\.?0+$/, '')}) = ${formatNumber(targetCompletes)} ÷ ${(effectiveEntrantYield).toFixed(6).replace(/\.?0+$/, '')}`
        : `${formatNumber(targetCompletes)} ÷ ${(validInfieldIr).toFixed(4).replace(/\.?0+$/, '')} (${infieldIr}%)`,
      unrounded: isEstimateUnavailable ? 'N/A' : liveParticipantsExact.toFixed(2),
      finalResult: isEstimateUnavailable ? '—' : formatNumber(liveParticipants),
      notes: 'Total survey entrants expected across the entire study lifetime.',
    },
    liveInvites: {
      formula: bufferFraction > 0
        ? 'Buffered Additional Invitations = ⌈ Baseline Additional Invitations × (1 + Buffer %) ⌉, where Baseline = ⌈ Net Completes Needed ÷ (Response Rate × Qualification IR × Valid Completion Rate) ⌉'
        : 'Additional Invitations = ⌈ Net Completes Needed ÷ (Response Rate × Qualification IR × Valid Completion Rate) ⌉',
      substitution: isEstimateUnavailable
        ? `Estimate unavailable: ${unavailableReason}`
        : `${remainingCompletesAfterPending.toFixed(2)} ÷ (${(validResponseRate).toFixed(4).replace(/\.?0+$/, '')} × ${(validInfieldIr).toFixed(4).replace(/\.?0+$/, '')} × ${(validCompletionRateDec).toFixed(4).replace(/\.?0+$/, '')}) = ${remainingCompletesAfterPending.toFixed(2)} ÷ ${(expectedValidCompletesPerInvite).toFixed(6).replace(/\.?0+$/, '')}${bufferFraction > 0 ? ` → ${formatNumber(baselineAdditionalInvites)} baseline × (1 + ${bufferFraction.toFixed(2)})` : ''}`,
      unrounded: isEstimateUnavailable
        ? 'N/A'
        : expectedValidCompletesPerInvite > 0
        ? `${(remainingCompletesAfterPending / expectedValidCompletesPerInvite).toFixed(2)} baseline${bufferFraction > 0 ? ` (buffered: ${(baselineAdditionalInvites * (1 + bufferFraction)).toFixed(2)})` : ''}`
        : '0',
      finalResult: isEstimateUnavailable ? '—' : formatNumber(bufferedAdditionalInvites),
      notes: isEstimateUnavailable
        ? unavailableReason
        : `Yield per invitation = ${(expectedValidCompletesPerInvite * 100).toFixed(4)}%. Round up (ceiling) only at final invitation count. Cumulative requirement, not a single batch release.`,
    },
    progressInvitations: {
      formula: progressIsActual
        ? 'Recorded Actual Dispatches from Project Parameters'
        : trackProgressBy === 'entrants'
        ? 'Invitations Sent = ⌈ Total Entrants ÷ Panel Response Rate ⌉'
        : 'Invitations Sent = ⌈ Completes ÷ (Qualification IR × Panel Response Rate × Valid Completion Rate) ⌉',
      substitution: progressIsActual
        ? `Actual recorded cumulative invitations = ${formatNumber(progressInvitationsRecorded!)} (Entered in Project Parameters)`
        : trackProgressBy === 'entrants'
        ? `${formatNumber(Number(safeData.totalEntrantsSoFar))} ÷ ${(validResponseRate).toFixed(4).replace(/\.?0+$/, '')} (${panelResponseRate}%)`
        : `${formatNumber(Number(safeData.completesSoFar))} ÷ (${(validInfieldIr).toFixed(4).replace(/\.?0+$/, '')} × ${(validResponseRate).toFixed(4).replace(/\.?0+$/, '')} × ${(validCompletionRateDec).toFixed(4).replace(/\.?0+$/, '')}) = ${formatNumber(Number(safeData.completesSoFar))} ÷ ${(expectedValidCompletesPerInvite).toFixed(6).replace(/\.?0+$/, '')}`,
      unrounded: progressIsActual
        ? 'Recorded count'
        : trackProgressBy === 'entrants'
        ? validResponseRate > 0
          ? (Number(safeData.totalEntrantsSoFar) / validResponseRate).toFixed(2)
          : '0'
        : expectedValidCompletesPerInvite > 0
        ? (Number(safeData.completesSoFar) / expectedValidCompletesPerInvite).toFixed(2)
        : '0',
      finalResult: progressInvitationsSent !== null ? formatNumber(progressInvitationsSent) : '—',
      notes: progressIsActual
        ? `Theoretical estimate from current ${trackProgressBy}: ${progressInvitationsEstimated !== null ? formatNumber(progressInvitationsEstimated) : '—'} (${progressFormulaNote})`
        : 'Round up (ceiling) only at final invitation count.',
    },
  };

  return {
    bidParticipants,
    bidParticipantsExact,
    bidInvites,
    liveParticipants,
    liveParticipantsExact,
    liveParticipantsRemaining,
    additionalParticipantsNeeded,
    additionalParticipantsNeededExact,
    remainingCompletes,
    expectedPendingCompletes,
    remainingCompletesAfterPending,
    expectedValidCompletesPerInvite,
    baselineAdditionalInvites,
    bufferedAdditionalInvites,
    liveInvites,
    totalProjectedInvites,
    isEstimateUnavailable,
    unavailableReason,
    remainingCompletesNeeded,
    estimatedInvitesSent,
    progressPercentage,
    progressInvitationsSent,
    progressInvitationsEstimated,
    progressInvitationsRecorded,
    progressIsActual,
    progressFormulaNote,
    assertionPassed,
    validationErrors,
    calculationDetails,
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
