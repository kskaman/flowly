import nodemailer from "nodemailer";
import { config } from "../config/index.js";

const { email } = config;

const transporter = nodemailer.createTransport({
  host: email.host,
  port: email.port,
  secure: false,
  requireTLS: email.requireTls,
  auth: email.user ? { user: email.user, pass: email.pass } : undefined,
});

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const info = await transporter.sendMail({
      from: `"Flowly" <${email.from ?? email.user}>`,
      to,
      subject,
      html,
    });
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
