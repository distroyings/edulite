import { supabase } from '../lib/supabase.js';

export const feedService = {

    async getNotes(classId, limit = 50) {
        if (!supabase) return { data: [], error: null };
        const user = (await supabase.auth.getUser()).data.user;

        const { data: notes, error } = await supabase
            .from('class_notes')
            .select('*, profiles:created_by(id, name, avatar_url, username, is_verified)')
            .eq('class_id', classId)
            .order('pinned', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) return { data: [], error };

        const noteIds = (notes || []).map(n => n.id);
        if (noteIds.length === 0) return { data: [], error: null };

        // Batch-fetch comment counts and tally with a Map so we don't do
        // O(notes × comments) work in the enrichment step.
        const { data: comments } = await supabase
            .from('note_comments')
            .select('note_id')
            .in('note_id', noteIds);

        const counts = new Map();
        (comments || []).forEach(c => {
            counts.set(c.note_id, (counts.get(c.note_id) || 0) + 1);
        });

        const enriched = (notes || []).map(note => ({
            ...note,
            commentCount: counts.get(note.id) || 0,
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

        return { data, error };
    },

    async deleteComment(commentId) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        return await supabase.from('note_comments').delete().eq('id', commentId);
    },
};
