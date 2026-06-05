
// utils/dateUtils.ts
export function formatDateToDDMMYYYY(dateString: string) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}-${month}-${year}`;
}

export function formatDateToYYYYMMDD(dateString: string) {
  if (!dateString) return "";
  const [day, month, year] = dateString.split("-");
  return `${year}-${month}-${day}`;
}
