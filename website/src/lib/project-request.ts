// Bound the entire SDK operation, including authentication/header preparation.
// An aborted fetch signal alone does not stop an SDK waiting before fetch().
export async function projectRequest<T>(lifetime: AbortSignal, operation: (signal: AbortSignal) => PromiseLike<T>): Promise<T> {
    if (lifetime.aborted) throw Error('Project sync cancelled');
    const request = new AbortController();
    let cancel = () => {};
    const stopped = new Promise<never>((_resolve, reject) => {
        cancel = () => { request.abort(); reject(Error('Project sync cancelled or timed out')); };
    });
    lifetime.addEventListener('abort', cancel, { once: true });
    const timer = setTimeout(cancel, 15000);
    try { return await Promise.race([operation(request.signal), stopped]); }
    finally { clearTimeout(timer); lifetime.removeEventListener('abort', cancel); }
}
