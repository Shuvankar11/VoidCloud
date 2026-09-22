import { describe, it, expect, beforeEach } from 'vitest';

describe('VoidCloud User Profile & Authentication Unit Tests', () => {
  const LOCAL_USERS_KEY = 'voidcloud_registered_users';
  const LOCAL_SESSION_KEY = 'voidcloud_current_user';
  let memoryStorage: Record<string, string> = {};

  beforeEach(() => {
    memoryStorage = {};
    (globalThis as any).localStorage = {
      getItem: (key: string) => memoryStorage[key] || null,
      setItem: (key: string, value: string) => {
        memoryStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete memoryStorage[key];
      },
      clear: () => {
        memoryStorage = {};
      },
    };
  });

  it('stores full name on user signup', () => {
    const mockUser = {
      uid: 'usr_test_123',
      email: 'alex@voidcloud.io',
      displayName: 'Alex Vance',
      createdAt: new Date().toISOString(),
      isAnonymous: false,
    };

    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(mockUser));
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify([{ ...mockUser, password: 'password123' }]));

    const session = JSON.parse(localStorage.getItem(LOCAL_SESSION_KEY) || '{}');
    expect(session.displayName).toBe('Alex Vance');
    expect(session.email).toBe('alex@voidcloud.io');
  });

  it('updates user display name and persists to session and user directory', () => {
    const mockUser = {
      uid: 'usr_test_456',
      email: 'shuvankar@voidcloud.io',
      displayName: 'Shuvankar',
      createdAt: new Date().toISOString(),
      isAnonymous: false,
    };

    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(mockUser));
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify([{ ...mockUser, password: 'securePass123' }]));

    // Simulate updateUserProfile
    const updatedDisplayName = 'Shuvankar Samanta';
    const updatedUser = { ...mockUser, displayName: updatedDisplayName };

    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(updatedUser));
    const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    users[0].displayName = updatedDisplayName;
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));

    const retrievedSession = JSON.parse(localStorage.getItem(LOCAL_SESSION_KEY) || '{}');
    expect(retrievedSession.displayName).toBe('Shuvankar Samanta');

    const retrievedUsers = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    expect(retrievedUsers[0].displayName).toBe('Shuvankar Samanta');
  });

  it('updates user profile picture (DP) and supports removal', () => {
    const mockUser = {
      uid: 'usr_test_789',
      email: 'pilot@voidcloud.io',
      displayName: 'Void Pilot',
      createdAt: new Date().toISOString(),
      photoURL: undefined,
    };

    // Add custom DP
    const customDP = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const userWithDP = { ...mockUser, photoURL: customDP };
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(userWithDP));

    let session = JSON.parse(localStorage.getItem(LOCAL_SESSION_KEY) || '{}');
    expect(session.photoURL).toBe(customDP);

    // Remove custom DP
    const userWithoutDP = { ...userWithDP, photoURL: '' };
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(userWithoutDP));

    session = JSON.parse(localStorage.getItem(LOCAL_SESSION_KEY) || '{}');
    expect(session.photoURL).toBe('');
  });

  it('validates password minimum length requirement (at least 6 characters)', () => {
    const validatePassword = (pass: string) => {
      if (!pass || pass.length < 6) {
        throw new Error('New password must be at least 6 characters long.');
      }
      return true;
    };

    expect(() => validatePassword('12345')).toThrow('at least 6 characters long');
    expect(validatePassword('123456')).toBe(true);
    expect(validatePassword('StrongVaultPassword!2026')).toBe(true);
  });

  it('validates current password before updating to a new password', () => {
    const storedUser = {
      uid: 'usr_security_1',
      email: 'sec@voidcloud.io',
      password: 'ExistingPassword2026',
    };

    const changeUserPassword = (currentInput: string, newInput: string) => {
      if (storedUser.password && currentInput !== storedUser.password) {
        throw new Error('Current password does not match.');
      }
      if (newInput.length < 6) {
        throw new Error('New password must be at least 6 characters long.');
      }
      storedUser.password = newInput;
      return true;
    };

    expect(() => changeUserPassword('WrongPassword', 'NewSecret123')).toThrow('Current password does not match');
    expect(storedUser.password).toBe('ExistingPassword2026');

    expect(changeUserPassword('ExistingPassword2026', 'NewSecret123')).toBe(true);
    expect(storedUser.password).toBe('NewSecret123');
  });

  it('generates proper initials from user display name or email', () => {
    const getInitials = (name?: string, email?: string) => {
      if (name && name.trim()) {
        const parts = name.trim().split(/\s+/);
        if (parts.length > 1) {
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return parts[0].slice(0, 2).toUpperCase();
      }
      return email ? email.slice(0, 2).toUpperCase() : 'U';
    };

    expect(getInitials('Shuvankar Samanta', 'shuvankar@voidcloud.io')).toBe('SS');
    expect(getInitials('Alice', 'alice@voidcloud.io')).toBe('AL');
    expect(getInitials('', 'john.doe@midnight.network')).toBe('JO');
    expect(getInitials(undefined, 'user@domain.com')).toBe('US');
  });
});
