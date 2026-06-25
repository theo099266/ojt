import { useState } from "react";
import { FiRefreshCw } from "react-icons/fi"; // optional, replace with inline SVG if you don't want react-icons

export default function AppBar() {
  const [query, setQuery] = useState("");
  const [showIcons, setShowIcons] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  function handleIconClick() {
    // hide both icons when either is clicked
    setShowIcons(false);
  }

  function handleSearch(e) {
    if (e.key === "Enter") {
      // perform search action
      // replace with your real search logic (navigate, API call, filter, etc.)
      console.log("Search for:", query);
    }
  }

  function handleReload() {
    // reload the page
    window.location.reload();
  }

  return (
    <header className="h-16 bg-white border-b flex items-center justify-start px-6 gap-4">
      <h1 className="text-xl font-semibold">Cash Advance Dashboard</h1>

      <div className="flex items-center flex-1 ">
        {/* Search container */}
        <div className="relative ml-auto">
          <div className="flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Search..."
              aria-label="Search"
              className="w-72 h-10 pl-10 pr-10 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-[#EED2F7] text-sm"
            />

            {/* left icon (magnifier) */}
            {showIcons && (
              <button
                type="button"
                onClick={handleIconClick}
                aria-label="Toggle search icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
              >
                {/* inline magnifier SVG */}
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M21 21l-4.35-4.35"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="11"
                    cy="11"
                    r="6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}

            {/* right icon (chevron/dropdown) */}
            {showIcons && (
              <button
                type="button"
                onClick={handleIconClick}
                aria-label="Toggle dropdown icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
              >
                {/* inline chevron SVG */}
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
            <button
              type="button"
              onClick={handleReload}
              aria-label="Reload page"
              className="ml-2 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            >
              <FiRefreshCw className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex flex-col min-w-0">
            {/* Username: Bold, larger font, and dark text */}
            <span className="font-bold text-base text-gray-900 leading-tight">
              {user?.username}
            </span>

            {/* Description: Smaller font, muted gray text, and handles long strings safely */}
            <span className="text-xs text-gray-500 truncate">
              {user?.descrip}
            </span>
          </div>
          {user?.image ? (
            <img
              // Changed from image/jpeg to image/png
              src={`data:image/png;base64,${user.image}`}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
