const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const demoUsers = [
  {
    email: 'cybergada@gmail.com',
    role: 'admin',
    metadata: {
      full_name: 'System Administrator',
      role: 'admin'
    }
  },
  {
    email: 'principal@vel.edu.ph',
    role: 'principal',
    metadata: {
      full_name: 'School Principal',
      role: 'principal'
    }
  },
  {
    email: 'teacher@vel.edu.ph',
    role: 'teacher',
    metadata: {
      full_name: 'Grade Teacher',
      role: 'teacher'
    }
  },
  {
    email: 'treasurer@vel.edu.ph',
    role: 'treasurer',
    metadata: {
      full_name: 'PTA Treasurer',
      role: 'treasurer'
    }
  },
  {
    email: 'parent@example.com',
    role: 'parent',
    metadata: {
      full_name: 'Parent User',
      role: 'parent'
    }
  }
];

async function fixUserProfiles() {
  console.log('🔧 Fixing user profiles with correct table name...');
  
  // First, check if the correct table exists
  const { data: tableInfo, error: tableError } = await supabase
    .from('ptavoid_users')
    .select('*')
    .limit(1);
  
  if (tableError && tableError.message.includes('does not exist')) {
    console.log('❌ Table ptavoid_users does not exist. Creating it...');
    
    // Create the table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ptavoid_users (
        id UUID PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT,
        role TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: createError } = await supabase.rpc('exec', { query: createTableQuery });
    
    if (createError) {
      console.error('❌ Failed to create table:', createError.message);
      console.log('⚠️ Attempting to continue anyway...');
    } else {
      console.log('✅ Table created successfully');
    }
  }
  
  for (const user of demoUsers) {
    try {
      console.log(`📝 Processing user: ${user.email}`);
      
      // Get user ID from Auth
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        console.error(`❌ Error fetching users: ${userError.message}`);
        continue;
      }
      
      const authUser = userData.users.find(u => u.email === user.email);
      
      if (!authUser) {
        console.error(`❌ User not found in Auth: ${user.email}`);
        continue;
      }
      
      console.log(`✅ Found auth user: ${user.email} (${authUser.id})`);
      
      // Update user metadata if needed
      const { error: metadataError } = await supabase.auth.admin.updateUserById(
        authUser.id,
        { user_metadata: user.metadata }
      );
      
      if (metadataError) {
        console.error(`❌ Error updating metadata for ${user.email}: ${metadataError.message}`);
      } else {
        console.log(`✅ Updated auth metadata for: ${user.email}`);
      }
      
      // Check if user exists in the profile table
      const { data: existingProfile, error: profileQueryError } = await supabase
        .from('ptavoid_users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (profileQueryError && !profileQueryError.message.includes('No rows found')) {
        console.error(`❌ Error checking profile for ${user.email}: ${profileQueryError.message}`);
      }
      
      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('ptavoid_users')
          .update({
            email: user.email,
            full_name: user.metadata.full_name,
            role: user.role,
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', authUser.id);
        
        if (updateError) {
          console.error(`❌ Error updating profile for ${user.email}: ${updateError.message}`);
        } else {
          console.log(`✅ Updated profile for: ${user.email}`);
        }
      } else {
        // Insert new profile
        const { error: insertError } = await supabase
          .from('ptavoid_users')
          .insert({
            id: authUser.id,
            email: user.email,
            full_name: user.metadata.full_name,
            role: user.role,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error(`❌ Error creating profile for ${user.email}: ${insertError.message}`);
        } else {
          console.log(`✅ Created profile for: ${user.email}`);
        }
      }
    } catch (error) {
      console.error(`❌ Unexpected error for ${user.email}: ${error.message}`);
    }
  }
  
  console.log('🎉 User profile fix completed!');
}

fixUserProfiles().catch(console.error);