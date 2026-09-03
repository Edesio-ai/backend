import { isAdmin } from './role.utils';

describe('isAdmin', () => {
  it('returns true only for admin role', () => {
    expect(isAdmin('admin')).toBe(true);
  });

  it('returns false for other roles and empty values', () => {
    expect(isAdmin('teacher')).toBe(false);
    expect(isAdmin('student')).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
    expect(isAdmin(null)).toBe(false);
    expect(isAdmin('')).toBe(false);
  });
});
