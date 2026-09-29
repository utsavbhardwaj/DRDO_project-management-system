"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { downloadObjectivesPDF } from "@/utils/pdfExport";
import { API_BASE_URL } from "@/utils/api";

const API = `${API_BASE_URL}/api/quality`;

const STATUS_COLORS = {
  "Achieved": "bg-green-100 text-green-700 border-green-200",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
  "Pending": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Not Achieved": "bg-red-100 text-red-700 border-red-200",
};

const EMPTY_FORM = { detailsActivity: "", target: "", status: "Pending", remarks: "", signatureDate: "", responsibility: "" };

export default function MemberQualityObjectivesPage({ params: paramsPromise }) {
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
      const r = await fetch(`${API}/objectives/project/${projectId}`, { headers: { Authorization: `Bearer ${t}` } });
      if (r.ok) setItems(await r.json());
    } catch (e) {} finally { setLoading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    const token = getToken();
    const url = editId ? `${API}/objectives/${editId}` : `${API}/objectives/project/${projectId}`;
    const method = editId ? "PUT" : "POST";
    try {
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (r.ok) { fetchItems(token); setShowForm(false); setForm(EMPTY_FORM); setEditId(null); }
    } catch (e) {} finally { setSaving(false); }
  };

  const handleEdit = (item) => {
    setForm({ detailsActivity: item.detailsActivity, target: item.target, status: item.status, remarks: item.remarks, signatureDate: item.signatureDate, responsibility: item.responsibility });
    setEditId(item.id); setShowForm(true);
  };

  const handleEntryPDF = (item) => {
    downloadObjectivesPDF({
      projectTitle,
      items: [item],
      filename: `Quality_Objective_${projectTitle || projectId}.pdf`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => router.push(`/member/quality/${projectId}`)} className="flex items-center gap-1 text-sm text-[#2a5494] hover:underline mb-4 font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Quality Hub
        </button>
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          {/* DRDO-style header banner */}
          <div className="bg-gradient-to-r from-[#003366] via-[#00508f] to-[#0077cc] px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-yellow-300 text-xs font-semibold uppercase tracking-widest">Solid State Physics Laboratory · New Delhi</p>
              <h1 className="text-white text-xl font-bold mt-0.5">Quality Objectives (Member Submission)</h1>
              <p className="text-blue-200 text-sm mt-0.5">Doc No: QF/QPG/QUALITY OBJECTIVES</p>
            </div>
            <div className="text-right text-xs text-blue-200 space-y-0.5">
              <p>Issue No.: 01 &nbsp;|&nbsp; Issue Date: 01.01.2024</p>
              <p>Rev. No.: 01 &nbsp;|&nbsp; Rev. Date: 30.04.2025</p>
              <p className="mt-1 text-white font-medium">Project: {projectTitle}</p>
            </div>
          </div>
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">Note: New entries will notify the Quality Admins via email.</p>
            <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}
              className="bg-[#2a5494] hover:bg-[#1e3f72] text-white text-sm font-semibold px-5 py-2 rounded-lg shadow transition-all">
              + Submit Entry
            </button>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#003366] to-[#0077cc] text-white px-6 py-4 rounded-t-xl">
              <h3 className="font-bold text-lg">{editId ? "Edit" : "Submit"} Quality Objective</h3>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Details of Activity *</label>
                <textarea required rows="2" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                  value={form.detailsActivity} onChange={e => setForm({ ...form, detailsActivity: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Target *</label>
                  <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Status</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                    value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Achieved</option>
                    <option>Not Achieved</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Responsibility</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={form.responsibility} onChange={e => setForm({ ...form, responsibility: e.target.value })} placeholder="e.g. QMS Head" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Remarks</label>
                <textarea rows="2" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                  value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Signature & Date</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={form.signatureDate} onChange={e => setForm({ ...form, signatureDate: e.target.value })} placeholder="e.g. Dr. R.S. Saxena | 30.04.2025" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2 bg-[#2a5494] hover:bg-[#1e3f72] text-white text-sm font-semibold rounded-lg shadow disabled:opacity-50">
                  {saving ? "Saving..." : editId ? "Update Submission" : "Submit Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#e8f0fb] border-b-2 border-[#2a5494]">
                <th className="text-left px-4 py-3 text-xs font-bold text-[#003366] uppercase tracking-wide border border-gray-300 w-8">#</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#003366] uppercase tracking-wide border border-gray-300">Details of Activity</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#003366] uppercase tracking-wide border border-gray-300">Target</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#003366] uppercase tracking-wide border border-gray-300">Status</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#003366] uppercase tracking-wide border border-gray-300">Remarks</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#003366] uppercase tracking-wide border border-gray-300">Admin Remarks</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#003366] uppercase tracking-wide border border-gray-300">Signature & Date</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-[#003366] uppercase tracking-wide border border-gray-300 w-[240px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-12"><div className="animate-spin w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"></div></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-12 text-gray-400 text-sm">No entries yet. Click "+ Submit Entry" to get started.</td></tr>
              ) : items.map((item, idx) => {
                const isOwn = item.submittedById === currentUser?.id;
                return (
                  <tr key={item.id} className="border-b border-gray-200 hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-500 border border-gray-200 text-center">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 border border-gray-200 max-w-[200px]">
                      <p className="font-medium">{item.detailsActivity}</p>
                      {item.responsibility && <p className="text-xs text-gray-400 mt-0.5">By: {item.responsibility}</p>}
                      <p className="text-[10px] text-gray-400 mt-1">Submitted by: {item.submittedBy?.name || "Admin"}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 border border-gray-200">{item.target}</td>
                    <td className="px-4 py-3 border border-gray-200">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[item.status] || STATUS_COLORS["Pending"]}`}>{item.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 border border-gray-200 max-w-[180px]">{item.remarks || "—"}</td>
                    <td className="px-4 py-3 text-sm text-blue-800 bg-blue-50/30 font-medium border border-gray-200 max-w-[180px]">{item.adminRemarks || "No remarks yet"}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 border border-gray-200">{item.signatureDate || "—"}</td>
                    <td className="px-4 py-3 border border-gray-200 w-[240px] min-w-[240px]">
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
        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
          <span>APPROVED BY: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <span>ISSUED BY: &nbsp; Dr. R. S. Saxena, Head QMS & MR</span>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">Pages: 1 of 1</p>
    </div>
  );
}
