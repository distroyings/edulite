// EduLite Configuration
// Supabase public credentials only — SERVICE_KEY lives in server/.env

export const SUPABASE_URL = 'https://vpvaiagrhzdzohgryqck.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_0v8VzC6dWNvhpOPEGbTfKA_1RwoOsQQ';

// Optional: Google OAuth Redirect URL
export const GOOGLE_REDIRECT_URL = import.meta.env.PROD ? 'https://my-board.space' : 'http://localhost:5173';
