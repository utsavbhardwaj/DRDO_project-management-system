"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/utils/api";

export default function MemberDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("sqrmt_token");
    const storedUser = JSON.parse(localStorage.getItem("sqrmt_user"));
    if (!token || storedUser?.role !== "Member") { router.push("/login"); return; }
    setUser(storedUser);
    fetchProjects(token);
  }, [router]);

  const fetchProjects = async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setProjects(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div></div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      {/* Welcome */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
        <h2 className="text-xl font-bold text-[#003366] mb-1">Welcome, {user?.name}</h2>
        <p className="text-sm text-gray-500">View your assigned projects and submit progress updates below.</p>
      </div>

      {/* Feature 4: If not assigned to any project */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 py-20 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h3 className="text-xl font-bold text-gray-600 mb-2">You are not assigned to any project yet</h3>
          <p className="text-sm text-gray-400">Please contact your administrator to get assigned to a project.</p>
        </div>
      ) : (
        <>
          <h3 className="text-lg font-bold text-gray-800 mb-4">Assigned Projects ({projects.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map((project) => (
              <Link href={`/member/projects/${project._id}`} key={project._id} className="group">
                <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="bg-gradient-to-r from-[#003366] to-[#0077cc] h-1.5 rounded-t-lg"></div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-base font-bold text-gray-800 group-hover:text-[#2a5494] transition-colors">{project.title}</h3>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        project.status === "Active" ? "bg-green-100 text-green-700" :
                        project.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"
                      }`}>{project.status}</span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{project.description}</p>
                    <div className="flex justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                      <span>Team: {project.assignedMembers?.length || 0} members</span>
                      <span className="text-[#2a5494] font-semibold group-hover:underline">View Details →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
