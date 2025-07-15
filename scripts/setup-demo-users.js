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
    password: 'Qweasd145698@',
    role: 'admin',
    metadata: {
      full_name: 'System Administrator',
      role: 'admin'
    }
  },
  {
    email: 'principal@vel.edu.ph',
    password: 'principal123',
    role: 'principal',
    metadata: {
      full_name: 'School Principal',
      role: 'principal'
    }
  },
  {
    email: 'teacher@vel.edu.ph',
    password: 'teacher123',
    role: 'teacher',
    metadata: {
      full_name: 'Grade Teacher',
      role: 'teacher'
    }
  },
  {
    email: 'treasurer@vel.edu.ph',
    password: 'treasurer123',
    role: 'treasurer',
    metadata: {
      full_name: 'PTA Treasurer',
      role: 'treasurer'
    }
  },
  {
    email: 'parent@example.com',
    password: 'parent123',
    role: 'parent',
    metadata: {
      full_name: 'Parent User',
      role: 'parent'
    }
  }
];

async function createDemoUsers() {
  console.log('Creating demo users...');
  
  for (const user of demoUsers) {
    try {
      console.log(`Creating user: ${user.email}`);
      
      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: user.metadata
      });

      if (authError) {
        console.error(`Error creating auth user ${user.email}:`, authError.message);
        continue;
      }

      console.log(`✓ Auth user created: ${user.email}`);

      // Insert user profile into ptaVOID_users table
      const { error: profileError } = await supabase
        .from('ptaVOID_users')
        .insert({
          id: authData.user.id,
          email: user.email,
          full_name: user.metadata.full_name,
          role: user.role,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error(`Error creating profile for ${user.email}:`, profileError.message);
      } else {
        console.log(`✓ Profile created: ${user.email}`);
      }

    } catch (error) {
      console.error(`Unexpected error for ${user.email}:`, error.message);
    }
  }
  
  console.log('Demo user creation completed!');
}

createDemoUsers().catch(console.error);