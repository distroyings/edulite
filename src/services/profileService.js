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
            .select('*', { count: 'exact', head: true })
            .ilike('username', cleanUsername);

        // Exclude the current user's own profile from the check
        if (currentUserId) {
            query = query.neq('id', currentUserId);
        }

        const { count, error } = await query;
        
        // If there is an error, default to available unless it's a constraint issue to prevent blocking signups on network flakes
        if (error) {
            console.error('checkUsernameAvailability error:', error);
            return { available: true, error };
        }

        return { available: count === 0, error: null };
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
