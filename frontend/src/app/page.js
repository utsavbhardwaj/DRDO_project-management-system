"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* ─── LEFT: BRANDING PANEL ─── */}
      <div className="relative flex-1 flex items-center justify-center py-16 px-8 lg:px-14 bg-gradient-to-br from-[#001f3f] via-[#003366] to-[#005599] overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-[-80px] left-[-80px] w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-60px] right-[-60px] w-52 h-52 bg-cyan-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-yellow-300/5 rounded-full blur-2xl"></div>

        <div className="relative z-10 text-center max-w-md">
          {/* Logo with float animation */}
          <div className="animate-float mb-8 inline-block">
            <div className="w-28 h-28 mx-auto rounded-full bg-white/10 backdrop-blur-md border-2 border-white/20 flex items-center justify-center animate-pulse-glow">
              <img
                src="/logo-right.png"
                alt="QRAMS Logo"
                className="w-20 h-20 object-contain"
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="animate-fade-in-up text-5xl font-black text-white tracking-tight mb-2">
            QRAMS
          </h1>
          <p className="animate-fade-in-up delay-100 text-yellow-300 text-sm font-semibold tracking-[0.2em] uppercase mb-6">
            Quality Requirement Audit Management System
          </p>

          {/* Description */}
          <p className="animate-fade-in-up delay-200 text-blue-100/80 text-sm leading-relaxed mb-10 max-w-sm mx-auto">
            Streamline project audits, manage teams, and track requirements efficiently built for the SSPL.
          </p>

          {/* Feature bullets */}
          <div className="space-y-3 text-left max-w-xs mx-auto">
            {[
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                ),
                text: "Manage Projects & Audits"
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ),
                text: "Collaborate with Teams"
              },
              {
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                ),
                text: "Upload & Track Reports"
              }
            ].map((item, i) => (
              <div
                key={i}
                className={`animate-fade-in-up delay-${(i + 3) * 100} flex items-center gap-3 bg-white/[0.07] backdrop-blur-sm rounded-lg px-4 py-3 border border-white/10`}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                <span className="text-white/90 text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>

          {/* DRDO badge */}
          <p className="animate-fade-in-up delay-700 mt-10 text-blue-200/40 text-xs font-medium tracking-wider uppercase">
            Solid State Physics Laboratory · Ministry of Defence
          </p>
        </div>
      </div>

      {/* ─── RIGHT: AUTH PANEL ─── */}
      <div className="relative flex-1 flex items-center justify-center py-16 px-8 bg-[#f0f4f8]">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, #003366 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}></div>

        <div className="relative z-10 w-full max-w-md">
          {/* Welcome heading */}
          <div className="animate-fade-in-right text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#003366] shadow-lg shadow-blue-900/20 mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#003366]">Welcome to QRAMS</h2>
            <p className="text-gray-500 text-sm mt-2">
              Sign in to manage your projects, track audits, and collaborate securely.
            </p>
          </div>

          {/* Auth Card */}
          <div className="animate-fade-in-right delay-200 bg-white rounded-2xl shadow-xl shadow-gray-200/70 border border-gray-200/60 overflow-hidden">
            {/* Card header stripe */}
            <div className="h-1.5 bg-gradient-to-r from-[#003366] via-[#2a5494] to-[#0077cc]"></div>

            <div className="px-8 py-10 space-y-5">
              {/* Admin Login */}
              <Link
                href="/login"
                className="group w-full flex items-center gap-4 bg-gradient-to-r from-[#003366] to-[#0060a8] hover:from-[#002244] hover:to-[#004f8a] text-white font-semibold px-6 py-4 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="w-10 h-10 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="block text-base">Login</span>
                  <span className="block text-xs text-blue-200/80 font-normal mt-0.5">Login with credentials</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/60 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative flex justify-center"><span className="bg-white px-4 text-xs text-gray-400 font-medium">or</span></div>
              </div>

              {/* Register */}
              <Link
                href="/register"
                className="group w-full flex items-center gap-4 bg-white hover:bg-gray-50 text-[#003366] font-semibold px-6 py-4 rounded-xl border-2 border-[#003366]/20 hover:border-[#003366]/40 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="w-10 h-10 bg-[#003366]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#003366]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="block text-base">Register Account</span>
                  <span className="block text-xs text-gray-400 font-normal mt-0.5">Create a new member account</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Card footer */}
            <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-100">
              <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Secure Login
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Quick Access
                </span>
              </div>
            </div>
          </div>

          {/* Default credentials hint */}
          {/* <div className="animate-fade-in-right delay-400 mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
            <p className="text-xs text-yellow-700 font-semibold mb-1">🔑 Default Admin Credentials</p>
            <p className="text-xs text-yellow-600 font-mono">Username: admin &nbsp;|&nbsp; Password: 123</p>
          </div> */}
        </div>
      </div>
    </div>
  );
}
