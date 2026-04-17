import { supabase } from '../lib/supabase.js';

export const storageService = {
    async uploadFile(bucket, path, file) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: false
            });

        return { data, error };
    },

    getPublicUrl(bucket, path) {
        if (!supabase) return null;
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
    },

    async downloadFile(bucket, path) {
        // For private buckets or forced downloads
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        const { data, error } = await supabase.storage.from(bucket).download(path);
        return { data, error };
    },

    async deleteFile(bucket, path) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        const { data, error } = await supabase.storage.from(bucket).remove([path]);
        return { data, error };
    }
};
