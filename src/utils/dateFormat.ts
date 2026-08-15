/**
 * Format date to dd-mm-yyyy format
 * @param date - Date string or Date object
 * @returns Formatted date string in dd-mm-yyyy format
 */
export const formatDate = (date: string | Date): string => {
  if (!date) return 'N/A'
  
  const dateObj = new Date(date)
  
  if (isNaN(dateObj.getTime())) return 'Invalid Date'
  
  const day = dateObj.getDate().toString().padStart(2, '0')
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
  const year = dateObj.getFullYear()
  
  return `${day}-${month}-${year}`
}