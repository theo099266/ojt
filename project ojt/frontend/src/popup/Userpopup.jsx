import { useState, useEffect } from "react";

function UserModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    username: "",
    password_hash: "",
    role: "user",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username || "",
        password_hash: "", // Hidden/not updated on PUT route
        role: initialData.role || "user",
      });
    } else {
      setFormData({
        username: "",
        password_hash: "",
        role: "user",
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Edit User Account" : "Create User Account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field */}
          <div>
            <label className="text-xs text-gray-500 font-medium">Username</label>
            <input
              name="username"
              placeholder="Enter unique username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
              required
            />
          </div>

          {/* Password Field - ONLY visible during creation */}
          {!initialData && (
            <div>
              <label className="text-xs text-gray-500 font-medium">Password Hash / Plain Password</label>
              <input
                type="password"
                name="password_hash"
                placeholder="Enter account password"
                value={formData.password_hash}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
                required
              />
            </div>
          )}

          {/* Role Field - Enforcing strict ENUM options */}
          <div>
            <label className="text-xs text-gray-500 font-medium">System Access Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {initialData ? "Update Account" : "Register Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserModal;