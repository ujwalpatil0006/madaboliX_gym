import React, { useState } from 'react';
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

import { NavigationTab, BranchLocation, Member, BillingItem } from './types';
import { INITIAL_MEMBERS, INITIAL_BILLING_ITEMS } from './data/mockData';
import { Smartphone, Monitor, CheckCircle, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [currentBranch, setCurrentBranch] = useState<BranchLocation>('Jatra Hotel');
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [billingItems, setBillingItems] = useState<BillingItem[]>(INITIAL_BILLING_ITEMS);

  // Desktop view toggle: 'phone' or 'fluid'
  const [isPhoneView, setIsPhoneView] = useState<boolean>(true);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
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

  // WhatsApp modal state
  const [whatsAppModalData, setWhatsAppModalData] = useState<{
    isOpen: boolean;
    name: string;
    phone: string;
    amount?: number;
    plan?: string;
    type?: 'expiry' | 'overdue' | 'churn';
  }>({
    isOpen: false,
    name: '',
    phone: '',
  });

  // Action handlers
  const handleAddMember = (newMemberData: Partial<Member>) => {
    const targetBranch =
      newMemberData.branch ||
      (currentBranch === 'All Locations' ? 'Jatra Hotel' : currentBranch);
    const newMember: Member = {
      id: `mem-${Date.now()}`,
      name: newMemberData.name || 'New Athlete',
      plan: newMemberData.plan || 'Monthly',
      branch: targetBranch,
      status: 'active',
      lastActive: 'Enrolled today',
      phone: newMemberData.phone || '+91 98000 00000',
      email: newMemberData.email,
      address: newMemberData.address,
      membershipStartDate: newMemberData.membershipStartDate,
      membershipEndDate: newMemberData.membershipEndDate,
      locker: newMemberData.locker,
      isCheckedIn: false,
      ltv: newMemberData.ltv || 0,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };
    setMembers([newMember, ...members]);
    showToast(`Athlete ${newMember.name} enrolled successfully!`);
  };

  const handleToggleCheckIn = (memberId: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          const newState = !m.isCheckedIn;
          showToast(`${m.name} ${newState ? 'checked in to turnstile' : 'checked out'}`);
          return {
            ...m,
            isCheckedIn: newState,
            lastActive: newState ? 'Just now' : m.lastActive,
          };
        }
        return m;
      })
    );
  };

  const handleAthleteCheckedInViaQR = (name: string, locker: string) => {
    showToast(`Turnstile Gate 1: ${name} verified & checked in (${locker})`);
  };

  const handleOpenRenew = (member?: Member | null) => {
    setSelectedMemberForRenew(member || null);
    setIsRenewOpen(true);
  };

  const handleRenewSuccess = (amount: number, duration: string) => {
    showToast(`Invoice for ₹${amount.toLocaleString()} pushed and recorded!`);
    if (selectedMemberForRenew) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === selectedMemberForRenew.id
            ? { ...m, status: 'active', statusLabel: undefined, amountDue: 0 }
            : m
        )
      );
    }
  };

  const handleMarkPaid = (billingId: string) => {
    setBillingItems((prev) => prev.filter((item) => item.id !== billingId));
    showToast('Payment marked as paid & settled');
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
      setWhatsAppModalData({
        isOpen: true,
        name: name || '',
        phone: memberOrPhone,
        amount,
        plan,
        type: amount ? 'overdue' : 'expiry',
      });
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
    setWhatsAppModalData({
      isOpen: true,
      name: member.name,
      phone: member.phone,
      amount: kind === 'overdue' ? member.amountDue : undefined,
      plan: member.plan,
      type: kind,
    });
  };

  const handleSendPassEmail = (member: Member) => {
    if (!member.email) {
      showToast(`${member.name} has no email registered on their profile`);
      return;
    }
    const subject = 'Your MADABOLICX gym pass is about to expire';
    const body = `Hi ${member.name},\n\nYour ${member.plan} pass at Madabolicx Fitness (${member.branch}) is expiring soon.\nRenew now to keep your training uninterrupted.\n\n1-tap renew: https://madabolicx.in/renew\n\n— MADABOLICX Front Desk`;
    window.location.href = `mailto:${member.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    showToast(`Renewal email composed for ${member.name}`);
  };

  const passAlertCount = members.filter(
    (m) => m.status === 'expiring' || m.status === 'expired' || m.status === 'dormant'
  ).length;

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col items-center justify-start selection:bg-[#0284c7] selection:text-white relative font-sans">
      {/* View Switcher Top Bar for breathing space & clean framing */}
      <div className="w-full max-w-md md:max-w-2xl px-4 pt-2.5 pb-1 flex items-center justify-between text-xs text-[#64748b] border-b border-[#e2e8f0]/60 z-20">
        <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[#006194]">
          <span className="w-2 h-2 rounded-full bg-[#0284c7] animate-pulse" />
          <span>MADABOLICX TELEMETRY CORE</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 bg-white px-2 py-1 rounded-full border border-slate-200 shadow-xs">
          <button
            type="button"
            onClick={() => setIsPhoneView(true)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
              isPhoneView
                ? 'bg-[#0284c7] text-white shadow-xs'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>Mobile Device</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPhoneView(false)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
              !isPhoneView
                ? 'bg-[#0284c7] text-white shadow-xs'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            <Monitor className="w-3 h-3" />
            <span>Expanded Studio</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 relative flex flex-col ${
          isPhoneView
            ? 'max-w-md min-h-screen sm:min-h-[844px] sm:my-4 sm:rounded-[36px] sm:border-[8px] sm:border-[#090d16] sm:shadow-[0_25px_60px_-15px_rgba(2,132,199,0.18)] bg-[#f8f9ff] overflow-hidden'
            : 'max-w-2xl px-4 py-2'
        }`}
      >
        {/* Dynamic Island / Speaker Notch in Mobile Frame */}
        {isPhoneView && (
          <div className="hidden sm:flex justify-center pt-2 pb-1 bg-transparent">
            <div className="w-24 h-4 rounded-full bg-[#090d16] flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1e293b]" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/80" />
            </div>
          </div>
        )}

        {/* Top Header - Consistent branding across screens */}
        <Header
          currentBranch={currentBranch}
          onSelectBranch={(b) => {
            setCurrentBranch(b);
            showToast(`Switched telemetry to ${b}`);
          }}
          onOpenOwnerProfile={() => setIsOwnerProfileOpen(true)}
          syncActive={true}
        />

        {/* Main Content Area */}
        <main className="flex-1 px-4 pt-2 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardScreen
              currentBranch={currentBranch}
              members={members}
              onOpenAddMember={() => setIsAddMemberOpen(true)}
              onOpenRenewModal={(m) => handleOpenRenew(m)}
              onOpenQRTerminal={() => setIsQRTerminalOpen(true)}
              onOpenCollectFee={() => setIsCollectFeeOpen(true)}
              onOpenWhatsAppNudge={(m) => handleOpenWhatsAppNudge(m)}
              onViewAllMembers={() => setActiveTab('members')}
            />
          )}

          {activeTab === 'members' && (
            <MembersScreen
              members={members}
              currentBranch={currentBranch}
              onOpenAddMember={() => setIsAddMemberOpen(true)}
              onOpenQRTerminal={() => setIsQRTerminalOpen(true)}
              onToggleCheckIn={handleToggleCheckIn}
              onOpenMemberTelemetry={(m) => setTelemetryMember(m)}
              onOpenMemberProfile={setProfileMember}
            />
          )}

          {activeTab === 'billing' && (
            <BillingScreen
              billingItems={billingItems}
              onOpenQuickPay={() => setIsCollectFeeOpen(true)}
              onOpenRenewModal={(memberId, amount, plan) => {
                const found = members.find((m) => m.id === memberId);
                handleOpenRenew(found);
              }}
              onOpenWhatsAppNudge={(phone, name, amount, plan) =>
                handleOpenWhatsAppNudge(phone, name, amount, plan)
              }
              onMarkPaid={handleMarkPaid}
              onSendUPI={handleSendUPI}
            />
          )}

          {activeTab === 'reports' && (
            <RevenueScreen
              onOpenExecutiveSnapshot={() => {
                showToast('Executive daily snapshot generated and shared to WhatsApp');
              }}
            />
          )}
        {activeTab === 'alerts' && (
            <GymPassAlertScreen
              members={members}
              onSendWhatsApp={handleSendPassAlert}
              onSendEmail={handleSendPassEmail}
              onOpenRenew={(m) => handleOpenRenew(m)}
            />
          )}
        </main>

        {/* Bottom Navigation - Consistent across all screens */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          badgeCounts={{
            members: 0,
            billing: billingItems.length > 0 ? billingItems.length : undefined,
            reports: 0,
            alerts: passAlertCount,
          }}
        />
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-[#090d16] text-white text-xs font-semibold shadow-2xl flex items-center gap-2 border border-cyan-500/40 animate-in fade-in slide-in-from-top-4 duration-200 max-w-sm">
          <CheckCircle className="w-4 h-4 text-[#38bdf8] shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* All Modal Overlays */}
      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onAddMember={handleAddMember}
        defaultBranch={currentBranch}
      />

      <RenewModal
        isOpen={isRenewOpen}
        onClose={() => setIsRenewOpen(false)}
        member={selectedMemberForRenew}
        onSuccess={handleRenewSuccess}
      />

      <QRTerminalModal
        isOpen={isQRTerminalOpen}
        onClose={() => setIsQRTerminalOpen(false)}
        onAthleteCheckedIn={handleAthleteCheckedInViaQR}
      />

      <CollectFeeModal
        isOpen={isCollectFeeOpen}
        onClose={() => setIsCollectFeeOpen(false)}
        onPaymentRecorded={(amount, method) => {
          showToast(`₹${amount.toLocaleString()} payment collected via ${method}`);
        }}
      />

      <WhatsAppModal
        isOpen={whatsAppModalData.isOpen}
        onClose={() => setWhatsAppModalData((prev) => ({ ...prev, isOpen: false }))}
        recipientName={whatsAppModalData.name}
        phone={whatsAppModalData.phone}
        amount={whatsAppModalData.amount}
        plan={whatsAppModalData.plan}
        type={whatsAppModalData.type}
      />

      <OwnerProfileModal
        isOpen={isOwnerProfileOpen}
        onClose={() => setIsOwnerProfileOpen(false)}
      />

      <MemberTelemetryModal
        isOpen={!!telemetryMember}
        onClose={() => setTelemetryMember(null)}
        member={telemetryMember}
      />

      <MemberProfileModal
        isOpen={!!profileMember}
        onClose={() => setProfileMember(null)}
        member={profileMember}
      />
    </div>
  );
}
