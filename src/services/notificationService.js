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

    // Mark single notification as read
    async markRead(notifId) {
        if (!supabase) return;
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notifId);
        return { error };
    },

    // Mark all notifications as read
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

    // Delete a notification
    async deleteNotification(notifId) {
        if (!supabase) return;
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notifId);
        return { error };
    },

    // Create a notification (called from other services when events happen)
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

        // Broadcast for instant delivery
        if (data) {
            try {
                const chan = supabase.channel(`notif-live:${userId}`);
                let isSubscribed = false;
                
                chan.subscribe((status) => {
                    if (status === 'SUBSCRIBED') isSubscribed = true;
                });

                // Wait up to 2 seconds for subscription
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
                    chan.send({
                        type: 'broadcast',
                        event: 'new_notification',
                        payload: data
                    });
                }
            } catch (e) { /* best-effort */ }
        }

        return { data, error };
    },

    // Subscribe to realtime notification changes (broadcast-based)
    subscribeToNotifications(userId, callback) {
        if (!supabase || !userId) return null;

        const channel = supabase
            .channel(`notif-live:${userId}`)
            .on('broadcast', { event: 'new_notification' }, ({ payload }) => {
                callback(payload);
            })
            .subscribe();

        return channel;
    },

    // Unsubscribe from realtime
    unsubscribe(channel) {
        if (supabase && channel) {
            supabase.removeChannel(channel);
        }
    },

    // Notify all members of a class (except excludeUserId)
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

        const { data, error } = await supabase
            .from('notifications')
            .insert(notifications)
            .select();

        if (error) {
            console.error('Bulk notify error:', error);
            return;
        }

        // Broadcast to each target user for instant delivery
        if (data) {
            for (const notif of data) {
                try {
                    const chan = supabase.channel(`notif-live:${notif.user_id}`);
                    let isSubscribed = false;
                    chan.subscribe((status) => { if (status === 'SUBSCRIBED') isSubscribed = true; });
                    await new Promise(resolve => {
                        let attempt = 0;
                        const check = setInterval(() => {
                            if (isSubscribed || attempt > 40) { clearInterval(check); resolve(); }
                            attempt++;
                        }, 50);
                    });
                    if (isSubscribed) {
                        chan.send({ type: 'broadcast', event: 'new_notification', payload: notif });
                    }
                } catch (e) { /* best-effort */ }
            }
        }
    }
};
