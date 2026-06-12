// PayPal REST helpers. Credentials are passed in explicitly (resolved from the
// admin settings layer or env) rather than read from the environment here.

export interface PayPalCreds {
  clientId?: string;
  secret?: string;
  env?: 'sandbox' | 'live';
}

function apiBase(creds: PayPalCreds): string {
  return creds.env === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

export function paypalConfigured(creds: PayPalCreds): boolean {
  return Boolean(creds.clientId && creds.secret);
}

async function accessToken(creds: PayPalCreds): Promise<string> {
  const basic = btoa(`${creds.clientId}:${creds.secret}`);
  const res = await fetch(`${apiBase(creds)}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function createOrder(
  creds: PayPalCreds,
  opts: { amountCents: number; currency?: string; description: string; returnUrl: string; cancelUrl: string }
): Promise<{ id: string; approveUrl: string }> {
  const token = await accessToken(creds);
  const res = await fetch(`${apiBase(creds)}/v2/checkout/orders`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          description: opts.description,
          amount: {
            currency_code: (opts.currency || 'USD').toUpperCase(),
            value: (opts.amountCents / 100).toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: 'CarVinLookup',
        user_action: 'PAY_NOW',
        return_url: opts.returnUrl,
        cancel_url: opts.cancelUrl,
      },
    }),
  });
  const data = (await res.json()) as { id: string; links: { rel: string; href: string }[] };
  if (!res.ok) throw new Error(`PayPal order failed: ${JSON.stringify(data)}`);
  const approve = data.links.find((l) => l.rel === 'approve');
  return { id: data.id, approveUrl: approve?.href || '' };
}

export async function captureOrder(creds: PayPalCreds, orderId: string): Promise<{ status: string; captureId?: string }> {
  const token = await accessToken(creds);
  const res = await fetch(`${apiBase(creds)}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  const data = (await res.json()) as {
    status: string;
    purchase_units?: { payments?: { captures?: { id: string }[] } }[];
  };
  if (!res.ok) throw new Error(`PayPal capture failed: ${JSON.stringify(data)}`);
  const captureId = data.purchase_units?.[0]?.payments?.captures?.[0]?.id;
  return { status: data.status, captureId };
}
