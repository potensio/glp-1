import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Get user from request
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get the file from form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop();
    const fileName = `avatar-${user.id}-${Date.now()}.${fileExtension}`;

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Update user profile with new avatar URL
    await prisma.profile.update({
      where: { id: user.id },
      data: { avatarUrl: blob.url },
    });

    return NextResponse.json({
      success: true,
      avatarUrl: blob.url,
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}