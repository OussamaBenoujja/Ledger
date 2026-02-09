export function getApiUrl(): string {
    // If running on the client, use the public API URL
    if (typeof window !== 'undefined') {
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    }

    // If running on the server (SSR), use the internal Docker network URL if available,
    // otherwise fallback to NEXT_PUBLIC_API_URL or localhost.
    // In Docker, you should set INTERNAL_API_URL=http://ledger_api:3000
    return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
}
