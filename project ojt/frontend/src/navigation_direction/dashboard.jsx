import { useEffect, useState } from "react";
import { formatDateTime } from "../functions";
import CashAdvanceModal from "../popup/CashPopup";
import axios from "axios";
import OfficialModal from "../popup/Officialpopup";
import UserModal from "../popup/Userpopup";
import { PieChart } from "@mui/x-charts/PieChart";
function Dashboard() {
  const [cashAdvances, setCashAdvances] = useState([]);
  const [users, setUsers] = useState([]);
  const [bondedOfficials, setBondedOfficials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showOfficialModal, setShowOfficialModal] = useState(false);
  const [selectedCashAdvance, setSelectedCashAdvance] = useState(null);
  const [selectedOfficial, setSelectedOfficial] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const fetchData = () => {
    fetch("http://localhost:5000/all")
      .then((res) => res.json())
      .then((data) => {
        setCashAdvances(data.cashAdvances || []);
        setUsers(data.users || []);
        setBondedOfficials(data.bondedOfficials || []);
      })
      .catch((err) => console.error("Error fetching data:", err));
  };

  const handleDeleteOfficial = async (id) => {
    if (!window.confirm("Are you sure you want to delete this official?"))
      return;

    try {
      const res = await fetch(`http://localhost:5000/api/officials/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      // refresh data AFTER delete
      fetchData();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  useEffect(() => {
    fetchData(); // initial load

    const interval = setInterval(() => {
      fetchData(); // auto refresh
    }, 5000); // every 3 seconds

    return () => clearInterval(interval); // cleanup
  }, []);
  const handleOfficialSubmit = async (formData) => {
  const isEdit = !!selectedOfficial;

  const url = isEdit
    ? `http://localhost:5000/api/officials/${selectedOfficial.id}`
    : "http://localhost:5000/api/officials";

  const method = isEdit ? "PUT" : "POST";

  try {
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    fetchData();
    setShowOfficialModal(false); 
    setSelectedOfficial(null);   
  } catch (err) {
    console.error("Error saving official:", err);
  }
};


  const handleUserSubmit = async (formData) => {
    try {
      const isEdit = !!selectedUser;
      const url = isEdit
        ? `http://localhost:5000/api/users/${selectedUser.id}`
        : "http://localhost:5000/api/users";

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transaction failure");

      setShowUserModal(false);
      fetchData(); 
    } catch (err) {
      console.error("User Save error:", err);
      alert(err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to completely remove this user account?",
      )
    )
      return;

    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Deletion processing error");
      fetchData();
    } catch (err) {
      console.error("User Delete Error:", err);
    }
  };

  // Handle Form Submission (Create or Update)
  const handleModalSubmit = async (data) => {
  try {
    const isEdit = !!selectedCashAdvance;
    const url = isEdit
      ? `http://localhost:5000/cash-advances/${selectedCashAdvance.id}`
      : "http://localhost:5000/cash-advances";

    const method = isEdit ? "put" : "post";

    const response = await axios({
      method,
      url,
      data, 
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("Saved:", response.data);
    setShowModal(false);
    fetchData();
  } catch (err) {
    console.error("Submission error:", err.response?.data || err.message);
    alert("Failed to save transaction. Check backend logs for SQL errors.");
  }
};

  // Handle Record Removal
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this cash advance?"))
      return;

    try {
      const response = await fetch(
        `http://localhost:5000/cash-advances/${id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) throw new Error("Delete request failed");
      fetchData();
    } catch (err) {
      console.error("Deletion error:", err);
    }
  };
  const settledCash = cashAdvances
    .filter((c) => c.status === "Done")
    .reduce((sum, c) => sum + Number(c.amount), 0);

  // 2. Total Cash Currently Pending Out in the Field (Ongoing)
  const totalPendingCash = cashAdvances
    .filter((c) => c.status === "Ongoing")
    .reduce((sum, c) => sum + Number(c.amount), 0);

  // 3. AUDIT BREAKDOWN: Real Cash Exposure (Money advanced minus partial receipts)
  const actualCashAtRisk = cashAdvances
    .filter((c) => c.status === "Ongoing")
    .reduce((sum, c) => {
      const unliquidatedForThisRow =
        Number(c.amount) - Number(c.spent) - Number(c.refund);
      return sum + unliquidatedForThisRow;
    }, 0);
  // 1. Total Outstanding (Total value of all active/open cash advances)
  const totalOutstanding = cashAdvances
    .filter((c) => c.status === "Ongoing")
    .reduce((sum, c) => sum + Number(c.amount || 0), 0);

  // 2. Pending Liquidations (The net exposed cash still unliquidated out in the field)
  const pendingLiquidations = cashAdvances
    .filter((c) => c.status === "Ongoing")
    .reduce((sum, c) => {
      const netUnliquidated =
        Number(c.amount || 0) - Number(c.spent || 0) - Number(c.refund || 0);
      return sum + (netUnliquidated > 0 ? netUnliquidated : 0);
    }, 0);

  // 3. Refund Due (Cash left over from ongoing advances that must be returned to treasury)
  const refundDue = cashAdvances
    .filter((c) => c.status === "Ongoing")
    .reduce((sum, c) => {
      // If amount is greater than what was spent, the difference is due back as a refund
      const expectedRefund = Number(c.amount || 0) - Number(c.spent || 0);
      const actualRefunded = Number(c.refund || 0);
      const remainingRefundOwed = expectedRefund - actualRefunded;

      return sum + (remainingRefundOwed > 0 ? remainingRefundOwed : 0);
    }, 0);

  // 4. COA Submitted (Total amount of cash completely accounted for and turned over to COA)
  const coaSubmitted = cashAdvances
    .filter(
      (c) =>
        c.date_submitted_to_coa !== null &&
        c.date_submitted_to_coa !== undefined,
    )
    .reduce((sum, c) => sum + Number(c.amount || 0), 0);

  // 4. AUDIT BREAKDOWN: Partially Proven Cash (Receipts submitted but file not closed)
  const partiallyProvenCash = totalPendingCash - actualCashAtRisk;
  return (
    <div className="space-y-6">
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
                        item.status === "Done"
                          ? "bg-green-100 text-green-700"
                          : item.status === "Ongoing"
                            ? "bg-yellow-100 text-yellow-700"
                            : item.status === "Canceled"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
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
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold text-gray-700">USERS</h2>

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
            onClick={() => {
              setSelectedUser(null);
              setShowUserModal(true);
            }}
          >
            + Create USERS
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Username</th>
                <th className="p-3">password</th>
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
                  <td className="p-3">{u.password_hash}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                      onClick={() => {
                        setSelectedUser(u);
                        setShowUserModal(true);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      onClick={() => handleDeleteUser(u.id)}
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
      <UserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onSubmit={handleUserSubmit}
        initialData={selectedUser}
        key={selectedUser?.id || "user-creation"}
      />

      {/* ================= BONDED OFFICIALS ================= */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold text-gray-700">Bonded Officials</h2>

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
            onClick={() => {
              setSelectedOfficial(null);
              setShowOfficialModal(true);
            }}
          >
            + Create Bonded Officials
          </button>
        </div>

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
                      onClick={() => {
                        setSelectedOfficial(b);
                        setShowOfficialModal(true);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      onClick={() => handleDeleteOfficial(b.id)}
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
      {/* ================= POPUP MODALS RENDERING ================= */}
      <CashAdvanceModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedCashAdvance}
        key={selectedCashAdvance?.id || "creation-view"}
      />

      {/* FIXED: Rendered the newly created form popup below */}
      <OfficialModal
        isOpen={showOfficialModal}
        onClose={() => setShowOfficialModal(false)}
        onSubmit={handleOfficialSubmit}
        initialData={selectedOfficial}
        key={selectedOfficial?.id || "official-creation"}
      />
      <div className="space-y-6">
        {/* TOP LEVEL CASH BANNER CARDS */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-[#DAA5F6] border border-green-200 rounded-lg">
            <p className="text-xs text-blackfont-medium uppercase">
              Fully Audited & Settled
            </p>
            <p className="text-2xl font-bold text-green-900">
              ${settledCash.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-[#DAA5F6] border border-orange-200 rounded-lg">
            <p className="text-xs text-blackfont-medium uppercase">
              Partially Proven Cash
            </p>
            <p className="text-2xl font-bold text-orange-900">
              ${partiallyProvenCash.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-[#DAA5F6] border-red-200 rounded-lg">
            <p className="text-xs text-red-700 font-medium uppercase">
              Net Cash Exposure (At Risk)
            </p>
            <p className="text-2xl font-bold text-red-900">
              ${actualCashAtRisk.toLocaleString()}
            </p>
          </div>
        </div>

        {/* THE CHARTS */}
        <div className="flex gap-8 justify-center p-6 bg-white rounded-lg shadow-sm">
          {/* CHART 1: WHERE IS THE TOTAL ADVANCED CASH? */}
          <div className="flex flex-col items-center">
            <h3 className="font-bold text-lg mb-2 text-gray-800">
              Total Advanced Cash Allocation
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Tracking total cash distributions
            </p>

            <PieChart
              series={[
                {
                  data: [
                    {
                      id: 0,
                      value: settledCash,
                      label: "Settled Cash",
                      color: "#22c55e",
                    },
                    {
                      id: 1,
                      value: totalPendingCash,
                      label: "Pending Cash Out",
                      color: "#ef4444",
                    },
                  ],
                  innerRadius: 60,
                  outerRadius: 100,
                  arcLabel: (item) => `$${item.value.toLocaleString()}`, // Shows cash value on chart slices
                },
              ]}
              width={450}
              height={300}
            />
          </div>

          {/* CHART 2: OUTSTANDING CASH RISK EXPOSURE */}
          <div className="flex flex-col items-center">
            <h3 className="font-bold text-lg mb-2 text-gray-800">
              Pending Cash Breakdown
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Analyzing the unliquidated status of open advances
            </p>

            <PieChart
              series={[
                {
                  data: [
                    {
                      id: 0,
                      value: partiallyProvenCash,
                      label: "Backed by Receipts",
                      color: "#3b82f6",
                    }, // Blue
                    {
                      id: 1,
                      value: actualCashAtRisk,
                      label: "Unaccounted Cash (High Risk)",
                      color: "#991b1b",
                    }, // Dark Red
                  ],
                  innerRadius: 60,
                  outerRadius: 100,
                  arcLabel: (item) => `$${item.value.toLocaleString()}`,
                },
              ]}
              width={450}
              height={300}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Card 1: Total Outstanding */}
        <div className="bg-white border border-blue-100 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Total Outstanding
              </span>
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm">
                💵
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              ₱
              {totalOutstanding.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-50">
            Active cash distributions out in the field
          </p>
        </div>

        {/* Card 2: Pending Liquidations */}
        <div className="bg-white border border-red-100 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-red-600">
                Pending Liquidations
              </span>
              <span className="p-1.5 bg-red-50 text-red-600 rounded-lg text-sm">
                ⚠️
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              ₱
              {pendingLiquidations.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-50">
            Unaccounted net financial exposure risk
          </p>
        </div>

        {/* Card 3: Refund Due */}
        <div className="bg-white border border-amber-100 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                Refund Due
              </span>
              <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg text-sm">
                🔄
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              ₱
              {refundDue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-50">
            Unreturned remaining balances owed
          </p>
        </div>

        {/* Card 4: COA Submitted */}
        <div className="bg-white border border-green-100 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-green-600">
                COA Submitted
              </span>
              <span className="p-1.5 bg-green-50 text-green-700 rounded-lg text-sm">
                📋
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              ₱
              {coaSubmitted.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-50">
            Cleared accounts submitted to audit
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
