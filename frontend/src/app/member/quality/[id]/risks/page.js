"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { downloadRisksPDF } from "@/utils/pdfExport";
import { API_BASE_URL } from "@/utils/api";

const API = `${API_BASE_URL}/api/quality`;

const RISK_COLORS = {
  "Low": "bg-green-100 text-green-700 border-green-200",
  "Medium": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "High": "bg-red-100 text-red-700 border-red-200",
};

const EMPTY_FORM = {
  riskNo: "", processTitle: "", processOwner: "", riskDescription: "", consequences: "",
  likelihoodRating: 1, impactRating: 1, riskSignificance: "Low",
  dealingOfficer: "", deptFunction: "", date: ""
};

function calcRiskSignificance(l, i) {
  const r = Number(l) * Number(i);
  if (r <= 4) return "Low";
  if (r <= 14) return "Medium";
  return "High";
}

export default function MemberRiskAssessmentPage({ params: paramsPromise }) {
  const { id: projectId } = use(paramsPromise);
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const getToken = () => localStorage.getItem("sqrmt_token");

  useEffect(() => {
    const token = getToken();
    const user = JSON.parse(localStorage.getItem("sqrmt_user") || "{}");
    if (!token || user?.role !== "Member") { router.push("/login"); return; }
    setCurrentUser(user);
    fetchProject(token);
    fetchItems(token);
  }, [projectId]);

  const fetchProject = async (t) => {
    try {
      const r = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, { headers: { Authorization: `Bearer ${t}` } });
      if (r.ok) { const p = await r.json(); setProjectTitle(p.title); }
    } catch (e) {}
  };

  const fetchItems = async (t) => {
    try {
      const r = await fetch(`${API}/risks/project/${projectId}`, { headers: { Authorization: `Bearer ${t}` } });
      if (r.ok) setItems(await r.json());
    } catch (e) {} finally { setLoading(false); }
  };

  const handleFormChange = (key, value) => {
    const updated = { ...form, [key]: value };
    if (key === "likelihoodRating" || key === "impactRating") {
      const l = key === "likelihoodRating" ? value : form.likelihoodRating;
      const i = key === "impactRating" ? value : form.impactRating;
      updated.riskSignificance = calcRiskSignificance(l, i);
    }
    setForm(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    const token = getToken();
    const url = editId ? `${API}/risks/${editId}` : `${API}/risks/project/${projectId}`;
    const method = editId ? "PUT" : "POST";
    const payload = { ...form, riskRating: Number(form.likelihoodRating) * Number(form.impactRating) };
    try {
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (r.ok) { fetchItems(token); setShowForm(false); setForm(EMPTY_FORM); setEditId(null); }
    } catch (e) {} finally { setSaving(false); }
  };

  const handleEdit = (item) => {
    setForm({
      riskNo: item.riskNo, processTitle: item.processTitle, processOwner: item.processOwner,
      riskDescription: item.riskDescription, consequences: item.consequences,
      likelihoodRating: item.likelihoodRating, impactRating: item.impactRating,
      riskSignificance: item.riskSignificance, dealingOfficer: item.dealingOfficer,
      deptFunction: item.deptFunction, date: item.date
    });
    setEditId(item.id); setShowForm(true);
  };

  const handleEntryPDF = (item) => {
    downloadRisksPDF({
      projectTitle,
      items: [item],
      filename: `Risk_Assessment_${item.riskNo || item.id}.pdf`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      <div className="mb-6">
        <button onClick={() => router.push(`/member/quality/${projectId}`)} className="flex items-center gap-1 text-sm text-[#2a5494] hover:underline mb-4 font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Quality Hub
        </button>
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#003366] via-[#00508f] to-[#0077cc] px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-yellow-300 text-xs font-semibold uppercase tracking-widest">Solid State Physics Laboratory · New Delhi · Quality Promotion Group Activity</p>
              <h1 className="text-white text-xl font-bold mt-0.5">Risk Assessment Table (Member Submission)</h1>
              <p className="text-blue-200 text-sm mt-0.5">Doc No: QF/QPG/RAT</p>
            </div>
            <div className="text-right text-xs text-blue-200 space-y-0.5">
              <p>Issue No.: 01 &nbsp;|&nbsp; Issue Date: 01.01.2024</p>
              <p>Rev. No.: 01 &nbsp;|&nbsp; Rev. Date: 30.04.2025</p>
              <p className="mt-1 text-white font-medium">Project: {projectTitle}</p>
            </div>
          </div>
          {/* Legend */}
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex flex-wrap gap-6 text-xs">
            <div>
              <span className="font-bold text-gray-600">Likelihood Rating: </span>
              <span className="text-gray-500">1=Very Unlikely, 2=Unlikely, 3=Possible, 4=Likely, 5=Very Likely</span>
            </div>
            <div>
              <span className="font-bold text-gray-600">Impact Rating: </span>
              <span className="text-gray-500">1=Insignificant, 2=Low, 3=Medium, 4=High, 5=Very High</span>
            </div>
            <div>
              <span className="font-bold text-gray-600">Significance: </span>
              <span className="text-green-600 font-semibold">Low (R≤4)</span> · <span className="text-yellow-600 font-semibold">Medium (5–14)</span> · <span className="text-red-600 font-semibold">High (≥15)</span>
            </div>
          </div>
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">Note: New submissions will trigger email alerts to project administrators.</p>
            <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}
              className="bg-[#2a5494] hover:bg-[#1e3f72] text-white text-sm font-semibold px-5 py-2 rounded-lg shadow transition-all">
              + Submit Risk
            </button>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 pt-8 pb-8 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl mx-4" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#003366] to-[#0077cc] text-white px-6 py-4 rounded-t-xl">
              <h3 className="font-bold text-lg">{editId ? "Edit" : "Submit"} Risk Entry</h3>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Risk No. *</label>
                  <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={form.riskNo} onChange={e => handleFormChange("riskNo", e.target.value)} placeholder="e.g. R-001" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Dept / Function</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={form.deptFunction} onChange={e => handleFormChange("deptFunction", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Process Title</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={form.processTitle} onChange={e => handleFormChange("processTitle", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Process Owner</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={form.processOwner} onChange={e => handleFormChange("processOwner", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Risk Description (Identification)</label>
                <textarea rows="2" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                  value={form.riskDescription} onChange={e => handleFormChange("riskDescription", e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Consequences of Risk</label>
                <textarea rows="2" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                  value={form.consequences} onChange={e => handleFormChange("consequences", e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-4 bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Likelihood (1–5)</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={form.likelihoodRating} onChange={e => handleFormChange("likelihoodRating", Number(e.target.value))}>
                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Impact (1–5)</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={form.impactRating} onChange={e => handleFormChange("impactRating", Number(e.target.value))}>
                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Risk Rating (L×I)</label>
                  <div className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white font-bold text-center text-[#003366]">
                    {Number(form.likelihoodRating) * Number(form.impactRating)}
                  </div>
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Risk Significance (auto-computed)</label>
                  <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full border ${RISK_COLORS[form.riskSignificance] || RISK_COLORS["Low"]}`}>
                    {form.riskSignificance}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Dealing Officer</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={form.dealingOfficer} onChange={e => handleFormChange("dealingOfficer", e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Date</label>
                  <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={form.date} onChange={e => handleFormChange("date", e.target.value)} placeholder="e.g. 30.04.2025" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2 bg-[#2a5494] hover:bg-[#1e3f72] text-white text-sm font-semibold rounded-lg shadow disabled:opacity-50">
                  {saving ? "Saving..." : editId ? "Update Submission" : "Submit Risk"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Risk Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#e8f0fb] border-b-2 border-[#2a5494]">
                <th className="text-left px-3 py-3 text-xs font-bold text-[#003366] uppercase border border-gray-300 w-20">Risk No.</th>
                <th className="text-left px-3 py-3 text-xs font-bold text-[#003366] uppercase border border-gray-300">Process Title / Owner</th>
                <th className="text-left px-3 py-3 text-xs font-bold text-[#003366] uppercase border border-gray-300">Risk Description</th>
                <th className="text-left px-3 py-3 text-xs font-bold text-[#003366] uppercase border border-gray-300">Consequences</th>
                <th className="text-center px-3 py-3 text-xs font-bold text-[#003366] uppercase border border-gray-300 w-12">L</th>
                <th className="text-center px-3 py-3 text-xs font-bold text-[#003366] uppercase border border-gray-300 w-12">I</th>
                <th className="text-center px-3 py-3 text-xs font-bold text-[#003366] uppercase border border-gray-300 w-12">R=L×I</th>
                <th className="text-center px-3 py-3 text-xs font-bold text-[#003366] uppercase border border-gray-300 w-24">Significance</th>
                <th className="text-left px-3 py-3 text-xs font-bold text-[#003366] uppercase border border-gray-300">Admin Remarks</th>
                <th className="text-center px-3 py-3 text-xs font-bold text-[#003366] uppercase border border-gray-300 w-[240px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" className="text-center py-12"><div className="animate-spin w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"></div></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="10" className="text-center py-12 text-gray-400 text-sm">No risk entries yet. Click "+ Submit Risk" to get started.</td></tr>
              ) : items.map((item) => {
                const isOwn = item.submittedById === currentUser?.id;
                return (
                  <tr key={item.id} className={`border-b border-gray-200 hover:bg-blue-50/20 transition-colors ${item.riskSignificance === "High" ? "bg-red-50/30" : item.riskSignificance === "Medium" ? "bg-yellow-50/30" : ""}`}>
                    <td className="px-3 py-3 text-sm font-semibold text-[#2a5494] border border-gray-200">
                      <p>{item.riskNo}</p>
                      <p className="text-[9px] text-gray-400 font-normal mt-0.5">By: {item.submittedBy?.name || "Admin"}</p>
                    </td>
                    <td className="px-3 py-3 border border-gray-200">
                      <p className="text-sm font-medium text-gray-800">{item.processTitle || "—"}</p>
                      {item.processOwner && <p className="text-xs text-gray-400 mt-0.5">Owner: {item.processOwner}</p>}
                      {item.deptFunction && <p className="text-xs text-gray-400">Dept: {item.deptFunction}</p>}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-700 border border-gray-200 max-w-[200px]">{item.riskDescription || "—"}</td>
                    <td className="px-3 py-3 text-sm text-gray-600 border border-gray-200 max-w-[160px]">{item.consequences || "—"}</td>
                    <td className="px-3 py-3 text-center font-bold text-gray-700 border border-gray-200">{item.likelihoodRating}</td>
                    <td className="px-3 py-3 text-center font-bold text-gray-700 border border-gray-200">{item.impactRating}</td>
                    <td className="px-3 py-3 text-center font-bold text-[#003366] border border-gray-200">{item.riskRating}</td>
                    <td className="px-3 py-3 text-center border border-gray-200">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${RISK_COLORS[item.riskSignificance] || RISK_COLORS["Low"]}`}>{item.riskSignificance}</span>
                    </td>
                    <td className="px-3 py-3 text-sm text-blue-800 bg-blue-50/30 font-medium border border-gray-200 max-w-[180px]">{item.adminRemarks || "No remarks yet"}</td>
                    <td className="px-3 py-3 border border-gray-200 w-[240px] min-w-[240px]">
                      <div className="flex gap-2 justify-center">
                        {isOwn ? (
                          <button onClick={() => handleEdit(item)} className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-200 transition-all shadow-sm hover:scale-[1.02] active:scale-95">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Edit
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm cursor-not-allowed">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            View Only
                          </span>
                        )}
                        <button onClick={() => handleEntryPDF(item)} title="Download PDF" className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs font-bold transition-all shadow-sm hover:scale-[1.02] active:scale-95">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3" /></svg>
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
          <span>ISSUED BY: &nbsp;&nbsp; SSPL Quality Promotion Group</span>
          <span>Pages: 1 of 1</span>
        </div>
      </div>
    </div>
  );
}
