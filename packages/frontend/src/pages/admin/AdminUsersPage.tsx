// ============================================================
// User Management Page (Admin Only)
// ============================================================

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import SEO from "../../components/SEO";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const { isAdmin, refreshProfile, deleteUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  async function fetchUsers() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateRole(userId: string, newRole: string) {
    setUpdatingId(userId);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      // Refresh current user's profile in case they changed their own role
      await refreshProfile();
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role. Make sure you are an admin.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(userId: string, email: string) {
    if (!confirm(`Are you sure you want to permanently delete ${email}? This cannot be undone.`)) {
      return;
    }
    setDeletingId(userId);
    try {
      const { error } = await deleteUser(userId);
      if (error) throw error;
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error: any) {
      console.error("Error deleting user:", error);
      alert(error.message || "Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <div className="admin-error-box">
          <i className="fa fa-lock"></i>
          <h2>Access Denied</h2>
          <p>Only administrators can manage users.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Manage Users" noindex />
      <div className="admin-page">
      <div className="admin-page-header">
        <h1>Users</h1>
        <span className="admin-count-badge">{users.length} total</span>
      </div>

      <div className="admin-filters">
        <div className="search-box">
          <i className="fa fa-search"></i>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="admin-loading">
          <i className="fa fa-spinner fa-spin"></i> Loading users...
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">
                        {user.full_name?.charAt(0).toUpperCase() ||
                          user.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="user-name">
                        {user.full_name || "Unnamed User"}
                      </span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="actions">
                    <select
                      className="role-select"
                      value={user.role}
                      onChange={(e) => updateRole(user.id, e.target.value)}
                      disabled={updatingId === user.id || deletingId === user.id}
                    >
                      <option value="student">Student</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(user.id, user.email)}
                      disabled={deletingId === user.id || updatingId === user.id}
                      title="Delete user permanently"
                    >
                      {deletingId === user.id ? (
                        <i className="fa fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fa fa-trash"></i>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="empty-state">
              <i className="fa fa-users"></i>
              <p>No users found</p>
            </div>
          )}
        </div>
      )}
    </div>
  </>
  );
}
