import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// test/unit/services/neteaseSearch.test.ts
// Covers the anonymous-cookie cold-start retry for NetEase search.

const mockJsonResponse = (payload: unknown) => ({
    status: 200,
    text: vi.fn().mockResolvedValue(JSON.stringify(payload)),
});

describe('netease search', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.restoreAllMocks();
        vi.stubEnv('VITE_NETEASE_API_BASE', 'http://127.0.0.1:3000');
        const values = new Map([
            ['online_provider:netease:anonymous_cookie', 'anonymous-cookie'],
        ]);
        vi.stubGlobal('localStorage', {
            getItem: vi.fn((key: string) => values.get(key) ?? null),
            setItem: vi.fn((key: string, value: string) => values.set(key, value)),
            removeItem: vi.fn((key: string) => values.delete(key)),
        });
        vi.stubGlobal('window', {});
        vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
    });

    it('retries an empty anonymous result once during cold start', async () => {
        vi.mocked(fetch)
            .mockResolvedValueOnce(mockJsonResponse({ code: 200, result: { songs: [], songCount: 0 } }) as any)
            .mockResolvedValueOnce(mockJsonResponse({
                code: 200,
                result: { songs: [{ id: 42, name: '戒不掉' }], songCount: 1 },
            }) as any);

        const { neteaseApi } = await import('@/services/netease');
        const response = await neteaseApi.cloudSearch('戒不掉');

        expect(response.result.songs).toHaveLength(1);
        expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
        expect(String(vi.mocked(fetch).mock.calls[0]?.[0])).toContain('/cloudsearch?keywords=%E6%88%92%E4%B8%8D%E6%8E%89');
        expect(String(vi.mocked(fetch).mock.calls[1]?.[0])).toContain('/cloudsearch?keywords=%E6%88%92%E4%B8%8D%E6%8E%89');
    });

    it('preserves a zero-count cloud response when the backend omits data', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(mockJsonResponse({ code: 200, count: 0 }) as any);

        const { neteaseApi } = await import('@/services/netease');
        const response = await neteaseApi.getUserCloud(1, 0);

        expect(response).toMatchObject({ code: 200, count: 0 });
        expect(response).not.toHaveProperty('songs');
    });
});
