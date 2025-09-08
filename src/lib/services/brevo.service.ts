import { z } from "zod";

// Brevo API types
interface BrevoContact {
  email: string;
  attributes?: Record<string, any>;
  listIds?: number[];
  updateEnabled?: boolean;
}

interface BrevoResponse {
  id?: number;
  message?: string;
}

interface BrevoEmailRequest {
  templateId: number;
  to: Array<{
    email: string;
    name?: string;
  }>;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

interface BrevoEmailResponse {
  messageId: string;
}

// Validation schema for Brevo contact
const brevoContactSchema = z.object({
  email: z.string().email(),
  attributes: z.record(z.string(), z.any()).optional(),
  listIds: z.array(z.number()).optional(),
});

// Validation schema for email sending
const brevoEmailSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  params: z.record(z.string(), z.any()).optional(),
});

export class BrevoService {
  private static apiKey = process.env.BREVO_API_KEY;
  private static waitlistId = process.env.BREVO_WAITLIST_ID;
  private static baseUrl = "https://api.brevo.com/v3";

  private static getHeaders() {
    if (!this.apiKey) {
      throw new Error("BREVO_API_KEY environment variable is not set");
    }

    return {
      "Content-Type": "application/json",
      "api-key": this.apiKey,
    };
  }

  /**
   * Add a contact to Brevo email list
   * This method is designed to be non-blocking - it won't throw errors that would break the main flow
   */
  static async addContactToList(
    email: string,
    attributes: Record<string, any> = {}
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate input
      const validatedData = brevoContactSchema.parse({
        email,
        attributes,
        listIds: this.waitlistId ? [parseInt(this.waitlistId)] : undefined,
      });

      // Skip if API key or waitlist ID not configured
      if (!this.apiKey || !this.waitlistId) {
        console.warn(
          "Brevo API key or waitlist ID not configured. Skipping email list addition."
        );
        return { success: false, error: "Brevo not configured" };
      }

      const contact: BrevoContact = {
        email: validatedData.email.toLowerCase().trim(),
        attributes: {
          SIGNUP_DATE: new Date().toISOString(),
          SOURCE: "waitlist",
          ...validatedData.attributes,
        },
        listIds: validatedData.listIds,
        updateEnabled: true, // Update contact if already exists
      };

      const response = await fetch(`${this.baseUrl}/contacts`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(contact),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific Brevo errors gracefully
        if (
          response.status === 400 &&
          errorData.code === "duplicate_parameter"
        ) {
          // Contact already exists - this is okay
          console.log(`Contact ${email} already exists in Brevo list`);
          return { success: true };
        }

        throw new Error(
          `Brevo API error: ${response.status} - ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const result: BrevoResponse = await response.json();
      console.log(
        `Successfully added ${email} to Brevo list (ID: ${result.id})`
      );

      return { success: true };
    } catch (error: any) {
      // Log error but don't throw - we want waitlist signup to succeed even if Brevo fails
      console.error("Failed to add contact to Brevo:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove a contact from Brevo email list
   */
  static async removeContactFromList(
    email: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: "Brevo not configured" };
      }

      const response = await fetch(
        `${this.baseUrl}/contacts/${encodeURIComponent(email)}`,
        {
          method: "DELETE",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok && response.status !== 404) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Brevo API error: ${response.status} - ${
            errorData.message || "Unknown error"
          }`
        );
      }

      console.log(`Successfully removed ${email} from Brevo`);
      return { success: true };
    } catch (error: any) {
      console.error("Failed to remove contact from Brevo:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get contact information from Brevo
   */
  static async getContact(
    email: string
  ): Promise<{ success: boolean; contact?: any; error?: string }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: "Brevo not configured" };
      }

      const response = await fetch(
        `${this.baseUrl}/contacts/${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      if (response.status === 404) {
        return { success: true, contact: null };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Brevo API error: ${response.status} - ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const contact = await response.json();
      return { success: true, contact };
    } catch (error: any) {
      console.error("Failed to get contact from Brevo:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send transactional email using Brevo template
   * This method sends welcome email when user joins waitlist
   */
  static async sendWaitlistWelcomeEmail(
    email: string,
    name?: string,
    params: Record<string, any> = {}
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Validate input
      const validatedData = brevoEmailSchema.parse({
        email,
        name,
        params,
      });

      // Skip if API key not configured
      if (!this.apiKey) {
        console.warn(
          "Brevo API key not configured. Skipping welcome email."
        );
        return { success: false, error: "Brevo not configured" };
      }

      const emailRequest: BrevoEmailRequest = {
        templateId: 1, // Template ID yang sudah dibuat di Brevo
        to: [
          {
            email: validatedData.email.toLowerCase().trim(),
            name: validatedData.name || validatedData.email.split('@')[0],
          },
        ],
        params: {
          // Default parameters yang bisa digunakan di template
          EMAIL: validatedData.email,
          NAME: validatedData.name || validatedData.email.split('@')[0],
          SIGNUP_DATE: new Date().toLocaleDateString('id-ID'),
          ...validatedData.params,
        },
        headers: {
          'X-Mailin-custom': 'waitlist_welcome|' + new Date().toISOString(),
        },
      };

      const response = await fetch(`${this.baseUrl}/smtp/email`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(emailRequest),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Brevo email API error: ${response.status} - ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const result: BrevoEmailResponse = await response.json();
      console.log(
        `Successfully sent welcome email to ${email} (Message ID: ${result.messageId})`
      );

      return { success: true, messageId: result.messageId };
    } catch (error: any) {
      // Log error but don't throw - we want waitlist signup to succeed even if email fails
      console.error("Failed to send welcome email via Brevo:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test Brevo API connection
   */
  static async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.apiKey) {
        return { success: false, error: "BREVO_API_KEY not configured" };
      }

      const response = await fetch(`${this.baseUrl}/account`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Brevo API error: ${response.status} - ${
            errorData.message || "Unknown error"
          }`
        );
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
