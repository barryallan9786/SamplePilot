import { MarginData, InvitationData, SavedItem, NotificationItem } from '../types';

export const initialMarginData: MarginData = {
  totalCompletes: 1000,
  clientCpi: 5.50,
  targetMargin: 30,
  incidenceRate: 15,
  phases: [
    { id: '1', phase: 'Initial Launch', completes: 200, cpi: 1.50 },
    { id: '2', phase: 'Boost 1', completes: 250, cpi: 2.25 },
  ],
};

export const initialInvitationData: InvitationData = {
  targetCompletes: 1000,
  bidIr: 20,
  infieldIr: 18,
  panelResponseRate: 8,
  completesAchieved: 0,
};

export const initialSavedItems: SavedItem[] = [
  {
    id: 'scen-001',
    type: 'margin',
    title: 'Project TechPulse Q3 - Midfield Check',
    timestamp: '2026-08-05 14:30',
    keyMetric: 'Req Future CPI: $1.85',
    marginData: {
      totalCompletes: 1000,
      clientCpi: 5.50,
      targetMargin: 30,
      incidenceRate: 15,
      phases: [
        { id: '1', phase: 'Initial Launch', completes: 200, cpi: 1.50 },
        { id: '2', phase: 'Boost 1', completes: 250, cpi: 2.25 },
      ]
    },
    notes: 'Infield performance running at 15% IR. CPI boost required for final 550 completes.'
  },
  {
    id: 'scen-002',
    type: 'invitation',
    title: 'Healthcare B2B Sample Release - Batch 1',
    timestamp: '2026-08-04 09:15',
    keyMetric: 'Invites Needed: 69,450',
    invitationData: {
      targetCompletes: 1000,
      bidIr: 20,
      infieldIr: 18,
      panelResponseRate: 8,
      completesAchieved: 150,
    },
    notes: 'Infield IR slightly lower than 20% bid estimate. Adjusted invite wave release.'
  },
  {
    id: 'scen-003',
    type: 'margin',
    title: 'Global Consumer Tracker - Phase 2',
    timestamp: '2026-07-28 16:45',
    keyMetric: 'Req Future CPI: $2.10',
    marginData: {
      totalCompletes: 2500,
      clientCpi: 6.00,
      targetMargin: 35,
      incidenceRate: 25,
      phases: [
        { id: '1', phase: 'Soft Launch', completes: 500, cpi: 1.75 },
        { id: '2', phase: 'Wave 1', completes: 700, cpi: 1.90 },
      ]
    },
    notes: 'On track to hit 35% margin goal.'
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Data Mismatch Warning',
    message: 'Check Project TechPulse: Sum of phase completes should match total collected.',
    time: '10m ago',
    type: 'alert',
    read: false,
  },
  {
    id: 'n2',
    title: 'Calculation Saved',
    message: 'Project TechPulse Q3 - Midfield Check was saved to history.',
    time: '2h ago',
    type: 'success',
    read: true,
  },
  {
    id: 'n3',
    title: 'System Update',
    message: 'Market benchmark IR factors updated for Q3 2026.',
    time: '1d ago',
    type: 'info',
    read: true,
  }
];
