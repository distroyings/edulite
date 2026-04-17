import { supabase } from '../../../lib/supabase.js';
import { GOOGLE_REDIRECT_URL } from '../../../config.js';

export const authService = {
    async signUp(email, password, metadata) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata, // Contains name, username, etc.
            },
        });

        // Note: Use a Supabase Trigger to create the profile row automatically
        // OR create it here if trigger not set up. prefer Trigger for consistency.
        if (data.user && !error) {
            // Profile creation moved to OTP verification step
            // or created via DB trigger if configured.
            // For now, we defer manual creation until verification.
        }

        return { data, error };
    },

    async verifySignupOtp(email, token) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };

        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'signup'
        });

        if (data.user && !error) {
            // Profile is created automatically by DB Trigger
            console.log('User verified. Profile should be created by Trigger.');
        }

        return { data, error };
    },

    async resendSignupOtp(email) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        return await supabase.auth.resend({
            type: 'signup',
            email
        });
    },

    async verifyRecoveryOtp(email, token) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        return await supabase.auth.verifyOtp({
            email,
            token,
            type: 'recovery'
        });
    },

    async signIn(identifier, password) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };

        let email = identifier.trim();

        // If identifier starts with @, it's a username
        if (email.startsWith('@')) {
            const username = email.substring(1);
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('email')
                .eq('username', username)
                .maybeSingle();

            if (profileError) return { error: profileError };
            if (!profile || !profile.email) return { error: { message: 'Utilizador não encontrado.' } };

            email = profile.email;
        } else if (!email.includes('@')) {
            // Auto-prefix @ for username attempts
            const { data: profile } = await supabase
                .from('profiles')
                .select('email')
                .eq('username', email)
                .maybeSingle();

            if (profile?.email) {
                email = profile.email;
            } else {
                return { error: { message: 'Utilizador não encontrado. Use @username ou email.' } };
            }
        }

        return await supabase.auth.signInWithPassword({ email, password });
    },

    async resetPassword(email) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        return await supabase.auth.resetPasswordForEmail(email);
    },

    async updatePassword(newPassword) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        return await supabase.auth.updateUser({ password: newPassword });
    },

    async signInWithGoogle() {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        return await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: GOOGLE_REDIRECT_URL,
            },
        });
    },

    // Admin login removed


    async signOut() {
        if (!supabase) return;
        return await supabase.auth.signOut();
    },

    async getSession() {
        if (!supabase) return null;
        const { data } = await supabase.auth.getSession();
        return data.session;
    },

    async getUser() {
        if (!supabase) return null;
        const { data } = await supabase.auth.getUser();
        return data.user;
    },

    async createProfile(user, metadata) {
        if (!supabase) return;
        // Fallback if trigger doesn't exist
        const { error } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                username: metadata.username,
                name: metadata.name,
                avatar_url: `https://ui-avatars.com/api/?name=${metadata.name}&background=random`
            })
            .select()
            .single();

        if (error && error.code !== '23505') { // Ignore duplicate key error
            console.error('Error creating profile:', error);
        }
    },

    /**
     * Ensures the current user has a profile row. Safe to call on every session restore.
     * Uses upsert (ON CONFLICT DO NOTHING) so it won't overwrite existing profiles.
     * This prevents FK violations when the DB was reset but auth sessions persist.
     */
    async ensureProfile() {
        if (!supabase) return;
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Check if profile exists first (fast path — avoids unnecessary writes)
            const { data: existing } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .maybeSingle();

            if (existing) return; // Profile exists, nothing to do

            // Profile missing — create one from auth metadata
            const meta = user.user_metadata || {};
            const name = meta.name || meta.full_name || user.email?.split('@')[0] || 'User';
            const username = meta.username || meta.preferred_username || user.email?.split('@')[0] || `user_${user.id.substring(0, 8)}`;

            const { error } = await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    name,
                    username,
                    avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=256`
                });

            if (error && error.code !== '23505') {
                console.error('ensureProfile: failed to create profile:', error);
            }
        } catch (e) {
            console.error('ensureProfile error:', e);
        }
    }
};
