export type ActiveTab = 'margin' | 'invitation' | 'resources';

export interface CpiPhase {
  id: string;
  phase: string;
  completes: number;
  cpi: number;
}

export interface CalculationDetail {
  formula: string;
  substitution: string;
  unrounded?: string | number | null;
  finalResult: string | number;
  notes?: string;
}

export interface MarginData {
  totalCompletes: number;
  clientCpi: number;
  targetMargin: number;
  incidenceRate: number;
  phases: CpiPhase[];
  committedCost?: number; // Optional: committed but unpaid supplier costs
  fixedCost?: number; // Optional: fixed project costs (platform, PM, programming)
}

export interface FeasibilityCheck {
  isFeasible: boolean;
  status: 'Feasible' | 'Unfeasible';
  reason: string;
}

export interface OperationalFeasibilityCheck extends FeasibilityCheck {
  estimatedMinMarketCpi: number;
}

export interface SmartRecommendation {
  icon: string;
  title?: string;
  text: string;
  type?: 'option_a' | 'option_b' | 'cushion' | 'info';
}

export interface MarginResults {
  projectRevenue: number;
  allowedCost: number;
  incurredCost: number;
  incurredVariableCost: number;
  committedCost: number;
  fixedCost: number;
  totalRecognizedCosts: number;
  incurredCompletes: number;
  remainingBudget: number;
  remainingCompletes: number;
  requiredFutureCpi: number;
  breakevenFutureCpi: number;
  blendedMarginToDate: number | null; // percentage e.g. 35.5 or null if 0 completes
  financialFeasibility: FeasibilityCheck;
  operationalFeasibility: OperationalFeasibilityCheck;
  smartRecommendations: SmartRecommendation[];
  assertionPassed: boolean; // Project Revenue / Total Completes == Client CPI
  validationErrors: Record<string, string>;
  isBudgetExhausted?: boolean;
  budgetDeficit?: number;
  calculationDetails?: Record<string, CalculationDetail>;
}

export type ProgressTrackBy = 'entrants' | 'completes';

export interface InvitationData {
  targetCompletes: number;
  bidIr: number;
  infieldIr: number;
  panelResponseRate: number;
  validCompletionRate?: number; // percentage (0.1 - 100), defaults to 100
  completesAchieved: number;
  outstandingInvitations?: number; // invitations currently in field awaiting response
  invitationsAlreadySent?: number; // total invitations already sent to date (optional)
  invitationBuffer?: number; // optional buffer percentage (0 - 50), default 0
  trackProgressBy?: ProgressTrackBy;
  totalEntrantsSoFar?: number | string | null;
  completesSoFar?: number | string | null;
}

export interface InvitationResults {
  // Stage 1: Bid Estimate (Reference based on bid IR and 100% target)
  bidParticipants: number;
  bidParticipantsExact: number;
  bidInvites: number;

  // Stage 2: Live Performance Estimate (Additional invites for remaining target)
  liveParticipants: number;
  liveParticipantsExact: number;
  liveParticipantsRemaining: number;
  additionalParticipantsNeeded: number;
  additionalParticipantsNeededExact: number;
  remainingCompletes: number;
  expectedPendingCompletes: number;
  remainingCompletesAfterPending: number;
  expectedValidCompletesPerInvite: number;
  baselineAdditionalInvites: number;
  bufferedAdditionalInvites: number;
  liveInvites: number; // Represents estimated additional invitations needed (buffered if buffer > 0)
  totalProjectedInvites: number | null; // invitationsAlreadySent + liveInvites if sent provided
  isEstimateUnavailable: boolean;
  unavailableReason?: string;

  // Stage 3 & Legacy Compatibility
  remainingCompletesNeeded: number;
  estimatedInvitesSent: number | null;
  progressPercentage: number;
  progressInvitationsSent: number | null;
  progressInvitationsEstimated: number | null;
  progressInvitationsRecorded: number | null;
  progressIsActual: boolean;
  progressFormulaNote: string;
  assertionPassed: boolean;
  validationErrors: Record<string, string>;
  calculationDetails?: Record<string, CalculationDetail>;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'alert' | 'info' | 'success';
  read: boolean;
}

