import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthRepository, authRepository } from "@/lib/repositories/auth.repository";
import { User, Role } from "@/types/prisma-enums";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d"; // 7 days

export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthToken = {
  token: string;
  expiresAt: Date;
};

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    staffNumber: string;
  } | null;
};

export type LoginResponse = {
  user: AuthUser;
  token: AuthToken;
};

export class AuthService {
  private repository: AuthRepository;

  constructor(repository: AuthRepository = authRepository) {
    this.repository = repository;
  }

  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { email, password } = credentials;

    // Find user by email
    const user = await this.repository.findUserByEmail(email);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error("Account is inactive. Please contact administrator.");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Update last login
    await this.repository.updateLastLogin(user.id);

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile
          ? {
              id: user.profile.id,
              firstName: user.profile.firstName,
              lastName: user.profile.lastName,
              staffNumber: user.profile.staffNumber,
            }
          : null,
      },
      token: {
        token,
        expiresAt: this.getTokenExpirationDate(),
      },
    };
  }

  /**
   * Verify JWT token and return user
   */
  async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      // Verify and decode token
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
        role: Role;
      };

      // Check if user still exists and is active
      const user = await this.repository.findUserById(decoded.userId);

      if (!user || !user.isActive) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile
          ? {
              id: user.profile.id,
              firstName: user.profile.firstName,
              lastName: user.profile.lastName,
              staffNumber: user.profile.staffNumber,
            }
          : null,
      };
    } catch (error) {
      // Token is invalid or expired
      return null;
    }
  }

  /**
   * Generate JWT token for user
   */
  private generateToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );
  }

  /**
   * Get token expiration date
   */
  private getTokenExpirationDate(): Date {
    const expiresIn = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    return new Date(Date.now() + expiresIn);
  }

  /**
   * Hash password
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return { valid: false, message: "Password must be at least 8 characters long" };
    }

    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: "Password must contain at least one uppercase letter" };
    }

    if (!/[a-z]/.test(password)) {
      return { valid: false, message: "Password must contain at least one lowercase letter" };
    }

    if (!/[0-9]/.test(password)) {
      return { valid: false, message: "Password must contain at least one number" };
    }

    if (!/[!@#$%^&*]/.test(password)) {
      return { valid: false, message: "Password must contain at least one special character (!@#$%^&*)" };
    }

    return { valid: true };
  }
}

export const authService = new AuthService();
