# Security Documentation

## 🎯 Overview

The PTA Management System implements comprehensive security measures to protect sensitive data, prevent unauthorized access, and ensure system integrity. This document outlines the security architecture, threat mitigation strategies, and best practices implemented throughout the application.

## 🛡️ Security Architecture

### **Multi-Layer Security Model**
```
1. Network Security (HTTPS, CORS)
2. Authentication (Supabase Auth, JWT)
3. Authorization (Role-based Access Control)
4. Database Security (Row Level Security)
5. Application Security (Input Validation, CSRF Protection)
6. Data Protection (Encryption, Secure Storage)
```

### **Security Components**
- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Role-based access control (RBAC)
- **Database Security**: Row Level Security (RLS) policies
- **Network Security**: HTTPS, CORS, CSP headers
- **Input Validation**: Server-side validation with Zod
- **Session Management**: Secure session handling
- **Error Handling**: Secure error reporting

## 🔐 Authentication Security

### **Password Security**

#### **Password Requirements**
```typescript
export const passwordPolicy = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
  preventCommonPasswords: true,
  preventUserInfoInPassword: true,
};

export function validatePassword(password: string, userInfo?: {
  email?: string;
  name?: string;
}): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} {
  const errors: string[] = [];
  let score = 0;

  // Length check
  if (password.length < passwordPolicy.minLength) {
    errors.push(`Password must be at least ${passwordPolicy.minLength} characters long`);
  } else if (password.length >= 12) {
    score += 2;
  } else {
    score += 1;
  }

  // Character requirements
  if (passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (/[A-Z]/.test(password)) {
    score += 1;
  }

  if (passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (/[a-z]/.test(password)) {
    score += 1;
  }

  if (passwordPolicy.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else if (/\d/.test(password)) {
    score += 1;
  }

  if (passwordPolicy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  }

  // Common password check
  if (passwordPolicy.preventCommonPasswords && isCommonPassword(password)) {
    errors.push('Password is too common. Please choose a more unique password');
  }

  // User info in password check
  if (passwordPolicy.preventUserInfoInPassword && userInfo) {
    if (userInfo.email && password.toLowerCase().includes(userInfo.email.split('@')[0].toLowerCase())) {
      errors.push('Password should not contain your email address');
    }
    if (userInfo.name && password.toLowerCase().includes(userInfo.name.toLowerCase())) {
      errors.push('Password should not contain your name');
    }
  }

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 5) strength = 'strong';
  else if (score >= 3) strength = 'medium';

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

// Common passwords list (subset)
const commonPasswords = new Set([
  'password', '123456', '123456789', 'qwerty', 'abc123',
  'password123', 'admin', 'letmein', 'welcome', 'monkey',
  // Add more common passwords
]);

function isCommonPassword(password: string): boolean {
  return commonPasswords.has(password.toLowerCase());
}
```

#### **Password Hashing and Storage**
```typescript
// Supabase handles password hashing automatically
// But for additional security measures:

export class PasswordSecurity {
  // Generate secure random password
  static generateSecurePassword(length: number = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one character from each required set
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
    
    // Fill remaining length
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  // Check for password breaches (implement with HaveIBeenPwned API)
  static async checkPasswordBreach(password: string): Promise<boolean> {
    try {
      const crypto = require('crypto');
      const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
      const prefix = sha1.substring(0, 5);
      const suffix = sha1.substring(5);

      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const data = await response.text();
      
      return data.includes(suffix);
    } catch (error) {
      console.error('Error checking password breach:', error);
      return false; // Fail open for availability
    }
  }
}
```

### **Multi-Factor Authentication (MFA)**
```typescript
// MFA implementation with TOTP
export class MFAService {
  // Generate MFA secret for user
  static generateMFASecret(): {
    secret: string;
    qrCode: string;
    backupCodes: string[];
  } {
    const secret = this.generateBase32Secret();
    const qrCode = this.generateQRCode(secret);
    const backupCodes = this.generateBackupCodes();

    return { secret, qrCode, backupCodes };
  }

  // Verify TOTP code
  static verifyTOTP(secret: string, token: string): boolean {
    const speakeasy = require('speakeasy');
    
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps (60 seconds) tolerance
    });
  }

  // Generate backup codes
  private static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  }

  private static generateBase32Secret(): string {
    const speakeasy = require('speakeasy');
    return speakeasy.generateSecret({
      name: 'PTA Management System',
      issuer: 'Vel Elementary School',
    }).base32;
  }

  private static generateQRCode(secret: string): string {
    const QRCode = require('qrcode');
    const otpauth = `otpauth://totp/PTA%20Management%20System?secret=${secret}&issuer=Vel%20Elementary%20School`;
    return QRCode.toDataURL(otpauth);
  }
}
```

## 🔒 Authorization Security

### **Role-Based Access Control (RBAC)**

#### **Permission Matrix**
```typescript
export const permissions = {
  // Member management
  'members:read': ['admin', 'treasurer', 'teacher'],
  'members:create': ['admin'],
  'members:update': ['admin'],
  'members:delete': ['admin'],
  'members:read_own': ['admin', 'treasurer', 'teacher', 'parent'],
  'members:update_own': ['admin', 'treasurer', 'teacher', 'parent'],

  // Student management
  'students:read': ['admin', 'teacher'],
  'students:create': ['admin', 'teacher'],
  'students:update': ['admin', 'teacher'],
  'students:delete': ['admin'],
  'students:read_own_children': ['parent'],

  // Financial management
  'finance:read': ['admin', 'treasurer'],
  'finance:create': ['admin', 'treasurer'],
  'finance:update': ['admin', 'treasurer'],
  'finance:delete': ['admin'],

  // Reports
  'reports:read': ['admin', 'treasurer', 'teacher'],
  'reports:financial': ['admin', 'treasurer'],

  // System administration
  'system:admin': ['admin'],
  'system:backup': ['admin'],
  'system:logs': ['admin'],
} as const;

export type Permission = keyof typeof permissions;
export type Role = 'admin' | 'treasurer' | 'teacher' | 'parent';

export class AuthorizationService {
  // Check if user has permission
  static hasPermission(userRole: Role, permission: Permission): boolean {
    const allowedRoles = permissions[permission];
    return allowedRoles.includes(userRole);
  }

  // Check multiple permissions
  static hasAnyPermission(userRole: Role, permissionList: Permission[]): boolean {
    return permissionList.some(permission => this.hasPermission(userRole, permission));
  }

  // Check all permissions
  static hasAllPermissions(userRole: Role, permissionList: Permission[]): boolean {
    return permissionList.every(permission => this.hasPermission(userRole, permission));
  }

  // Get user permissions
  static getUserPermissions(userRole: Role): Permission[] {
    return Object.keys(permissions).filter(permission => 
      this.hasPermission(userRole, permission as Permission)
    ) as Permission[];
  }
}

// Permission decorator for API routes
export function requirePermission(permission: Permission) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const request = args[0] as NextRequest;
      
      // Get user from session
      const user = await getCurrentUser(request);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Get user role
      const userRole = await getUserRole(user.id);
      if (!userRole) {
        return NextResponse.json({ error: 'User role not found' }, { status: 403 });
      }

      // Check permission
      if (!AuthorizationService.hasPermission(userRole, permission)) {
        return NextResponse.json({ 
          error: 'Insufficient permissions',
          required: permission,
          userRole 
        }, { status: 403 });
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
```

### **Resource-Level Authorization**
```typescript
// Resource ownership checks
export class ResourceAuthorizationService {
  // Check if user owns resource
  static async canAccessResource(
    userId: string,
    resourceType: 'student' | 'member' | 'income' | 'expense',
    resourceId: string
  ): Promise<boolean> {
    const userRole = await getUserRole(userId);
    
    switch (resourceType) {
      case 'student':
        return this.canAccessStudent(userId, userRole, resourceId);
      case 'member':
        return this.canAccessMember(userId, userRole, resourceId);
      case 'income':
      case 'expense':
        return this.canAccessFinancialRecord(userId, userRole);
      default:
        return false;
    }
  }

  private static async canAccessStudent(
    userId: string,
    userRole: Role,
    studentId: string
  ): Promise<boolean> {
    // Admins and teachers can access all students
    if (['admin', 'teacher'].includes(userRole)) {
      return true;
    }

    // Parents can only access their own children
    if (userRole === 'parent') {
      const { data } = await supabase
        .from('ptaVOID_students')
        .select('parent_id')
        .eq('id', studentId)
        .single();
      
      return data?.parent_id === userId;
    }

    return false;
  }

  private static async canAccessMember(
    userId: string,
    userRole: Role,
    memberId: string
  ): Promise<boolean> {
    // Users can always access their own record
    if (userId === memberId) {
      return true;
    }

    // Admins can access all member records
    return userRole === 'admin';
  }

  private static canAccessFinancialRecord(
    userId: string,
    userRole: Role
  ): boolean {
    // Only admins and treasurers can access financial records
    return ['admin', 'treasurer'].includes(userRole);
  }
}
```

## 🌐 Network Security

### **HTTPS and Security Headers**
```typescript
// Security headers middleware
export function securityHeaders(request: NextRequest) {
  const response = NextResponse.next();

  // Strict Transport Security
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
    ].join('; ')
  );

  // X-Frame-Options
  response.headers.set('X-Frame-Options', 'DENY');

  // X-Content-Type-Options
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  return response;
}
```

### **CORS Configuration**
```typescript
// CORS configuration
export const corsConfig = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com', 'https://www.yourdomain.com']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
};

export function handleCORS(request: NextRequest) {
  const origin = request.headers.get('origin');
  const response = NextResponse.next();

  // Check if origin is allowed
  if (origin && corsConfig.origin.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    response.headers.set('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
    response.headers.set('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
    response.headers.set('Access-Control-Max-Age', corsConfig.maxAge.toString());
    
    return new NextResponse(null, { status: 200, headers: response.headers });
  }

  return response;
}
```

## 🛡️ Input Validation and Sanitization

### **Server-Side Validation**
```typescript
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Input validation schemas
export const validationSchemas = {
  // Member validation
  member: z.object({
    email: z.string().email('Invalid email format').max(255),
    full_name: z.string().min(1, 'Name is required').max(255),
    role: z.enum(['admin', 'treasurer', 'teacher', 'parent']),
    phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone format').optional(),
    address: z.string().max(500).optional(),
  }),

  // Student validation
  student: z.object({
    student_id: z.string().min(1, 'Student ID is required').max(50),
    full_name: z.string().min(1, 'Name is required').max(255),
    grade_level: z.string().min(1, 'Grade level is required').max(20),
    section: z.string().min(1, 'Section is required').max(10),
    parent_id: z.string().uuid('Invalid parent ID').optional(),
  }),

  // Financial record validation
  financial: z.object({
    description: z.string().min(1, 'Description is required').max(1000),
    amount: z.number().positive('Amount must be positive').max(999999.99),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    category: z.string().min(1, 'Category is required').max(100),
  }),

  // Login validation
  login: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
};

// Input sanitization
export class InputSanitizer {
  // Sanitize HTML content
  static sanitizeHTML(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: [],
    });
  }

  // Sanitize SQL input (prevent SQL injection)
  static sanitizeSQL(input: string): string {
    return input.replace(/['";\\]/g, '');
  }

  // Sanitize file names
  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 255);
  }

  // Sanitize user input for display
  static sanitizeForDisplay(input: string): string {
    return this.sanitizeHTML(input.trim());
  }

  // Validate and sanitize object
  static validateAndSanitize<T>(
    data: unknown,
    schema: z.ZodSchema<T>
  ): { success: true; data: T } | { success: false; errors: string[] } {
    try {
      // First validate structure
      const validatedData = schema.parse(data);

      // Then sanitize string fields
      const sanitizedData = this.sanitizeObject(validatedData);

      return { success: true, data: sanitizedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
        };
      }
      return { success: false, errors: ['Validation failed'] };
    }
  }

  private static sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeForDisplay(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  }
}
```

### **CSRF Protection**
```typescript
// CSRF token management
export class CSRFProtection {
  private static tokens = new Map<string, { token: string; expires: number }>();

  // Generate CSRF token
  static generateToken(sessionId: string): string {
    const token = crypto.randomUUID();
    const expires = Date.now() + (60 * 60 * 1000); // 1 hour

    this.tokens.set(sessionId, { token, expires });
    
    // Clean up expired tokens
    this.cleanupExpiredTokens();
    
    return token;
  }

  // Validate CSRF token
  static validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId);
    
    if (!stored) {
      return false;
    }

    if (Date.now() > stored.expires) {
      this.tokens.delete(sessionId);
      return false;
    }

    return stored.token === token;
  }

  // Clean up expired tokens
  private static cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [sessionId, data] of this.tokens.entries()) {
      if (now > data.expires) {
        this.tokens.delete(sessionId);
      }
    }
  }

  // Middleware for CSRF protection
  static middleware(request: NextRequest): NextResponse | null {
    // Skip CSRF for GET requests
    if (request.method === 'GET') {
      return null;
    }

    const sessionId = request.cookies.get('session-id')?.value;
    const csrfToken = request.headers.get('x-csrf-token');

    if (!sessionId || !csrfToken) {
      return NextResponse.json(
        { error: 'CSRF token missing' },
        { status: 403 }
      );
    }

    if (!this.validateToken(sessionId, csrfToken)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    return null; // Continue processing
  }
}
```

## 🔐 Data Protection

### **Encryption at Rest**
```typescript
// Data encryption utilities
export class DataEncryption {
  private static readonly algorithm = 'aes-256-gcm';
  private static readonly keyLength = 32;
  private static readonly ivLength = 16;

  // Encrypt sensitive data
  static encrypt(text: string, key: string): {
    encrypted: string;
    iv: string;
    tag: string;
  } {
    const crypto = require('crypto');
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipher(this.algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  }

  // Decrypt sensitive data
  static decrypt(encryptedData: {
    encrypted: string;
    iv: string;
    tag: string;
  }, key: string): string {
    const crypto = require('crypto');
    const decipher = crypto.createDecipher(
      this.algorithm,
      key,
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Hash sensitive data (one-way)
  static hash(data: string, salt?: string): string {
    const crypto = require('crypto');
    const actualSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(data, actualSalt, 10000, 64, 'sha512');
    return `${actualSalt}:${hash.toString('hex')}`;
  }

  // Verify hashed data
  static verifyHash(data: string, hashedData: string): boolean {
    const [salt, hash] = hashedData.split(':');
    const newHash = this.hash(data, salt);
    return newHash === hashedData;
  }
}

// PII (Personally Identifiable Information) protection
export class PIIProtection {
  // Mask sensitive data for logging
  static maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    const maskedUsername = username.length > 2 
      ? `${username[0]}${'*'.repeat(username.length - 2)}${username[username.length - 1]}`
      : '*'.repeat(username.length);
    return `${maskedUsername}@${domain}`;
  }

  static maskPhone(phone: string): string {
    return phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
  }

  static maskName(name: string): string {
    const parts = name.split(' ');
    return parts.map(part => 
      part.length > 1 ? `${part[0]}${'*'.repeat(part.length - 1)}` : part
    ).join(' ');
  }

  // Remove PII from logs
  static sanitizeForLogging(data: any): any {
    if (typeof data === 'string') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeForLogging(item));
    }

    if (data && typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (this.isPIIField(key)) {
          sanitized[key] = this.maskPIIValue(key, value as string);
        } else {
          sanitized[key] = this.sanitizeForLogging(value);
        }
      }
      return sanitized;
    }

    return data;
  }

  private static isPIIField(fieldName: string): boolean {
    const piiFields = ['email', 'phone', 'address', 'full_name', 'name'];
    return piiFields.some(field => 
      fieldName.toLowerCase().includes(field.toLowerCase())
    );
  }

  private static maskPIIValue(fieldName: string, value: string): string {
    if (fieldName.toLowerCase().includes('email')) {
      return this.maskEmail(value);
    }
    if (fieldName.toLowerCase().includes('phone')) {
      return this.maskPhone(value);
    }
    if (fieldName.toLowerCase().includes('name')) {
      return this.maskName(value);
    }
    return '***MASKED***';
  }
}
```

## 🚨 Security Monitoring

### **Security Event Logging**
```typescript
// Security event logging
export class SecurityLogger {
  private static logQueue: SecurityEvent[] = [];

  static logSecurityEvent(event: SecurityEvent): void {
    event.timestamp = new Date().toISOString();
    event.id = crypto.randomUUID();
    
    this.logQueue.push(event);
    
    // Process immediately for critical events
    if (event.severity === 'critical') {
      this.processEvent(event);
    }
    
    // Batch process other events
    if (this.logQueue.length >= 10) {
      this.processBatch();
    }
  }

  private static async processEvent(event: SecurityEvent): Promise<void> {
    try {
      // Log to database
      await this.logToDatabase(event);
      
      // Send alerts for critical events
      if (event.severity === 'critical') {
        await this.sendSecurityAlert(event);
      }
      
      // Log to external security service
      if (process.env.NODE_ENV === 'production') {
        await this.logToExternalService(event);
      }
    } catch (error) {
      console.error('Failed to process security event:', error);
    }
  }

  private static async processBatch(): Promise<void> {
    const batch = [...this.logQueue];
    this.logQueue = [];
    
    for (const event of batch) {
      await this.processEvent(event);
    }
  }

  private static async logToDatabase(event: SecurityEvent): Promise<void> {
    // Implementation would log to security_events table
    console.log('Security Event:', PIIProtection.sanitizeForLogging(event));
  }

  private static async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    // Implementation would send email/SMS alerts to administrators
    console.warn('CRITICAL SECURITY EVENT:', event.type, event.description);
  }

  private static async logToExternalService(event: SecurityEvent): Promise<void> {
    // Implementation would send to external SIEM or security service
  }
}

interface SecurityEvent {
  id?: string;
  type: 'authentication' | 'authorization' | 'data_access' | 'system' | 'network';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

// Usage examples
export function logFailedLogin(email: string, ipAddress: string): void {
  SecurityLogger.logSecurityEvent({
    type: 'authentication',
    severity: 'medium',
    description: 'Failed login attempt',
    userId: email,
    ipAddress,
    action: 'login_failed',
  });
}

export function logUnauthorizedAccess(userId: string, resource: string): void {
  SecurityLogger.logSecurityEvent({
    type: 'authorization',
    severity: 'high',
    description: 'Unauthorized access attempt',
    userId,
    resource,
    action: 'access_denied',
  });
}

export function logDataAccess(userId: string, resource: