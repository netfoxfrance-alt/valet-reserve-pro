import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const log = (step: string, details?: unknown) => {
  console.log(`[GOOGLE-CALENDAR-CALLBACK] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

serve(async (req) => {
  // This endpoint receives the OAuth redirect from Google
  // URL: /functions/v1/google-calendar-callback?code=XXX&state=CENTER_ID
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state'); // center_id
    const error = url.searchParams.get('error');

    // Redirect base URL
    const redirectBase = 'https://www.cleaningpage.com';

    if (error) {
      log('OAuth error from Google', { error });
      return Response.redirect(`${redirectBase}/dashboard/settings?google=error&reason=${error}`, 302);
    }

    if (!code || !state) {
      log('Missing code or state');
      return Response.redirect(`${redirectBase}/dashboard/settings?google=error&reason=missing_params`, 302);
    }

    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      log('Missing Google OAuth credentials');
      return Response.redirect(`${redirectBase}/dashboard/settings?google=error&reason=config`, 302);
    }

    const redirectUri = 'https://www.cleaningpage.com/api/google/callback';

    // Exchange authorization code for tokens
    log('Exchanging code for tokens');
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.refresh_token) {
      log('Token exchange failed', { status: tokenRes.status, error: tokenData.error });
      // If no refresh_token, user might have already authorized before
      // Google only sends refresh_token on first consent
      if (tokenData.access_token && !tokenData.refresh_token) {
        return Response.redirect(`${redirectBase}/dashboard/settings?google=error&reason=no_refresh_token`, 302);
      }
      return Response.redirect(`${redirectBase}/dashboard/settings?google=error&reason=token_exchange`, 302);
    }

    log('Tokens received successfully');

    // Get user's email from Google
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userInfo = await userInfoRes.json();
    const googleEmail = userInfo.email || 'Compte Google';

    log('Google email retrieved', { email: googleEmail });

    // Store refresh token securely in centers table via service_role
    const supabase = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    const { error: updateError } = await supabase
      .from('centers')
      .update({
        google_calendar_refresh_token: tokenData.refresh_token,
        google_calendar_connected: true,
        google_calendar_email: googleEmail,
      })
      .eq('id', state);

    if (updateError) {
      log('Failed to store tokens', { error: updateError.message });
      return Response.redirect(`${redirectBase}/dashboard/settings?google=error&reason=storage`, 302);
    }

    log('Google Calendar connected successfully', { centerId: state, email: googleEmail });
    return Response.redirect(`${redirectBase}/dashboard/settings?google=success`, 302);

  } catch (err) {
    log('Unexpected error', { error: err instanceof Error ? err.message : String(err) });
    return Response.redirect('https://www.cleaningpage.com/dashboard/settings?google=error&reason=unexpected', 302);
  }
});
