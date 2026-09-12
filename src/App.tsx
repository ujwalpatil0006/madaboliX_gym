import React, { useEffect, useMemo, useState } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardScreen } from './components/DashboardScreen';
import { MembersScreen } from './components/MembersScreen';
import { BillingScreen } from './components/BillingScreen';
import { RevenueScreen } from './components/RevenueScreen';
import { GymPassAlertScreen } from './components/GymPassAlertScreen';

import { AddMemberModal } from './components/modals/AddMemberModal';
import { RenewModal } from './components/modals/RenewModal';
import { QRTerminalModal } from './components/modals/QRTerminalModal';
import { CollectFeeModal } from './components/modals/CollectFeeModal';
import { WhatsAppModal } from './components/modals/WhatsAppModal';
import { OwnerProfileModal } from './components/modals/OwnerProfileModal';
import { MemberTelemetryModal } from './components/modals/MemberTelemetryModal';
import { MemberProfileModal } from './components/modals/MemberProfileModal';
import { TestAutomationModal } from './components/modals/TestAutomationModal';

import { NavigationTab, BranchLocation, Member, BillingItem } from './types';
import { INITIAL_MEMBERS, INITIAL_BILLING_ITEMS } from './data/mockData';
import {
  apiGetMembers,
  apiGetBilling,
  apiCreateMember,
  apiToggleCheckIn,
  apiRenewMember,
  apiRecordPayment,
  apiTestDispatch,
  apiGetOverview,
  apiGetBranchAnalytics,
  fromApiMember,
} from './api';
import { Smartphone, Monitor, CheckCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [currentBranch, setCurrentBranch] = useState<BranchLocation>('Jatra Hotel');
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [billingItems, setBillingItems] = useState<BillingItem[]>(INITIAL_BILLING_ITEMS);
  const [overview, setOverview] = useState<any | null>(null);
  const [branchAnalytics, setBranchAnalytics] = useState<any[]>([]);
  const [isPhoneView, setIsPhoneView] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isTestAutomationOpen, setIsTestAutomationOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Modals state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isRenewOpen, setIsRenewOpen] = useState(false);
  const [selectedMemberForRenew, setSelectedMemberForRenew] = useState<Member | null>(null);
  const [isQRTerminalOpen, setIsQRTerminalOpen] = useState(false);
  const [isCollectFeeOpen, setIsCollectFeeOpen] = useState(false);
  const [isOwnerProfileOpen, setIsOwnerProfileOpen] = useState(false);
  const [telemetryMember, setTelemetryMember] = useState<Member | null>(null);
  const [profileMember, setProfileMember] = useState<Member | null>(null);
  const [whatsAppModalData, setWhatsAppModalData] = useState<{
    isOpen: boolean;
    name: string;
    phone: string;
    amount?: number;
    plan?: string;
    type?: 'expiry' | 'overdue' | 'churn';
  }>({ isOpen: false, name: '', phone: '' });

  // ---- Data loading (full dataset, branch filtered client-side) ----
  const loadAllData = async () => {
    try {
      const [mRes, bItems, bAnalytics, oRes] = await Promise.all([
        apiGetMembers({}).catch(() => ({ data: INITIAL_MEMBERS })),
        apiGetBilling().catch(() => INITIAL_BILLING_ITEMS),
        apiGetBranchAnalytics().catch(() => ({ data: [] })),
        apiGetOverview(currentBranch === 'All Locations' ? undefined : currentBranch).catch(() => ({ data: null })),
      ]);
      setMembers(mRes.data.map(fromApiMember));
      setBillingItems(Array.isArray(bItems) ? bItems : []);
      setBranchAnalytics(bAnalytics.data || []);
      setOverview(oRes.data);
    } catch {
      // keep demo state
    }
  };

  useEffect(() => {
    loadAllData();
  }, [currentBranch]);

  // ---- Branch-filtered visible lists ----
  const memberById = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);

  const visibleMembers = useMemo(
    () => (currentBranch === 'All Locations' ? members : members.filter((m) => m.branch === currentBranch)),
    [members, currentBranch],
  );

  const visibleBilling = useMemo(() => {
    const enriched = billingItems.map((item) => ({
      ...item,
      avatar: memberById.get(item.memberId)?.avatar || item.avatar,
    }));
    return currentBranch === 'All Locations'
      ? enriched
      : enriched.filter((item) => memberById.get(item.memberId)?.branch === currentBranch);
  }, [billingItems, memberById, currentBranch]);

  // ---- Action handlers ----
  const handleAddMember = async (data: Partial<Member>) => {
    const target = data.branch || currentBranch;
    try {
      await apiCreateMember({ ...data, branch: target === 'All Locations' ? 'Jatra Hotel' : target });
      showToast(`Athlete enrolled successfully!`);
      await loadAllData();
    } catch (err: any) {
      showToast(`Enrollment failed: ${err.message || 'server error'}`);
    }
  };

  const handleToggleCheckIn = async (memberId: string) => {
    try {
      const res = await apiToggleCheckIn(memberId);
      if (res.success) {
        showToast(`${res.data.name} ${res.data.isCheckedIn ? 'checked in' : 'checked out'}`);
        setMembers((prev) => prev.map((m) => (m.id === memberId ? res.data : m)));
      }
    } catch (err: any) {
      showToast(`Turnstile error: ${err.message || 'no connection'}`);
    }
  };

  const handleAthleteCheckedInViaQR = (name: string, _locker: string) => {
    showToast(`Turnstile Gate 1: ${name} verified & checked in`);
  };

  const handleOpenRenew = (member?: Member | null) => {
    setSelectedMemberForRenew(member || null);
    setIsRenewOpen(true);
  };

  const handleRenewSuccess = async (amount: number, duration: string) => {
    if (selectedMemberForRenew) {
      try {
        await apiRenewMember(selectedMemberForRenew.id, amount, duration, 'UPI');
        showToast(`Invoice for ₹${amount.toLocaleString()} pushed and recorded!`);
        await loadAllData();
      } catch (err: any) {
        showToast(`Renewal error: ${err.message}`);
      }
    } else {
      showToast(`Invoice for ₹${amount.toLocaleString()} pushed`);
    }
  };

  const handleMarkPaid = async (billingId: string) => {
    const item = billingItems.find((b) => b.id === billingId);
    if (item) {
      try {
        await apiRecordPayment({ amount: item.amount, method: 'UPI', memberId: item.memberId, note: item.memberName });
        showToast('Payment marked as paid & settled');
        await loadAllData();
      } catch (err: any) {
        showToast(`Payment error: ${err.message}`);
      }
    }
  };

  const handleQuickPayRecorded = async (amount: number, method: string) => {
    try {
      await apiRecordPayment({ amount, method, note: 'Quick Collect' });
      showToast(`₹${amount.toLocaleString()} payment collected via ${method}`);
      await loadAllData();
    } catch {
      showToast(`₹${amount.toLocaleString()} payment collected (demo)`);
    }
  };

  const handleSendUPI = (item: BillingItem) => {
    showToast(`UPI Payment link generated & pushed to ${item.memberName}`);
    setWhatsAppModalData({
      isOpen: true,
      name: item.memberName,
      phone: item.phone,
      amount: item.amount,
      plan: item.plan,
      type: 'overdue',
    });
  };

  const handleOpenWhatsAppNudge = (
    memberOrPhone: Member | string,
    name?: string,
    amount?: number,
    plan?: string
  ) => {
    if (typeof memberOrPhone === 'string') {
      setWhatsAppModalData({ isOpen: true, name: name || '', phone: memberOrPhone, amount, plan, type: amount ? 'overdue' : 'expiry' });
    } else {
      setWhatsAppModalData({
        isOpen: true,
        name: memberOrPhone.name,
        phone: memberOrPhone.phone,
        amount: memberOrPhone.amountDue,
        plan: memberOrPhone.plan,
        type: memberOrPhone.status === 'expired' ? 'overdue' : 'expiry',
      });
    }
  };

  const handleSendPassAlert = (member: Member, kind: 'expiry' | 'overdue' | 'churn') => {
    setWhatsAppModalData({ isOpen: true, name: member.name, phone: member.phone, amount: kind === 'overdue' ? member.amountDue : undefined, plan: member.plan, type: kind });
  };

  const handleSendPassEmail = (member: Member) => {
    if (!member.email) { showToast(`${member.name} has no email on file`); return; }
    const subject = 'Your MADABOLICX gym pass is about to expire';
    const body = `Hi ${member.name},\n\nYour ${member.plan} pass at Madabolicx Fitness (${member.branch}) is expiring soon.\nRenew now to keep your training uninterrupted.\n\n1-tap renew: https://madabolicx.in/renew\n\n— MADABOLICX Front Desk`;
    window.location.href = `mailto:${member.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    showToast(`Renewal email composed for ${member.name}`);
  };

  const handleTestAutomationDispatch = async (phoneE164: string) => {
    setIsTestAutomationOpen(false);
    showToast('Creating dummy athlete & dispatching renewal WhatsApp...');
    try {
      const res = await apiTestDispatch(phoneE164);
      if (res.success) {
        const { dispatch: result, data: payload } = res;
        if (result.mode === 'simulated') {
          window.open(result.whatsappUrl, '_blank');
          showToast(`Simulated — opened WhatsApp for ${payload.member.phone}. Tap send.`);
        } else {
          showToast(`WhatsApp DELIVERED to ${payload.member.phone} via Graph API ✅`);
        }
        await loadAllData();
      } else {
        showToast('Test dispatch failed');
      }
    } catch {
      showToast('Backend not reachable — start it with npm run server');
    }
  };

  const passAlertCount = visibleMembers.filter((m) => m.status === 'expiring' || m.status === 'expired').length;

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col items-center justify-start selection:bg-[#0284c7] selection:text-white relative font-sans">
      <div className="w-full max-w-md md:max-w-2xl px-4 pt-2.5 pb-1 flex items-center justify-between text-xs text-[#64748b] border-b border-[#e2e8f0]/60 z-20">
        <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[#006194]">
          <span className="w-2 h-2 rounded-full bg-[#0284c7] animate-pulse" />
          <span>MADABOLICX TELEMETRY CORE</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 bg-white px-2 py-1 rounded-full border border-slate-200 shadow-xs">
          <button type="button" onClick={() => setIsPhoneView(true)} className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all ${isPhoneView ? 'bg-[#0284c7] text-white shadow-xs' : 'text-slate-600 hover:text-black'}`}><Smartphone className="w-3 h-3" /><span>Mobile Device</span></button>
          <button type="button" onClick={() => setIsPhoneView(false)} className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all ${!isPhoneView ? 'bg-[#0284c7] text-white shadow-xs' : 'text-slate-600 hover:text-black'}`}><Monitor className="w-3 h-3" /><span>Expanded Studio</span></button>
        </div>
      </div>

      <div className={`w-full transition-all duration-300 relative flex flex-col ${isPhoneView ? 'max-w-md min-h-screen sm:min-h-[844px] sm:my-4 sm:rounded-[36px] sm:border-[8px] sm:border-[#090d16] sm:shadow-[0_25px_60px_-15px_rgba(2,132,199,0.18)] bg-[#f8f9ff] overflow-hidden' : 'max-w-2xl px-4 py-2'}`}>
        {isPhoneView && (
          <div className="hidden sm:flex justify-center pt-2 pb-1 bg-transparent">
            <div className="w-24 h-4 rounded-full bg-[#090d16] flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1e293b]" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/80" />
            </div>
          </div>
        )}

        <Header currentBranch={currentBranch} onSelectBranch={(b) => { setCurrentBranch(b); showToast(`Switched telemetry to ${b}`); }} onOpenOwnerProfile={() => setIsOwnerProfileOpen(true)} syncActive={true} />

        <main className="flex-1 px-4 pt-2 overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardScreen currentBranch={currentBranch} members={visibleMembers} overview={overview} branchAnalytics={branchAnalytics} onOpenAddMember={() => setIsAddMemberOpen(true)} onOpenRenewModal={(m) => handleOpenRenew(m)} onOpenQRTerminal={() => setIsQRTerminalOpen(true)} onOpenCollectFee={() => setIsCollectFeeOpen(true)} onViewAllMembers={() => setActiveTab('members')} />}
          {activeTab === 'members' && <MembersScreen members={visibleMembers} currentBranch={currentBranch} onOpenAddMember={() => setIsAddMemberOpen(true)} onOpenQRTerminal={() => setIsQRTerminalOpen(true)} onToggleCheckIn={handleToggleCheckIn} onOpenMemberTelemetry={(m) => setTelemetryMember(m)} onOpenMemberProfile={setProfileMember} />}
          {activeTab === 'billing' && <BillingScreen billingItems={visibleBilling} onOpenQuickPay={() => setIsCollectFeeOpen(true)} onOpenRenewModal={(memberId, amount, plan) => { const found = members.find((m) => m.id === memberId); handleOpenRenew(found); }} onOpenWhatsAppNudge={(phone, name, amount, plan) => handleOpenWhatsAppNudge(phone, name, amount, plan)} onMarkPaid={handleMarkPaid} onSendUPI={handleSendUPI} />}
          {activeTab === 'reports' && <RevenueScreen onOpenExecutiveSnapshot={() => showToast('Executive daily snapshot generated')} />}
          {activeTab === 'alerts' && <GymPassAlertScreen members={visibleMembers} onSendWhatsApp={handleSendPassAlert} onSendEmail={handleSendPassEmail} onOpenRenew={(m) => handleOpenRenew(m)} onSendTestAutomation={() => setIsTestAutomationOpen(true)} />}
        </main>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} badgeCounts={{ members: 0, billing: visibleBilling.length || undefined, reports: 0, alerts: passAlertCount }} />
      </div>

      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-[#090d16] text-white text-xs font-semibold shadow-2xl flex items-center gap-2 border border-cyan-500/40 animate-in fade-in slide-in-from-top-4 duration-200 max-w-sm">
          <CheckCircle className="w-4 h-4 text-[#38bdf8] shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      <AddMemberModal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} onAddMember={handleAddMember} defaultBranch={currentBranch} />
      <RenewModal isOpen={isRenewOpen} onClose={() => setIsRenewOpen(false)} member={selectedMemberForRenew} onSuccess={handleRenewSuccess} />
      <QRTerminalModal isOpen={isQRTerminalOpen} onClose={() => setIsQRTerminalOpen(false)} onAthleteCheckedIn={handleAthleteCheckedInViaQR} />
      <CollectFeeModal isOpen={isCollectFeeOpen} onClose={() => setIsCollectFeeOpen(false)} onPaymentRecorded={handleQuickPayRecorded} />
      <WhatsAppModal isOpen={whatsAppModalData.isOpen} onClose={() => setWhatsAppModalData((prev) => ({ ...prev, isOpen: false }))} recipientName={whatsAppModalData.name} phone={whatsAppModalData.phone} amount={whatsAppModalData.amount} plan={whatsAppModalData.plan} type={whatsAppModalData.type} />
      <OwnerProfileModal isOpen={isOwnerProfileOpen} onClose={() => setIsOwnerProfileOpen(false)} />
      <MemberTelemetryModal isOpen={!!telemetryMember} onClose={() => setTelemetryMember(null)} member={telemetryMember} />
      <MemberProfileModal isOpen={!!profileMember} onClose={() => setProfileMember(null)} member={profileMember} />
      <TestAutomationModal isOpen={isTestAutomationOpen} onClose={() => setIsTestAutomationOpen(false)} onDispatch={handleTestAutomationDispatch} />
    </div>
  );
}