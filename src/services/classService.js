import { supabase } from '../lib/supabase.js';
import { notificationService } from './notificationService.js';

export const classService = {
    async getClasses() {
        try {
            if (!supabase) return { data: [], error: { message: 'Supabase not configured' } };

            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) return { data: [], error: { message: 'Not authenticated' } };

            // 1. Fetch classes I own
            const { data: owned, error: ownedError } = await supabase
                .from('classes')
                .select('*')
                .eq('owner_id', user.id);

            if (ownedError) throw ownedError;

            // 2. Fetch classes I joined
            const { data: joinedMemberships, error: joinedError } = await supabase
                .from('class_members')
                .select('class_id, classes(*)')
                .eq('user_id', user.id);

            if (joinedError) throw joinedError;

            const joined = joinedMemberships?.map(m => m.classes).filter(Boolean) || [];

            // Tag each with ownership flag
            const ownedIds = new Set(owned.map(c => c.id));
            const all = [...owned, ...joined]
                .filter((v, i, a) => a.findIndex(v2 => (v2.id === v.id)) === i)
                .map(c => ({ ...c, _is_owner: ownedIds.has(c.id) }));

            // Fetch up to 3 members per class for avatar display
            const classIds = all.map(c => c.id);
            if (classIds.length > 0) {
                const { data: members } = await supabase
                    .from('class_members')
                    .select('class_id, user_id, profiles(name, avatar_url, is_verified)')
                    .in('class_id', classIds);

                // Also include owners (they might not be in class_members)
                const { data: ownerProfiles } = await supabase
                    .from('profiles')
                    .select('id, name, avatar_url')
                    .in('id', all.map(c => c.owner_id));

                const ownerMap = {};
                (ownerProfiles || []).forEach(p => { ownerMap[p.id] = p; });

                const membersByClass = {};
                all.forEach(c => {
                    const classMembers = (members || [])
                        .filter(m => m.class_id === c.id)
                        .map(m => m.profiles)
                        .filter(Boolean);

                    // Add owner if not already in members
                    const owner = ownerMap[c.owner_id];
                    if (owner && !classMembers.find(m => m.name === owner.name)) {
                        classMembers.unshift(owner);
                    }

                    membersByClass[c.id] = classMembers.slice(0, 3);
                });

                all.forEach(c => { c._members = membersByClass[c.id] || []; });
            }

            return { data: all, error: null };
        } catch (error) {
            console.error('Error in getClasses:', error);
            return { data: [], error };
        }
    },

    async getClassDetails(classId) {
        try {
            if (!supabase) return { data: null, error: { message: 'Supabase not configured' } };
            const { data, error } = await supabase
                .from('classes')
                .select('*')
                .eq('id', classId)
                .single();
            if (error) return { data: null, error };
            return { data, error: null };
        } catch (error) {
            console.error('Error in getClassDetails:', error);
            return { data: null, error };
        }
    },

    async getClassBanner(classId) {
        // Returns a default gradient CSS class string based on the class name/id
        const gradients = [
            'bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800',
            'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-800',
            'bg-gradient-to-br from-rose-500 via-pink-600 to-fuchsia-800',
            'bg-gradient-to-br from-amber-500 via-orange-600 to-red-700',
            'bg-gradient-to-br from-violet-500 via-purple-600 to-blue-800',
            'bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-800',
        ];
        // Simple hash from classId to pick a gradient
        let hash = 0;
        for (let i = 0; i < classId.length; i++) {
            hash = classId.charCodeAt(i) + ((hash << 5) - hash);
        }
        const idx = Math.abs(hash) % gradients.length;
        return { data: gradients[idx] };
    },

    async createClass(name, description, options = {}) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };

        const user = (await supabase.auth.getUser()).data.user;

        const {
            banner_url = null,
            avatar_url = null,
            chat_enabled = true,
            is_locked = false
        } = options;

        // Create class

        // Generate Invite Code in JS to ensure format consistency (6 chars, uppercase alphanumeric)
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let inviteCode = '';
        for (let i = 0; i < 6; i++) {
            inviteCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const { data: classData, error } = await supabase
            .from('classes')
            .insert({
                owner_id: user.id,
                name,
                description,
                banner_url,
                avatar_url,
                chat_enabled,
                is_locked,
                invite_code: inviteCode
            })
            .select()
            .single();

        if (error) return { error };

        // Add owner as a member with 'teacher' role automatically
        await supabase.from('class_members').insert({
            class_id: classData.id,
            user_id: user.id,
            role: 'teacher'
        });

        // Create Class Chat
        const { data: chatData, error: chatError } = await supabase
            .from('chats')
            .insert({
                type: 'class',
                class_id: classData.id,
                name: 'Geral', // Default channel name
                created_at: new Date()
            })
            .select()
            .single();

        if (!chatError && chatData) {
            // Add owner to chat members
            await supabase.from('chat_members').insert({
                chat_id: chatData.id,
                user_id: user.id
            });
        }

        return { data: classData, error: null };
    },

    async joinClass(inviteCode) {
        try {
            if (!supabase) return { error: { message: 'Supabase not configured' } };
            const user = (await supabase.auth.getUser()).data.user;

            // Check if class exists by invite code
            const { data: classData, error: classError } = await supabase
                .from('classes')
                .select('id, is_locked')
                .eq('invite_code', inviteCode)
                .single();

            if (classError || !classData) return { error: { message: 'Código de convite inválido ou expirado.' } };
            if (classData.is_locked) return { error: { message: 'Esta turma está bloqueada.' } };

            // Check if already member
            const { data: existing } = await supabase
                .from('class_members')
                .select('id')
                .eq('class_id', classData.id)
                .eq('user_id', user.id)
                .single();

            if (existing) return { error: { message: 'Já és membro desta turma.' } };

            const { data, error } = await supabase
                .from('class_members')
                .insert({
                    class_id: classData.id,
                    user_id: user.id,
                    role: 'student'
                })
                .select()
                .single();

            if (error) return { error };

            // Add to Class Chat
            const { data: chatData } = await supabase
                .from('chats')
                .select('id')
                .eq('class_id', classData.id)
                .eq('type', 'class')
                .maybeSingle();

            if (chatData) {
                await supabase.from('chat_members').insert({
                    chat_id: chatData.id,
                    user_id: user.id
                });
            }
            // Notify teacher about new member
            (async () => {
                try {
                    const { data: cls } = await supabase
                        .from('classes').select('owner_id, name').eq('id', classData.id).single();
                    if (cls?.owner_id && cls.owner_id !== user.id) {
                        const { data: profile } = await supabase
                            .from('profiles').select('name').eq('id', user.id).single();
                        await notificationService.createNotification(
                            cls.owner_id,
                            'member_joined',
                            'Novo Membro',
                            `${profile?.name || 'Alguém'} juntou-se à turma "${cls.name}".`,
                            `/class/${classData.id}`,
                            classData.id
                        );
                    }
                } catch (e) { console.error('Notify member join error:', e); }
            })();

            return { data, error };

        } catch (error) {
            console.error('Join Class Error:', error);
            return { error: { message: error.message || 'Erro inesperado ao entrar na turma.' } };
        }
    },

    async regenerateInviteCode(classId) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };

        // This relies on the DB function we created: 'generate_invite_code()'
        // We can just update the column to DEFAULT, but update usually needs a value.
        // We can call the rpc function or fetch a new one.
        // Easiest approach given schema: call helper or explicit update.
        // Let's rely on JS generation for simplicity if DB func access is tricky via client 'update default'.
        // Actually, we can use rpc if we exposed it, but we didn't expose 'generate_invite_code' as RPC, just SQL function.
        // Let's generate in JS to be safe and fast.

        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let newCode = '';
        for (let i = 0; i < 6; i++) {
            newCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const { data, error } = await supabase
            .from('classes')
            .update({ invite_code: newCode })
            .eq('id', classId)
            .select()
            .single();

        return { data, error };
    },

    async getClassMembers(classId) {
        if (!supabase) return { data: [], error: { message: 'Supabase not configured' } };

        const { data, error } = await supabase
            .from('class_members')
            .select('role, profiles(id, name, username, avatar_url, is_verified)')
            .eq('class_id', classId);

        return { data, error };
    },

    async removeMember(classId, userId) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        const result = await supabase
            .from('class_members')
            .delete()
            .eq('class_id', classId)
            .eq('user_id', userId);

        if (!result.error) {
            // Also remove kicked user from the class group chat
            const { data: chatData } = await supabase
                .from('chats')
                .select('id')
                .eq('class_id', classId)
                .eq('type', 'class')
                .maybeSingle();

            if (chatData) {
                await supabase.from('chat_members')
                    .delete()
                    .eq('chat_id', chatData.id)
                    .eq('user_id', userId);
            }
        }

        return result;
    },

    async updateClass(classId, updates) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };

        const { data, error } = await supabase
            .from('classes')
            .update(updates)
            .eq('id', classId)
            .select()
            .single();

        return { data, error };
    },

    async deleteClass(classId) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };

        // Direct DB delete (cascade handles DB rows, user must manually clean storage if needed)
        return await supabase.from('classes').delete().eq('id', classId);
    },

    async leaveClass(classId) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        const user = (await supabase.auth.getUser()).data.user;

        // Owners can't leave — they must delete
        const { data: classData } = await supabase
            .from('classes')
            .select('owner_id')
            .eq('id', classId)
            .single();

        if (classData?.owner_id === user.id) {
            return { error: { message: 'O proprietário não pode sair da turma. Elimina-a em vez disso.' } };
        }

        // Remove from class_members
        const { error } = await supabase
            .from('class_members')
            .delete()
            .eq('class_id', classId)
            .eq('user_id', user.id);

        if (error) return { error };

        // Remove from class chat_members too
        const { data: chatData } = await supabase
            .from('chats')
            .select('id')
            .eq('class_id', classId)
            .eq('type', 'class')
            .maybeSingle();

        if (chatData) {
            await supabase.from('chat_members')
                .delete()
                .eq('chat_id', chatData.id)
                .eq('user_id', user.id);
        }

        return { error: null };
    }
};
