import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOTP = async (to: string, code: string) => {
  try {
    await transporter.sendMail({
      from: `"EduSphere Security" <${process.env.SMTP_USER}>`,
      to,
      subject: "Your Login Security Code",
      text: `Your security code is: ${code}\n\nThis code expires in 60 seconds.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333;">Login Attempt Detected</h2>
          <p style="color: #555;">We detected a new sign-in attempt to your EduSphere account. Use the following code to verify your device:</p>
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="margin: 0; font-size: 32px; letter-spacing: 5px; color: #2563eb;">${code}</h1>
          </div>
          <p style="color: #555; font-size: 12px;">This code expires in 60 seconds.</p>
        </div>
      `,
    });
    console.log(`✅ OTP Email sent successfully to ${to}`);
  } catch (error) {
    console.error("==========================================");
    console.error("⚠️  Failed to send OTP email via Brevo SMTP");
    console.error(`⚠️  Reason: ${(error as any).response || (error as Error).message}`);
    console.error("⚠️  DEVELOPMENT MODE: Since the email failed, here is your code:");
    console.error(`🔑  SECURITY CODE FOR ${to}: ${code}`);
    console.error("==========================================");
    // We do NOT throw here so that the UI can still show the verification screen!
  }
};
