"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

export default function VerifyEmail({ params: paramsPromise }) {
  const { token } = use(paramsPromise);
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`http://localhost:5005/api/auth/verify/${token}`);
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Network error. Please try again.");
      }
    };
    verify();
  }, [token]);

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-lg p-10 text-center">
        {status === "verifying" && (
          <>
            <div className="animate-spin w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-5"></div>
            <h2 className="text-xl font-bold text-[#003366] mb-2">Verifying Your Email...</h2>
            <p className="text-sm text-gray-500">Please wait while we verify your account.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-green-700 mb-3">Email Verified!</h2>
            <p className="text-sm text-gray-600 mb-6">{message}</p>
            <Link href="/login" className="inline-block bg-[#2a5494] hover:bg-[#1e3f72] text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all">
              Go to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-600 mb-3">Verification Failed</h2>
            <p className="text-sm text-gray-600 mb-6">{message}</p>
            <Link href="/register" className="inline-block bg-[#2a5494] hover:bg-[#1e3f72] text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all">
              Register Again
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
