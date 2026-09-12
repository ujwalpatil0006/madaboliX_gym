import { Member, BillingItem } from './types';

// ---- branch mapping (frontend labels -> backend labels) ----
export const toApiBranch = (branch: string): string | undefined =>
  branch === 'Adgaon' ? 'Adgaon Branch' : branch === 'Jatra Hotel' ? 'Jatra Branch' : undefined;

export const fromApiBranch = (branch: string): string =>
  branch === 'Adgaon Branch' ? 'Adgaon' : branch === 'Jatra Branch' ? 'Jatra Hotel' : branch;

export const fromApiMember = (m: any): Member => ({
  ...m,
  id: String(m.id || m._id || ''),
  branch: fromApiBranch(m.branch || 'Jatra Hotel'),
  isCheckedIn: !!m.isCheckedIn,
});

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || json?.message || `HTTP ${res.status}`);
  return json as T;
}

export async function apiGetMembers(params?: { branch?: string; status?: string; search?: string }) {
  const q = new URLSearchParams();
  if (params?.branch && params.branch !== 'All Locations') q.set('branch', toApiBranch(params.branch) || params.branch);
  if (params?.status) q.set('status', params.status);
  if (params?.search) q.set('search', params.search);
  const res = await request<{ success: boolean; count: number; data: any[] }>(
    `/api/members${q.toString() ? `?${q}` : ''}`
  );
  return { ...res, data: res.data.map(fromApiMember) };
}

export async function apiGetBilling(): Promise<BillingItem[]> {
  const res = await request<{ success: boolean; data: BillingItem[] }>(`/api/billing`);
  return res.data;
}

export async function apiCreateMember(data: Partial<Member>) {
  return request<{ success: boolean; message: string; data: Member }>(`/api/members`, {
    method: 'POST',
    body: JSON.stringify({
      name: data.name,
      phone: data.phone,
      plan: data.plan,
      branch: toApiBranch(data.branch || 'Jatra Hotel'),
      locker: data.locker,
      ltv: data.ltv,
    }),
  });
}

export async function apiToggleCheckIn(id: string) {
  const res = await request<{ success: boolean; data: any }>(`/api/members/${id}/checkin`, {
    method: 'POST',
  });
  return { ...res, data: fromApiMember(res.data) };
}

export async function apiRenewMember(id: string, amount: number, duration: string, paymentMethod: string) {
  return request<{ success: boolean; message: string; data: any; invoice: any }>(`/api/members/${id}/renew`, {
    method: 'POST',
    body: JSON.stringify({ amount, duration, paymentMethod }),
  });
}

export async function apiRecordPayment(payload: { amount: number; method?: string; memberId?: string; note?: string }) {
  return request<{ success: boolean; message: string; invoice: any }>(`/api/billing/pay`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function apiTestDispatch(phone: string) {
  return request<{ success: boolean; message: string; mode: 'live' | 'simulated'; dispatch: any; data: any }>(
    `/api/automations/test-dispatch`,
    {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }
  );
}

export async function apiGetOverview(branch?: string) {
  const q = branch && branch !== 'All Locations' ? `?branch=${encodeURIComponent(toApiBranch(branch) || branch)}` : '';
  return request<{ success: boolean; data: any }>(`/api/analytics/overview${q}`);
}

export async function apiGetBranchAnalytics() {
  const res = await request<{ success: boolean; data: any[] }>(`/api/analytics/branches`);
  return { ...res, data: res.data.map((b) => ({ ...b, name: fromApiBranch(b.name) })) };
}