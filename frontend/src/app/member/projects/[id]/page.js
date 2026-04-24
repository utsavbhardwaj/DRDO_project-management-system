"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function MemberProjectDetails({ params: paramsPromise }) {
  const { id } = use(paramsPromise);
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [documents, setDocuments] = useState([]);
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("qrams_token");
    if (!token) return router.push("/login");
    fetchProject(token);
    fetchDocuments(token);
  }, [id]);

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
  const fetchDocuments = async (t) => {
    try {
      const r = await fetch(`http://localhost:5005/api/documents/project/${id}`, { headers: { Authorization: `Bearer ${t}` } });
      if (r.ok) setDocuments(await r.json());
    } catch (e) {}
  };

  const handleSubmission = async (e) => {
    e.preventDefault(); setSubmitting(true); setSuccess(false);
    const token = localStorage.getItem("qrams_token");
    try {
      const r = await fetch("http://localhost:5005/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ projectId: id, progress: Number(progress), notes })
      });
      if (r.ok) setSuccess(true);
    } catch (e) {} finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div></div>;

  if (error || !project) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 text-center">
        <div className="bg-white rounded-lg shadow-md border border-red-200 p-8">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">{error || "Project not found"}</h2>
          <p className="text-sm text-gray-500 mb-6">The project may have been deleted, or the ID is invalid.</p>
          <button onClick={() => router.push("/member/dashboard")} className="bg-[#2a5494] hover:bg-[#1e3f72] text-white font-semibold px-6 py-2.5 rounded-lg shadow">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      {/* Back Button */}
      <button onClick={() => router.push("/member/dashboard")} className="flex items-center gap-1 text-sm text-[#2a5494] hover:underline mb-5 font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Dashboard
      </button>

      {/* Project Header — Title, Description, Purpose */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl font-bold text-[#003366]">{project.title}</h1>
        <p className="text-sm text-gray-500 mt-2">{project.description}</p>
        {project.purpose && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Project Purpose</p>
            <p className="text-sm text-gray-700">{project.purpose}</p>
          </div>
        )}
        <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
          <span className={`font-bold px-3 py-1 rounded-full ${project.status === "Active" ? "bg-green-100 text-green-700" : project.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>{project.status}</span>
          <span className="flex items-center">Created: {new Date(project.createdAt).toLocaleDateString("en-IN")}</span>
          {project.deadline && <span className="flex items-center">Deadline: {new Date(project.deadline).toLocaleDateString("en-IN")}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Members */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="bg-[#003366] text-white px-5 py-3 rounded-t-lg font-bold text-sm flex justify-between items-center">
            <span>Team Members</span>
            <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">{project.assignedMembers.length}</span>
          </div>
          <div className="p-5 space-y-2">
            {project.assignedMembers.length === 0 ? (
              <p className="text-sm text-gray-400">No team members yet.</p>
            ) : project.assignedMembers.map(m => (
              <div key={m._id} className="flex items-center gap-3 py-2 px-3 bg-blue-50 rounded-lg">
                <div className="w-9 h-9 rounded-full bg-[#2a5494] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{m.name.charAt(0).toUpperCase()}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{m.name}</p>
                  <p className="text-xs text-gray-500">{m.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents from Admin */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="bg-[#003366] text-white px-5 py-3 rounded-t-lg font-bold text-sm">📄 Documents from Admin</div>
          <div className="p-5 space-y-3">
            {documents.length === 0 ? (
              <p className="text-sm text-gray-400 py-2 text-center">No documents uploaded yet.</p>
            ) : documents.map(d => (
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
          </div>
        </div>

        {/* Submit Progress */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 lg:col-span-2">
          <div className="bg-[#003366] text-white px-5 py-3 rounded-t-lg font-bold text-sm">Submit Progress Update</div>
          <form onSubmit={handleSubmission} className="p-6 space-y-5">
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3 font-medium">
                ✅ Progress updated successfully!
              </div>
            )}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold text-gray-600">Completion Progress:</label>
                <span className="text-lg font-bold text-[#003366]">{progress}%</span>
              </div>
              <input type="range" min="0" max="100" step="5" value={progress} onChange={e => setProgress(e.target.value)} className="w-full" />
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-[#2a5494] h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Status Notes:</label>
              <textarea rows="4" value={notes} onChange={e => setNotes(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                placeholder="Describe your progress, blockers, or next steps..." />
            </div>
            <button type="submit" disabled={submitting}
              className="bg-[#2a5494] hover:bg-[#1e3f72] text-white font-semibold px-8 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 text-sm"
            >{submitting ? "Submitting..." : "Submit Update"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
