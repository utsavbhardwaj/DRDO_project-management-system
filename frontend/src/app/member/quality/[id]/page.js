"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/utils/api";

const API = `${API_BASE_URL}/api/quality`;

const FORMATS = [
  {
    key: "objectives",
    title: "Quality Objectives",
    docNo: "QF/QPG/QUALITY OBJECTIVES",
    description: "Track measurable quality targets, their status, and responsible officers for each project activity.",
    color: "from-blue-600 to-blue-800",
    border: "border-blue-500",
    badge: "bg-blue-100 text-blue-700",
    path: "objectives",
  },
  {
    key: "opportunities",
    title: "Opportunity Register",
    docNo: "QF/QPG/OPP",
    description: "Document improvement opportunities, potential benefits, and implementation plans for IR Materials and Devices activity.",
    color: "from-emerald-600 to-emerald-800",
    border: "border-emerald-500",
    badge: "bg-emerald-100 text-emerald-700",
    path: "opportunities",
  },
  {
    key: "fracas",
    title: "FRACAS",
    docNo: "FRACAS",
    description: "Failure Reporting, Analysis and Corrective Actions — document component failures, defects, and corrective measures.",
    color: "from-orange-600 to-red-700",
    border: "border-orange-500",
    badge: "bg-orange-100 text-orange-700",
    path: "fracas",
  },
  {
    key: "risks",
    title: "Risk Assessment Table",
    docNo: "QF/QPG/RAT",
    description: "Identify, assess, and track project risks using Likelihood × Impact scoring with automatic significance classification.",
    color: "from-violet-600 to-purple-800",
    border: "border-violet-500",
    badge: "bg-violet-100 text-violet-700",
    path: "risks",
  },
];

export default function MemberQualityHubPage({ params: paramsPromise }) {
  const { id: projectId } = use(paramsPromise);
  const router = useRouter();
  const [projectTitle, setProjectTitle] = useState("");
  const [counts, setCounts] = useState({ objectives: 0, opportunities: 0, fracas: 0, risks: 0 });
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem("qrams_token");

  useEffect(() => {
    const token = getToken();
    const user = JSON.parse(localStorage.getItem("qrams_user") || "{}");
    if (!token || user?.role !== "Member") { router.push("/login"); return; }
    fetchAll(token);
  }, [projectId]);

  const fetchAll = async (t) => {
    try {
      const [projRes, objRes, oppRes, fracRes, riskRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/projects/${projectId}`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${API}/objectives/project/${projectId}`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${API}/opportunities/project/${projectId}`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${API}/fracas/project/${projectId}`, { headers: { Authorization: `Bearer ${t}` } }),
        fetch(`${API}/risks/project/${projectId}`, { headers: { Authorization: `Bearer ${t}` } }),
      ]);
      if (projRes.ok) { const p = await projRes.json(); setProjectTitle(p.title); }
      const [obj, opp, frac, risk] = await Promise.all([
        objRes.ok ? objRes.json() : [],
        oppRes.ok ? oppRes.json() : [],
        fracRes.ok ? fracRes.json() : [],
        riskRes.ok ? riskRes.json() : [],
      ]);
      setCounts({ objectives: obj.length, opportunities: opp.length, fracas: frac.length, risks: risk.length });
    } catch (e) {} finally { setLoading(false); }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      {/* Back */}
      <button onClick={() => router.push(`/member/projects/${projectId}`)} className="flex items-center gap-1 text-sm text-[#2a5494] hover:underline mb-6 font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Project
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-[#003366] via-[#00508f] to-[#0077cc] px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-300 text-xs font-semibold uppercase tracking-widest">Solid State Physics Laboratory · New Delhi · Quality Promotion Group</p>
              <h1 className="text-white text-2xl font-bold mt-1">Quality Management Hub (Member View)</h1>
              <p className="text-blue-200 text-sm mt-1">ISO 9001:2015 · Quality Format Register</p>
            </div>
            <div className="text-right">
              <div className="text-white text-sm font-semibold">Project:</div>
              <div className="text-yellow-300 font-bold">{loading ? "Loading..." : projectTitle}</div>
              <div className="text-blue-200 text-xs mt-1">Rev. Date: 30.04.2025</div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-blue-50 border-t border-blue-100">
          <p className="text-sm text-blue-800">
            As a project member, you can submit and manage quality reports for this project. 
            All submissions will be forwarded to QMS Administrators, who will be notified by email and can review or write remarks on your reports.
          </p>
        </div>
      </div>

      {/* Format Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {FORMATS.map((fmt) => (
          <Link key={fmt.key} href={`/member/quality/${projectId}/${fmt.path}`}>
            <div className={`bg-white rounded-xl shadow-md border-l-4 ${fmt.border} hover:shadow-xl transition-all duration-200 group overflow-hidden h-full`}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${fmt.badge}`}>{fmt.docNo}</span>
                    </div>
                    <h2 className="text-lg font-bold text-gray-800 group-hover:text-[#2a5494] transition-colors">{fmt.title}</h2>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-gray-800">
                      {loading ? "—" : counts[fmt.key]}
                    </div>
                    <div className="text-xs text-gray-400">entries</div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{fmt.description}</p>
                <div className="mt-4 flex items-center gap-1 text-sm text-[#2a5494] font-semibold group-hover:gap-2 transition-all">
                  <span>Submit / View Format</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
              <div className={`h-1 bg-gradient-to-r ${fmt.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 text-center text-xs text-gray-400">
        <p>QRAMS · Quality Requirement Audit Management System · Solid State Physics Laboratory, New Delhi</p>
        <p className="mt-0.5">Issue Date: 01.01.2024 &nbsp;|&nbsp; Rev. Date: 30.04.2025 &nbsp;|&nbsp; Pages: 1 of 1</p>
      </div>
    </div>
  );
}
