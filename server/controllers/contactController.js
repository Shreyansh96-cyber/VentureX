import sendEmail from "../utils/sendEmail.js";

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "");
const normalize = (value) => typeof value === "string" ? value.trim() : "";

export const submitContactForm = async (req, res) => {
  try {
    const name = normalize(req.body?.name);
    const email = normalize(req.body?.email).toLowerCase();
    const subject = normalize(req.body?.subject);
    const message = normalize(req.body?.message);

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please complete all fields before sending your message.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (name.length > 100 || subject.length > 200 || message.length > 3000) {
      return res.status(400).json({
        success: false,
        message: "One or more fields are too long. Please shorten them and try again.",
      });
    }

    const supportEmail = process.env.SUPPORT_EMAIL || process.env.EMAIL_USER || "venturex.support@gmail.com";
    const formattedMessage = message.replace(/\r\n/g, "\n");

    await sendEmail(
      supportEmail,
      `New VentureX contact form: ${subject}`,
      `
        <div style="max-width:680px;margin:0 auto;padding:32px 24px;background:#f8fafc;border:1px solid #dbeafe;border-radius:16px;font-family:Arial,sans-serif;color:#0f172a;line-height:1.7">
          <p style="margin:0 0 12px;font-size:13px;font-weight:700;letter-spacing:2px;color:#2563eb">VENTUREX</p>
          <h2 style="margin:0 0 18px;font-size:26px;color:#0f172a">New message from ${name}</h2>
          <p style="margin:0 0 8px"><strong>From:</strong> ${email}</p>
          <p style="margin:0 0 8px"><strong>Subject:</strong> ${subject}</p>
          <div style="margin-top:20px;padding:18px 20px;border-radius:12px;background:#ffffff;border:1px solid #e2e8f0">
            <p style="margin:0;white-space:pre-wrap">${formattedMessage}</p>
          </div>
        </div>
      `,
      `New VentureX contact form message from ${name} (${email})\n\nSubject: ${subject}\n\n${formattedMessage}`
    );

    return res.status(200).json({
      success: true,
      message: "Your message has been sent successfully. Our team will get back to you soon.",
    });
  } catch (error) {
    console.error("CONTACT FORM ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "We couldn't send your message right now. Please try again later.",
    });
  }
};
