import { useState, useRef, useEffect } from "react";
import axios from "axios";

function UserModal({ isOpen, onClose, initialData = null }) {
  const [formData, setFormData] = useState({
    username: "",
    password_hash: "",
    role: "",
    descrip: "",
  });
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const modalRef = useRef(null);

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
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

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

    try {
      let userId;

      if (initialData?.id) {
        // Editing existing user
        const res = await fetch(
          `http://localhost:5000/api/users/${initialData.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Update failed");
        userId = initialData.id;
      } else {
        // Creating new user
        const res = await fetch("http://localhost:5000/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Creation failed");
        userId = data.userId; // returned from backend
      }

      // Upload image if selected
      if (selectedFile) {
        const formDataUpload = new FormData();
        formDataUpload.append("image", selectedFile);
        await axios.post(
          `http://localhost:5000/upload-image/${userId}`,
          formDataUpload,
        );
      }

      // Close modal + refresh
      onClose();
    } catch (err) {
      console.error("User Save error:", err);
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div ref={modalRef} className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Edit User Account" : "Create User Account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="text-xs text-gray-500 font-medium">
              Username
            </label>
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
              <label className="text-xs text-gray-500 font-medium">
                Password
              </label>
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
            <label className="text-xs text-gray-500 font-medium">
              Description
            </label>
            <input
              name="descrip"
              value={formData.descrip}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
              required
            />
          </div>

          <div className="border rounded p-3 mt-4">
            <label className="block text-sm font-medium mb-2">
              Profile Image
            </label>

            {/* Hidden input */}
            <input
              type="file"
              id="profileImage"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Styled box acts as trigger */}
            <label
              htmlFor="profileImage"
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded"
                />
              ) : (
                <>
                  <span className="text-3xl mb-3">📸</span>
                  <span className="font-medium text-gray-700">
                    Click to choose an image
                  </span>
                  <span className="text-sm text-gray-500">JPG, PNG, GIF</span>
                </>
              )}
            </label>
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
