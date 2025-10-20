import bcrypt from "bcryptjs";
import { serialize } from "cookie"
import { supabase } from '@/lib/supabaseClient';
export const loginUser = async (userId, password) => {
  try {
    // Fetch the user from the database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();


      if (error) {
        console.error('Supabase connection error:', error);
      }
    
    if (error || !user) {
      return { error: 'User not found  00' };
      
    }

    // Verify the password (plain-text comparison)
    if (password !== user.password) {
      return { error: 'Invalid password' };

    }

    // Return the user data if login is successful
    return { user };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'An error occurred during login' };
  }
  

  


  
};