import { emptyProject, parseProject, type ProjectDraft } from './project-core';

export type RemoteProject = { content: ProjectDraft; revision: number };
export type ProjectConflict = { local: ProjectDraft; remote: ProjectDraft; raw: string | null; revision: number; hash: string };
export type ProjectSyncResult = { state: 'synced' | 'pending' | 'conflict' | 'error' | 'cancelled'; message: string; conflict?: ProjectConflict; localRaw?: string | null };
export type ProjectDecision = { choice: 'local' | 'remote'; conflict: ProjectConflict };
export type ProjectSyncAdapter = {
    owner: string;
    active: () => boolean;
    local: { raw: () => string | null; busy: () => boolean; restore: (value: unknown, baseline: string | null) => Promise<boolean> };
    storage: { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void };
    remote: { load: (owner: string) => Promise<RemoteProject | null>; save: (owner: string, revision: number, content: ProjectDraft) => Promise<RemoteProject> };
};
export const projectSyncKey = (owner: string) => `roadmap-v2:project-sync:user:${owner}`;
export const projectConflictKey = (owner: string) => `roadmap-v2:project-conflict:user:${owner}`;
const pending = (): ProjectSyncResult => ({ state: 'pending', message: 'Đã lưu trên thiết bị; đang chờ đồng bộ dự án.' });
const cancelled = (): ProjectSyncResult => ({ state: 'cancelled', message: '' });
async function fingerprint(value: ProjectDraft) {
    const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(value)));
    return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
}
function checkedRemote(row: RemoteProject | null): RemoteProject {
    if (!row) return { content: emptyProject(), revision: 0 };
    if (!Number.isSafeInteger(row.revision) || row.revision < 1) throw Error('Invalid project revision');
    return { content: parseProject(row.content), revision: row.revision };
}
// The caller holds an exclusive cloud lock for this account. Local editing uses
// its own short lock; a slow network must never block typing or local backups.
export async function syncProject(adapter: ProjectSyncAdapter, decision?: ProjectDecision): Promise<ProjectSyncResult> {
    const { local, storage, remote, owner, active } = adapter;
    if (!active()) return cancelled();
    if (local.busy()) return pending();
    try {
        const raw = local.raw();
        const value = raw === null ? emptyProject() : parseProject(JSON.parse(raw));
        const hash = await fingerprint(value);
        const metaRaw = storage.getItem(projectSyncKey(owner));
        const meta = metaRaw === null ? null : JSON.parse(metaRaw) as { version: number; revision: number; hash: string };
        if (metaRaw !== null && (!meta || meta.version !== 1 || !Number.isSafeInteger(meta.revision) || meta.revision < 0 || !/^[a-f0-9]{64}$/.test(meta.hash))) throw Error('Invalid sync metadata');
        if (!active()) return cancelled();
        const row = checkedRemote(await remote.load(owner));
        const remoteHash = await fingerprint(row.content);
        if (!active()) return cancelled();
        if (local.busy() || local.raw() !== raw) return pending();
        const conflict: ProjectConflict = { local: value, remote: row.content, raw, revision: row.revision, hash: remoteHash };
        const conflictResult = (): ProjectSyncResult => ({ state: 'conflict', message: 'Dự án trên thiết bị và máy chủ khác nhau. Xem và tải hai bản trước khi chọn bản muốn giữ.', conflict });
        const acknowledge = (revision: number, acknowledgedHash: string): ProjectSyncResult => {
            if (!active()) return cancelled();
            storage.setItem(projectSyncKey(owner), JSON.stringify({ version: 1, revision, hash: acknowledgedHash }));
            return local.busy() || local.raw() !== raw ? pending() : { state: 'synced', message: 'Đã đồng bộ dự án với máy chủ.', localRaw: raw };
        };
        if (decision) {
            // A click on an old conflict view cannot replace newer work from
            // either device. Refresh the comparison and require a new choice.
            if (decision.conflict.raw !== raw || decision.conflict.revision !== row.revision || decision.conflict.hash !== remoteHash) return conflictResult();
            storage.setItem(projectConflictKey(owner), JSON.stringify({ version: 1, local: value, remote: row.content, remoteRevision: row.revision }));
        }
        if (!decision && meta && row.revision < meta.revision) return conflictResult();
        if (hash === remoteHash) return acknowledge(row.revision, hash);
        if (!decision && meta && row.revision === meta.revision && remoteHash !== meta.hash) return conflictResult();
        const pristine = raw === null;
        const clean = meta !== null && hash === meta.hash;
        if (decision?.choice === 'remote' || (!decision && (pristine || clean))) {
            if (!active()) return cancelled();
            if (!await local.restore(row.content, raw)) return pending();
            if (!active()) return cancelled();
            storage.setItem(projectSyncKey(owner), JSON.stringify({ version: 1, revision: row.revision, hash: remoteHash }));
            // Restore itself may finish while another local edit is queued.
            const restored = local.raw();
            return !local.busy() && restored !== null && JSON.stringify(parseProject(JSON.parse(restored))) === JSON.stringify(row.content)
                ? { state: 'synced', message: 'Đã đồng bộ dự án với máy chủ.', localRaw: restored } : pending();
        }
        const unchangedRemote = meta ? row.revision === meta.revision && remoteHash === meta.hash : row.revision === 0;
        if (!decision && !unchangedRemote) return conflictResult();
        if (!active()) return cancelled();
        const saved = checkedRemote(await remote.save(owner, row.revision, value));
        if (saved.revision <= row.revision || JSON.stringify(saved.content) !== JSON.stringify(value)) throw Error('Invalid project acknowledgement');
        return acknowledge(saved.revision, hash);
    } catch {
        return active() ? { state: 'error', message: 'Chưa xác nhận đồng bộ dự án. Bản lưu trên thiết bị được giữ nguyên; kiểm tra mạng và thử lại.' } : cancelled();
    }
}
