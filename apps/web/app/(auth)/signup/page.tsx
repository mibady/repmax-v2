'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signup, signInWithGoogle, signInWithApple } from '@/lib/actions/auth-actions';

export default function Page() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  function checkPasswordStrength(password: string) {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  }

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signup(formData);
      if (!result.success && result.error) {
        setError(result.error);
      }
    } catch {
      // Redirect happens on success
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

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];

  return (
    <>
      {/*  Left Panel: Branding  */}
      <div className="relative w-full lg:w-[45%] h-48 lg:h-full bg-background-darker flex flex-col justify-center items-center overflow-hidden shrink-0 border-b lg:border-b-0 lg:border-r border-[#1f1f1f]">
        {/*  Background Image/Texture  */}
        <div className="absolute inset-0 z-0 opacity-20 mix-blend-overlay bg-cover bg-center" data-alt="Silhouette of a football player in a stadium tunnel" style={{backgroundImage: "url('https"}}>
        </div>
        {/*  Gradient Overlay for better text readability  */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-background-darker via-transparent to-background-darker/50 lg:bg-gradient-to-b lg:from-background-darker/80 lg:via-background-darker/40 lg:to-background-darker"></div>
        {/*  Content  */}
        <div className="relative z-20 flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-primary mb-4 drop-shadow-lg">
            REPMAX
          </h1>
          <h2 className="text-white/90 text-lg lg:text-2xl font-light tracking-wide uppercase">
            Every Rep Counts.
          </h2>
        </div>
      </div>

      {/*  Right Panel: Form  */}
      <div className="flex-1 w-full lg:w-[55%] h-full bg-background-dark overflow-y-auto relative flex flex-col">
        <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 xl:p-24 w-full">
          <div className="w-full max-w-[440px] flex flex-col gap-8">
            {/*  Form Header  */}
            <div className="space-y-2 text-center lg:text-left">
              <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-white">Join RepMax</h2>
              <p className="text-text-muted text-base lg:text-lg">Unlock elite recruiting intelligence today.</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            {/*  Form Fields  */}
            <form action={handleSubmit} className="flex flex-col gap-5">
              {/*  Full Name  */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1" htmlFor="fullname">Full Name</label>
                <input
                  className="w-full h-12 px-4 rounded-lg bg-input-bg border border-transparent text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  id="fullname"
                  name="fullname"
                  placeholder="Enter your full name"
                  type="text"
                  required
                  disabled={isLoading}
                />
              </div>

              {/*  Email  */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1" htmlFor="email">Email Address</label>
                <input
                  className="w-full h-12 px-4 rounded-lg bg-input-bg border border-transparent text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  id="email"
                  name="email"
                  placeholder="name@example.com"
                  type="email"
                  required
                  disabled={isLoading}
                />
              </div>

              {/*  Password  */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1" htmlFor="password">Password</label>
                <div className="relative">
                  <input
                    className="w-full h-12 px-4 pr-12 rounded-lg bg-input-bg border border-transparent text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    id="password"
                    name="password"
                    placeholder="Create a password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    disabled={isLoading}
                    onChange={(e) => checkPasswordStrength(e.target.value)}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {/* Password Strength Indicator */}
                {passwordStrength > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs mt-1 ${strengthColors[passwordStrength - 1]?.replace('bg-', 'text-')}`}>
                      {strengthLabels[passwordStrength - 1]}
                    </p>
                  </div>
                )}
              </div>

              {/*  Submit Button  */}
              <button
                className="mt-4 w-full h-12 bg-primary hover:bg-primary-hover text-[#0a0a0a] font-bold text-base rounded-lg transition-all transform active:scale-[0.98] shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/*  Divider  */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-800"></div>
              <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">or continue with</span>
              <div className="flex-grow border-t border-gray-800"></div>
            </div>

            {/*  Social Login  */}
            <div className="grid grid-cols-2 gap-4">
              <button
                className="flex items-center justify-center gap-3 h-12 bg-input-bg hover:bg-[#252525] border border-gray-800 hover:border-gray-600 rounded-lg transition-all duration-200 group disabled:opacity-50"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 text-white group-hover:text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                <span className="text-sm font-medium text-gray-300 group-hover:text-white">Google</span>
              </button>
              <button
                className="flex items-center justify-center gap-3 h-12 bg-input-bg hover:bg-[#252525] border border-gray-800 hover:border-gray-600 rounded-lg transition-all duration-200 group disabled:opacity-50"
                type="button"
                onClick={handleAppleSignIn}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 text-white group-hover:text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.31-.89 3.51-.84 1.54.06 2.7.79 3.44 1.92-3.04 1.8-2.5 5.27.64 6.64-.67 1.72-1.6 3.49-2.67 4.47zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"></path>
                </svg>
                <span className="text-sm font-medium text-gray-300 group-hover:text-white">Apple</span>
              </button>
            </div>

            {/*  Footer  */}
            <div className="text-center space-y-4 pt-2">
              <p className="text-gray-400 text-sm">
                Already have an account?
                <Link className="text-primary hover:text-primary-hover font-semibold transition-colors ml-1" href="/login">Sign In</Link>
              </p>
              <p className="text-xs text-gray-600 max-w-xs mx-auto leading-relaxed">
                By creating an account, you agree to our
                <Link className="text-primary/70 hover:text-primary underline decoration-primary/30 ml-1" href="/terms">Terms of Service</Link>
                {" "}and
                <Link className="text-primary/70 hover:text-primary underline decoration-primary/30 ml-1" href="/privacy">Privacy Policy</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
