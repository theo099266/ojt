import { useEffect, useState } from "react";
import {
  FaMoneyBill,
  FaHourglassHalf,
  FaBalanceScaleRight,
} from "react-icons/fa";
import { BsFillClipboardDataFill } from "react-icons/bs";
function Dashboard() {
  const [cashAdvances, setCashAdvances] = useState([]);
  const fetchData = () => {
    fetch("http://localhost:5000/all")
      .then((res) => res.json())
      .then((data) => {
        setCashAdvances(data.cashAdvances || []);
      })
      .catch((err) => console.error("Error fetching data:", err));
  };

  useEffect(() => {
    fetchData(); // initial load

    const interval = setInterval(() => {
      fetchData(); // auto refresh
    }, 5000); // every 3 seconds

    return () => clearInterval(interval); // cleanup
  }, []);

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Card 1: Total Outstanding */}
        <div className="bg-[#DAA5F6] border-blue-100 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Total Outstanding
              </span>
              <span className="p-1.5 bg-[#d28af9] text-blue-600 rounded-lg text-sm">
                <FaMoneyBill className="w-4 h-4 text-purple-800" />
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
        <div className="bg-[#DAA5F6] border-red-100 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-red-600">
                Pending Liquidations
              </span>
              <span className="p-1.5 bg-[#d28af9] rounded-lg text-sm">
                <FaHourglassHalf className="w-4 h-4 text-purple-800" />
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
        <div className="bg-[#DAA5F6] border-amber-100 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                Refund Due
              </span>
              <span className="p-1.5 bg-[#d28af9] rounded-lg text-sm">
                <FaBalanceScaleRight className="w-4 h-4 text-purple-800" />
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
        <div className="bg-[#DAA5F6] border-green-100 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-green-600">
                COA Submitted
              </span>
              <span className="p-1.5 bg-[#d28af9] rounded-lg text-sm">
                <BsFillClipboardDataFill className="w-4 h-4 text-purple-800" />
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
