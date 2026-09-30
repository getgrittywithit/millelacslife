import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const prerender = false;

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = import.meta.env.RESEND_API_KEY;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { email, name, source = 'website' } = data;

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase with service role key for full access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('subscribers')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      if (existing.status === 'active') {
        return new Response(
          JSON.stringify({ message: 'You are already subscribed!' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Reactivate if previously unsubscribed
      await supabase
        .from('subscribers')
        .update({ status: 'active', unsubscribed_at: null })
        .eq('id', existing.id);
    } else {
      // Insert new subscriber
      const { error: insertError } = await supabase
        .from('subscribers')
        .insert({
          email: email.toLowerCase(),
          name: name || null,
          source,
          confirmed_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to subscribe. Please try again.' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Send welcome email via Resend
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);

      try {
        await resend.emails.send({
          from: 'Mille Lacs Life <hello@millelacslife.com>',
          to: email,
          subject: 'Welcome to Mille Lacs Life!',
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #2d5a47; font-family: 'Cabin', sans-serif;">Welcome to Mille Lacs Life!</h1>
              <p>Thanks for subscribing to our weekly fishing reports and lake updates.</p>
              <p>Every Friday, you'll receive:</p>
              <ul>
                <li>Current fishing conditions and hot spots</li>
                <li>Water temperature and lake conditions</li>
                <li>Upcoming events around the lake</li>
                <li>Tips from local guides</li>
              </ul>
              <p>In the meantime, check out our <a href="https://millelacslife.com/fishing-report" style="color: #2d7d8a;">latest fishing report</a>.</p>
              <p style="margin-top: 30px; color: #666;">
                Tight lines!<br>
                The Mille Lacs Life Team
              </p>
              <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #999;">
                You're receiving this because you signed up at millelacslife.com.<br>
                <a href="https://millelacslife.com/unsubscribe?email=${encodeURIComponent(email)}" style="color: #999;">Unsubscribe</a>
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        // Log but don't fail the subscription if email fails
        console.error('Resend email error:', emailError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Successfully subscribed! Check your email for confirmation.'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Subscribe error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
