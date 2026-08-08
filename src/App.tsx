import React, { useState, useEffect } from 'react';
import { ActiveTab, MarginData, InvitationData, SavedItem, NotificationItem } from './types';
import { initialMarginData, initialInvitationData, initialSavedItems, initialNotifications } from './data/initialData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MarginCalculator } from './components/MarginCalculator';
import { InvitationCalculator } from './components/InvitationCalculator';
import { HistoryView } from './components/HistoryView';
import { ResourcesView } from './components/ResourcesView';
import { NewProjectModal } from './components/NewProjectModal';
import { SaveModal } from './components/SaveModal';
import { ContactSupportModal } from './components/ContactSupportModal';
import { AboutModal } from './components/AboutModal';
import { calculateMarginResults, calculateInvitationResults, formatCurrency, formatNumber, validateAndSanitizeMarginData, validateAndSanitizeInvitationData } from './utils/calculations';

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

  const [savedItems, setSavedItems] = useState<SavedItem[]>(() => {
    const local = localStorage.getItem('inv_calc_saved_items');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          let hasMigration = false;
          const sanitized = parsed.map((item: SavedItem) => {
            if (item.type === 'margin' && item.marginData) {
              const sanitizedData = validateAndSanitizeMarginData(item.marginData);
              if (JSON.stringify(sanitizedData) !== JSON.stringify(item.marginData)) {
                hasMigration = true;
                return {
                  ...item,
                  marginData: sanitizedData,
                };
              }
            }
            return item;
          });
          if (hasMigration) {
            console.warn('[LocalStorage Migration] Auto-repaired saved items in localStorage.');
            localStorage.setItem('inv_calc_saved_items', JSON.stringify(sanitized));
          }
          return sanitized;
        }
      } catch (e) {
        console.error('Error parsing inv_calc_saved_items from localStorage:', e);
      }
    }
    return initialSavedItems.map((item) => {
      if (item.type === 'margin' && item.marginData) {
        return {
          ...item,
          marginData: validateAndSanitizeMarginData(item.marginData),
        };
      }
      return item;
    });
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  // Modal controls
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isContactSupportOpen, setIsContactSupportOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('inv_calc_margin_data', JSON.stringify(marginData));
  }, [marginData]);

  useEffect(() => {
    localStorage.setItem('inv_calc_invitation_data', JSON.stringify(invitationData));
  }, [invitationData]);

  useEffect(() => {
    localStorage.setItem('inv_calc_saved_items', JSON.stringify(savedItems));
  }, [savedItems]);

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

  // Load item from history
  const handleLoadMargin = (data: MarginData) => {
    setMarginData(data);
    setActiveCalculator('margin');
    setActiveTab('margin');
  };

  const handleLoadInvitation = (data: InvitationData) => {
    setInvitationData(validateAndSanitizeInvitationData(data));
    setActiveCalculator('invitation');
    setActiveTab('invitation');
  };

  // Delete saved item
  const handleDeleteSavedItem = (id: string) => {
    setSavedItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Mark notification read
  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Create new project preset
  const handleCreateProject = (type: 'margin' | 'invitation', title: string) => {
    if (type === 'margin') {
      const resetMargin: MarginData = {
        totalCompletes: 1000,
        clientCpi: 5.00,
        targetMargin: 30,
        incidenceRate: 20,
        phases: [{ id: '1', phase: 'Launch Phase', completes: 0, cpi: 1.50 }],
      };
      setMarginData(resetMargin);
      setActiveCalculator('margin');
      setActiveTab('margin');
    } else {
      const resetInvitation: InvitationData = {
        targetCompletes: 1000,
        bidIr: 20,
        infieldIr: 20,
        panelResponseRate: 10,
        completesAchieved: 0,
      };
      setInvitationData(resetInvitation);
      setActiveCalculator('invitation');
      setActiveTab('invitation');
    }

    // Add notification
    const newNotif: NotificationItem = {
      id: Date.now().toString(),
      title: 'New Project Initialized',
      message: `Started new ${type} calculator project: ${title}`,
      time: 'Just now',
      type: 'info',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Confirm Save Scenario / Report
  const handleConfirmSave = (title: string, notes: string) => {
    const isMargin = activeCalculator === 'margin';
    let keyMetric = '';

    if (isMargin) {
      const res = calculateMarginResults(marginData);
      keyMetric = `Req Future CPI: ${formatCurrency(res.requiredFutureCpi)}`;
    } else {
      const res = calculateInvitationResults(invitationData);
      keyMetric = `Invites Needed: ${formatNumber(res.liveInvites)}`;
    }

    const newItem: SavedItem = {
      id: `scen-${Date.now()}`,
      type: isMargin ? 'margin' : 'invitation',
      title,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      marginData: isMargin ? marginData : undefined,
      invitationData: !isMargin ? invitationData : undefined,
      keyMetric,
      notes,
    };

    setSavedItems((prev) => [newItem, ...prev]);

    // Add toast notification
    const newNotif: NotificationItem = {
      id: Date.now().toString(),
      title: 'Saved to History',
      message: `Saved "${title}" (${isMargin ? 'Margin Scenario' : 'Invitation Report'})`,
      time: 'Just now',
      type: 'success',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
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
        onOpenNewProject={() => setIsNewProjectOpen(true)}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
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
            onSaveScenario={() => setIsSaveModalOpen(true)}
            onExport={handleExportCSV}
          />
        )}

        {activeTab === 'invitation' && (
          <InvitationCalculator
            data={invitationData}
            onChange={setInvitationData}
            onSaveReport={() => setIsSaveModalOpen(true)}
            onExport={handleExportCSV}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            items={savedItems}
            onLoadMargin={handleLoadMargin}
            onLoadInvitation={handleLoadInvitation}
            onDeleteItem={handleDeleteSavedItem}
          />
        )}

        {activeTab === 'resources' && (
          <ResourcesView
            onOpenContactSupport={() => setIsContactSupportOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        setActiveTab={handleTabChange}
        onOpenContactSupport={() => setIsContactSupportOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Modals */}
      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onCreateProject={handleCreateProject}
      />

      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        calculatorType={activeCalculator}
        defaultTitle={
          activeCalculator === 'margin'
            ? `Margin Check - ${marginData.totalCompletes} Completes`
            : `Invitation Batch - ${invitationData.targetCompletes} Completes`
        }
        onConfirmSave={handleConfirmSave}
      />

      <ContactSupportModal
        isOpen={isContactSupportOpen}
        onClose={() => setIsContactSupportOpen(false)}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
}
