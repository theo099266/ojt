import ReactDOM from "react-dom";
import {useRef, useEffect} from "react";

function ConfirmDeleteModal({ open, onClose, onConfirm, type }) {
 const modalRef = useRef(null);
 useEffect(() => {
     const handleClickOutside = (event) => {
       if (modalRef.current && !modalRef.current.contains(event.target)) {
         onClose();
       }
     };
     document.addEventListener("mousedown", handleClickOutside);
     return () => document.removeEventListener("mousedown", handleClickOutside);
   }, [onClose]);
  if (!open) return null;
  

  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div ref={modalRef} className className="bg-white rounded-lg shadow-lg p-6 w-80">
        <h2 className="text-lg font-semibold mb-4">Delete {type}</h2>
        <p className="text-sm text-gray-700 mb-6">
          Are you sure you want to delete this {type.toLowerCase()}?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmDeleteModal;
