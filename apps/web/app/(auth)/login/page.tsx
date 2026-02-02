'use client';

import Link from 'next/link';
import { useState } from 'react';
import { login, signInWithGoogle, signInWithApple, resetPassword } from '@/lib/actions/auth-actions';

export default function Page() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await login(formData);
      if (!result.success && result.error) {
        setError(result.error);
      }
    } catch {
      // Redirect happens on success, errors are caught here
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithGoogle();
      if (!result.success && result.error) {
        setError(result.error);
      }
    } catch {
      // Redirect happens on success
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAppleSignIn() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithApple();
      if (!result.success && result.error) {
        setError(result.error);
      }
    } catch {
      // Redirect happens on success
    } finally {
      setIsLoading(false);
    }
  }

  async function handleForgotPassword() {
    const email = (document.getElementById('email') as HTMLInputElement)?.value;
    if (!email) {
      setError('Please enter your email address first');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await resetPassword(email);
      if (result.success) {
        setResetSent(true);
      } else if (result.error) {
        setError(result.error);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/*  Left Panel: Brand & Atmosphere  */}
      <div className="relative w-full md:w-[45%] h-32 md:h-full bg-dark-panel-l flex flex-col items-center justify-center overflow-hidden shrink-0">
        {/*  Ambient Background Effects  */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-60 pointer-events-none"></div>
        {/*  Football Silhouette/Texture Background  */}
        <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-cover bg-center pointer-events-none" data-alt="American football stadium lights at night" style={{backgroundImage: "url('https"}}>
        </div>
        {/*  Brand Content  */}
        <div className="relative z-10 flex flex-col items-center text-center p-8">
          <h1 className="text-primary tracking-tight text-5xl md:text-6xl font-black leading-tight mb-2 drop-shadow-lg">
            REPMAX
          </h1>
          <p className="text-white text-lg md:text-xl font-light italic opacity-90 tracking-wide">
            Every Rep Counts.
          </p>
          {/*  Decorative Element  */}
          <div className="mt-8 w-16 h-1 bg-primary rounded-full opacity-60"></div>
        </div>
        {/*  Subtle overlay pattern  */}
        <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
      </div>

      {/*  Right Panel: Login Form  */}
      <div className="w-full md:w-[55%] h-full bg-dark-panel-r flex flex-col justify-center items-center overflow-y-auto relative">
        <div className="w-full max-w-[520px] px-6 py-12 md:px-12 flex flex-col">
          {/*  Header Section  */}
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-white text-3xl md:text-4xl font-black leading-tight mb-3 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-gray-400 text-base font-normal">
              Enter your details to access recruiting intelligence.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Reset Password Sent Message */}
          {resetSent && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
              Password reset email sent! Check your inbox.
            </div>
          )}

          {/*  Login Form  */}
          <form action={handleSubmit} className="flex flex-col gap-6">
            {/*  Email Field  */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-300 text-sm font-medium ml-1" htmlFor="email">Email Address</label>
              <input
                className="w-full h-14 bg-input-bg text-white placeholder-gray-500 rounded-xl border border-transparent focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none px-4 transition-all duration-200"
                id="email"
                name="email"
                placeholder="coach@university.edu"
                type="email"
                required
                disabled={isLoading}
              />
            </div>

            {/*  Password Field  */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-gray-300 text-sm font-medium" htmlFor="password">Password</label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-primary text-sm hover:underline hover:text-primary/80 transition-colors"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center">
                <input
                  className="w-full h-14 bg-input-bg text-white placeholder-gray-500 rounded-xl border border-transparent focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none pl-4 pr-12 transition-all duration-200"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isLoading}
                />
                <button
                  className="absolute right-4 text-gray-500 hover:text-primary transition-colors flex items-center justify-center"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            {/*  Sign In Button  */}
            <button
              className="mt-2 w-full h-14 bg-primary hover:bg-yellow-600 text-black font-bold text-lg rounded-xl transition-all duration-200 shadow-[0_0_15px_rgba(212,175,53,0.2)] hover:shadow-[0_0_20px_rgba(212,175,53,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/*  Divider  */}
          <div className="relative flex py-8 items-center">
            <div className="flex-grow border-t border-gray-800"></div>
            <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">or continue with</span>
            <div className="flex-grow border-t border-gray-800"></div>
          </div>

          {/*  Social Logins  */}
          <div className="grid grid-cols-2 gap-4">
            <button
              className="flex items-center justify-center gap-3 h-12 bg-input-bg hover:bg-[#252525] border border-gray-800 hover:border-gray-700 rounded-xl transition-all duration-200 group disabled:opacity-50"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              <span className="text-white text-sm font-medium">Google</span>
            </button>
            <button
              className="flex items-center justify-center gap-3 h-12 bg-input-bg hover:bg-[#252525] border border-gray-800 hover:border-gray-700 rounded-xl transition-all duration-200 group disabled:opacity-50"
              type="button"
              onClick={handleAppleSignIn}
              disabled={isLoading}
            >
              <svg aria-hidden="true" className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.2 2.6C12.4 3.5 12 4.7 12.2 6c1.3-.1 2.5-.7 3.3-1.6.8-.9 1.3-2.1 1.1-3.3-1.2 0-2.4.6-3.4 1.5ZM12.9 6.8c-1.7 0-3-.9-3.7-.9-.8 0-2 .9-3.3.9-1.7 0-3.3-1.7-4.4-4.1C-.2 8.7.6 14.8 3.1 18.4c1.2 1.7 2.6 3.6 4.4 3.6 1.7 0 2.4-1.1 4.5-1.1 2.1 0 2.7 1.1 4.5 1.1 1.8 0 3-1.6 4.2-3.4 1.3-1.9 1.9-3.7 1.9-3.8-.1 0-3.7-1.4-3.7-5.6 0-3.5 2.9-5.1 3-5.2-1.7-2.4-4.3-2.7-5.2-2.7-.9 0-2.2.4-3.8.4Z"></path>
              </svg>
              <span className="text-white text-sm font-medium">Apple</span>
            </button>
          </div>

          {/*  Footer  */}
          <div className="mt-10 text-center">
            <p className="text-gray-400 text-sm">
              Don&apos;t have an account?
              <Link className="text-primary font-semibold hover:underline hover:text-primary/80 transition-colors ml-1" href="/signup">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
