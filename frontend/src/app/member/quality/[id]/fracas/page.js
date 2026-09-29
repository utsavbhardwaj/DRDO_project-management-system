"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { downloadFracasPDF } from "@/utils/pdfExport";
import { API_BASE_URL } from "@/utils/api";

const API = `${API_BASE_URL}/api/quality`;

const FAILURE_TYPES = ["Minor", "Major", "Serious", "Critical"];

const FAILURE_COLORS = {
  "Minor": "bg-green-100 text-green-700 border-green-200",
  "Major": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Serious": "bg-orange-100 text-orange-700 border-orange-200",
  "Critical": "bg-red-100 text-red-700 border-red-200",
};

const EMPTY_FORM = {
  noLabYear: "", dateTimeFailure: "", projectName: "", typeOfProject: "",
  nomenclature: "", serialNo: "", componentManufacturer: "",
  failureDescription: "", failureReported: "", defectObserved: "",
  statusAnalysis: "", typeOfFailure: "Minor"
};

export default function MemberFracasPage({ params: paramsPromise }) {
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
      const r = await fetch(`${API}/fracas/project/${projectId}`, { headers: { Authorization: `Bearer ${t}` } });
      if (r.ok) setItems(await r.json());
    } catch (e) {} finally { setLoading(false); }
  };

  const f = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    const token = getToken();
    const url = editId ? `${API}/fracas/${editId}` : `${API}/fracas/project/${projectId}`;
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
    setForm({
      noLabYear: item.noLabYear, dateTimeFailure: item.dateTimeFailure, projectName: item.projectName,
      typeOfProject: item.typeOfProject, nomenclature: item.nomenclature, serialNo: item.serialNo,
      componentManufacturer: item.componentManufacturer, failureDescription: item.failureDescription,
      failureReported: item.failureReported, defectObserved: item.defectObserved,
      statusAnalysis: item.statusAnalysis, typeOfFailure: item.typeOfFailure
    });
    setEditId(item.id); setShowForm(true);
  };

  const handleEntryPDF = (item, idx) => {
    downloadFracasPDF({
      projectTitle,
      item,
      filename: `FRACAS_${item.noLabYear || "Report_" + (idx + 1)}_${projectTitle || projectId}.pdf`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      {/* Breadcrumb + Header */}
      <div className="mb-6">
        <button onClick={() => router.push(`/member/quality/${projectId}`)} className="flex items-center gap-1 text-sm text-[#2a5494] hover:underline mb-4 font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Quality Hub
        </button>
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#003366] via-[#00508f] to-[#0077cc] px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-yellow-300 text-xs font-semibold uppercase tracking-widest">Solid State Physics Laboratory · New Delhi · QUALITY FORMAT</p>
              <h1 className="text-white text-xl font-bold mt-0.5">FRACAS — Failure Reporting, Analysis & Corrective Actions</h1>
              <p className="text-blue-200 text-sm mt-0.5">Format for Failure Reporting, Analysis and Corrective Actions</p>
            </div>
            <div className="text-right text-xs text-blue-200 space-y-0.5">
              <p>Issue No.: 01 &nbsp;|&nbsp; Rev. No.: 00</p>
              <p>Pages: 1 of 2</p>
              <p className="mt-1 text-white font-medium">Project: {projectTitle}</p>
            </div>
          </div>
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">Note: New submissions will immediately alert project administrators via email.</p>
            <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }}
              className="bg-[#2a5494] hover:bg-[#1e3f72] text-white text-sm font-semibold px-5 py-2 rounded-lg shadow transition-all">
              + Submit FRACAS Report
            </button>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 pt-8 pb-8 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#003366] to-[#0077cc] text-white px-6 py-4 rounded-t-xl">
              <h3 className="font-bold text-lg">{editId ? "Edit" : "Submit"} FRACAS Report</h3>
              <p className="text-blue-200 text-xs mt-0.5">Format for Failure Reporting, Analysis and Corrective Actions</p>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Section 1: Identification */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Failure Event Identification</h4>
                </div>
                <div className="p-4 grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">No./Lab/Year</label>
                    <input className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={form.noLabYear} onChange={f("noLabYear")} placeholder="e.g. 001/SSPL/2025" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Date & Time of Failure</label>
                    <input className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={form.dateTimeFailure} onChange={f("dateTimeFailure")} placeholder="e.g. 21.05.2025 14:30" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Type of Failure</label>
                    <select className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                      value={form.typeOfFailure} onChange={f("typeOfFailure")}>
                      {FAILURE_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Project Info */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Project Details</h4>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Project Name</label>
                    <input className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={form.projectName} onChange={f("projectName")} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Type of Project</label>
                    <input className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={form.typeOfProject} onChange={f("typeOfProject")} />
                  </div>
                </div>
              </div>

              {/* Section 3: Failed Component */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Failed Component / Item Description</h4>
                </div>
                <div className="p-4 grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Nomenclature</label>
                    <input className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={form.nomenclature} onChange={f("nomenclature")} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Serial No.</label>
                    <input className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={form.serialNo} onChange={f("serialNo")} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Component Manufacturer</label>
                    <input className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={form.componentManufacturer} onChange={f("componentManufacturer")} />
                  </div>
                </div>
              </div>

              {/* Section 4: Failure Description */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Failure Description</h4>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Failure reported:</label>
                    <textarea rows="2" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                      value={form.failureReported} onChange={f("failureReported")} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Defect Observed:</label>
                    <textarea rows="2" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                      value={form.defectObserved} onChange={f("defectObserved")} />
                  </div>
                </div>
              </div>

              {/* Section 5: Analysis */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Status of Failure Analysis / Investigation</h4>
                </div>
                <div className="p-4">
                  <textarea rows="3" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                    value={form.statusAnalysis} onChange={f("statusAnalysis")} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-2 bg-[#2a5494] hover:bg-[#1e3f72] text-white text-sm font-semibold rounded-lg shadow disabled:opacity-50">
                  {saving ? "Saving..." : editId ? "Update Submission" : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Cards */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div></div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 py-20 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <p className="text-gray-500 font-medium">No FRACAS reports yet.</p>
          <p className="text-sm text-gray-400 mt-1">Click "+ Submit FRACAS Report" to submit the first entry.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, idx) => {
            const isOwn = item.submittedById === currentUser?.id;
            return (
              <div key={item.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                {/* Card Header */}
                <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${FAILURE_COLORS[item.typeOfFailure] || FAILURE_COLORS["Minor"]}`}>{item.typeOfFailure}</span>
                    <span className="text-sm font-semibold text-gray-700">{item.noLabYear || `Report ${idx + 1}`}</span>
                    {item.dateTimeFailure && <span className="text-xs text-gray-400">{item.dateTimeFailure}</span>}
                    <span className="text-[10px] text-gray-400 font-normal">Submitted by: {item.submittedBy?.name || "Admin"}</span>
                  </div>
                  <div className="flex gap-2">
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
                  <button onClick={() => handleEntryPDF(item, idx)} title="Download PDF" className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200 transition-all shadow-sm hover:scale-[1.02] active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3" /></svg>
                    PDF Failure Report
                  </button>
                </div>
                </div>
                {/* Card Body */}
                <div className="p-5">
                  <table className="w-full border-collapse text-sm mb-4">
                    <tbody>
                      <tr className="border border-gray-300">
                        <td className="border border-gray-300 px-3 py-2 font-semibold text-gray-500 text-xs w-32 bg-gray-50">Project</td>
                        <td className="border border-gray-300 px-3 py-2 text-gray-800">{item.projectName || "—"}</td>
                        <td className="border border-gray-300 px-3 py-2 font-semibold text-gray-500 text-xs w-32 bg-gray-50">Type of Project</td>
                        <td className="border border-gray-300 px-3 py-2 text-gray-800">{item.typeOfProject || "—"}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-semibold text-gray-500 text-xs bg-gray-50">Nomenclature</td>
                        <td className="border border-gray-300 px-3 py-2 text-gray-800">{item.nomenclature || "—"}</td>
                        <td className="border border-gray-300 px-3 py-2 font-semibold text-gray-500 text-xs bg-gray-50">Serial No.</td>
                        <td className="border border-gray-300 px-3 py-2 text-gray-800">{item.serialNo || "—"}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-semibold text-gray-500 text-xs bg-gray-50">Manufacturer</td>
                        <td className="border border-gray-300 px-3 py-2 text-gray-800" colSpan="3">{item.componentManufacturer || "—"}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-semibold text-gray-500 text-xs bg-gray-50 align-top pt-3">Failure Reported</td>
                        <td className="border border-gray-300 px-3 py-2 text-gray-700 whitespace-pre-line" colSpan="3">{item.failureReported || "—"}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-semibold text-gray-500 text-xs bg-gray-50 align-top pt-3">Defect Observed</td>
                        <td className="border border-gray-300 px-3 py-2 text-gray-700 whitespace-pre-line" colSpan="3">{item.defectObserved || "—"}</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-semibold text-gray-500 text-xs bg-gray-50 align-top pt-3">Status of Analysis</td>
                        <td className="border border-gray-300 px-3 py-2 text-gray-700 whitespace-pre-line" colSpan="3">{item.statusAnalysis || "—"}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Admin remarks display */}
                  <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
                    <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">Administrator Review Remarks</p>
                    <p className="text-sm text-gray-700 mt-1">{item.adminRemarks || "No administrative remarks submitted yet."}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-3 flex justify-between text-xs text-gray-500">
        <span>APPROVED BY: &nbsp;&nbsp; Dr. Meena Mishra, Director SSPL</span>
        <span>ISSUED BY: &nbsp;&nbsp; Dr. R. S. Saxena, Head QMS & MR</span>
      </div>
    </div>
  );
}
