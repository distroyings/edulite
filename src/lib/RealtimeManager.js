import { supabase } from './supabase.js';

/** Universally safe UUID generator (works in non-secure contexts) */
export function generateUUID() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
}

/**
 * RealtimeManager — Postgres CDC subscription manager.
 *
 * Each subscribe() creates a dedicated supabase channel that listens for
 * `postgres_changes` events on the target table. The underlying WebSocket
 * connection is shared across channels by the supabase client, so the
 * per-key channel overhead is just protocol-level state.
 *
 *   realtimeManager.subscribe('class:123:assignments', 'assignments',
 *     { column: 'class_id', value: '123' },
 *     ['INSERT', 'UPDATE', 'DELETE'],
 *     (payload) => { ... }
 *   );
 *   realtimeManager.unsubscribe('class:123:assignments');
 *   realtimeManager.unsubscribeByPrefix('class:123');
 *   realtimeManager.cleanup();
 *
 * Tables MUST be part of the `supabase_realtime` publication — see
 * create_all.sql `ALTER PUBLICATION supabase_realtime ADD TABLE ...`.
 *
 * Writers do NOT need to broadcast anything after a mutation; Postgres
 * delivers the INSERT/UPDATE/DELETE event to all subscribers itself.
 */
class RealtimeManager {
    constructor() {
        /** @type {Map<string, { channel: import('@supabase/supabase-js').RealtimeChannel, table: string }>} */
        this.subscriptions = new Map();
    }

    /**
     * Subscribe to data changes via Postgres CDC.
     *
     * @param {string} key - Unique subscription key
     * @param {string} table - Table name (must be in supabase_realtime publication)
     * @param {{column: string, value: any}|null} filter - Equality filter, or null for all rows
     * @param {Array<'INSERT'|'UPDATE'|'DELETE'>} events
     * @param {(payload: { table: string, event: string, data: any }) => void} callback
     */
    subscribe(key, table, filter, events, callback) {
        if (!supabase || !table || !Array.isArray(events) || events.length === 0) return;

        // Replace any previous subscription with the same key.
        this.unsubscribe(key);

        const filterStr = filter && filter.column && filter.value !== undefined
            ? `${filter.column}=eq.${filter.value}`
            : undefined;

        // A unique channel name per key avoids accidental sharing if the
        // same key is re-registered after a re-mount.
        const channel = supabase.channel(`rt:${key}:${generateUUID()}`);

        const opts = { event: '*', schema: 'public', table };
        if (filterStr) opts.filter = filterStr;

        channel.on('postgres_changes', opts, (payload) => {
            if (!events.includes(payload.eventType)) return;
            const data = payload.eventType === 'DELETE' ? payload.old : payload.new;
            try {
                callback({ table, event: payload.eventType, data });
            } catch (e) {
                console.error(`[RT] callback error in ${key}:`, e);
            }
        });

        channel.subscribe();
        this.subscriptions.set(key, { channel, table });
    }

    /** Unsubscribe a specific key — tears down the underlying channel. */
    unsubscribe(key) {
        const sub = this.subscriptions.get(key);
        if (!sub) return;
        try { supabase.removeChannel(sub.channel); } catch { /* ignore */ }
        this.subscriptions.delete(key);
    }

    /** Unsubscribe all keys starting with prefix (e.g. `class:abc:`). */
    unsubscribeByPrefix(prefix) {
        for (const key of [...this.subscriptions.keys()]) {
            if (key.startsWith(prefix)) this.unsubscribe(key);
        }
    }

    /** Tear down every active subscription. */
    cleanup() {
        for (const key of [...this.subscriptions.keys()]) this.unsubscribe(key);
    }

    get activeCount() {
        return this.subscriptions.size;
    }
}

export const realtimeManager = new RealtimeManager();
