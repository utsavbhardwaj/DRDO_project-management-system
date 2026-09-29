"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/utils/api";

export default function AdminProjectDetails({ params: paramsPromise }) {
  const { id } = use(paramsPromise);
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [allMembers, setAllMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [file, setFile] = useState(null);
  const [docTitle, setDocTitle] = useState("");
  const [docDesc, setDocDesc] = useState("");
  const [uploading, setUploading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [pinging, setPinging] = useState(null);
  const [activePingMember, setActivePingMember] = useState(null);
  const [pingRemarks, setPingRemarks] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("sqrmt_token");
    if (!token) return router.push("/login");
    fetchAll(token);
  }, [id]);

  const getToken = () => localStorage.getItem("sqrmt_token");

  const fetchAll = (t) => {
    fetchProject(t);
    fetchMembers(t);
    fetchDocuments(t);
    fetchSubmissions(t);
  };

  const fetchProject = async (t) => {
    try {
      const r = await fetch(`${API_BASE_URL}/api/projects/${id}`, { headers: { Authorization: `Bearer ${t}` } });
      if (r.ok) {
        setProject(await r.json());
        setError("");
      } else {
        const data = await r.json();
        setError(data.message || "Failed to load project");
      }
    } catch (e) {
      setError("Network error — is the backend running?");
    } finally { setLoading(false); }
  };
  const fetchMembers = async (t) => {
    try {
      const r = await fetch(`${API_BASE_URL}/api/auth/members`, { headers: { Authorization: `Bearer ${t}` } });
      if (r.ok) setAllMembers(await r.json());
    } catch (e) {}
  };
  const fetchDocuments = async (t) => {
    try {
      const r = await fetch(`${API_BASE_URL}/api/documents/project/${id}`, { headers: { Authorization: `Bearer ${t}` } });
      if (r.ok) setDocuments(await r.json());
    } catch (e) {}
  };
  const fetchSubmissions = async (t) => {
    try {
      const r = await fetch(`${API_BASE_URL}/api/submissions/project/${id}`, { headers: { Authorization: `Bearer ${t}` } });
      if (r.ok) setSubmissions(await r.json());
    } catch (e) {}
  };

  const toggleMember = (memberId) => {
    setSelectedMemberIds(prev =>
      prev.includes(memberId) ? prev.filter(x => x !== memberId) : [...prev, memberId]
    );
  };

  const handleAssignMembers = async () => {
    if (selectedMemberIds.length === 0) return;
    setAssigning(true);
    const token = getToken();
    try {
      const r = await fetch(`${API_BASE_URL}/api/projects/${id}/add-members`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ memberIds: selectedMemberIds })
      });
      if (r.ok) {
        setSelectedMemberIds([]);
        setMemberSearch("");
        fetchProject(token);
      }
    } catch (e) {} finally { setAssigning(false); }
  };

  const handleCreateContributor = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;
    setCreating(true);
    setCreateMsg(null);
    const token = getToken();
    try {
      const r = await fetch(`${API_BASE_URL}/api/auth/admin-create-contributor`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName.trim(), email: newEmail.trim(), projectId: id })
      });
      const data = await r.json();
      if (r.ok) {
        setCreateMsg({ type: "success", text: data.message });
        setNewName("");
        setNewEmail("");
        fetchProject(token);
        fetchMembers(token);
      } else {
        setCreateMsg({ type: "error", text: data.message || "Failed to create contributor" });
      }
    } catch (e) {
      setCreateMsg({ type: "error", text: "Network error. Is the backend running?" });
    } finally { setCreating(false); }
  };

  const handlePingMember = async () => {
    if (!activePingMember) return;
    const { id: memberId, name: memberName } = activePingMember;
    setPinging(memberId);
    const token = getToken();
    try {
      const r = await fetch(`${API_BASE_URL}/api/projects/${id}/ping`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ managerId: memberId, remarks: pingRemarks })
      });
      if (r.ok) {
        alert(`Reminder email sent to ${memberName}.`);
        setActivePingMember(null);
        setPingRemarks("");
      } else {
        const data = await r.json();
        alert(`Failed: ${data.message || "Could not send email"}`);
      }
    } catch (e) {
      alert("Network error. Is the backend running?");
    } finally { setPinging(null); }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!confirm(`Remove ${memberName} from this project?`)) return;
    const token = getToken();
    try {
      const r = await fetch(`${API_BASE_URL}/api/projects/${id}/remove-member`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ memberId })
      });
      if (r.ok) {
        fetchProject(token);
      } else {
        const data = await r.json();
        alert(`Failed: ${data.message || "Could not remove member"}`);
      }
    } catch (e) {
      alert("Network error.");
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const token = getToken();
    const fd = new FormData();
    fd.append("projectId", id);
    fd.append("document", file);
    fd.append("title", docTitle || file.name);
    fd.append("description", docDesc);
    try {
      const r = await fetch(`${API_BASE_URL}/api/documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      if (r.ok) {
        setFile(null); setDocTitle(""); setDocDesc("");
        fetchDocuments(token);
      }
    } catch (e) {} finally { setUploading(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div></div>;

  if (error || !project) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 text-center">
        <div className="bg-white rounded-lg shadow-md border border-red-200 p-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-red-600 mb-2">{error || "Project not found"}</h2>
          <p className="text-sm text-gray-500 mb-6">The project may have been deleted, or the ID is invalid.</p>
          <button onClick={() => router.push("/admin/dashboard")} className="bg-[#2a5494] hover:bg-[#1e3f72] text-white font-semibold px-6 py-2.5 rounded-lg shadow">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const assignedIds = new Set(project.assignedMembers.map(m => m._id));
  const filteredUnassigned = allMembers.filter(m =>
    !assignedIds.has(m._id) &&
    (m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
     m.email.toLowerCase().includes(memberSearch.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      {/* Back Button */}
      <button onClick={() => router.push("/admin/dashboard")} className="flex items-center gap-1 text-sm text-[#2a5494] hover:underline mb-5 font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Dashboard
      </button>

      {/* Project Header — Title, Description, Purpose */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#003366]">{project.title}</h1>
            <p className="text-sm text-gray-500 mt-2">{project.description}</p>
            {project.purpose && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Project Purpose</p>
                <p className="text-sm text-gray-700">{project.purpose}</p>
              </div>
            )}
          </div>
          <span className={`ml-4 flex-shrink-0 text-xs font-bold px-3 py-1 rounded-full ${project.status === "Active" ? "bg-green-100 text-green-700" : project.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>{project.status}</span>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100 items-center justify-between">
          <div className="flex gap-4 text-xs text-gray-400">
            <span>Created: {new Date(project.createdAt).toLocaleDateString("en-IN")}</span>
            {project.deadline && <span>Deadline: {new Date(project.deadline).toLocaleDateString("en-IN")}</span>}
            <span>Members: {project.assignedMembers.length}</span>
          </div>
          {/* Quality Formats Button */}
          <button
            onClick={() => router.push(`/admin/quality/${id}`)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#003366] to-[#0077cc] hover:from-[#002244] hover:to-[#005fa3] text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Quality Formats (DRDO)
          </button>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Members + Assign */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="bg-[#003366] text-white px-5 py-3 rounded-t-lg font-bold text-sm flex justify-between items-center">
            <span>Team Members</span>
            <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">{project.assignedMembers.length}</span>
          </div>
          <div className="p-5">
            {project.assignedMembers.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">No members assigned yet.</p>
            ) : (
              <div className="space-y-2 mb-4">
                {project.assignedMembers.map(m => (
                  <div key={m._id} className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#2a5494] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{m.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{m.name}</p>
                        <p className="text-xs text-gray-500">{m.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setActivePingMember({ id: m._id, name: m.name });
                          setPingRemarks("");
                        }}
                        disabled={pinging === m._id}
                        className="text-[11px] bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2.5 py-1 rounded-full font-semibold transition-colors disabled:opacity-50"
                        title={`Send reminder email to ${m.name}`}
                      >
                        {pinging === m._id ? "Sending..." : "Ping"}
                      </button>
                      <button
                        onClick={() => handleRemoveMember(m._id, m.name)}
                        className="text-[11px] bg-red-100 hover:bg-red-200 text-red-600 px-2 py-1 rounded-full font-semibold transition-colors"
                        title={`Remove ${m.name} from project`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Assign More Members</p>
              <input type="text" placeholder="Search by name or email..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 mb-2" />
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                {filteredUnassigned.length === 0 ? (
                  <p className="text-xs text-gray-400 p-3 text-center">{memberSearch ? "No matching members" : "All members already assigned"}</p>
                ) : filteredUnassigned.map(m => (
                  <div key={m._id} onClick={() => toggleMember(m._id)} className={`flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-gray-50 ${selectedMemberIds.includes(m._id) ? 'bg-blue-50' : ''}`}>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.email}</p>
                    </div>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selectedMemberIds.includes(m._id) ? 'bg-[#2a5494] border-[#2a5494]' : 'border-gray-300'}`}>
                      {selectedMemberIds.includes(m._id) && <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                    </div>
                  </div>
                ))}
              </div>
              {selectedMemberIds.length > 0 && (
                <button onClick={handleAssignMembers} disabled={assigning} className="w-full mt-3 bg-[#2a5494] hover:bg-[#1e3f72] text-white text-sm font-semibold py-2 rounded-lg shadow disabled:opacity-50">
                  {assigning ? "Assigning..." : `Assign ${selectedMemberIds.length} Member(s)`}
                </button>
              )}
            </div>

            {/* Create New Contributor */}
            <div className="border-t border-gray-200 pt-4 mt-2">
              <button
                onClick={() => { setShowCreateForm(v => !v); setCreateMsg(null); }}
                className="w-full flex items-center justify-between text-xs font-bold text-[#2a5494] uppercase tracking-wide hover:text-[#1e3f72] transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Create New Contributor
                </span>
                <span className="text-gray-400 text-base">{showCreateForm ? "▲" : "▼"}</span>
              </button>

              {showCreateForm && (
                <form onSubmit={handleCreateContributor} className="mt-3 space-y-3">
                  <p className="text-[11px] text-gray-500 leading-relaxed bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                    Creates a new contributor account with default password <strong>sun123</strong>, adds them to this project, and sends a welcome email.
                  </p>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. R.K. Sharma"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. scientist@sspl.drdo.in"
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>

                  {createMsg && (
                    <div className={`text-xs rounded-lg px-3 py-2 font-medium ${
                      createMsg.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      {createMsg.type === "success" ? "✅ " : "❌ "}{createMsg.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={creating || !newName.trim() || !newEmail.trim()}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold py-2 rounded-lg shadow transition-colors flex items-center justify-center gap-2"
                  >
                    {creating ? (
                      <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>Creating &amp; Sending Email...</>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Create Contributor Account
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Document Upload (Admin Only) */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="bg-[#003366] text-white px-5 py-3 rounded-t-lg font-bold text-sm">📄 Documents</div>
          <div className="p-5">
            <form onSubmit={handleFileUpload} className="space-y-3 mb-4 pb-4 border-b border-gray-200">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Document Title</label>
                <input type="text" placeholder="e.g. Project report template" value={docTitle} onChange={e => setDocTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Description (optional)</label>
                <textarea rows="2" placeholder="Instructions for members..." value={docDesc} onChange={e => setDocDesc(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
              </div>
              <input type="file" onChange={e => setFile(e.target.files[0])} required
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              <button type="submit" disabled={!file || uploading} className="w-full bg-[#2a5494] hover:bg-[#1e3f72] text-white text-sm font-semibold py-2 rounded-lg shadow disabled:opacity-50">
                {uploading ? "Uploading & Notifying..." : "Upload & Notify Members"}
              </button>
            </form>
            <div className="space-y-3">
              {documents.map(d => (
                <div key={d._id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{d.title || d.fileName}</p>
                      {d.description && <p className="text-xs text-gray-500 mt-0.5">{d.description}</p>}
                      <p className="text-xs text-gray-400 mt-1">Uploaded: {new Date(d.createdAt).toLocaleString("en-IN")}</p>
                    </div>
                    <a href={`${API_BASE_URL}${d.fileUrl}`} target="_blank" className="text-xs text-[#2a5494] font-semibold hover:underline ml-3 mt-1">Download ↓</a>
                  </div>
                </div>
              ))}
              {documents.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No documents uploaded yet.</p>}
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 lg:col-span-2">
          <div className="bg-[#003366] text-white px-5 py-3 rounded-t-lg font-bold text-sm">Member Submissions</div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Member</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Progress</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Notes</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(s => (
                  <tr key={s._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm font-medium text-gray-800">{s.memberId?.name}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${s.progress}%` }}></div></div>
                        <span className="text-xs text-gray-500">{s.progress}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500 max-w-[200px] truncate">{s.notes || "—"}</td>
                    <td className="px-5 py-3"><span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${s.status === "Submitted" ? "bg-green-100 text-green-700" : s.status === "Late" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{s.status}</span></td>
                  </tr>
                ))}
                {submissions.length === 0 && <tr><td colSpan="4" className="px-5 py-8 text-center text-sm text-gray-400">No submissions received yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {activePingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden transform scale-100 transition-transform">
            <div className="bg-[#003366] text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>Send Ping Reminder</span>
              </h3>
              <button 
                onClick={() => setActivePingMember(null)}
                className="text-white/80 hover:text-white transition-colors text-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                You are sending a report reminder to <span className="font-semibold text-gray-800">{activePingMember.name}</span>. You can optionally add any specific remarks or instructions below:
              </p>
              <div className="mb-5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Remarks / Message (Optional)</label>
                <textarea 
                  rows={4} 
                  placeholder="e.g. Please submit the outstanding Q4 report by Friday..." 
                  value={pingRemarks} 
                  onChange={e => setPingRemarks(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none placeholder:text-gray-400 text-gray-800"
                />
              </div>
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setActivePingMember(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePingMember}
                  disabled={pinging === activePingMember.id}
                  className="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white rounded-lg text-sm font-semibold shadow-md transition-colors flex items-center justify-center min-w-[110px]"
                >
                  {pinging === activePingMember.id ? (
                    <span className="flex items-center gap-1.5">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    "Send Ping"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
