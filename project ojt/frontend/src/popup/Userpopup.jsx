import { useState, useEffect } from "react";
import axios from "axios";

function UserModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    username: "",
    password_hash: "",
    role: "",
    descrip: "",
  });
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username || "",
        password_hash: "",
        role: initialData.role || "user",
        descrip: initialData.descrip || "",
      });
      if (initialData.image) {
        setPreview(`data:image/jpeg;base64,${initialData.image}`);
      }
    } else {
      setFormData({
        username: "",
        password_hash: "",
        role: "user",
        descrip: "",
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);

    if (selectedFile && initialData?.id) {
      const formDataUpload = new FormData();
      formDataUpload.append("image", selectedFile);
      await axios.post(`http://localhost:5000/upload-image/${initialData.id}`, formDataUpload);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Edit User Account" : "Create User Account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="text-xs text-gray-500 font-medium">Username</label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
              required
            />
          </div>

          {/* Password - only on create */}
          {!initialData && (
            <div>
              <label className="text-xs text-gray-500 font-medium">Password</label>
              <input
                type="password"
                name="password_hash"
                value={formData.password_hash}
                onChange={handleChange}
                className="w-full border p-2 rounded mt-1"
                required
              />
            </div>
          )}

          {/* Role */}
          <div>
            <label className="text-xs text-gray-500 font-medium">Role</label>
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

          {/* Description */}
          <div>
            <label className="text-xs text-gray-500 font-medium">Description</label>
            <input
              name="descrip"
              value={formData.descrip}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-xs text-gray-500 font-medium">Profile Image</label>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-2 w-24 h-24 object-cover rounded"
              />
            )}
          </div>

          {/* Buttons */}
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
