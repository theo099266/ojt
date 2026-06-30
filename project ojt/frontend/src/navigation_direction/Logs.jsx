import { useEffect, useState } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
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

  // 4. AUDIT BREAKDOWN: Partially Proven Cash (Receipts submitted but file not closed)
  const partiallyProvenCash = totalPendingCash - actualCashAtRisk;
  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          AUDIT DASHBOARD
        </h1>
        </div>

      <div className="space-y-6">

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
                      color: "#710193",
                    },
                    {
                      id: 1,
                      value: totalPendingCash,
                      label: "Pending Cash Out",
                      color: "#7A4988",
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
                      color: "#710193",
                    }, // Blue
                    {
                      id: 1,
                      value: actualCashAtRisk,
                      label: "Unaccounted Cash (High Risk)",
                    color: "#7A4988",
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
    </div>
  );
}

export default Dashboard;
