import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  private static instance: EmailService;
  private fromEmail: string;
  private appUrl: string;

  private constructor() {
    this.fromEmail =
      process.env.RESEND_FROM_EMAIL || "noreply@mydailyhealthjournal.com";
    this.appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.appUrl}/reset-password?token=${token}`;

    try {
      const result = await resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: "Reset Your Password - My Daily Health Journal",
        html: this.getPasswordResetEmailTemplate(resetUrl),
      });
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      throw new Error("Failed to send password reset email");
    }
  }

  private getPasswordResetEmailTemplate(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>My Daily Health Journal</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0065ff 0%, #003cbf 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 20px; font-weight: medium;">My Daily Health Journal</h1>
          </div>
          
          <div style="background: #f9f9f9; font-color: #333; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              We received a request to reset your password for your GLP-1 Health Tracker account. 
              If you didn't make this request, you can safely ignore this email.
            </p>
            
            <p style="font-size: 16px; margin-bottom: 30px;">
              To reset your password, click the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #0065ff 0%, #003cbf 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-weight: medium; 
                        font-size: 16px; 
                        display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="margin-top: 30px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="font-size: 14px; color: #666; word-break: break-all;">
              ${resetUrl}
            </p>
            
            <p style="margin-top: 30px;">
              This link will expire in 1 hour for security reasons.
            </p>
            
          </div>

          <p style="font-size: 14px; color: #999; text-align: center;">
              If you have any questions, please contact our support team.
            </p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="font-size: 12px; color: #999; text-align: center;">
              &copy; 2025 My Daily Health Journal. All rights reserved.
            </p>

                <p style="font-size: 12px; color: #999; text-align: center;">
             Track weight, blood pressure, blood sugar, medications, and more — designed for GLP‑1 users, diabetics, and anyone committed to better health.
            </p>
        </body>
      </html>
    `;
  }
}

export const emailService = EmailService.getInstance();
