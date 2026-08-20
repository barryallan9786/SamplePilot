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
      csvContent += `Target Margin (%),${marginData.targetMargin}%\n`;
      csvContent += `Current Incidence Rate (%),${marginData.incidenceRate}%\n\n`;

      csvContent += `CPI CHANGE HISTORY PHASES\n`;
      csvContent += `Phase,Completes,CPI ($),Cost ($)\n`;
      marginData.phases.forEach((p) => {
        csvContent += `"${p.phase}",${p.completes},${p.cpi},${p.completes * p.cpi}\n`;
      });
      csvContent += `\nCALCULATED FINANCIAL & OPERATIONAL METRICS\n`;
      csvContent += `Project Revenue,$${res.projectRevenue.toFixed(2)}\n`;
      csvContent += `Allowed Cost,$${res.allowedCost.toFixed(2)}\n`;
      csvContent += `Incurred Cost,$${res.incurredCost.toFixed(2)}\n`;
      csvContent += `Remaining Budget,$${res.remainingBudget.toFixed(2)}\n`;
      csvContent += `Remaining Completes,${res.remainingCompletes}\n`;
      csvContent += `REQUIRED FUTURE CPI,$${res.requiredFutureCpi.toFixed(2)}\n`;
      csvContent += `BREAKEVEN FUTURE CPI (0% Margin),$${res.breakevenFutureCpi.toFixed(2)}\n`;
      csvContent += `BLENDED MARGIN TO DATE,${res.blendedMarginToDate !== null ? `${res.blendedMarginToDate.toFixed(1)}%` : 'N/A'}\n`;
      csvContent += `Financially Feasible,${res.financialFeasibility.status} ("${res.financialFeasibility.reason}")\n`;
      csvContent += `Operationally Feasible,${res.operationalFeasibility.status} ("${res.operationalFeasibility.reason}")\n`;
    } else {
      const res = calculateInvitationResults(invitationData);
      fileName = `Invitation_Calculator_Report_${Date.now()}.csv`;

      csvContent += `Invitation Calculator Report\n`;
      csvContent += `Export Date,${new Date().toLocaleString()}\n\n`;
      csvContent += `PROJECT PARAMETERS\n`;
      csvContent += `Target Completes,${invitationData.targetCompletes}\n`;
      csvContent += `Bid IR (client-shared),${invitationData.bidIr}%\n`;
      csvContent += `Infield IR (actual performance),${invitationData.infieldIr}%\n`;
      csvContent += `Panel Response Rate,${invitationData.panelResponseRate}%\n\n`;

      csvContent += `STAGE 1 - BID ESTIMATE\n`;
      csvContent += `Survey Participants Needed,${res.bidParticipants}\n`;
      csvContent += `Estimated Invites (reference),${res.bidInvites}\n\n`;

      csvContent += `STAGE 2 - LIVE PERFORMANCE ESTIMATE\n`;
      csvContent += `Survey Participants Expected,${res.liveParticipants}\n`;
      csvContent += `INVITES TO RELEASE,${res.liveInvites}\n`;
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
