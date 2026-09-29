"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/utils/api";

export default function AdminDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", description: "", purpose: "", deadline: "" });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("sqrmt_user"));
    const token = localStorage.getItem("sqrmt_token");
    if (!token || user?.role !== "Admin") { router.push("/login"); return; }
    fetchProjects(token);
  }, [router]);

  const fetchProjects = async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setProjects(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("sqrmt_token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newProject),
      });
      if (res.ok) { setIsModalOpen(false); setNewProject({ title: "", description: "", purpose: "", deadline: "" }); fetchProjects(token); }
    } catch (e) { console.error(e); }
  };

  const handleDeleteProject = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const token = localStorage.getItem("sqrmt_token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${deleteTarget._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setDeleteTarget(null);
        fetchProjects(token);
      }
    } catch (e) { console.error(e); }
    finally { setDeleting(false); }
  };

  const activeCount = projects.filter((p) => p.status === "Active").length;
  const pendingCount = projects.filter((p) => p.status === "Pending").length;
  const completedCount = projects.filter((p) => p.status === "Completed").length;

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div></div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      {/* Title bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h2 className="text-2xl font-bold text-[#003366]">Admin Dashboard</h2>
        <div className="flex gap-3">
          <button onClick={() => router.push("/admin/contributors")}
            className="bg-white hover:bg-gray-50 text-[#2a5494] font-semibold px-5 py-2.5 rounded-lg shadow-md border border-[#2a5494] hover:shadow-lg transition-all text-sm"
          >View Contributors</button>
          <button onClick={() => setIsModalOpen(true)}
            className="bg-[#2a5494] hover:bg-[#1e3f72] text-white font-semibold px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all text-sm"
          >+ Create Project</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Projects", value: projects.length, color: "border-blue-500" },
          { label: "Active", value: activeCount, color: "border-green-500" },
          { label: "Pending", value: pendingCount, color: "border-yellow-500" },
          { label: "Completed", value: completedCount, color: "border-gray-400" },
        ].map((s) => (
          <div key={s.label} className={`bg-white rounded-lg shadow-md border-l-4 ${s.color} p-5`}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{s.label}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <input type="text" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((project) => (
          <div key={project._id} className="relative group">
            <Link href={`/admin/projects/${project._id}`}>
              <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow h-full">
                <div className="bg-gradient-to-r from-[#003366] to-[#0077cc] h-1.5 rounded-t-lg"></div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base font-bold text-gray-800 group-hover:text-[#2a5494] transition-colors pr-8">{project.title}</h3>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      project.status === "Active" ? "bg-green-100 text-green-700" :
                      project.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"
                    }`}>{project.status}</span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{project.description}</p>
                  <div className="flex justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                    <span>Members: {project.assignedMembers?.length || 0}</span>
                    <span>{new Date(project.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </Link>
            {/* Delete button — appears on hover */}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteTarget(project); }}
              className="absolute top-4 right-3 p-1.5 bg-white/90 hover:bg-red-50 border border-gray-200 hover:border-red-300 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
              title="Delete project"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-lg shadow-md py-16 text-center">
          <p className="text-gray-500 font-medium">No projects found.</p>
          <p className="text-sm text-gray-400 mt-1">Create a new project to get started.</p>
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#003366] to-[#0077cc] text-white px-6 py-4 rounded-t-xl">
              <h3 className="font-bold text-lg">Create New Project</h3>
            </div>
            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Project Title:</label>
                <input type="text" required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Description:</label>
                <textarea required rows="3" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                  value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Purpose (optional):</label>
                <textarea rows="2" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                  placeholder="What is the goal of this project?"
                  value={newProject.purpose} onChange={(e) => setNewProject({ ...newProject, purpose: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Deadline:</label>
                <input type="date" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={newProject.deadline} onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })} />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#2a5494] hover:bg-[#1e3f72] text-white text-sm font-semibold rounded-lg shadow">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Project?</h3>
              <p className="text-sm text-gray-500 mb-1">
                Are you sure you want to delete <strong className="text-gray-700">{deleteTarget.title}</strong>?
              </p>
              <p className="text-xs text-red-500 mb-6">This will permanently remove all documents, submissions, and notifications.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setDeleteTarget(null)} className="px-5 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 font-medium">Cancel</button>
                <button onClick={handleDeleteProject} disabled={deleting}
                  className="px-5 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg shadow font-semibold disabled:opacity-50">
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
