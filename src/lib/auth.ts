import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

interface CustomJWTPayload {
  userId: string;
  email: string;
}

// Hash password using bcrypt
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Verify password against hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
export async function generateToken(payload: CustomJWTPayload): Promise<string> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  
  const secretKey = new TextEncoder().encode(secret);
  
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secretKey);
}

// Verify JWT token
export async function verifyToken(token: string): Promise<CustomJWTPayload> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as CustomJWTPayload;
  } catch {
    throw new Error('Invalid or expired token');
  }
}

// Get user from request (either from Authorization header or cookie)
export async function getUserFromRequest(request: NextRequest) {
  let token: string | undefined;

  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // If no token in header, try to get from cookie
  if (!token) {
    token = request.cookies.get('auth-token')?.value;
  }

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  } catch {
    return null;
  }
}

// Get user with profile
export async function getUserWithProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      profile: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
}

// Validate email format
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
export function validatePassword(password: string): boolean {
  // At least 8 characters, 1 lowercase, 1 uppercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}