import { supabase } from '../lib/supabase.js';
import { storageService } from './storageService.js';
import { RealtimeManager, realtimeManager, generateUUID } from '../lib/RealtimeManager.js';

export const chatService = {
    async searchUsers(query) {
        if (!supabase || !query) return { data: [], error: null };

        const cleanQuery = query.startsWith('@') ? query.substring(1) : query;
        const user = (await supabase.auth.getUser()).data.user;

        const { data, error } = await supabase
            .from('profiles')
            .select('id, name, username, avatar_url, is_verified')
            .or(`username.ilike.%${cleanQuery}%,name.ilike.%${cleanQuery}%`)
            .neq('id', user.id) // Don't show self
            .limit(10);

        return { data, error };
    },

    async getChats() {
        if (!supabase) return { data: [], error: null };
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return { data: [], error: { message: 'Not authenticated' } };

        try {
            // 1. Get my chat memberships
            const { data: memberships, error } = await supabase
                .from('chat_members')
                .select('chat_id, chats(id, type, class_id, name, avatar_url, created_at)')
                .eq('user_id', user.id);

            if (error) return { error };
            if (!memberships?.length) return { data: [], error: null };

            const chatIds = memberships.map(m => m.chat_id).filter(Boolean);
            const directChatIds = memberships.filter(m => m.chats?.type === 'direct').map(m => m.chat_id);
            const classIds = memberships.filter(m => m.chats?.type === 'class' && m.chats?.class_id).map(m => m.chats.class_id);

            // 2. Batch fetch: other members for direct chats, classes, last messages
            const [othersResult, classesResult, lastMsgsResult] = await Promise.all([
                // Get other members for all direct chats in one query
                directChatIds.length > 0
                    ? supabase.from('chat_members')
                        .select('chat_id, user_id, profiles(id, name, avatar_url, username, is_verified)')
                        .in('chat_id', directChatIds)
                        .neq('user_id', user.id)
                    : { data: [] },
                // Get class info (including chat_enabled) for all class chats in one query
                classIds.length > 0
                    ? supabase.from('classes')
                        .select('id, name, avatar_url, banner_url, chat_enabled')
                        .in('id', classIds)
                    : { data: [] },
                // Get last messages for all chats using a lateral join approach
                // We fetch the 1 most recent message per chat
                supabase.from('messages')
                    .select('chat_id, content, created_at, sender_id')
                    .in('chat_id', chatIds)
                    .order('created_at', { ascending: false })
            ]);

            // Build lookup maps
            const otherMembersMap = new Map();
            (othersResult.data || []).forEach(om => {
                if (!otherMembersMap.has(om.chat_id)) otherMembersMap.set(om.chat_id, om);
            });

            const classesMap = new Map();
            (classesResult.data || []).forEach(c => classesMap.set(c.id, c));

            // Get only the latest message per chat
            const lastMsgMap = new Map();
            (lastMsgsResult.data || []).forEach(msg => {
                if (!lastMsgMap.has(msg.chat_id)) lastMsgMap.set(msg.chat_id, msg);
            });

            // 3. Build chat details from maps (no N+1!)
            const chatsWithDetails = memberships.map(m => {
                const chat = m.chats;
                if (!chat) return null;

                let name = chat.name || 'Chat';
                let avatar = chat.avatar_url || null;
                let otherProfile = null;

                if (chat.type === 'direct') {
                    const other = otherMembersMap.get(m.chat_id);
                    if (other?.profiles) {
                        name = other.profiles.name || other.profiles.username || 'Utilizador';
                        avatar = other.profiles.avatar_url;
                        otherProfile = other.profiles;
                    }
                } else if (chat.type === 'class' && chat.class_id) {
                    const classData = classesMap.get(chat.class_id);
                    // Skip class chats where chat is disabled
                    if (!classData || classData.chat_enabled === false) return null;
                    name = classData.name;
                }

                const lastMsg = lastMsgMap.get(m.chat_id) || null;

                return {
                    id: m.chat_id,
                    type: chat.type,
                    class_id: chat.class_id,
                    name,
                    avatar,
                    otherProfile,
                    is_verified: otherProfile?.is_verified || false,
                    created_at: chat.created_at,
                    last_message: lastMsg ? {
                        content: lastMsg.content,
                        created_at: lastMsg.created_at,
                        is_mine: lastMsg.sender_id === user.id
                    } : null
                };
            });

            const validChats = chatsWithDetails
                .filter(c => c && (c.type !== 'direct' || c.last_message))
                .sort((a, b) => {
                    const aTime = a.last_message?.created_at || a.created_at;
                    const bTime = b.last_message?.created_at || b.created_at;
                    return new Date(bTime) - new Date(aTime);
                });

            return { data: validChats, error: null };
        } catch (err) {
            console.error('getChats error:', err);
            return { data: [], error: err };
        }
    },

    async createChat(targetUserId) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return { error: { message: 'Not authenticated' } };
        if (user.id === targetUserId) return { error: { message: 'Cannot chat with yourself' } };

        try {
            // 1. Check if a direct chat already exists between these two users
            const { data: myMemberships } = await supabase
                .from('chat_members')
                .select('chat_id')
                .eq('user_id', user.id);

            if (myMemberships?.length) {
                const myChatIds = myMemberships.map(m => m.chat_id);
                const { data: sharedMemberships } = await supabase
                    .from('chat_members')
                    .select('chat_id')
                    .eq('user_id', targetUserId)
                    .in('chat_id', myChatIds);

                if (sharedMemberships?.length) {
                    for (const sm of sharedMemberships) {
                        const { data: chatData } = await supabase
                            .from('chats')
                            .select('id, type')
                            .eq('id', sm.chat_id)
                            .eq('type', 'direct')
                            .maybeSingle();
                        if (chatData) return { data: chatData, error: null };
                    }
                }
            }

            // 2. Create new chat
            //    - Generate UUID client-side so we don't need .select() after insert
            //    - Skip created_by to avoid FK violation if profile doesn't exist yet
            //    - Skip .select() to avoid RLS SELECT failure (user isn't a member yet)
            const chatId = generateUUID();
            const { error: insertError } = await supabase
                .from('chats')
                .insert({ id: chatId, type: 'direct' });

            if (insertError) return { error: insertError };

            // 3. Add both users as members
            const { error: memberError } = await supabase
                .from('chat_members')
                .insert([
                    { chat_id: chatId, user_id: user.id },
                    { chat_id: chatId, user_id: targetUserId }
                ]);

            if (memberError) {
                // Best-effort cleanup (may fail if no DELETE policy, that's OK)
                await supabase.from('chats').delete().eq('id', chatId).catch(() => { });
                return { error: memberError };
            }

            return { data: { id: chatId, type: 'direct' }, error: null };
        } catch (err) {
            console.error('createChat error:', err);
            return { error: err };
        }
    },

    async getMessages(chatId) {
        if (!supabase) return { data: [], error: null };

        const { data, error } = await supabase
            .from('messages')
            .select(`
                *,
                profiles:sender_id(name, avatar_url, username, is_verified),
                parent:reply_to_id(
                    content,
                    sender_id,
                    is_deleted,
                    profiles:sender_id(name)
                )
            `)
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true })
            .limit(100);

        return { data, error };
    },

    async _broadcastToChat(chatId, eventName, payloadData) {
        if (!supabase) return;
        try {
            const topic = `chat-live:${chatId}`;
            let chan = supabase.channel(topic);
            let isSubscribed = false;
            chan.subscribe((status) => { if (status === 'SUBSCRIBED') isSubscribed = true; });
            
            await new Promise(resolve => {
                let attempt = 0;
                const check = setInterval(() => {
                    if (isSubscribed || attempt > 40) {
                        clearInterval(check);
                        resolve();
                    }
                    attempt++;
                }, 50);
            });

            if (isSubscribed) {
                chan.send({ type: 'broadcast', event: eventName, payload: payloadData });
            }
        } catch (e) { console.error('Chat broadcast error:', e); }
    },

    async sendMessage(chatId, content, fileUrl = null, replyToId = null) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        const user = (await supabase.auth.getUser()).data.user;

        const payload = {
            chat_id: chatId,
            sender_id: user.id,
            content
        };
        if (fileUrl) payload.file_url = fileUrl;
        if (replyToId) payload.reply_to_id = replyToId;

        // Select with joins so broadcast includes full profile + reply data
        const { data, error } = await supabase
            .from('messages')
            .insert(payload)
            .select('*, profiles:sender_id(name, avatar_url, username, is_verified), parent:reply_to_id(content, sender_id, profiles:sender_id(name))')
            .single();

        // Broadcast enriched message for instant delivery
        if (data) {
            await this._broadcastToChat(chatId, 'new_message', data);
            // 2. Broadcast via RealtimeManager for sidebar updates (no REST fallback warning)
            await RealtimeManager.broadcast('messages', 'INSERT', { chat_id: chatId, content, sender_id: user.id, created_at: data.created_at });
        }

        return { data, error };
    },

    subscribeToChat(chatId, { onInsert, onUpdate, onDelete } = {}) {
        if (!supabase) return null;

        // Use Broadcast for realtime — no DB replication needed
        const channel = supabase.channel(`chat-live:${chatId}`);

        if (onInsert) {
            channel.on('broadcast', { event: 'new_message' }, ({ payload }) => {
                onInsert(payload);
            });
        }

        if (onUpdate) {
            channel.on('broadcast', { event: 'message_updated' }, ({ payload }) => {
                onUpdate(payload);
            });
        }

        if (onDelete) {
            channel.on('broadcast', { event: 'message_deleted' }, ({ payload }) => {
                onDelete(payload);
            });
        }

        return channel.subscribe((status) => {
            console.log(`[Chat RT] ${chatId} subscription: ${status}`);
        });
    },

    async deleteMessage(messageId) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return { error: { message: 'Not authenticated' } };

        // Fetch the message first to get file_url, chat_id, and verify ownership
        const { data: msg } = await supabase
            .from('messages')
            .select('id, sender_id, file_url, chat_id')
            .eq('id', messageId)
            .eq('sender_id', user.id)
            .maybeSingle();

        if (!msg) return { error: { message: 'Mensagem não encontrada' } };

        // Delete file from storage if it exists
        if (msg.file_url) {
            try {
                const url = new URL(msg.file_url);
                const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
                if (pathMatch) {
                    await storageService.deleteFile(pathMatch[1], decodeURIComponent(pathMatch[2]));
                }
            } catch (e) { console.warn('File cleanup failed:', e); }
        }

        // Soft-delete: update content and clear file
        const result = await supabase
            .from('messages')
            .update({
                content: '[Mensagem apagada]',
                file_url: null,
                is_deleted: true
            })
            .eq('id', messageId)
            .eq('sender_id', user.id)
            .select()
            .single();

        // Broadcast the update for instant UI change on other clients
        if (result.data) {
            await this._broadcastToChat(msg.chat_id, 'message_updated', result.data);
        }

        return result;
    },

    // Unread tracking (localStorage-based)
    markAsRead(chatId) {
        try {
            const key = 'edulite_chat_read';
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            data[chatId] = new Date().toISOString();
            localStorage.setItem(key, JSON.stringify(data));
        } catch { }
    },

    getUnreadCounts(chats) {
        try {
            const key = 'edulite_chat_read';
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            const counts = {};
            for (const chat of chats) {
                if (!chat.last_message) continue;
                const lastRead = data[chat.id];
                if (!lastRead || new Date(chat.last_message.created_at) > new Date(lastRead)) {
                    if (!chat.last_message.is_mine) {
                        counts[chat.id] = 1; // Simple flag for "has unread"
                    }
                }
            }
            return counts;
        } catch { return {}; }
    },

    async getUnreadTotalCount() {
        if (!supabase) return 0;
        const { data } = await this.getChats();
        if (!data) return 0;
        const counts = this.getUnreadCounts(data);
        return Object.keys(counts).length;
    },

    /**
     * Subscribe to sidebar-level chat updates (new messages arriving in any chat).
     * Uses RealtimeManager's global broadcast channel.
     * @param {Function} callback - Called when any message INSERT is broadcast
     * @returns {void} - Cleanup via realtimeManager.unsubscribe('sidebar:messages')
     */
    subscribeToChatUpdates(callback) {
        realtimeManager.subscribe('sidebar:messages', 'messages', null, ['INSERT'], (payload) => {
            callback(payload.data);
        });
    }
};
