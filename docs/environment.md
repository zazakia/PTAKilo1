# Environment Configuration Documentation

## 🎯 Overview

The PTA Management System implements robust environment configuration management with runtime validation, type safety, and development-friendly error reporting. This document outlines the configuration system, environment variables, and setup procedures.

## 🔧 Configuration Architecture

### **Configuration Files Structure**
```
├── .env.local                    # Local development environment
├── .env.example                  # Environment template
├── src/lib/config.ts            # Configuration validation and exports
└── docs/environment.md          # This documentation
```

### **Configuration Flow**
```
Environment Variables → Zod Validation → Type-Safe Config → Application
```

## 📋 Environment Variables

### **Required Environment Variables**

#### **Supabase Configuration**
```bash
# Supabase Database Connection
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase Service Role (Server-side only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### **Application Configuration**
```bash
# Application Environment
NODE_ENV=development|production|test

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Application Settings
APP_NAME="PTA Management System"
APP_VERSION=1.0.0
```

### **Optional Environment Variables**

#### **Development Tools**
```bash
# Development debugging
DEBUG=true
VERBOSE_LOGGING=true

# Performance monitoring
ENABLE_PERFORMANCE_MONITORING=true
PERFORMANCE_THRESHOLD_MS=1000

# Error reporting
SENTRY_DSN=your-sentry-dsn
ERROR_REPORTING_ENABLED=true
```

#### **Feature Flags**
```bash
# Feature toggles
ENABLE_ANALYTICS=false
ENABLE_NOTIFICATIONS=true
ENABLE_DARK_MODE=true
MAINTENANCE_MODE=false
```

#### **Security Configuration**
```bash
# CORS settings
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Rate limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=100
RATE_LIMIT_ENABLED=true

# Session configuration
SESSION_TIMEOUT_MINUTES=60
SECURE_COOKIES=true
```

## 🛡️ Configuration Validation

### **File**: [`src/lib/config.ts`](../src/lib/config.ts)

### **Zod Schema Validation**
```typescript
import { z } from 'zod';

// Environment schema with validation rules
const envSchema = z.object({
  // Supabase configuration
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url('Invalid Supabase URL format')
    .refine(
      (url) => url.includes('supabase.co'),
      'Supabase URL must be from supabase.co domain'
    ),
  
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'Supabase anonymous key is required')
    .refine(
      (key) => key.startsWith('eyJ'),
      'Invalid Supabase anonymous key format'
    ),
  
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, 'Supabase service role key is required')
    .refine(
      (key) => key.startsWith('eyJ'),
      'Invalid Supabase service role key format'
    ),

  // Application configuration
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  
  NEXTAUTH_URL: z
    .string()
    .url('Invalid NextAuth URL format')
    .default('http://localhost:3000'),
  
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NextAuth secret must be at least 32 characters')
    .optional(),

  // Application metadata
  APP_NAME: z
    .string()
    .default('PTA Management System'),
  
  APP_VERSION: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/, 'Version must follow semantic versioning (x.y.z)')
    .default('1.0.0'),

  // Development settings
  DEBUG: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  
  VERBOSE_LOGGING: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),

  // Performance monitoring
  ENABLE_PERFORMANCE_MONITORING: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  
  PERFORMANCE_THRESHOLD_MS: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, 'Performance threshold must be positive')
    .default('1000'),

  // Error reporting
  SENTRY_DSN: z
    .string()
    .url('Invalid Sentry DSN format')
    .optional(),
  
  ERROR_REPORTING_ENABLED: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),

  // Feature flags
  ENABLE_ANALYTICS: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  
  ENABLE_NOTIFICATIONS: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
  
  ENABLE_DARK_MODE: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
  
  MAINTENANCE_MODE: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),

  // Security settings
  ALLOWED_ORIGINS: z
    .string()
    .transform((val) => val.split(',').map(origin => origin.trim()))
    .default('http://localhost:3000'),
  
  RATE_LIMIT_REQUESTS_PER_MINUTE: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, 'Rate limit must be positive')
    .default('100'),
  
  RATE_LIMIT_ENABLED: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),

  // Session configuration
  SESSION_TIMEOUT_MINUTES: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, 'Session timeout must be positive')
    .default('60'),
  
  SECURE_COOKIES: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
});

// Type inference from schema
export type EnvConfig = z.infer<typeof envSchema>;
```

### **Configuration Validation and Export**
```typescript
// Validate environment variables at startup
function validateEnvironment(): EnvConfig {
  try {
    const env = envSchema.parse(process.env);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Environment configuration validated successfully');
      
      if (env.DEBUG) {
        console.log('🔧 Debug mode enabled');
        console.log('📊 Configuration:', {
          supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
          nodeEnv: env.NODE_ENV,
          appName: env.APP_NAME,
          appVersion: env.APP_VERSION,
          performanceMonitoring: env.ENABLE_PERFORMANCE_MONITORING,
          errorReporting: env.ERROR_REPORTING_ENABLED,
        });
      }
    }
    
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment configuration validation failed:');
      
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        console.error(`  • ${path}: ${err.message}`);
      });
      
      console.error('\n📋 Please check your .env.local file and ensure all required variables are set correctly.');
      console.error('📖 See docs/environment.md for configuration details.');
      
      process.exit(1);
    }
    
    throw error;
  }
}

// Export validated configuration
export const config = validateEnvironment();

// Export individual configuration sections
export const supabaseConfig = {
  url: config.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceRoleKey: config.SUPABASE_SERVICE_ROLE_KEY,
} as const;

export const appConfig = {
  name: config.APP_NAME,
  version: config.APP_VERSION,
  environment: config.NODE_ENV,
  debug: config.DEBUG,
  verboseLogging: config.VERBOSE_LOGGING,
} as const;

export const performanceConfig = {
  monitoring: config.ENABLE_PERFORMANCE_MONITORING,
  threshold: config.PERFORMANCE_THRESHOLD_MS,
} as const;

export const securityConfig = {
  allowedOrigins: config.ALLOWED_ORIGINS,
  rateLimitEnabled: config.RATE_LIMIT_ENABLED,
  rateLimitRequestsPerMinute: config.RATE_LIMIT_REQUESTS_PER_MINUTE,
  sessionTimeoutMinutes: config.SESSION_TIMEOUT_MINUTES,
  secureCookies: config.SECURE_COOKIES,
} as const;

export const featureFlags = {
  analytics: config.ENABLE_ANALYTICS,
  notifications: config.ENABLE_NOTIFICATIONS,
  darkMode: config.ENABLE_DARK_MODE,
  maintenanceMode: config.MAINTENANCE_MODE,
} as const;
```

### **Runtime Configuration Checks**
```typescript
// Runtime configuration health check
export function checkConfigurationHealth(): {
  healthy: boolean;
  issues: string[];
  warnings: string[];
} {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check Supabase connection
  if (!config.NEXT_PUBLIC_SUPABASE_URL || !config.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    issues.push('Supabase configuration is incomplete');
  }

  // Check production-specific requirements
  if (config.NODE_ENV === 'production') {
    if (!config.NEXTAUTH_SECRET) {
      issues.push('NextAuth secret is required in production');
    }
    
    if (!config.SECURE_COOKIES) {
      warnings.push('Secure cookies should be enabled in production');
    }
    
    if (config.DEBUG) {
      warnings.push('Debug mode should be disabled in production');
    }
  }

  // Check development-specific settings
  if (config.NODE_ENV === 'development') {
    if (!config.DEBUG) {
      warnings.push('Consider enabling debug mode in development');
    }
  }

  // Check feature flag consistency
  if (config.MAINTENANCE_MODE && config.NODE_ENV === 'production') {
    warnings.push('Maintenance mode is enabled in production');
  }

  return {
    healthy: issues.length === 0,
    issues,
    warnings,
  };
}

// Export health check for monitoring
export const configHealth = checkConfigurationHealth();
```

## 🚀 Setup Instructions

### **1. Initial Setup**

#### **Copy Environment Template**
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit the environment file
nano .env.local  # or your preferred editor
```

#### **Required Configuration**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXTAUTH_SECRET=your-32-character-secret-here
```

### **2. Supabase Setup**

#### **Create Supabase Project**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and API keys from Settings > API

#### **Configure Database**
```sql
-- Enable Row Level Security
ALTER TABLE ptaVOID_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ptaVOID_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE ptaVOID_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE ptaVOID_expenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (see database documentation)
```

### **3. Development Environment**

#### **Install Dependencies**
```bash
npm install
# or
yarn install
```

#### **Start Development Server**
```bash
npm run dev
# or
yarn dev
```

#### **Verify Configuration**
```bash
# Check configuration validation
npm run config:check

# Run configuration tests
npm run test:config
```

### **4. Production Setup**

#### **Environment Variables**
```bash
# Production .env.local
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-key
NEXTAUTH_SECRET=your-secure-32-char-secret
SECURE_COOKIES=true
ERROR_REPORTING_ENABLED=true
SENTRY_DSN=your-sentry-dsn
```

#### **Security Checklist**
- [ ] Secure cookies enabled
- [ ] Debug mode disabled
- [ ] Error reporting configured
- [ ] Rate limiting enabled
- [ ] CORS origins configured
- [ ] Session timeout set appropriately

## 🔍 Configuration Usage

### **In Components**
```typescript
import { appConfig, featureFlags } from '@/lib/config';

export function AppHeader() {
  return (
    <header>
      <h1>{appConfig.name}</h1>
      <span>v{appConfig.version}</span>
      
      {featureFlags.darkMode && (
        <DarkModeToggle />
      )}
      
      {appConfig.debug && (
        <DebugPanel />
      )}
    </header>
  );
}
```

### **In API Routes**
```typescript
import { securityConfig, performanceConfig } from '@/lib/config';

export async function GET(request: Request) {
  // Rate limiting
  if (securityConfig.rateLimitEnabled) {
    await applyRateLimit(request, securityConfig.rateLimitRequestsPerMinute);
  }
  
  // Performance monitoring
  if (performanceConfig.monitoring) {
    const startTime = performance.now();
    
    try {
      const result = await processRequest();
      return result;
    } finally {
      const duration = performance.now() - startTime;
      if (duration > performanceConfig.threshold) {
        console.warn(`Slow API response: ${duration}ms`);
      }
    }
  }
}
```

### **In Middleware**
```typescript
import { securityConfig, featureFlags } from '@/lib/config';

export function middleware(request: NextRequest) {
  // Maintenance mode check
  if (featureFlags.maintenanceMode) {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }
  
  // CORS check
  const origin = request.headers.get('origin');
  if (origin && !securityConfig.allowedOrigins.includes(origin)) {
    return new NextResponse('CORS not allowed', { status: 403 });
  }
  
  return NextResponse.next();
}
```

## 🧪 Configuration Testing

### **Configuration Validation Tests**
```typescript
// tests/config.test.ts
import { describe, test, expect } from '@jest/globals';
import { z } from 'zod';

describe('Configuration Validation', () => {
  test('validates required Supabase configuration', () => {
    const validEnv = {
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    };
    
    expect(() => envSchema.parse(validEnv)).not.toThrow();
  });
  
  test('rejects invalid Supabase URL', () => {
    const invalidEnv = {
      NEXT_PUBLIC_SUPABASE_URL: 'not-a-url',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    };
    
    expect(() => envSchema.parse(invalidEnv)).toThrow();
  });
  
  test('applies default values correctly', () => {
    const minimalEnv = {
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    };
    
    const result = envSchema.parse(minimalEnv);
    
    expect(result.NODE_ENV).toBe('development');
    expect(result.APP_NAME).toBe('PTA Management System');
    expect(result.DEBUG).toBe(false);
  });
});
```

### **Configuration Health Tests**
```typescript
// tests/config-health.test.ts
import { checkConfigurationHealth } from '@/lib/config';

describe('Configuration Health', () => {
  test('reports healthy configuration', () => {
    const health = checkConfigurationHealth();
    
    expect(health.healthy).toBe(true);
    expect(health.issues).toHaveLength(0);
  });
  
  test('detects missing production requirements', () => {
    // Mock production environment without required settings
    process.env.NODE_ENV = 'production';
    delete process.env.NEXTAUTH_SECRET;
    
    const health = checkConfigurationHealth();
    
    expect(health.healthy).toBe(false);
    expect(health.issues).toContain('NextAuth secret is required in production');
  });
});
```

## 🔧 Configuration Scripts

### **Configuration Check Script**
```bash
#!/bin/bash
# scripts/check-config.sh

echo "🔍 Checking environment configuration..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found"
    echo "📋 Copy .env.example to .env.local and configure it"
    exit 1
fi

# Check required variables
required_vars=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
)

missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "  • $var"
    done
    exit 1
fi

echo "✅ Environment configuration looks good!"
```

### **Configuration Generation Script**
```bash
#!/bin/bash
# scripts/generate-config.sh

echo "🔧 Generating environment configuration..."

# Generate NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Create .env.local from template
cat > .env.local << EOF
# Generated configuration - $(date)

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$NEXTAUTH_SECRET

# Application Configuration
APP_NAME="PTA Management System"
APP_VERSION=1.0.0
NODE_ENV=development

# Development Settings
DEBUG=true
VERBOSE_LOGGING=false

# Feature Flags
ENABLE_ANALYTICS=false
ENABLE_NOTIFICATIONS=true
ENABLE_DARK_MODE=true
MAINTENANCE_MODE=false
EOF

echo "✅ Configuration file generated at .env.local"
echo "📝 Please update the Supabase configuration with your actual values"
```

## 📋 Troubleshooting

### **Common Issues**

#### **1. Invalid Supabase URL**
```
Error: Invalid Supabase URL format
```
**Solution**: Ensure URL follows format `https://your-project.supabase.co`

#### **2. Missing Environment Variables**
```
Error: NEXT_PUBLIC_SUPABASE_ANON_KEY is required
```
**Solution**: Check `.env.local` file exists and contains all required variables

#### **3. Configuration Validation Errors**
```
Error: NextAuth secret must be at least 32 characters
```
**Solution**: Generate a secure secret: `openssl rand -base64 32`

#### **4. Development vs Production Issues**
```
Warning: Debug mode should be disabled in production
```
**Solution**: Set `DEBUG=false` in production environment

### **Debug Configuration**
```typescript
// Add to your component for debugging
import { config, configHealth } from '@/lib/config';

export function ConfigDebug() {
  if (!config.DEBUG) return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded text-xs">
      <h3>Configuration Debug</h3>
      <pre>{JSON.stringify(configHealth, null, 2)}</pre>
    </div>
  );
}
```

---

This comprehensive environment configuration system ensures reliable, secure, and maintainable configuration management for the PTA Management System across all deployment environments.