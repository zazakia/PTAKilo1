import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

// Get environment variables with fallbacks
const getSupabaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  return url;
};

const getSupabaseAnonKey = () => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }
  return key;
};

const getSupabaseServiceKey = () => {
  // Only available on server side
  if (typeof window !== 'undefined') {
    throw new Error('Service role key should not be accessed on client side');
  }
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }
  return key;
};

// Client-side Supabase client
export const supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey());

// Server-side Supabase client with service role (for admin operations)
// This should only be used in server-side code (API routes, server components)
export const createSupabaseAdmin = () => {
  return createClient(getSupabaseUrl(), getSupabaseServiceKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};


// Browser client for client components
export const createSupabaseBrowserClient = () =>
  createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());

// Browser client for client components (alternative name for compatibility)
export const createBrowserSupabaseClient = () =>
  createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());

// Database helper functions
export class DatabaseService {
  private client;

  constructor(client = supabase) {
    this.client = client;
  }

  // Generic CRUD operations
  async create<T>(table: string, data: Partial<T>): Promise<T> {
    const { data: result, error } = await this.client
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result as T;
  }

  async findById<T>(table: string, id: string): Promise<T | null> {
    const { data, error } = await this.client
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as T | null;
  }

  async findMany<T>(
    table: string,
    options?: {
      select?: string;
      filters?: Record<string, any>;
      orderBy?: { column: string; ascending?: boolean };
      limit?: number;
      offset?: number;
    }
  ): Promise<T[]> {
    let query = this.client.from(table).select(options?.select || '*');

    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? true,
      });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data as T[]) || [];
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<T> {
    const { data: result, error } = await this.client
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result as T;
  }

  async delete(table: string, id: string): Promise<void> {
    const { error } = await this.client
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Search functionality
  async search<T>(
    table: string,
    searchTerm: string,
    searchColumns: string[],
    options?: {
      select?: string;
      filters?: Record<string, any>;
      limit?: number;
    }
  ): Promise<T[]> {
    let query = this.client.from(table).select(options?.select || '*');

    // Apply filters first
    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    // Add search conditions
    if (searchTerm && searchColumns.length > 0) {
      const searchConditions = searchColumns
        .map(column => `${column}.ilike.%${searchTerm}%`)
        .join(',');
      query = query.or(searchConditions);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data as T[]) || [];
  }

  // Count records
  async count(
    table: string,
    filters?: Record<string, any>
  ): Promise<number> {
    let query = this.client
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    const { count, error } = await query;

    if (error) throw error;
    return count || 0;
  }
}

// Default database service instance
export const db = new DatabaseService();

// Admin database service instance - only for server-side use
export const createAdminDb = () => new DatabaseService(createSupabaseAdmin());


// Storage helpers
export class StorageService {
  private client;
  private bucketName: string;

  constructor(bucketName = 'receipts', client = supabase) {
    this.client = client;
    this.bucketName = bucketName;
  }

  async uploadFile(
    file: File,
    path: string,
    options?: {
      cacheControl?: string;
      contentType?: string;
      upsert?: boolean;
    }
  ): Promise<string> {
    const { data, error } = await this.client.storage
      .from(this.bucketName)
      .upload(path, file, {
        cacheControl: options?.cacheControl || '3600',
        contentType: options?.contentType || file.type,
        upsert: options?.upsert || false,
      });

    if (error) throw error;
    return data.path;
  }

  async getPublicUrl(path: string): Promise<string> {
    const { data } = this.client.storage
      .from(this.bucketName)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  async getSignedUrl(
    path: string,
    expiresIn = 3600
  ): Promise<string> {
    const { data, error } = await this.client.storage
      .from(this.bucketName)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  }

  async deleteFile(path: string): Promise<void> {
    const { error } = await this.client.storage
      .from(this.bucketName)
      .remove([path]);

    if (error) throw error;
  }

  async listFiles(
    folder = '',
    options?: {
      limit?: number;
      offset?: number;
      sortBy?: { column: string; order: 'asc' | 'desc' };
    }
  ): Promise<any[]> {
    const { data, error } = await this.client.storage
      .from(this.bucketName)
      .list(folder, {
        limit: options?.limit,
        offset: options?.offset,
        sortBy: options?.sortBy,
      });

    if (error) throw error;
    return data || [];
  }
}

// Default storage service instance
export const storage = new StorageService();

// Auth helpers
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signUpWithEmail = async (email: string, password: string, metadata?: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
  if (error) throw error;
  return data;
};

// Transaction helpers
export const generateTransactionNumber = (prefix: string = 'TXN'): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};