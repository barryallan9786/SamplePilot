import { MarginData, InvitationData, NotificationItem } from '../types';

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

export const initialNotifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Data Benchmark Notice',
    message: 'Incidence rate and CPI calculations ready for evaluation.',
    time: '10m ago',
    type: 'info',
    read: false,
  },
  {
    id: 'n2',
    title: 'System Update',
    message: 'Market benchmark IR factors updated for Q3 2026.',
    time: '1d ago',
    type: 'info',
    read: true,
  }
];

