import { useState, useRef, useEffect } from "react";
import axios from "axios";
function CashAdvanceModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    fund: "",
    dv_number: "",
    dv_date: "",
    accountable_official: "",
    bonded_official_id: "", // Added to match backend expectation
    amount: "",
    spent: "0",
    refund: "0",
    status: "Pending",
  });
  const modalRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user"));

  const [selectedFile, setSelectedFile] = useState(null);
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      if (name === "amount" || name === "spent") {
        const amount = Number(name === "amount" ? value : updated.amount) || 0;

        const spent = Number(name === "spent" ? value : updated.spent) || 0;

        updated.refund = amount - spent;
      }

      return updated;
    });
  };
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
  const handleWatermark = async () => {
    if (!initialData?.id) {
      alert("Please save the record first.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/watermark/${initialData.id}`,
      );

      alert(response.data.message);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to add watermark.");
    }
  };
  useEffect(() => {
  if (initialData) {
    setFormData({
      fund: initialData.fund ?? "",
      dv_number: initialData.dv_number ?? "",
      dv_date: initialData.dv_date
        ? new Date(initialData.dv_date).toISOString().slice(0,16)
        : "",
      accountable_official: initialData.accountable_official ?? "",
      bonded_official_id: initialData.bonded_official_id ?? "",
      amount: initialData.amount?.toString() ?? "",
      spent: initialData.spent?.toString() ?? "0",
      refund: initialData.refund?.toString() ?? "0",
      status: initialData.status ?? "Ongoing",
    });
  } else {
    setFormData({
      fund: "",
      dv_number: "",
      dv_date: "",
      accountable_official: "",
      bonded_official_id: "",
      amount: "",
      spent: "0",
      refund: "0",
      status: "Ongoing",
    });
  }
}, [isOpen, initialData]);



  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    if (selectedFile) {
      data.append("attachment", selectedFile);
      // field name must match multer
    }
    data.append("created_by", user?.id);

    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div ref={modalRef} className="bg-white rounded-xl p-6 w-full max-w-4xl">
  <h2 className="text-xl font-bold mb-4">
    {initialData ? "Edit Cash Advance" : "Create Cash Advance"}
  </h2>

  <form onSubmit={handleSubmit} className="space-y-4">
    {/* 2 COLUMN GRID */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      <input
        name="fund"
        placeholder="Fund"
        value={formData.fund || ""}
        onChange={handleChange}
        className="w-full border p-1.5 text-sm rounded"
        required
      />

      <input
        name="dv_number"
        placeholder="DV Number"
        value={formData.dv_number}
        onChange={handleChange}
        className="w-full border p-1.5 text-sm rounded"
        required
      />

      <input
        type="datetime-local"
        name="dv_date"
        value={formData.dv_date}
        onChange={handleChange}
        className="w-full border p-1.5 text-sm rounded"
        required
      />

      <input
        name="accountable_official"
        placeholder="Accountable Official"
        value={formData.accountable_official}
        onChange={handleChange}
        className="w-full border p-1.5 text-sm rounded"
        required
      />

      <input
        name="bonded_official_id"
        placeholder="Bonded Official ID"
        value={formData.bonded_official_id}
        onChange={handleChange}
        className="w-full border p-1.5 text-sm rounded"
      />

      <input
        type="number"
        name="amount"
        placeholder="Amount"
        value={formData.amount}
        onChange={handleChange}
        className="w-full border p-1.5 text-sm rounded"
        required
      />

      {/* Status */}
      <div>
        <label className="text-xs text-gray-500">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full border p-1.5 text-sm rounded"
        >
          <option value="Ongoing">Ongoing</option>
          <option value="Done">Done</option>
        </select>
      </div>

      {/* Spent */}
      <div>
        <label className="text-xs text-gray-500">Spent</label>
        <input
          type="number"
          name="spent"
          value={formData.spent}
          onChange={handleChange}
          className="w-full border p-1.5 text-sm rounded"
        />
      </div>

      {/* Refund */}
      <div>
        <label className="text-xs text-gray-500">Refund</label>
        <input
          type="number"
          name="refund"
          value={formData.refund}
          onChange={handleChange}
          className="w-full border p-1.5 text-sm rounded"
        />
      </div>
      <div className="md:col-start-2 md:justify-self-end flex gap-4 pt-2 mt-4">
  <button
    type="button"
    onClick={onClose}
    className="bg-gray-500 text-white px-10 py-2 text-sm rounded"
  >
    Cancel
  </button>

  <button
    type="submit"
    className="bg-blue-600 text-white px-10 py-2 text-sm rounded"
  >
    {initialData ? "Update" : "Create"}
  </button>
</div>
    </div>


    {/* FILE UPLOAD (KEPT SAME, FULL WIDTH) */}
    <div className="border rounded p-3 mt-4">
      <label className="block text-sm font-medium mb-2">
        Attachment (PDF, DOC, DOCX)
      </label>

      <input
        type="file"
        id="attachment"
        name="attachment"
        accept=".pdf,.doc,.docx"
        onChange={(e) => setSelectedFile(e.target.files[0])}
        className="hidden"
      />

      <label
        htmlFor="attachment"
        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
      >
        <span className="text-3xl mb-2">📁</span>
        <span className="font-medium text-gray-700">
          Click to choose a file
        </span>
        <span className="text-sm text-gray-500">
          PDF, DOC, DOCX
        </span>
      </label>

      <div className="mt-3 border rounded bg-gray-50 p-2">
        {selectedFile ? (
          <span className="flex items-center gap-2">
            📄 {selectedFile.name}
          </span>
        ) : initialData?.file_path ? (
          <a
            href={`http://localhost:5000/uploads/${initialData.file_path}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center gap-2"
          >
            {" "}
            {initialData.file_path.split("---")[1] ||
              initialData.file_path}
          </a>
        ) : (
          <span className="text-gray-500">No file selected</span>
        )}
      </div>
    </div>

    {initialData?.id && (
      <button
        type="button"
        onClick={handleWatermark}
        className="bg-red-600 text-white px-4 py-2 rounded mt-2"
      >
        Add Watermark
      </button>
    )}
  </form>
</div>
    </div>
  );
}

export default CashAdvanceModal;
