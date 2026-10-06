"use client";
import { useEffect, useMemo, useSyncExternalStore } from 'react';

type Snapshot<T> = { value: T; ready: boolean; error: string };
function createStore<T>(key: string | null, empty: T, parse: (input: unknown) => T) {
    const initial: Snapshot<T> = { value: empty, ready: false, error: '' };
    let current = initial, started = false, locked = false;
    const listeners = new Set<() => void>();
    function publish(next: Snapshot<T>) { current = next; listeners.forEach(fn => fn()); }
    function load() {
        if (!key) return;
        try {
            const raw = localStorage.getItem(key);
            const value = raw === null ? empty : parse(JSON.parse(raw));
            locked = false;
            publish({ value, ready: true, error: '' });
        } catch {
            locked = true;
            publish({ value: current.value, ready: true, error: 'Không đọc được bản lưu. Đã khóa ghi để giữ dữ liệu; xuất bản lưu gốc trước khi sửa bộ nhớ trình duyệt.' });
        }
    }
    return {
        initial,
        snapshot: () => current,
        subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; },
        start() {
            if (started || !key) return;
            started = true; load();
            window.addEventListener('storage', event => { if (event.key === key || event.key === null) load(); });
        },
        save(value: T) {
            if (!key || !current.ready || locked) return false;
            try {
                const checked = parse(value);
                localStorage.setItem(key, JSON.stringify(checked));
                publish({ value: checked, ready: true, error: '' });
                return true;
            } catch {
                publish({ ...current, error: 'Lưu thất bại. Thay đổi chưa được lưu; tải bản đang có trước khi rời trang.' });
                return false;
            }
        },
        raw() { try { return key ? localStorage.getItem(key) : null; } catch { return null; } },
    };
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
    return { ...state, save: store.save, raw: store.raw };
}
