import { supabase } from '../lib/supabase.js';

const KNOWN_BUCKETS = new Set([
    'avatars',
    'banners',
    'assignments',
    'submissions',
    'chat-attachments',
    'resources',
]);

export const storageService = {
    async uploadFile(bucket, path, file) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        if (!KNOWN_BUCKETS.has(bucket)) {
            return { error: { message: `Unknown bucket: ${bucket}` } };
        }

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, {
                // 1 day cache — avatars/banners change rarely; chat attachments are
                // immutable once posted (path includes timestamp).
                cacheControl: '86400',
                upsert: false
            });

        return { data, error };
    },

    getPublicUrl(bucket, path) {
        if (!supabase) return null;
        if (!KNOWN_BUCKETS.has(bucket) || !path) return null;
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
        if (!KNOWN_BUCKETS.has(bucket)) {
            return { error: { message: `Unknown bucket: ${bucket}` } };
        }
        const paths = Array.isArray(path) ? path : [path];
        const { data, error } = await supabase.storage.from(bucket).remove(paths);
        return { data, error };
    }
};
