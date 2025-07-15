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

const userUpdates = [
  {
    email: 'cybergada@gmail.com',
    metadata: {
      full_name: 'System Administrator',
      role: 'admin'
    }
  },
  {
    email: 'principal@vel.edu.ph',
    metadata: {
      full_name: 'School Principal',
      role: 'principal'
    }
  },
  {
    email: 'teacher@vel.edu.ph',
    metadata: {
      full_name: 'Grade Teacher',
      role: 'teacher'
    }
  },
  {
    email: 'treasurer@vel.edu.ph',
    metadata: {
      full_name: 'PTA Treasurer',
      role: 'treasurer'
    }
  },
  {
    email: 'parent@example.com',
    metadata: {
      full_name: 'Parent User',
      role: 'parent'
    }
  }
];

async function updateUserMetadata() {
  console.log('Updating user metadata...');
  
  for (const userUpdate of userUpdates) {
    try {
      console.log(`Updating user: ${userUpdate.email}`);
      
      // Get user by email
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        console.error(`Error listing users:`, listError.message);
        continue;
      }
      
      const user = users.users.find(u => u.email === userUpdate.email);
      
      if (!user) {
        console.log(`User not found: ${userUpdate.email}`);
        continue;
      }
      
      // Update user metadata
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        {
          user_metadata: userUpdate.metadata
        }
      );
      
      if (updateError) {
        console.error(`Error updating user ${userUpdate.email}:`, updateError.message);
      } else {
        console.log(`✓ Updated metadata for: ${userUpdate.email}`);
      }
      
    } catch (error) {
      console.error(`Unexpected error for ${userUpdate.email}:`, error.message);
    }
  }
  
  console.log('User metadata update completed!');
}

updateUserMetadata().catch(console.error);