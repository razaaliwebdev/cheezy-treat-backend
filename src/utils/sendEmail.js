import { Resend } from "resend";

import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY); // use your .env

export const sendEmail = async ({ toEmail, subject, htmlContent }) => {
  // console.log("Sending email to:", toEmail);

  try {
    const { data } = await resend.emails.send({
      from: process.env.MAIL_FROM,
      to: [toEmail],
      subject,
      html: htmlContent,
    });

    // console.log("Email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.log("Email sending failed:", error);
    return { success: false, error };
  }
};
