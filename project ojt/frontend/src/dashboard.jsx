import { useEffect, useState } from "react";
import { formatDateTime } from "./functions";
import CashAdvanceModal from "./popup/CashPopup";
function Dashboard() {
  const [cashAdvances, setCashAdvances] = useState([]);
  const [users, setUsers] = useState([]);
  const [bondedOfficials, setBondedOfficials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCashAdvance, setSelectedCashAdvance] = useState(null);

 const fetchData = () => {
    fetch("http://localhost:3000/all")
      .then((res) => res.json())
      .then((data) => {
        setCashAdvances(data.cashAdvances || []);
        setUsers(data.users || []);
        setBondedOfficials(data.bondedOfficials || []);
      })
      .catch((err) => console.error("Error fetching data:", err));
  };

  useEffect(() => {
    fetchData(); // initial load

    const interval = setInterval(() => {
      fetchData(); // auto refresh
    }, 3000); // every 3 seconds

    return () => clearInterval(interval); // cleanup
  }, []);

  // Handle Form Submission (Create or Update)
const handleModalSubmit = async (formData) => {
  try {
    const isEdit = !!selectedCashAdvance;
    const url = isEdit 
      ? `http://localhost:3000/cash-advances/${selectedCashAdvance.id}` 
      : "http://localhost:3000/cash-advances";
    
    const method = isEdit ? "PUT" : "POST";
    
    // Clean and explicitly map values to match backend requirements
    const bodyData = {
  fund: formData.fund,
  dv_number: formData.dv_number,
  dv_date: formData.dv_date,
  accountable_official: formData.accountable_official,
  
  // 1. Map to what MySQL actually accepts: 'Ongoing' or 'Done'
  status: formData.status === "Pending" ? "Ongoing" : formData.status || "Ongoing", 
  
  amount: parseFloat(formData.amount) || 0,
  spent: parseFloat(formData.spent) || 0,
  refund: parseFloat(formData.refund) || 0,
  bonded_official_id: formData.bonded_official_id ? parseInt(formData.bonded_official_id, 10) : 1,
  created_by: 1
};

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    });

    // Extract exact backend error logs if available
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend Error Message:", errorText);
      throw new Error("Network transaction failed");
    }

    setShowModal(false);
    fetchData(); // Instantly update view
  } catch (err) {
    console.error("Submission error:", err);
    alert("Failed to save transaction. Check terminal logs for detailed SQL errors.");
  }
};
  // Handle Record Removal
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this cash advance?")) return;

    try {
      const response = await fetch(`http://localhost:3000/cash-advances/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete request failed");
      fetchData();
    } catch (err) {
      console.error("Deletion error:", err);
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Cash Advances Dashboard
        </h1>

        <div className="text-sm text-gray-500 space-x-4">
          <span>Cash: {cashAdvances.length}</span>
          <span>Users: {users.length}</span>
          <span>Officials: {bondedOfficials.length}</span>
        </div>
      </div>

      {/* ================= CASH ADVANCES ================= */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold text-gray-700">Cash Advances</h2>

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
            onClick={() => {
  setSelectedCashAdvance(null);
  setShowModal(true);
}}
          >
            + Create Cash Advance
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Fund</th>
                <th className="p-3">DV Number</th>
                <th className="p-3">DV Date</th>
                <th className="p-3">Bonded Official</th>
                <th className="p-3">Accountable</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Spent</th>
                <th className="p-3">Refund</th>
                <th className="p-3">Created By</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {cashAdvances.map((item, index) => (
                <tr
                  key={item.id}
                  className={`border-b hover:bg-gray-50 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="p-3">{item.id}</td>
                  <td className="p-3 font-medium">{item.fund}</td>
                  <td className="p-3">{item.dv_number}</td>
                  <td className="p-3">{formatDateTime(item.dv_date)}</td>

                  {/* NEW JOINED DATA */}
                  <td className="p-3">{item.bonded_official}</td>
                  <td className="p-3">{item.accountable_official}</td>

                  <td className="p-3">₱{item.amount}</td>
                  <td className="p-3">₱{item.spent}</td>
                  <td className="p-3">₱{item.refund}</td>

                  <td className="p-3">{item.created_by}</td>

                  {/* STATUS */}
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        item.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : item.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                      onClick={() => {
                        setSelectedCashAdvance(item); // FIXED: Passing actual item data
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= USERS TABLE ================= */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <h2 className="p-4 text-lg font-bold text-gray-700">Users</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Username</th>
                <th className="p-3">Role</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u, index) => (
                <tr
                  key={u.id}
                  className={`border-b hover:bg-gray-50 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="p-3">{u.id}</td>
                  <td className="p-3">{u.username}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                      onClick={() => console.log("Edit", u.id)}
                    >
                      Edit
                    </button>

                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      onClick={() => console.log("Delete", u.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= BONDED OFFICIALS ================= */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <h2 className="p-4 text-lg font-bold text-gray-700">
          Bonded Officials
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Availability</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {bondedOfficials.map((b, index) => (
                <tr
                  key={b.id}
                  className={`border-b hover:bg-gray-50 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="p-3">{b.id}</td>
                  <td className="p-3">{b.name}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        b.is_available
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {b.is_available ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                      onClick={() => console.log("Edit", b.id)}
                    >
                      Edit
                    </button>

                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      onClick={() => console.log("Delete", b.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <CashAdvanceModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedCashAdvance}
        key={selectedCashAdvance?.id || "creation-view"} // Fixed render state pattern
      />
    </div>

    
  );
}

export default Dashboard;
