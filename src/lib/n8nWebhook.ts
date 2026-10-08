/**
 * Production URL of an n8n webhook. Uses its own env var when set; otherwise it lives on the same n8n
 * instance as the lead form (N8N_LEAD_WEBHOOK_URL), so only the path changes. Same secret header for all.
 */
export function n8nWebhookUrl(envName: string, path: string) {
  const own = process.env[envName];
  if (own) return own;
  const lead = process.env.N8N_LEAD_WEBHOOK_URL;
  if (!lead) return "";
  try {
    return `${new URL(lead).origin}/webhook/${path}`;
  } catch {
    return "";
  }
}
