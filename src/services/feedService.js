import { supabase } from '../lib/supabase.js';
import { RealtimeManager } from '../lib/RealtimeManager.js';

export const feedService = {

    async getNotes(classId) {
        if (!supabase) return { data: [], error: null };
        const user = (await supabase.auth.getUser()).data.user;

        const { data: notes, error } = await supabase
            .from('class_notes')
            .select('*, profiles:created_by(id, name, avatar_url, username, is_verified)')
            .eq('class_id', classId)
            .order('pinned', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) return { data: [], error };

        const noteIds = (notes || []).map(n => n.id);
        if (noteIds.length === 0) return { data: [], error: null };

        // Batch-fetch comment counts
        const { data: comments } = await supabase
            .from('note_comments')
            .select('note_id')
            .in('note_id', noteIds);

        const enriched = (notes || []).map(note => ({
            ...note,
            commentCount: (comments || []).filter(c => c.note_id === note.id).length,
        }));

        return { data: enriched, error: null };
    },

    async getComments(noteId) {
        if (!supabase) return { data: [], error: null };
        const { data, error } = await supabase
            .from('note_comments')
            .select('*, profiles:user_id(id, name, avatar_url, username, is_verified)')
            .eq('note_id', noteId)
            .order('created_at', { ascending: true });
        return { data: data || [], error };
    },

    async addComment(noteId, content) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        const user = (await supabase.auth.getUser()).data.user;
        const { data, error } = await supabase
            .from('note_comments')
            .insert({ note_id: noteId, user_id: user.id, content })
            .select('*, profiles:user_id(id, name, avatar_url, username, is_verified)')
            .single();

        if (!error && data) RealtimeManager.broadcast('class_feed_reactions', 'INSERT', { note_id: noteId });

        return { data, error };
    },

    async deleteComment(commentId) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        const result = await supabase.from('note_comments').delete().eq('id', commentId);

        if (!result.error) RealtimeManager.broadcast('class_feed_reactions', 'DELETE', { id: commentId });

        return result;
    },
};
