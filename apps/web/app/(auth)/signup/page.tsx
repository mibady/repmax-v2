"use client";

import { useState } from "react";
import { createClient } from "@repmax/shared/supabase";
import Link from "next/link";

type UserType = "athlete" | "coach";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [userType, setUserType] = useState<UserType>("athlete");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName,
          role: userType,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <span className="text-green-400 text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
          <p className="text-text-grey mb-6">
            We&apos;ve sent a confirmation link to <strong className="text-white">{email}</strong>.
            Click the link to complete your registration.
          </p>
          <Link
            href="/login"
            className="text-primary hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-primary text-3xl">⚽</span>
            <span className="text-2xl font-black text-white">REPMAX</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-white">Create your account</h1>
          <p className="mt-2 text-text-grey">
            Join the recruiting intelligence platform
          </p>
        </div>

        {/* User Type Toggle */}
        <div className="flex gap-2 p-1 bg-surface-dark rounded-lg mb-6">
          <button
            type="button"
            onClick={() => setUserType("athlete")}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
              userType === "athlete"
                ? "bg-primary text-black"
                : "text-text-grey hover:text-white"
            }`}
          >
            I&apos;m an Athlete
          </button>
          <button
            type="button"
            onClick={() => setUserType("coach")}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
              userType === "coach"
                ? "bg-primary text-black"
                : "text-text-grey hover:text-white"
            }`}
          >
            I&apos;m a Coach
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-5">
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-white mb-2"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-surface-dark border border-white/10 text-white placeholder:text-text-grey focus:outline-none focus:border-primary transition-colors"
              placeholder="John Smith"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-surface-dark border border-white/10 text-white placeholder:text-text-grey focus:outline-none focus:border-primary transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 rounded-lg bg-surface-dark border border-white/10 text-white placeholder:text-text-grey focus:outline-none focus:border-primary transition-colors"
              placeholder="Minimum 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-primary hover:bg-primary-hover text-black font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Terms */}
        <p className="mt-6 text-center text-xs text-text-grey">
          By signing up, you agree to our{" "}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>

        {/* Login link */}
        <p className="mt-6 text-center text-text-grey">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
