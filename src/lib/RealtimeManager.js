import { supabase } from './supabase.js';

/** Universally safe UUID generator (works in non-secure contexts) */
export function generateUUID() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    // Fallback for HTTP or older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
}

/**
 * RealtimeManager — Broadcast-based real-time subscription manager.
 * 
 * Uses a single Supabase Broadcast channel for ALL data change events.
 * No dependency on Postgres Replication — works instantly out of the box.
 * 
 * Usage:
 *   // Subscribe (same API as before)
 *   realtimeManager.subscribe('class:123:assignments', 'assignments',
 *     { column: 'class_id', value: '123' },
 *     ['INSERT', 'UPDATE', 'DELETE'],
 *     (payload) => { ... }
 *   );
 *   
 *   // Broadcast from services after mutations
 *   RealtimeManager.broadcast('assignments', 'INSERT', { class_id: '123', ... });
 *   
 *   // Cleanup
 *   realtimeManager.unsubscribeByPrefix('class:123');
 *   realtimeManager.cleanup();
 */
class RealtimeManager {
    constructor() {
        /** @type {Map<string, { table: string, filter: string|null, events: string[], callback: Function }>} */
        this.subscriptions = new Map();
        /** @type {import('@supabase/supabase-js').RealtimeChannel|null} */
        this.channel = null;
    }

    /** Lazily create the single global broadcast channel */
    _ensureChannel() {
        if (this.channel || !supabase) return;

        this.channelStatus = 'JOINING';
        this.channel = supabase.channel('data-changes');
        
        this.channel.on('broadcast', { event: 'change' }, ({ payload }) => {
            if (!payload) return;
            const { table, event, data } = payload;

            for (const [, sub] of this.subscriptions) {
                if (sub.table !== table) continue;
                if (!sub.events.includes(event)) continue;
                if (sub.filter) {
                    const match = sub.filter.match(/^(.+?)=eq\.(.+)$/);
                    if (match) {
                        const [, col, val] = match;
                        if (data && String(data[col]) !== String(val)) continue;
                    }
                }
                try { sub.callback(payload); } catch (e) { console.error('[RT] callback error:', e); }
            }
        });

        this.channel.subscribe((status) => {
            this.channelStatus = status;
            if (status === 'SUBSCRIBED') {
                console.log('[RT] ✅ Global broadcast channel connected');
            } else if (status === 'CHANNEL_ERROR') {
                console.warn('[RT] ❌ Global channel error');
            }
        });
    }

    async _waitForConnection() {
        if (!this.channel) return;
        if (this.channelStatus === 'SUBSCRIBED') return;
        return new Promise(resolve => {
            let attempt = 0;
            const check = setInterval(() => {
                if (this.channelStatus === 'SUBSCRIBED' || attempt > 40) { // Max 2 seconds timeout
                    clearInterval(check);
                    resolve();
                }
                attempt++;
            }, 50);
        });
    }

    /**
     * Subscribe to data changes. Filter is applied client-side.
     * @param {string} key - Unique subscription key
     * @param {string} table - Table name to listen for
     * @param {string|null} filter - Optional filter like 'class_id=eq.xxx' (applied client-side)
     * @param {string[]} events - Events: 'INSERT', 'UPDATE', 'DELETE'
     * @param {(payload: any) => void} callback
     */
    subscribe(key, table, filter, events, callback) {
        if (!supabase) return;
        this.unsubscribe(key);
        this._ensureChannel();
        this.subscriptions.set(key, { table, filter, events, callback });
        console.log(`[RT] ✅ ${key}`);
    }

    /**
     * Broadcast a data change to all subscribers.
     * Call this from services after any mutation.
     * Uses the singleton's channel to avoid creating duplicate channels.
     * @param {string} table - Table name
     * @param {string} event - 'INSERT', 'UPDATE', or 'DELETE'
     * @param {object} data - The row data (should include filter fields like class_id)
     */
    static async broadcast(table, event, data = {}) {
        if (!supabase) return;
        try {
            const mgr = realtimeManager;
            mgr._ensureChannel();
            await mgr._waitForConnection();
            if (mgr.channel && mgr.channelStatus === 'SUBSCRIBED') {
                mgr.channel.send({
                    type: 'broadcast',
                    event: 'change',
                    payload: { table, event, data }
                });
            }
        } catch (e) { console.error('[RT] broadcast error:', e); }
    }

    /** Unsubscribe a specific key */
    unsubscribe(key) {
        if (this.subscriptions.delete(key)) {
            console.log(`[RT] 🔌 ${key}`);
        }
    }

    /** Unsubscribe all keys starting with prefix */
    unsubscribeByPrefix(prefix) {
        for (const key of [...this.subscriptions.keys()]) {
            if (key.startsWith(prefix)) {
                this.subscriptions.delete(key);
                console.log(`[RT] 🔌 ${key}`);
            }
        }
    }

    /** Cleanup everything */
    cleanup() {
        for (const key of this.subscriptions.keys()) {
            console.log(`[RT] 🧹 ${key}`);
        }
        this.subscriptions.clear();
        if (this.channel) {
            supabase.removeChannel(this.channel);
            this.channel = null;
        }
    }

    get activeCount() {
        return this.subscriptions.size;
    }
}

export const realtimeManager = new RealtimeManager();
export { RealtimeManager };
