require('dotenv').config(); // Load .env variables
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

async function createAdminUser(email, password, name, role) {
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name }
  });

  if (authError) throw authError;

  const { error: dbError } = await supabaseAdmin
    .from('users')
    .upsert({
      user_id: email.split('@')[0],
      email,
      auth_user_id: authUser.user.id,
      name,
      role,
      status: 'active'
    });

  if (dbError) throw dbError;

  console.log(`✅ Admin Created: ${email}`);
}

(async () => {
  try {
    await createAdminUser('ismailmuzammil206@gmail.com', 'DevSecurePass123!', 'System Developer', 'super_admin');
    await createAdminUser('appadmin@domain.com', 'AppAdminPass123!', 'Application Admin', 'developer');
    await createAdminUser('surveyadmin@domain.com', 'SurveyAdminPass123!', 'Survey Controller', 'survey_admin');
    console.log('✅ All admins created successfully');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
