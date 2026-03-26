import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dslxsooykqgarmgxdiup.supabase.co';
const supabaseAnonKey = 'sb_publishable_1PzNTiSP8OMDT1rqbCC9RQ_irswmjBX';

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Dev hack: Mock session for local development when rate limited
const originalGetSession = supabase.auth.getSession;
supabase.auth.getSession = async () => {
  if (typeof window !== 'undefined') {
    const mockEmail = localStorage.getItem('mock_user_email');
    if (mockEmail) {
      return { 
        data: { session: { user: { email: mockEmail } } }, 
        error: null 
      } as any;
    }
  }
  return originalGetSession.apply(supabase.auth);
};

// Mock signOut to clear the mock session
const originalSignOut = supabase.auth.signOut;
supabase.auth.signOut = async (options) => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mock_user_email');
  }
  return originalSignOut.apply(supabase.auth, [options]);
};
