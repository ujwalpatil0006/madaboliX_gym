import dotenv from 'dotenv';

dotenv.config();

const GRAPH_BASE = 'https://graph.facebook.com/v21.0';

export type SendMode = 'live' | 'simulated';
export type AutomationTrigger = '7_DAYS_BEFORE' | '3_DAYS_BEFORE' | '1_DAY_BEFORE' | 'MANUAL_DISPATCH';

export interface SendResult {
  mode: SendMode;
  status: 'sent' | 'delivered' | 'failed';
  messageId?: string;
  error?: string;
  whatsappUrl?: string;
  payload?: any;
}

export interface RenewalData {
  name: string;
  plan: string;
  amount: number;
  days: number;
}

function toE164(phone: string): string {
  let digits = (phone || '').replace(/\D/g, '');
  if (digits.length === 10) digits = '91' + digits;
  else if (digits.length === 11 && digits.startsWith('9')) digits = '91' + digits.slice(1);
  else if (digits.length === 12 && digits.startsWith('0')) digits = '91' + digits.slice(1);
  return digits;
}

function templateNameForTrigger(trigger: AutomationTrigger): string {
  const envVar =
    trigger === '7_DAYS_BEFORE'
      ? process.env.WHATSAPP_TEMPLATE_7D
      : trigger === '3_DAYS_BEFORE'
      ? process.env.WHATSAPP_TEMPLATE_3D
      : trigger === '1_DAY_BEFORE'
      ? process.env.WHATSAPP_TEMPLATE_1D
      : process.env.WHATSAPP_TEMPLATE_MANUAL;
  return envVar || process.env.WHATSAPP_TEMPLATE_NAME || 'gym_pass_renewal';
}

interface LiveConfig {
  accessToken: string;
  phoneNumberId: string;
  templateName: string;
  templateLanguage: string;
  recipientOverride: string;
}

function liveConfig(): LiveConfig | null {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  if (!accessToken || !phoneNumberId) return null;
  return {
    accessToken,
    phoneNumberId,
    templateName: process.env.WHATSAPP_TEMPLATE_NAME || 'gym_pass_renewal',
    templateLanguage: process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en',
    recipientOverride: process.env.WHATSAPP_RECIPIENT_PHONE || '',
  };
}

function buildTemplatePayload(cfg: LiveConfig, to: string, data: RenewalData, templateName: string) {
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: cfg.templateLanguage },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: data.name },
            { type: 'text', text: data.plan },
            { type: 'text', text: `₹${data.amount.toLocaleString('en-IN')}` },
            { type: 'text', text: String(data.days) },
          ],
        },
      ],
    },
  };
}

async function postToGraph(cfg: LiveConfig, payload: any): Promise<Response> {
  const url = `${GRAPH_BASE}/${cfg.phoneNumberId}/messages`;
  return fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

async function sendTemplate(
  to: string,
  data: RenewalData,
  templateName: string
): Promise<SendResult> {
  const cfg = liveConfig();
  const fallbackText = `Hey ${data.name}! 💪 Your ${data.plan} at MADABOLICX renews in ${data.days} day(s) for ₹${data.amount.toLocaleString('en-IN')}. Renew now: https://madabolicx.in/renew`;
  const waLink = `https://wa.me/${toE164(to)}?text=${encodeURIComponent(fallbackText)}`;

  if (!cfg) {
    return {
      mode: 'simulated',
      status: 'sent',
      whatsappUrl: waLink,
      payload: { note: 'WHATSAPP_ACCESS_TOKEN not set — simulated send', to, templateName, data },
    };
  }

  try {
    const payload = buildTemplatePayload(cfg, toE164(to), data, templateName);
    const res = await postToGraph(cfg, payload);
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      return {
        mode: 'live',
        status: 'delivered',
        messageId: body?.messages?.[0]?.id,
        whatsappUrl: waLink,
        payload,
      };
    }
    return {
      mode: 'live',
      status: 'failed',
      error: body?.error?.message || `Graph API HTTP ${res.status}`,
      whatsappUrl: waLink,
      payload,
    };
  } catch (err: any) {
    return {
      mode: 'live',
      status: 'failed',
      error: err?.message || 'Network error calling WhatsApp Cloud API',
      whatsappUrl: waLink,
    };
  }
}

async function sendText(to: string, text: string): Promise<SendResult> {
  const cfg = liveConfig();
  if (!cfg) {
    return {
      mode: 'simulated',
      status: 'sent',
      whatsappUrl: `https://wa.me/${toE164(to)}?text=${encodeURIComponent(text)}`,
    };
  }
  try {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: toE164(to),
      type: 'text',
      text: { body: text },
    };
    const res = await postToGraph(cfg, payload);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        mode: 'live',
        status: 'failed',
        error: body?.error?.message || `Graph API HTTP ${res.status}`,
      };
    }
    return { mode: 'live', status: 'delivered', messageId: body?.messages?.[0]?.id };
  } catch (err: any) {
    return { mode: 'live', status: 'failed', error: err?.message || 'Network error' };
  }
}

export const whatsapp = {
  toE164,
  templateNameForTrigger,
  isConfigured: () => !!liveConfig(),
  sendRenewal: sendTemplate,
  sendText,
  status: () => {
    const cfg = liveConfig();
    return {
      configured: !!cfg,
      mode: cfg ? ('live' as SendMode) : ('simulated' as SendMode),
      templateName: cfg?.templateName || 'gym_pass_renewal',
      templateLanguage: cfg?.templateLanguage || 'en',
      recipientOverride: cfg?.recipientOverride || '',
      graphApi: GRAPH_BASE,
    };
  },
};