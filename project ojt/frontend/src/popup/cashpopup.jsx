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

  // Fixed syntax error and properly tracked dependency array
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
      <div className="bg-white rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Edit Cash Advance" : "Create Cash Advance"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="fund"
            placeholder="Fund"
            value={formData.fund}
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
          {initialData && (
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
          )}

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
        </form>
      </div>
    </div>
  );
}

export default CashAdvanceModal;
