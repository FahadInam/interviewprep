"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      const data = await signUp(email, password);
      // If email confirmation is enabled in Supabase
      if (data?.user && !data.session) {
        setSuccess(true);
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div
          className="w-full max-w-sm rounded-2xl p-8 text-center"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            animation: "fadeInUp 0.35s ease forwards",
          }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"
            style={{ background: "rgba(74, 222, 128, 0.12)" }}
          >
            ✓
          </div>
          <h2
            className="text-xl mb-2"
            style={{ fontFamily: "var(--font-display), Georgia, serif", color: "var(--text-primary)" }}
          >
            Check your email
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            We sent a confirmation link to <strong style={{ color: "var(--text-secondary)" }}>{email}</strong>.
            Click it to activate your account.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-2.5 rounded-lg text-sm font-medium"
            style={{ background: "var(--accent)", color: "var(--bg-primary)" }}
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          animation: "fadeInUp 0.35s ease forwards",
        }}
      >
        <div className="text-center mb-8">
          <h1
            className="text-2xl mb-1"
            style={{ fontFamily: "var(--font-display), Georgia, serif", color: "var(--text-primary)" }}
          >
            Create account
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Track your interview prep progress
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-colors"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-colors"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              placeholder="Min 6 characters"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-colors"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs px-3 py-2 rounded-lg" style={{ color: "var(--error)", background: "rgba(248, 113, 113, 0.1)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all"
            style={{
              background: loading ? "var(--bg-hover)" : "var(--accent)",
              color: loading ? "var(--text-muted)" : "var(--bg-primary)",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-medium" style={{ color: "var(--accent)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
