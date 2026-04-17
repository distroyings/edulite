import { supabase } from '../lib/supabase.js';

export const profileService = {
    async getProfile(userId) {
        if (!supabase) return { data: null, error: null };

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        return { data, error };
    },

    async updateProfile(userId, updates) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId);

        if (error) return { data: null, error };

        // Fetch the updated profile separately
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

        return { data, error: null };
    },

    async checkUsernameAvailability(username, currentUserId = null) {
        if (!supabase || !username) return { data: false, error: null };

        // Strip @ if present for checking
        const cleanUsername = username.startsWith('@') ? username.substring(1) : username;

        // Reserved usernames
        const RESERVED = ['admin', 'super_admin', 'moderator', 'system', 'edulite', 'support', 'help'];
        if (RESERVED.includes(cleanUsername.toLowerCase())) {
            return { available: false, error: null };
        }

        let query = supabase
            .from('profiles')
            .select('id, username, name, avatar_url, bio, location, contact_email, created_at, is_verified');

        // Exclude the current user's own profile from the check
        if (currentUserId) {
            query = query.neq('id', currentUserId);
        }

        const { data, error } = await query.maybeSingle();

        return { available: !data, error };
    },

    async getProfileByUsername(username) {
        if (!supabase) return { data: null, error: null };
        const cleanUsername = username.startsWith('@') ? username.substring(1) : username;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', cleanUsername)
            .maybeSingle();

        return { data, error };
    }
};
