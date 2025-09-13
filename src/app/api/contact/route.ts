import { NextRequest } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Name, email, and message are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Please provide a valid email address" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get contact email from environment variables
    const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
    if (!contactEmail) {
      console.error("CONTACT_EMAIL environment variable not set");
      return new Response(
        JSON.stringify({ error: "Contact configuration error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@mydailyhealthjournal.com";

    // Send notification email to admin using Resend
    try {
      // Send notification to admin
      const adminEmailResult = await resend.emails.send({
        from: fromEmail,
        to: contactEmail,
        subject: `New Contact Form Submission from ${name}`,
        html: getContactNotificationTemplate(name, email, message),
      });

      // Send confirmation email to user
      const userEmailResult = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: "We've Received Your Message",
        html: getContactConfirmationTemplate(name, message),
      });

      return new Response(
        JSON.stringify({ success: true, message: "Message sent successfully" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (emailError: any) {
      console.error("Failed to send email:", emailError);
      return new Response(
        JSON.stringify({
          error: "Failed to send message. Please try again later.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error: any) {
    console.error("Contact form error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function getContactNotificationTemplate(name: string, email: string, message: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0065ff 0%, #003cbf 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px; font-weight: medium;">My Daily Health Journal</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          
          <p style="font-size: 16px; margin-bottom: 20px;"><strong>From:</strong> ${name} (${email})</p>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 10px;">Message:</h3>
            <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            This message was sent through the contact form on My Daily Health Journal.
          </p>
        </div>
      </body>
    </html>
  `;
}

function getContactConfirmationTemplate(name: string, message: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Message Received</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0065ff 0%, #003cbf 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px; font-weight: medium;">My Daily Health Journal</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
          <h2 style="color: #333;">Thank You for Your Message</h2>
          
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Thank you for contacting us. We've received your message and will get back to you within 24 hours.
          </p>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 10px;">Your Message:</h3>
            <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            In the meantime, if you have any urgent questions, please don't hesitate to reach out again.
          </p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Best regards,<br>The My Daily Health Journal Team
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
