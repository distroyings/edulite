import { supabase } from '../lib/supabase.js';

export const notificationService = {
    // Fetch all notifications for current user (newest first)
    async getNotifications(limit = 30) {
        if (!supabase) return { data: [], error: null };
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return { data: [], error: null };

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        return { data: data || [], error };
    },

    // Get unread count
    async getUnreadCount() {
        if (!supabase) return 0;
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return 0;

        const { count, error } = await supabase
            .from('notifications')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

        return error ? 0 : (count || 0);
    },

    async markRead(notifId) {
        if (!supabase) return;
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notifId);
        return { error };
    },

    async markAllRead() {
        if (!supabase) return;
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return;

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);
        return { error };
    },

    async deleteNotification(notifId) {
        if (!supabase) return;
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notifId);
        return { error };
    },

    /**
     * Create a notification. Realtime delivery is automatic via the
     * `supabase_realtime` publication (Postgres CDC) — subscribers on
     * the notifications table receive the INSERT event server-side.
     */
    async createNotification(userId, type, title, body = '', link = '', referenceId = null) {
        if (!supabase) return;
        const { data, error } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                type,
                title,
                body,
                link,
                reference_id: referenceId,
            })
            .select()
            .single();
        return { data, error };
    },

    /**
     * Subscribe to live notifications for `userId` via Postgres CDC.
     * `notifications` must be in the supabase_realtime publication.
     * Returns the channel — pass it to `unsubscribe()` for cleanup.
     */
    subscribeToNotifications(userId, callback) {
        if (!supabase || !userId) return null;
        
        // Import realtimeManager lazily to avoid circular dependencies if any
        import('../lib/RealtimeManager.js').then(({ realtimeManager }) => {
            realtimeManager.subscribe(`notif:${userId}`, 'notifications', { column: 'user_id', value: userId }, ['INSERT'], (payload) => {
                if (payload.event === 'INSERT') {
                    try { callback(payload.data); } catch (e) { console.error('notification callback:', e); }
                }
            });
        });

        return `notif:${userId}`; // Return the key for unsubscription
    },

    unsubscribe(key) {
        if (key) {
            import('../lib/RealtimeManager.js').then(({ realtimeManager }) => {
                realtimeManager.unsubscribe(key);
            });
        }
    },

    /**
     * Bulk-notify every member of a class except the actor. The bulk
     * INSERT fans out via CDC to each recipient's subscription — no
     * per-user broadcast loop required.
     */
    async notifyClassMembers(classId, excludeUserId, type, title, body = '', link = '', referenceId = null) {
        if (!supabase) return;

        const { data: members } = await supabase
            .from('class_members')
            .select('user_id')
            .eq('class_id', classId);

        if (!members) return;

        const targets = members.filter(m => m.user_id !== excludeUserId);
        const notifications = targets.map(m => ({
            user_id: m.user_id,
            type,
            title,
            body,
            link,
            reference_id: referenceId,
        }));

        if (notifications.length === 0) return;

        const { error } = await supabase
            .from('notifications')
            .insert(notifications);

        if (error) console.error('Bulk notify error:', error);
    }
};
