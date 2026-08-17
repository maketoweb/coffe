// Cloudflare Pages Function - Push Event Tracking
// Location: /functions/api/marketing/track-event.ts

declare const PagesFunction: any;

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

export const onRequestOptions: any = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestPost: any = async (context: any) => {
  const { request, env } = context;

  try {
    const payload = await request.json();
    const { notification_id, event_type, campaign_id, user_id, anonymous_id } = payload;

    if (!notification_id || !event_type) {
      return new Response(JSON.stringify({ error: 'Missing notification_id or event_type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
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

    const { error } = await supabase.from('push_events').insert({
      notification_id,
      campaign_id: campaign_id || null,
      user_id: user_id || null,
      anonymous_id: anonymous_id || '',
      event_type,
      metadata: payload.metadata || {}
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
    }

    if (event_type === 'clicked') {
      await supabase.rpc('increment_notification_click', { p_notif_id: notification_id });
      if (campaign_id) {
        const { data: campaign } = await supabase
          .from('campaigns').select('total_clicked').eq('id', campaign_id).single();
        if (campaign) {
          await supabase.from('campaigns').update({
            total_clicked: (campaign.total_clicked || 0) + 1
          }).eq('id', campaign_id);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  }
};
