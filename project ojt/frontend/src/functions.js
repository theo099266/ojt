export const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return "Invalid Date";

  const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const formattedDate = date.toLocaleDateString('en-US', dateOptions);

  const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
  const formattedTime = date.toLocaleTimeString('en-US', timeOptions);

  return `${formattedDate} ${formattedTime}`; 
};
