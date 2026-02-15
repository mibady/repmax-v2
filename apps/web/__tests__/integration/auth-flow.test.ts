import { describe, it, expect, beforeEach, vi } from 'vitest';
import { login, signup, signOut } from '@/lib/actions/auth-actions';
import { mockSupabaseClient } from '../setup';
import { redirect } from 'next/navigation';

describe('Auth Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // login
  // -------------------------------------------------------------------------
  describe('login', () => {
    it('returns error when email is missing', async () => {
      const formData = new FormData();
      formData.set('password', 'TestPass123!');

      const result = await login(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email and password are required');
    });

    it('returns error when password is missing', async () => {
      const formData = new FormData();
      formData.set('email', 'test@example.com');

      const result = await login(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email and password are required');
    });

    it('calls signInWithPassword with correct credentials and redirects on success', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'u1' }, session: {} },
        error: null,
      });

      const formData = new FormData();
      formData.set('email', 'test@example.com');
      formData.set('password', 'TestPass123!');

      await login(formData);

      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'TestPass123!',
      });
      expect(redirect).toHaveBeenCalledWith('/dashboard');
    });

    it('returns error on auth failure', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      const formData = new FormData();
      formData.set('email', 'wrong@example.com');
      formData.set('password', 'badpassword');

      const result = await login(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid login credentials');
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // signup
  // -------------------------------------------------------------------------
  describe('signup', () => {
    it('returns error when required fields are missing', async () => {
      const formData = new FormData();
      formData.set('email', 'test@example.com');
      // missing password and fullname

      const result = await signup(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('All fields are required');
    });

    it('returns error when password is less than 6 characters', async () => {
      const formData = new FormData();
      formData.set('email', 'test@example.com');
      formData.set('password', '12345');
      formData.set('fullname', 'John Doe');

      const result = await signup(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Password must be at least 6 characters');
    });

    it('calls signUp with email, password, and metadata then redirects', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: { id: 'u2' }, session: {} },
        error: null,
      });

      const formData = new FormData();
      formData.set('email', 'newuser@example.com');
      formData.set('password', 'SecurePass1!');
      formData.set('fullname', 'Jane Smith');

      await signup(formData);

      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'SecurePass1!',
        options: {
          data: { full_name: 'Jane Smith' },
          emailRedirectTo: expect.stringContaining('/auth/callback'),
        },
      });
      expect(redirect).toHaveBeenCalledWith('/onboarding/role');
    });
  });

  // -------------------------------------------------------------------------
  // signOut
  // -------------------------------------------------------------------------
  describe('signOut', () => {
    it('calls auth.signOut and redirects to /login', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null });

      await signOut();

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith('/login');
    });
  });
});
