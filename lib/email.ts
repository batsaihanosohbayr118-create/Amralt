import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM ?? "Amralt.mn <onboarding@resend.dev>";

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  if (!resend) {
    console.log(`[email] RESEND_API_KEY тохируулаагүй тул илгээгдсэнгүй: ${email} -> ${resetUrl}`);
    return;
  }

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Amralt.mn — Нууц үг сэргээх",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #0f7a4f;">Нууц үг сэргээх хүсэлт</h2>
        <p>Та Amralt.mn дээрх нууц үгээ сэргээх хүсэлт илгээсэн байна. Доорх товч дээр дарж шинэ нууц үгээ тохируулна уу.</p>
        <p style="margin: 32px 0;">
          <a href="${resetUrl}" style="background: #0f7a4f; color: #fff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600;">
            Нууц үг сэргээх
          </a>
        </p>
        <p style="color: #666; font-size: 13px;">Энэ холбоос 1 цагийн дараа хүчингүй болно. Хэрэв та энэ хүсэлтийг илгээгээгүй бол энэ имэйлийг үл тоомсорлоно уу.</p>
      </div>
    `,
  });
}
