export function formatDateTime(value) {
  if (!value) return "";

  const date = new Date(value);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const isMidnight = hours === 0 && minutes === "00";

  if (isMidnight) {
    return `${year}-${month}-${day}`;
  }

  return `${year}-${month}-${day} ${String(hours).padStart(2, "0")}:${minutes}`;
}