export async function trackPushEvent(params: {
  notification_id: string;
  event_type: 'clicked' | 'delivered' | 'dismissed';
  campaign_id?: string;
  user_id?: string;
  anonymous_id?: string;
}): Promise<void> {
  try {
    await fetch('/api/marketing/track-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notification_id: params.notification_id,
        event_type: params.event_type,
        campaign_id: params.campaign_id || undefined,
        user_id: params.user_id || undefined,
        anonymous_id: params.anonymous_id || localStorage.getItem('trv_anonymous_id') || undefined,
      })
    });
  } catch {
    // Silent fail for tracking
  }
}
