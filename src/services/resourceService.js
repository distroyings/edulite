import { supabase } from '../lib/supabase.js';
import { notificationService } from './notificationService.js';
import { generateUUID } from '../lib/RealtimeManager.js';

export const resourceService = {

    async getResources(classId, folder = null) {
        if (!supabase) return { data: [], error: null };
        const user = (await supabase.auth.getUser()).data.user;

        let query = supabase
            .from('class_resources')
            .select('*, profiles:uploaded_by(id, name, avatar_url, is_verified)')
            .eq('class_id', classId)
            .order('created_at', { ascending: false });

        if (folder && folder !== 'Todos') query = query.eq('folder', folder);

        const { data: resources, error } = await query;
        if (error) return { data: [], error };

        const enriched = (resources || []).map(r => ({
            ...r,
        }));

        return { data: enriched, error: null };
    },

    async getFolders(classId) {
        if (!supabase) return { data: [], error: null };
        const { data, error } = await supabase
            .from('class_resources')
            .select('folder')
            .eq('class_id', classId);
        if (error) return { data: [], error };
        const folders = [...new Set((data || []).map(r => r.folder).filter(Boolean))];
        return { data: folders, error: null };
    },

    async addResource(classId, { title, description, fileUrl, linkUrl, resourceType, folder }) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        const user = (await supabase.auth.getUser()).data.user;

        const { data, error } = await supabase
            .from('class_resources')
            .insert({
                class_id: classId,
                uploaded_by: user.id,
                title,
                description: description || null,
                file_url: fileUrl || null,
                link_url: linkUrl || null,
                resource_type: resourceType || 'file',
                folder: folder || 'Geral',
            })
            .select()
            .single();

        // Notify class members about new resource
        if (!error && data) {
            notificationService.notifyClassMembers(
                classId,
                user.id,
                'new_resource',
                'Novo Recurso Adicionado',
                `"${title}" foi partilhado na turma.`,
                `/class/${classId}`,
                data.id
            ).catch(err => console.error('Notify resource error:', err));
        }

        return { data, error };
    },

    async deleteResource(resourceId) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        return await supabase.from('class_resources').delete().eq('id', resourceId);
    },

    async updateResource(resourceId, { title, description, linkUrl, fileUrl, resourceType, folder }) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };

        const updates = {
            title,
            description: description || null,
            resource_type: resourceType || 'file',
            folder: folder || 'Geral',
        };
        if (linkUrl !== undefined) updates.link_url = linkUrl || null;
        if (fileUrl !== undefined) updates.file_url = fileUrl || null;

        const { data, error } = await supabase
            .from('class_resources')
            .update(updates)
            .eq('id', resourceId)
            .select()
            .single();

        return { data, error };
    },



    async uploadFile(classId, file) {
        if (!supabase) return { url: null, error: { message: 'Supabase not configured' } };
        const ext = file.name.split('.').pop();
        const path = `${classId}/${generateUUID()}.${ext}`;

        const { error } = await supabase.storage.from('resources').upload(path, file);
        if (error) return { url: null, error };

        const { data: { publicUrl } } = supabase.storage.from('resources').getPublicUrl(path);
        return { url: publicUrl, error: null };
    },
};
