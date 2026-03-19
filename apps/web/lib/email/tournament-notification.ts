/**
 * Tournament email notification via Resend.
 * Sends to all registered team contacts for a tournament.
 */

interface SendTournamentEmailParams {
  tournamentName: string;
  title: string;
  body: string;
  recipientEmails: string[];
}

export async function sendTournamentEmail({
  tournamentName,
  title,
  body,
  recipientEmails,
}: SendTournamentEmailParams): Promise<{ success: boolean; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn("RESEND_API_KEY not set — skipping email notification");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  if (recipientEmails.length === 0) {
    return { success: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "RepMax Tournaments <tournaments@repmax.io>",
        to: recipientEmails,
        subject: `[${tournamentName}] ${title}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <div style="background: #D4AF37; padding: 16px 24px; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #000; font-size: 18px; font-weight: 800;">RepMax Tournament Update</h1>
            </div>
            <div style="background: #141414; padding: 24px; border: 1px solid #333; border-top: 0; border-radius: 0 0 12px 12px;">
              <p style="color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0;">${tournamentName}</p>
              <h2 style="color: #fff; font-size: 20px; margin: 0 0 16px 0;">${title}</h2>
              <p style="color: #ccc; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${body}</p>
              <hr style="border: none; border-top: 1px solid #333; margin: 24px 0;" />
              <p style="color: #666; font-size: 11px; margin: 0;">Sent via <a href="https://repmax.io" style="color: #D4AF37;">RepMax</a></p>
            </div>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      console.error("Resend API error:", errData);
      return { success: false, error: errData.message || "Email send failed" };
    }

    return { success: true };
  } catch (err) {
    console.error("Email send error:", err);
    return { success: false, error: "Email send failed" };
  }
}
