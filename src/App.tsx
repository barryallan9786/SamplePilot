import React, { useState, useEffect } from 'react';
import { ActiveTab, MarginData, InvitationData, NotificationItem } from './types';
import { initialMarginData, initialInvitationData, initialNotifications } from './data/initialData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MarginCalculator } from './components/MarginCalculator';
import { InvitationCalculator } from './components/InvitationCalculator';
import { ResourcesView } from './components/ResourcesView';
import { AboutModal } from './components/AboutModal';
import { calculateMarginResults, calculateInvitationResults, validateAndSanitizeMarginData, validateAndSanitizeInvitationData } from './utils/calculations';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('margin');
  const [activeCalculator, setActiveCalculator] = useState<'margin' | 'invitation'>('margin');

  // Local storage backed state with comprehensive sanity & assertion validation
  const [marginData, setMarginData] = useState<MarginData>(() => {
    const local = localStorage.getItem('inv_calc_margin_data');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        const sanitized = validateAndSanitizeMarginData(parsed);
        if (JSON.stringify(sanitized) !== JSON.stringify(parsed)) {
          console.warn('[LocalStorage Migration] Auto-repaired corrupted marginData in localStorage.');
          localStorage.setItem('inv_calc_margin_data', JSON.stringify(sanitized));
        }
        return sanitized;
      } catch (e) {
        console.error('Error parsing inv_calc_margin_data from localStorage:', e);
      }
    }
    return validateAndSanitizeMarginData(initialMarginData);
  });

  const [invitationData, setInvitationData] = useState<InvitationData>(() => {
    const local = localStorage.getItem('inv_calc_invitation_data');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        return validateAndSanitizeInvitationData(parsed);
      } catch (e) {
        console.error('Failed to parse invitation data from local storage', e);
      }
    }
    return validateAndSanitizeInvitationData(initialInvitationData);
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  // Modal controls
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Sync to local storage & clean up any legacy history data store
  useEffect(() => {
    try {
      localStorage.removeItem('inv_calc_saved_items');
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('inv_calc_margin_data', JSON.stringify(marginData));
  }, [marginData]);

  useEffect(() => {
    localStorage.setItem('inv_calc_invitation_data', JSON.stringify(invitationData));
  }, [invitationData]);

  // Tab switcher wrapper
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'margin' || tab === 'invitation') {
      setActiveCalculator(tab);
    }
  };

  const handleCalculatorChange = (calc: 'margin' | 'invitation') => {
    setActiveCalculator(calc);
    setActiveTab(calc);
  };

  // Mark notification read
  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    let csvContent = '';
    let fileName = '';

    if (activeCalculator === 'margin') {
      const res = calculateMarginResults(marginData);
      fileName = `Margin_Calculator_Report_${Date.now()}.csv`;

      csvContent = `Margin Calculator Report\n`;
      csvContent += `Export Date,${new Date().toLocaleString()}\n\n`;
      csvContent += `PROJECT DETAILS\n`;
      csvContent += `Total Completes Needed,${marginData.totalCompletes}\n`;
      csvContent += `Completes Collected (from CPI History),${res.incurredCompletes}\n`;
      csvContent += `Client CPI ($),${marginData.clientCpi}\n`;
      csvContent += `Target Gross Margin (%),${marginData.targetMargin}%\n`;
      csvContent += `Current Incidence Rate (%),${marginData.incidenceRate}%\n`;
      csvContent += `Committed Supplier Costs ($),${res.committedCost}\n`;
      csvContent += `Fixed Project Costs ($),${res.fixedCost}\n\n`;

      csvContent += `CPI CHANGE HISTORY PHASES\n`;
      csvContent += `Phase,Completes,CPI ($),Cost ($)\n`;
      marginData.phases.forEach((p) => {
        csvContent += `"${p.phase}",${p.completes},${p.cpi},${p.completes * p.cpi}\n`;
      });

      csvContent += `\nRECOGNIZED PROJECT COST BREAKDOWN\n`;
      csvContent += `Incurred Variable Sample Cost,$${res.incurredVariableCost.toFixed(2)}\n`;
      csvContent += `Committed Supplier Cost,$${res.committedCost.toFixed(2)}\n`;
      csvContent += `Fixed Project Cost,$${res.fixedCost.toFixed(2)}\n`;
      csvContent += `Total Recognized Costs,$${res.totalRecognizedCosts.toFixed(2)}\n\n`;

      csvContent += `CALCULATED FINANCIAL & OPERATIONAL METRICS\n`;
      csvContent += `Project Revenue,$${res.projectRevenue.toFixed(2)}\n`;
      csvContent += `Allowed Cost,$${res.allowedCost.toFixed(2)}\n`;
      csvContent += `Remaining Budget,$${res.remainingBudget.toFixed(2)}\n`;
      csvContent += `Remaining Completes,${res.remainingCompletes}\n`;
      csvContent += `MAXIMUM ALLOWABLE FUTURE CPI,$${res.requiredFutureCpi.toFixed(2)}\n`;
      csvContent += `BREAKEVEN FUTURE CPI (0% Margin),$${res.breakevenFutureCpi.toFixed(2)}\n`;
      csvContent += `BLENDED MARGIN TO DATE,${res.blendedMarginToDate !== null ? `${res.blendedMarginToDate.toFixed(1)}%` : 'N/A'}\n`;
      csvContent += `Financially Feasible,${res.financialFeasibility.status} ("${res.financialFeasibility.reason}")\n`;
      csvContent += `Operationally Feasible,${res.operationalFeasibility.status} ("${res.operationalFeasibility.reason}")\n\n`;

      csvContent += `CALCULATION ASSUMPTIONS & FORMULA REFERENCE\n`;
      csvContent += `Allowed Cost,Project Revenue × (1 − Target Gross Margin %)\n`;
      csvContent += `Total Recognized Costs,Incurred Variable Cost + Committed Costs + Fixed Costs\n`;
      csvContent += `Remaining Budget,Allowed Cost − Total Recognized Costs\n`;
      csvContent += `Maximum Allowable Future CPI,Remaining Budget ÷ Remaining Completes (capped at $0.00 if budget exhausted)\n`;
    } else {
      const res = calculateInvitationResults(invitationData);
      fileName = `Invitation_Calculator_Report_${Date.now()}.csv`;

      csvContent = `Invitation Calculator Report\n`;
      csvContent += `Export Date,${new Date().toLocaleString()}\n\n`;
      csvContent += `PROJECT PARAMETERS\n`;
      csvContent += `Target Completes,${invitationData.targetCompletes}\n`;
      csvContent += `Valid Completion Rate,${invitationData.validCompletionRate ?? 100}%\n`;
      csvContent += `Bid IR (client-shared qualification rate),${invitationData.bidIr}%\n`;
      csvContent += `Infield IR (actual qualification rate),${invitationData.infieldIr}%\n`;
      csvContent += `Panel Response Rate,${invitationData.panelResponseRate}%\n`;
      csvContent += `Effective Infield Entrant Yield (IR × VCR),${((invitationData.infieldIr * (invitationData.validCompletionRate ?? 100)) / 100).toFixed(2)}%\n`;
      csvContent += `Valid Completes Achieved,${invitationData.completesAchieved ?? 0}\n`;
      csvContent += `Outstanding Invitations Pending,${invitationData.outstandingInvitations ?? 0}\n`;
      csvContent += `Operational Invitation Buffer,${invitationData.invitationBuffer ?? 0}%\n`;
      csvContent += `Cumulative Invitations Already Sent (Recorded),${invitationData.invitationsAlreadySent ?? 0}\n\n`;

      csvContent += `STAGE 1 - BID ESTIMATE (Reference Only)\n`;
      csvContent += `Survey Participants Needed,${res.bidParticipants}\n`;
      csvContent += `Estimated Invites (reference),${res.bidInvites}\n\n`;

      csvContent += `STAGE 2 - LIVE PERFORMANCE ESTIMATE\n`;
      csvContent += `Remaining Completes,${res.remainingCompletes}\n`;
      csvContent += `Pending Completes from Outstanding Invites,${res.expectedPendingCompletes.toFixed(1)}\n`;
      csvContent += `Net Completes Needed (After Pending),${res.remainingCompletesAfterPending.toFixed(1)}\n`;
      csvContent += `Additional Survey Participants Needed (Remaining Target),${res.isEstimateUnavailable ? '—' : res.additionalParticipantsNeeded}\n`;
      csvContent += `Survey Participants Expected (Full Target),${res.isEstimateUnavailable ? '—' : res.liveParticipants}\n`;
      csvContent += `Baseline Additional Invitations Needed,${res.isEstimateUnavailable ? '—' : res.baselineAdditionalInvites}\n`;
      csvContent += `ESTIMATED ADDITIONAL INVITATIONS NEEDED (Buffered),${res.isEstimateUnavailable ? '—' : res.bufferedAdditionalInvites}\n`;
      if (res.totalProjectedInvites !== null) {
        csvContent += `Total Projected Project Invitations,${res.totalProjectedInvites}\n`;
      }
      csvContent += `\n`;

      csvContent += `STAGE 3 - PROGRESS TRACKER\n`;
      csvContent += `Track Progress By,${invitationData.trackProgressBy === 'completes' ? 'Completes So Far' : 'Total Entrants So Far'}\n`;
      if (invitationData.trackProgressBy === 'completes') {
        csvContent += `Completes So Far,${invitationData.completesSoFar ?? '—'}\n`;
      } else {
        csvContent += `Total Entrants Into Survey So Far,${invitationData.totalEntrantsSoFar ?? '—'}\n`;
      }
      csvContent += `Invitations sent so far (Recorded Actual),${res.progressInvitationsRecorded !== null ? res.progressInvitationsRecorded : 'N/A'}\n`;
      csvContent += `Invitations sent so far (Theoretical Estimate),${res.progressInvitationsEstimated !== null ? res.progressInvitationsEstimated : '—'}\n`;
      csvContent += `Primary Progress Output,${res.progressInvitationsSent !== null ? res.progressInvitationsSent : '—'} (${res.progressIsActual ? 'Recorded Actual' : 'Theoretical Estimate'})\n\n`;

      csvContent += `CALCULATION ASSUMPTIONS & REPRODUCIBILITY REFERENCE\n`;
      csvContent += `IR Definition,Qualification IR (% of entrants passing screener eligibility)\n`;
      csvContent += `Effective Entrant Yield,Qualification IR × Valid Completion Rate\n`;
      csvContent += `Bid Survey Participants,⌈ Target Completes ÷ (Bid IR × Valid Completion Rate) ⌉\n`;
      csvContent += `Bid Invitations,⌈ Target Completes ÷ (Bid IR × Panel Response Rate × Valid Completion Rate) ⌉\n`;
      csvContent += `Additional Survey Participants,⌈ Net Completes Needed ÷ (Infield IR × Valid Completion Rate) ⌉\n`;
      csvContent += `Full Project Participants,⌈ Target Completes ÷ (Infield IR × Valid Completion Rate) ⌉\n`;
      csvContent += `Baseline Additional Invitations,⌈ Net Completes Needed ÷ (Response Rate × Infield IR × Valid Completion Rate) ⌉\n`;
      csvContent += `Buffered Additional Invitations,⌈ Baseline Additional Invitations × (1 + Buffer %) ⌉\n`;
      csvContent += `Stage 3 Completes Theoretical Invitations,⌈ Completes ÷ (Infield IR × Panel Response Rate × Valid Completion Rate) ⌉\n`;
      csvContent += `Stage 3 Entrants Theoretical Invitations,⌈ Total Entrants ÷ Panel Response Rate ⌉\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F4F4] text-[#2B2B2B]">
      {/* Top Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        activeCalculator={activeCalculator}
        setActiveCalculator={handleCalculatorChange}
        onOpenAbout={() => setIsAboutOpen(true)}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
      />

      {/* Main Screen Router */}
      <main className="flex-grow w-full">
        {activeTab === 'margin' && (
          <MarginCalculator
            data={marginData}
            onChange={setMarginData}
            onExport={handleExportCSV}
          />
        )}

        {activeTab === 'invitation' && (
          <InvitationCalculator
            data={invitationData}
            onChange={setInvitationData}
            onExport={handleExportCSV}
          />
        )}

        {activeTab === 'resources' && (
          <ResourcesView />
        )}
      </main>

      {/* Footer */}
      <Footer
        setActiveTab={handleTabChange}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Modals */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
}
