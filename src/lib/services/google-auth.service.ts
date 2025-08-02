import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

export class GoogleAuthService {
  private oauth2Client: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      }/api/google/callback`
    );
  }

  /**
   * Generate Google OAuth URL for user authentication
   */
  generateAuthUrl(userId: string): string {
    const scopes = [
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      state: userId,
      prompt: "consent",
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string) {
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return credentials;
  }

  /**
   * Get authenticated OAuth2 client for a user
   */
  async getAuthenticatedClient(userId: string) {
    const integration = await prisma.googleIntegration.findUnique({
      where: { userId },
    });

    if (!integration || !integration.isActive) {
      throw new Error("Google Calendar not connected");
    }

    // Check if token is expired and refresh if needed
    if (new Date() > integration.tokenExpiry) {
      try {
        const newTokens = await this.refreshAccessToken(
          integration.refreshToken
        );

        // Update tokens in database
        await prisma.googleIntegration.update({
          where: { userId },
          data: {
            accessToken: newTokens.access_token!,
            tokenExpiry: new Date(
              newTokens.expiry_date || Date.now() + 3600000
            ),
            updatedAt: new Date(),
          },
        });

        this.oauth2Client.setCredentials({
          access_token: newTokens.access_token,
          refresh_token: integration.refreshToken,
        });
      } catch (error) {
        // If refresh fails, mark integration as inactive
        await prisma.googleIntegration.update({
          where: { userId },
          data: { isActive: false },
        });
        throw new Error("Failed to refresh Google token. Please reconnect.");
      }
    } else {
      this.oauth2Client.setCredentials({
        access_token: integration.accessToken,
        refresh_token: integration.refreshToken,
      });
    }

    return this.oauth2Client;
  }

  /**
   * Revoke Google access and clean up
   */
  async revokeAccess(userId: string) {
    const integration = await prisma.googleIntegration.findUnique({
      where: { userId },
    });

    if (integration) {
      try {
        // Revoke the token with Google
        this.oauth2Client.setCredentials({
          access_token: integration.accessToken,
        });
        await this.oauth2Client.revokeCredentials();
      } catch (error) {
        console.error("Failed to revoke Google credentials:", error);
        // Continue with local cleanup even if revocation fails
      }

      // Delete from database
      await prisma.googleIntegration.delete({
        where: { userId },
      });
    }
  }
}

export const googleAuthService = new GoogleAuthService();
