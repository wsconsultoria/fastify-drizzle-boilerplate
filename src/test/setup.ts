import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { db } from '@/drizzle/db';

vi.mock('@/drizzle/db', () => ({
  db: mockDeep<typeof db>(),
}));

beforeAll(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  mockReset(db);
  vi.resetAllMocks();
});

afterAll(() => {
  vi.useRealTimers();
});
