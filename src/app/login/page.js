"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
            Welcome back
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Sign in to continue your progress
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
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: "var(--text-muted)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium" style={{ color: "var(--accent)" }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
