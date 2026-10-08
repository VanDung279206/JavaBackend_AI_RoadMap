"use client";
import { useEffect, useMemo, useSyncExternalStore } from 'react';

type Snapshot<T> = { value: T; ready: boolean; saving: boolean; blocked: boolean; error: string };
function createStore<T>(key: string | null, empty: T, parse: (input: unknown) => T) {
    const initial: Snapshot<T> = { value: empty, ready: false, saving: false, blocked: false, error: '' };
    let current = initial, started = false, locked = false;
    let savedValue = empty;
    const listeners = new Set<() => void>();
    const pending = new Map<symbol, (latest: T) => T>();
    function publish(next: Omit<Snapshot<T>, 'saving'>) {
        current = { ...next, saving: pending.size > 0 };
        listeners.forEach(fn => fn());
    }
    function read() {
        const raw = localStorage.getItem(key!);
        return raw === null ? empty : parse(JSON.parse(raw));
    }
    function preview(value: T) {
        for (const change of pending.values()) {
            try { value = parse(change(value)); } catch { /* Validation is reported by the queued save. */ }
        }
        return value;
    }
    function load() {
        if (!key) return;
        try {
            savedValue = read();
            const value = preview(savedValue);
            locked = false;
            publish({ value, ready: true, blocked: false, error: '' });
        } catch {
            locked = true;
            publish({ value: current.value, ready: true, blocked: true, error: 'Không đọc được bản lưu. Đã khóa ghi để giữ dữ liệu; xuất bản lưu gốc trước khi sửa bộ nhớ trình duyệt.' });
        }
    }
    const api = {
        initial,
        snapshot: () => current,
        subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; },
        start() {
            if (started || !key) return;
            started = true; load();
            window.addEventListener('storage', event => { if (event.key === key || event.key === null) load(); });
            window.addEventListener('beforeunload', event => {
                if (pending.size > 0) { event.preventDefault(); event.returnValue = ''; }
            });
        },
        async save(change: (latest: T) => T): Promise<boolean> {
            if (!key || !current.ready || locked) return false;
            if (!navigator.locks) {
                publish({ ...current, error: 'Trình duyệt chưa hỗ trợ khóa ghi an toàn. Dùng HTTPS và trình duyệt hỗ trợ Web Locks để lưu; bạn vẫn có thể xuất bản đang có.' });
                return false;
            }
            const ticket = Symbol();
            pending.set(ticket, change);
            // Controlled inputs must reflect typing before the asynchronous lock
            // is granted. Keep later queued edits visible when an earlier save ends.
            publish({ ...current, value: preview(savedValue), error: '' });
            try {
                // Read and merge inside the same exclusive lock across tabs. Never
                // base a write on the render snapshot or wait for a storage event.
                return await navigator.locks.request(`draft:${key}`, { mode: 'exclusive' }, () => {
                    let latest: T;
                    try { latest = read(); } catch {
                        pending.delete(ticket);
                        load();
                        return false;
                    }
                    const checked = parse(change(latest));
                    localStorage.setItem(key, JSON.stringify(checked));
                    pending.delete(ticket);
                    savedValue = checked;
                    publish({ value: preview(checked), ready: true, blocked: false, error: '' });
                    return true;
                });
            } catch {
                pending.delete(ticket);
                load();
                if (!locked) publish({ ...current, error: 'Lưu thất bại. Thay đổi chưa được lưu; bạn có thể sửa và thử lại hoặc tải bản đang có trước khi rời trang.' });
                return false;
            }
        },
        raw() { try { return key ? localStorage.getItem(key) : null; } catch { return null; } },
        backup() {
            // Check the live queue as well as the UI flag, so a stale click handler
            // cannot export old bytes while an optimistic edit is waiting to save.
            if (!key || !current.ready || (pending.size > 0 && !locked)) return null;
            try { return localStorage.getItem(key) ?? JSON.stringify(savedValue); } catch { return null; }
        },
        async restore(input: unknown, baseline: string | null, merge: (latest: T, imported: T) => T = (_latest, imported) => imported): Promise<boolean> {
            if (!key || !current.ready || locked || pending.size > 0) return false;
            let imported: T;
            try { imported = parse(input); } catch {
                publish({ ...current, error: 'File không đúng định dạng bản lưu. Dữ liệu hiện tại được giữ nguyên.' });
                return false;
            }
            let conflict = false;
            const restored = await api.save(latest => {
                if (localStorage.getItem(key) !== baseline) { conflict = true; throw Error('Draft changed during import'); }
                return merge(latest, imported);
            });
            if (conflict) publish({ ...current, error: 'Bản lưu đã thay đổi sau khi chọn file. Chọn lại file và xem trước để tránh ghi đè thay đổi mới.' });
            return restored;
        },
    };
    return api;
}
// One stable store per owner/area; account changes never reuse the guest snapshot.
const stores = new Map<string, ReturnType<typeof createStore<unknown>>>();
export function useLocalDraft<T>(key: string | null, empty: T, parse: (input: unknown) => T) {
    const store = useMemo(() => {
        if (!key) return createStore<T>(null, empty, parse);
        if (!stores.has(key)) stores.set(key, createStore(key, empty, parse) as ReturnType<typeof createStore<unknown>>);
        return stores.get(key)! as ReturnType<typeof createStore<T>>;
    }, [key, empty, parse]);
    const state = useSyncExternalStore(store.subscribe, store.snapshot, () => store.initial);
    useEffect(() => { store.start(); }, [store]);
    return { ...state, save: store.save, raw: store.raw, backup: store.backup, restore: store.restore };
}
