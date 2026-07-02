import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendApprovalMail = async (booking, pdfBuffer) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "JamVerse Bhuj <onboarding@resend.dev>", // swap once your domain is verified
      to: booking.email,
      subject: "🎵 Your JamVerse Ticket is Confirmed!",
      html: `
        <div style="font-family:Arial;padding:40px;background:#f5f5f5">
          <div style="max-width:650px;background:white;margin:auto;padding:40px;border-radius:15px">
            <h1 style="color:#D9A441;text-align:center">JAMVERSE BHUJ</h1>
            <h2 style="text-align:center">Booking Approved ✅</h2>
            <p>Hello <b>${booking.fullName}</b>,</p>
            <p>Your booking has been approved successfully.</p>
            <p>Your event ticket is attached with this email.</p>
            <hr>
            <p><b>Booking ID:</b> ${booking.bookingId}</p>
            <p><b>Tickets:</b> ${booking.tickets}</p>
            <p><b>Date:</b> 12 July 2026</p>
            <p><b>Time:</b> 08:00 PM</p>
            <p><b>Venue:</b> HVR Ground, Bhuj</p>
            <br>
            <p>See you at JamVerse ❤️</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `JamVerse-${booking.bookingId}.pdf`,
          content: pdfBuffer, // Buffer works directly, no base64 conversion needed
        },
      ],
    });

    if (error) {
      console.error("❌ Resend Error:", error);
      return;
    }
    console.log("✅ Approval Email Sent:", data.id);
  } catch (err) {
    console.error("❌ Unexpected error:", err);
  }
};
