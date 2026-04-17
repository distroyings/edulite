import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

let supabase = null;

// Validation helper
const isKeyConfigured = (val) => val && val.length > 20 && !val.includes('YOUR_');

// Initialize Standard Client (Anon — safe for browser)
if (isKeyConfigured(SUPABASE_URL) && isKeyConfigured(SUPABASE_ANON_KEY)) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.warn('Supabase not configured. Auth and DB will not work.');
}

// NOTE: Admin client (SERVICE_KEY) has been moved to server/index.js
// All admin operations now go through the server proxy at /api/admin/*
// No sensitive keys are exposed in the browser.

export { supabase };
