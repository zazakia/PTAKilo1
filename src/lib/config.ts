import { z } from 'zod';

// Environment variable schema
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required').optional(),
  NEXTAUTH_SECRET: z.string().min(1, 'NextAuth secret is required').optional(),
  NEXTAUTH_URL: z.string().url('Invalid NextAuth URL').optional(),
  MAX_FILE_SIZE: z.string().transform(Number).pipe(z.number().positive()).optional(),
  ALLOWED_FILE_TYPES: z.string().optional(),
  SCHOOL_NAME: z.string().optional(),
  SCHOOL_YEAR: z.string().optional(),
  PTA_CONTRIBUTION_AMOUNT: z.string().transform(Number).pipe(z.number().positive()).optional(),
  ADMIN_EMAIL: z.string().email('Invalid admin email').optional(),
  ADMIN_PASSWORD: z.string().min(8, 'Admin password must be at least 8 characters').optional(),
});

// Validate environment variables
function validateEnv() {
  try {
    const env = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      MAX_FILE_SIZE: process.env.MAX_FILE_SIZE,
      ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES,
      SCHOOL_NAME: process.env.SCHOOL_NAME,
      SCHOOL_YEAR: process.env.SCHOOL_YEAR,
      PTA_CONTRIBUTION_AMOUNT: process.env.PTA_CONTRIBUTION_AMOUNT,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL,
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    };

    return envSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Environment validation failed:\n${errorMessages.join('\n')}`);
    }
    throw error;
  }
}

// Export validated config
export const config = validateEnv();

// App configuration with defaults
export const appConfig = {
  supabase: {
    url: config.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: config.SUPABASE_SERVICE_ROLE_KEY,
  },
  app: {
    name: config.SCHOOL_NAME || 'Vel Elementary School',
    schoolYear: config.SCHOOL_YEAR || '2024-2025',
    ptaContributionAmount: config.PTA_CONTRIBUTION_AMOUNT || 250,
  },
  upload: {
    maxFileSize: config.MAX_FILE_SIZE || 5242880, // 5MB
    allowedTypes: config.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf'
    ],
  },
  admin: {
    email: config.ADMIN_EMAIL,
    password: config.ADMIN_PASSWORD,
  },
};

// Runtime configuration checks
export function checkConfig() {
  const checks = [
    {
      name: 'Supabase URL',
      value: config.NEXT_PUBLIC_SUPABASE_URL,
      test: (val: string) => val.startsWith('https://') && val.includes('.supabase.co'),
    },
    {
      name: 'Supabase Anon Key',
      value: config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      test: (val: string) => val.length > 100 && val.startsWith('eyJ'),
    },
  ];

  const results = checks.map(check => ({
    name: check.name,
    passed: check.test(check.value),
    value: check.value ? '✓ Set' : '✗ Missing',
  }));

  return results;
}

// Development helper
export function logConfig() {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 App Configuration:');
    console.table({
      'School Name': appConfig.app.name,
      'School Year': appConfig.app.schoolYear,
      'PTA Amount': `₱${appConfig.app.ptaContributionAmount}`,
      'Max File Size': `${appConfig.upload.maxFileSize / 1024 / 1024}MB`,
      'Supabase URL': config.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing',
      'Anon Key': config.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing',
    });
  }
}