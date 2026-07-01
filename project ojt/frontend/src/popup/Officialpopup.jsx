import { useState, useRef, useEffect } from "react";

function OfficialModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    name: "",
    is_available: true,
  });
  const modalRef = useRef(null);

  useEffect(() => {
    setFormData({
      name: initialData?.name ?? "",
      is_available: initialData?.is_available ?? true,
    });
  }, [isOpen, initialData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div ref={modalRef} className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Edit Bonded Official" : "Create Bonded Official"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 font-medium">Full Name</label>
            <input
              name="name"
              placeholder="Official Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-1"
              required
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium">Availability Status</label>
            <select
              name="is_available"
              value={formData.is_available ? "1" : "0"}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  is_available: e.target.value === "1",
                }))
              }
              className="w-full border p-2 rounded mt-1"
            >
              <option value="1">Available</option>
              <option value="0">Unavailable</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
              {initialData ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OfficialModal;
