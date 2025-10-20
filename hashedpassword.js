
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { createClient } from '@supabase/supabase-js';


dotenv.config();
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );


async function hashPasswords() {
  const { data: users, error } = await supabase.from("users").select("user_id, password");

  if (error) {
    console.error("Error fetching users:", error);
    return;
  }

  for (const user of users) {
    if (!user.password.startsWith("$2a$")) {  // Check if password is already hashed
      const hashedPassword = await bcrypt.hash(user.password, 10);

      await supabase
        .from("users")
        .update({ password: hashedPassword })
        .eq("user_id", user.user_id);

      console.log(`Updated password for user ${user.user_id}`);
    }
  }
}

hashPasswords();
