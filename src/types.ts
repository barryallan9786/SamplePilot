export type ActiveTab = 'margin' | 'invitation' | 'history' | 'resources';

export interface CpiPhase {
  id: string;
  phase: string;
  completes: number;
  cpi: number;
}

export interface MarginData {
  totalCompletes: number;
  clientCpi: number;
  targetMargin: number;
  incidenceRate: number;
  phases: CpiPhase[];
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
}

export interface InvitationData {
  targetCompletes: number;
  bidIr: number;
  infieldIr: number;
  panelResponseRate: number;
  completesAchieved: number;
}

export interface InvitationResults {
  bidParticipants: number;
  bidInvites: number;
  liveParticipants: number;
  liveInvites: number;
  remainingCompletesNeeded: number;
  estimatedInvitesSent: number | null;
  progressPercentage: number;
  assertionPassed: boolean;
  validationErrors: Record<string, string>;
}

export interface SavedItem {
  id: string;
  type: 'margin' | 'invitation';
  title: string;
  timestamp: string;
  marginData?: MarginData;
  invitationData?: InvitationData;
  keyMetric: string;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'alert' | 'info' | 'success';
  read: boolean;
}
