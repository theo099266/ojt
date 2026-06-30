import { useState, useEffect } from "react";
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
    if (initialData) {
      setFormData(initialData);
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
    data.append("created_by", 1); // replace currentuser //////////////////

    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Edit Cash Advance" : "Create Cash Advance"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="fund"
            placeholder="Fund"
            value={formData.fund || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <input
            name="dv_number"
            placeholder="DV Number"
            value={formData.dv_number}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <input
            type="datetime-local"
            name="dv_date"
            value={formData.dv_date}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <input
            name="accountable_official"
            placeholder="Accountable Official"
            value={formData.accountable_official}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <input
            name="bonded_official_id"
            placeholder="Bonded Official ID"
            value={formData.bonded_official_id}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          <div>
            <label className="text-xs text-gray-500">Status</label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="Ongoing">Ongoing</option>
              <option value="Done">Done</option>
            </select>
          </div>

          {/* Conditional editing fields: block updates to Spent/Refund on Creation */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">Spent</label>
              <input
                type="number"
                name="spent"
                value={formData.spent}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Refund</label>
              <input
                type="number"
                name="refund"
                value={formData.refund}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>

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
              {initialData ? "Update" : "Create"}
            </button>
          </div>
          <div className="border rounded p-3">
  <label className="block text-sm font-medium mb-2">
    Attachment (PDF, DOC, DOCX)
  </label>

  {/* File input */}
  <input
    type="file"
    name="attachment"
    accept=".pdf,.doc,.docx"
    onChange={(e) => setSelectedFile(e.target.files[0])}
    className="w-full"
  />

  {/* One box that shows either the existing file or the newly selected one */}
  <div className="mt-3 border rounded bg-gray-50 p-2">
    {selectedFile ? (
      // Show newly chosen file
      <span className="flex items-center gap-2">
        📄 {selectedFile.name}
      </span>
    ) : initialData?.file_path ? (
      // Show existing file from DB
      <a
        href={`http://localhost:5000/uploads/${initialData.file_path}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline flex items-center gap-2"
      >
        📄 {initialData.file_path.split("---")[1] || initialData.file_path}
      </a>
    ) : (
      // Nothing chosen yet
      <span className="text-gray-500">No file selected</span>
    )}
  </div>
</div>

        </form>
      </div>
    </div>
  );
}

export default CashAdvanceModal;
