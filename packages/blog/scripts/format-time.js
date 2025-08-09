export function formatToISOStringWithOffset() {
  const now = new Date();

  // Get date components
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  // Get time components
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  // Get the time zone offset in minutes and convert it to a string like "+09:00"
  const offsetMinutes = -now.getTimezoneOffset();
  const offsetHours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(
    2,
    "0",
  );
  const offsetMins = String(Math.abs(offsetMinutes) % 60).padStart(2, "0");
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const timeZoneOffset = `${sign}${offsetHours}:${offsetMins}`;

  // Combine all parts into the final string
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${timeZoneOffset}`;
}
