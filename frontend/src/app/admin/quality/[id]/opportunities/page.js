"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { downloadOpportunitiesPDF } from "@/utils/pdfExport";
import { API_BASE_URL } from "@/utils/api";

const API = `${API_BASE_URL}/api/quality`;

const EMPTY_FORM = { opNo: "", process: "", opportunity: "", potentialBenefit: "", implementationPlan: "", remarks: "", adminRemarks: "" };

export default function OpportunityRegisterPage({ params: paramsPromise }) {
  const { id: projectId } = use(paramsPromise);
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  // Editable header dates — persisted in localStorage per project
  const DATES_KEY = `sqrmt_dates_${projectId}`;
  const [issueDate, setIssueDate] = useState("01.01.2024");
  const [revDate, setRevDate]     = useState("30.04.2025");
  const [showDateEdit, setShowDateEdit] = useState(false);
  const [tempIssueDate, setTempIssueDate] = useState("");
  const [tempRevDate, setTempRevDate]     = useState("");

  const getToken = () => localStorage.getItem("sqrmt_token");

  useEffect(() => {
    const token = getToken();
    const user = JSON.parse(localStorage.getItem("sqrmt_user") || "{}");
    if (!token || user?.role !== "Admin") { router.push("/login"); return; }
    // Load saved dates for this project
    try {
      const saved = JSON.parse(localStorage.getItem(DATES_KEY)) || {};
      if (saved.issueDate) setIssueDate(saved.issueDate);
      if (saved.revDate)   setRevDate(saved.revDate);
    } catch {}
    fetchProject(token);
    fetchItems(token);
  }, [projectId]);

  const openDateEdit = () => { setTempIssueDate(issueDate); setTempRevDate(revDate); setShowDateEdit(true); };
  const saveDates = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(DATES_KEY)) || {};
      localStorage.setItem(DATES_KEY, JSON.stringify({ ...saved, issueDate: tempIssueDate, revDate: tempRevDate }));
    } catch {}
    setIssueDate(tempIssueDate);
    setRevDate(tempRevDate);
    setShowDateEdit(false);
  };

  const fetchProject = async (t) => {
    try {
      const r = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, { headers: { Authorization: `Bearer ${t}` } });
      if (r.ok) { const p = await r.json(); setProjectTitle(p.title); }
    } catch (e) {}
  };

  const fetchItems = async (t) => {
    try {
      const r = await fetch(`${API}/opportunities/project/${projectId}`, { headers: { Authorization: `Bearer ${t}` } });
      if (r.ok) setItems(await r.json());
    } catch (e) {} finally { setLoading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    const token = getToken();
    const url = editId ? `${API}/opportunities/${editId}` : `${API}/opportunities/project/${projectId}`;
    const method = editId ? "PUT" : "POST";
    try {
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
      if (r.ok) { fetchItems(token); setShowForm(false); setForm(EMPTY_FORM); setEditId(null); }
    } catch (e) {} finally { setSaving(false); }
  };

  const handleEdit = (item) => {
    setForm({ opNo: item.opNo, process: item.process, opportunity: item.opportunity, potentialBenefit: item.potentialBenefit, implementationPlan: item.implementationPlan, remarks: item.remarks, adminRemarks: item.adminRemarks || "" });
    setEditId(item.id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this entry?")) return;
    const token = getToken();
    await fetch(`${API}/opportunities/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    fetchItems(token);
  };

  const handleEntryPDF = (item) => {
    downloadOpportunitiesPDF({
      projectTitle,
      items: [item],
      filename: `Opportunity_Register_${item.opNo || item.id}.pdf`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      <div className="mb-6">
        <button onClick={() => router.push(`/admin/projects/${projectId}`)} className="flex items-center gap-1 text-sm text-[#2a5494] hover:underline mb-4 font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Project
        </button>
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#003366] via-[#00508f] to-[#0077cc] px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-yellow-300 text-xs font-semibold uppercase tracking-widest">Solid State Physics Laboratory · New Delhi</p>
              <h1 className="text-white text-xl font-bold mt-0.5">Opportunity Register</h1>
              <p className="text-blue-200 text-sm mt-0.5">Doc No: QF/QPG/OPP &nbsp;|&nbsp; IR Materials and Devices Activity</p>
            </div>
            <div className="text-right text-xs text-blue-200 space-y-0.5">
              <div className="flex items-center justify-end gap-2">

                <div className="space-y-0.5 text-right">

                  <p>Issue No.: 01 &nbsp;|&nbsp; Issue Date: {issueDate}</p>

                  <p>Rev. No.: 01 &nbsp;|&nbsp; Rev. Date: {revDate}</p>

                </div>

                <button onClick={openDateEdit} title="Edit dates" className="text-blue-200 hover:text-white transition-colors opacity-70 hover:opacity-100 flex-shrink-0">

                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>

                </button>

              </div>
              <p className="mt-1 text-white font-medium">Project: {projectTitle}</p>
            </div>
          </div>
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-end">
            <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}
              className="bg-[#2a5494] hover:bg-[#1e3f72] text-white text-sm font-semibold px-5 py-2 rounded-lg shadow transition-all">
              + Add Opportunity
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#003366] to-[#0077cc] text-white px-6 py-4 rounded-t-xl">
              <h3 className="font-bold text-lg">{editId ? "Edit" : "Add"} Opportunity</h3>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Op. No. *</label>
                  <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={form.opNo} onChange={e => setForm({ ...form, opNo: e.target.value })} placeholder="e.g. OP-001" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Process *</label>
                  <input required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={form.process} onChange={e => setForm({ ...form, process: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Opportunity *</label>
                <textarea required rows="2" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                  value={form.opportunity} onChange={e => setForm({ ...form, opportunity: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Potential Benefit</label>
                <textarea rows="2" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                  value={form.potentialBenefit} onChange={e => setForm({ ...form, potentialBenefit: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Implementation Plan (if any)</label>
                <textarea rows="2" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                  value={form.implementationPlan} onChange={e => setForm({ ...form, implementationPlan: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Remarks</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Admin Remarks (Review / Action Required)</label>
                <textarea rows="2" className="w-full border border-yellow-300 bg-yellow-50/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none font-medium text-blue-900"
                  value={form.adminRemarks} onChange={e => setForm({ ...form, adminRemarks: e.target.value })} placeholder="Write any feedback or review notes for the member..." />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2 bg-[#2a5494] hover:bg-[#1e3f72] text-white text-sm font-semibold rounded-lg shadow disabled:opacity-50">
                  {saving ? "Saving..." : editId ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#e8f0fb] border-b-2 border-[#2a5494]">
                <th className="text-left px-4 py-3 text-xs font-bold text-[#003366] uppercase border border-gray-300 w-20">Op. No.</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#003366] uppercase border border-gray-300">Process</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#003366] uppercase border border-gray-300">Opportunity</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#003366] uppercase border border-gray-300">Potential Benefit</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#003366] uppercase border border-gray-300">Implementation Plan (if any)</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#003366] uppercase border border-gray-300">Remarks</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#003366] uppercase border border-gray-300">Admin Remarks</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-[#003366] uppercase border border-gray-300 w-[290px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="text-center py-12"><div className="animate-spin w-6 h-6 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"></div></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-12 text-gray-400 text-sm">No entries yet. Click "+ Add Opportunity" to get started.</td></tr>
              ) : items.map((item) => (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-[#2a5494] border border-gray-200">
                    <p>{item.opNo}</p>
                    <p className="text-[10px] text-gray-400 font-normal mt-1">Submitted by: {item.submittedBy?.name || "Admin"}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 border border-gray-200">{item.process}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 border border-gray-200">{item.opportunity}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 border border-gray-200">{item.potentialBenefit || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 border border-gray-200">{item.implementationPlan || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 border border-gray-200">{item.remarks || "—"}</td>
                  <td className="px-4 py-3 text-sm text-blue-800 bg-blue-50/30 font-medium border border-gray-200 max-w-[180px]">{item.adminRemarks || "—"}</td>
                  <td className="px-4 py-3 border border-gray-200 w-[290px] min-w-[290px]">
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => handleEdit(item)} className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-200 transition-all shadow-sm hover:scale-[1.02] active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-bold transition-all shadow-sm hover:scale-[1.02] active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Delete
                      </button>
                      <button onClick={() => handleEntryPDF(item)} title="Download PDF" className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs font-bold transition-all shadow-sm hover:scale-[1.02] active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3" /></svg>
                        PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
          <span>APPROVED BY: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Director SSPL</span>
          <span>ISSUED BY: &nbsp; Dr. R. S. Saxena, Head QMS & MR</span>
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-4">Pages: 1 of 1</p>
    </div>
  );
}
