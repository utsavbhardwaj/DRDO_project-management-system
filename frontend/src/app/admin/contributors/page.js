"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/utils/api";

export default function ContributorsPage() {
  const router = useRouter();
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("qrams_user"));
    const token = localStorage.getItem("qrams_token");
    if (!token || user?.role !== "Admin") { router.push("/login"); return; }
    fetchContributors(token);
  }, [router]);

  const fetchContributors = async (token) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/all-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setContributors(await res.json());
      } else {
        setError("Failed to load contributors.");
      }
    } catch (e) {
      setError("Cannot connect to backend. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const token = localStorage.getItem("qrams_token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/users/${deleteTarget._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDeleteTarget(null);
        fetchContributors(token);
      } else {
        const data = await res.json();
        alert(`Failed to delete user: ${data.message || "Please check server logs"}`);
      }
    } catch (e) {
      alert("Network error.");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = contributors.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="flex items-center gap-1 text-sm text-[#2a5494] hover:underline mb-2 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h2 className="text-2xl font-bold text-[#003366]">Contributors</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {contributors.length} registered member{contributors.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#003366] text-white text-xs uppercase tracking-wide">
                  <th className="px-5 py-3.5 text-left font-semibold">#</th>
                  <th className="px-5 py-3.5 text-left font-semibold">Name</th>
                  <th className="px-5 py-3.5 text-left font-semibold">Email</th>
                  <th className="px-5 py-3.5 text-left font-semibold">Status</th>
                  <th className="px-5 py-3.5 text-left font-semibold">Assigned Projects</th>
                  <th className="px-5 py-3.5 text-left font-semibold">Joined</th>
                  <th className="px-5 py-3.5 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-16 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <p className="font-medium">No contributors found</p>
                      <p className="text-xs mt-1">
                        {search ? "Try a different search term." : "No members have registered yet."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((c, i) => (
                    <tr key={c._id} className="hover:bg-blue-50/40 transition-colors">
                      {/* # */}
                      <td className="px-5 py-4 text-gray-400 font-mono text-xs">{i + 1}</td>

                      {/* Name + Avatar */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2a5494] to-[#0077cc] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-800">{c.name}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4 text-gray-600">{c.email}</td>

                      {/* Verified status */}
                      <td className="px-5 py-4">
                        {c.isVerified ? (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Assigned Projects */}
                      <td className="px-5 py-4">
                        {c.assignedProjects && c.assignedProjects.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {c.assignedProjects.map((p) => (
                              <span
                                key={p.id}
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                  p.status === "Active"
                                    ? "bg-blue-100 text-blue-700"
                                    : p.status === "Completed"
                                    ? "bg-gray-100 text-gray-600"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {p.title}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Not assigned</span>
                        )}
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric"
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => setDeleteTarget(c)}
                          className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs px-3 py-1.5 rounded-lg border border-red-200 hover:border-red-300 transition-colors"
                          title={`Delete ${c.name}'s account`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          {filtered.length > 0 && (
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
              Showing {filtered.length} of {contributors.length} contributor{contributors.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Delete Account?</h3>
              <p className="text-sm text-gray-500 mb-1">
                You are about to permanently delete the account of{" "}
                <strong className="text-gray-700">{deleteTarget.name}</strong>.
              </p>
              <p className="text-xs text-gray-400 mb-1">{deleteTarget.email}</p>
              {deleteTarget.assignedProjects?.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 mb-4 mt-3 text-left">
                  <p className="text-xs text-yellow-800 font-semibold mb-1">This member is assigned to {deleteTarget.assignedProjects.length} project(s):</p>
                  <ul className="text-xs text-yellow-700 list-disc list-inside">
                    {deleteTarget.assignedProjects.map(p => <li key={p.id}>{p.title}</li>)}
                  </ul>
                  <p className="text-xs text-yellow-700 mt-1">They will be removed from all projects.</p>
                </div>
              )}
              <p className="text-xs text-red-500 mb-6 mt-2">This action cannot be undone.</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-5 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-5 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg shadow font-semibold disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
