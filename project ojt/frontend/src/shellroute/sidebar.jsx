import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
import logo_bill from "../assets/logo bill.png";
import { FiCheck, FiX } from "react-icons/fi";
export default function Sidebar() {
  const [bondedOfficials, setBondedOfficials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadOfficials() {
      try {
        setLoading(true);
        const res = await fetch(
          "http://localhost:5000/onlyoneBonded_Officials",
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setBondedOfficials(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadOfficials();
  }, []);

  return (
    <aside className="w-64 bg-[#DAA5F6]">
      {/* Card wrapper so header + table feel connected */}
      <div className="rounded-lg overflow-hidden shadow-sm">
        {/* Header */}
        <div className="h-16 flex items-center px-4 gap-3 bg-[#B66ECE]">
          <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
          <h2 className="font-bold text-lg text-white">Finance</h2>
        </div>

        {/* Table area pulled up slightly to touch header */}
        <div className="bg-[#DAA5F6] -mt-1 border-t border-[#DAA5F6]">
          <table className="w-full text-left text-sm table-fixed border-collapse">
            <thead>
              <tr className="text-black">
                <th className="p-2 pl-4 font-semibold border border-purple-400 bg-transparent text-sm w-3/4">
                  Bonded Officials
                </th>
                <th className="p-2 pr-4 font-semibold text-right border border-purple-400 bg-transparent text-sm">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="2" className="p-2 pl-4 text-sm text-gray-700">
                    Loading...
                  </td>
                </tr>
              )}

              {error && (
                <tr>
                  <td colSpan="2" className="p-2 pl-4 text-sm text-red-600">
                    Error: {error}
                  </td>
                </tr>
              )}

              {!loading && !error && bondedOfficials.length === 0 && (
                <tr>
                  <td colSpan="2" className="p-2 pl-4 text-sm text-gray-700">
                    No bonded officials found
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                bondedOfficials.map((bo) => (
                  <tr key={bo.id} className="bg-[#DAA5F6]">
                    <td className="p-2 pl-4 border border-purple-300 text-sm">
                      {bo.name}
                    </td>
                    <td className="p-2 pr-4 text-right border border-purple-300 text-sm">
                      {bo.is_available ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          <FiCheck className="w-4 h-4" aria-hidden="true" />
                          <span className="sr-only">Available</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                          <FiX className="w-4 h-4" aria-hidden="true" />
                          <span className="sr-only">Unavailable</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <nav className="p-4">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded transition-colors ${
              isActive
                ? "bg-[#DAA5F6] text-black"
                : "hover:bg-[#b741f7] hover:text-black"
            }`
          }
        >
          <img
            src={logo_bill}
            alt="Logo"
            className="w-10 h-10 object-contain"
          />
          <span>Dashboard</span>
        </NavLink>
      </nav>
    </aside>
  );
}
