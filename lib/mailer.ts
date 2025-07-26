import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (process.env.NODE_ENV !== "production") {
    // For local testing, just log the email content
    console.log("[DEV EMAIL] To:", to)
    console.log("[DEV EMAIL] Subject:", subject)
    console.log("[DEV EMAIL] HTML:\n", html)
    return { dev: true }
  }
  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  })
} 