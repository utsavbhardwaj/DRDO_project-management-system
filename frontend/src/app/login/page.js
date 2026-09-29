"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/utils/api";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNeedsVerification(false);
    setResendMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("sqrmt_token", data.token);
        localStorage.setItem("sqrmt_user", JSON.stringify(data));
        if (data.role === "Admin") router.push("/admin/dashboard");
        else router.push("/member/dashboard");
      } else {
        setError(data.message || "Login failed");
        // Detect verification error
        if (data.message && data.message.toLowerCase().includes("verify your email")) {
          setNeedsVerification(true);
        }
      }
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      setResendMessage(data.message);
    } catch (err) {
      setResendMessage("Failed to resend. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-lg p-10">
        <h2 className="text-xl font-bold text-[#003366] text-center mb-8">
          Login
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        {needsVerification && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800 font-medium mb-2">Your email is not verified yet.</p>
            <button
              onClick={handleResendVerification}
              disabled={resendLoading}
              className="text-sm bg-yellow-200 hover:bg-yellow-300 text-yellow-900 font-semibold px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {resendLoading ? "Sending..." : "Resend Verification Email"}
            </button>
            {resendMessage && (
              <p className="text-xs text-yellow-700 mt-2">{resendMessage}</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Email / Username:
            </label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
              placeholder="Enter your Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-600">
                Password:
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-[#2a5494] hover:underline font-medium"
              >
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2a5494] hover:bg-[#1e3f72] text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link href="/register" className="text-[#2a5494] font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

