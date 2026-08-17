// Cloudflare Pages Function - Evaluate Customer Segments
// Location: /functions/api/marketing/evaluate-segments.ts

declare const PagesFunction: any;

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-push-webhook-secret',
  'Access-Control-Max-Age': '86400',
};

export const onRequestOptions: any = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export const onRequestPost: any = async (context: any) => {
  const { request, env } = context;

  const rawAuthHeader = request.headers.get('x-push-webhook-secret') || '';
  const authHeader = rawAuthHeader.trim();
  const configuredSecret = [env.WEBHOOK_SECRET, env.webhook_secret, env.PUSH_WEBHOOK_SECRET, env.push_webhook_secret].find(Boolean) || '';

  if (configuredSecret && authHeader) {
    if (!safeCompare(authHeader, configuredSecret)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
    }
  }

  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return new Response(JSON.stringify({ error: 'Supabase not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { error } = await supabase.rpc('evaluate_all_segments');
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  }

  const { data: segData } = await supabase.from('customer_segments').select('segment_key');
  const counts: Record<string, number> = {};
  for (const row of segData || []) {
    counts[row.segment_key] = (counts[row.segment_key] || 0) + 1;
  }

  return new Response(JSON.stringify({ success: true, segments: counts }), {
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
  });
};

export const onRequestGet: any = async () => {
  return new Response(JSON.stringify({ status: 'ok', service: 'evaluate-segments' }), {
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
  });
};
