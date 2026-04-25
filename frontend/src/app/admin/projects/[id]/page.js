"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

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

  useEffect(() => {
    const token = localStorage.getItem("qrams_token");
    if (!token) return router.push("/login");
    fetchAll(token);
  }, [id]);

  const getToken = () => localStorage.getItem("qrams_token");

  const fetchAll = (t) => {
    fetchProject(t);
    fetchMembers(t);
    fetchDocuments(t);
    fetchSubmissions(t);
  };

  const fetchProject = async (t) => {
    try {
      const r = await fetch(`http://localhost:5005/api/projects/${id}`, { headers: { Authorization: `Bearer ${t}` } });
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
      const r = await fetch("http://localhost:5005/api/auth/members", { headers: { Authorization: `Bearer ${t}` } });
      if (r.ok) setAllMembers(await r.json());
    } catch (e) {}
  };
  const fetchDocuments = async (t) => {
    try {
      const r = await fetch(`http://localhost:5005/api/documents/project/${id}`, { headers: { Authorization: `Bearer ${t}` } });
      if (r.ok) setDocuments(await r.json());
    } catch (e) {}
  };
  const fetchSubmissions = async (t) => {
    try {
      const r = await fetch(`http://localhost:5005/api/submissions/project/${id}`, { headers: { Authorization: `Bearer ${t}` } });
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
      const r = await fetch(`http://localhost:5005/api/projects/${id}/add-members`, {
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

  const handlePingMember = async (memberId, memberName) => {
    setPinging(memberId);
    const token = getToken();
    try {
      const r = await fetch(`http://localhost:5005/api/projects/${id}/ping`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ managerId: memberId })
      });
      if (r.ok) {
        alert(`✅ Reminder email sent to ${memberName}!`);
      } else {
        const data = await r.json();
        alert(`❌ Failed: ${data.message || "Could not send email"}`);
      }
    } catch (e) {
      alert("❌ Network error. Is the backend running?");
    } finally { setPinging(null); }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!confirm(`Remove ${memberName} from this project?`)) return;
    const token = getToken();
    try {
      const r = await fetch(`http://localhost:5005/api/projects/${id}/remove-member`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ memberId })
      });
      if (r.ok) {
        fetchProject(token);
      } else {
        const data = await r.json();
        alert(`❌ Failed: ${data.message || "Could not remove member"}`);
      }
    } catch (e) {
      alert("❌ Network error.");
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
      const r = await fetch("http://localhost:5005/api/documents", {
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
          <div className="text-4xl mb-3">⚠️</div>
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
        <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
          <span>Created: {new Date(project.createdAt).toLocaleDateString("en-IN")}</span>
          {project.deadline && <span>Deadline: {new Date(project.deadline).toLocaleDateString("en-IN")}</span>}
          <span>Members: {project.assignedMembers.length}</span>
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
                        onClick={() => handlePingMember(m._id, m.name)}
                        disabled={pinging === m._id}
                        className="text-[11px] bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2.5 py-1 rounded-full font-semibold transition-colors disabled:opacity-50"
                        title={`Send reminder email to ${m.name}`}
                      >
                        {pinging === m._id ? "Sending..." : "Ping 📧"}
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
                {uploading ? "Uploading & Notifying..." : "📤 Upload & Notify Members"}
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
                    <a href={`http://localhost:5005${d.fileUrl}`} target="_blank" className="text-xs text-[#2a5494] font-semibold hover:underline ml-3 mt-1">Download ↓</a>
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
    </div>
  );
}
