// Enhanced function to properly format values for export
const formatValueForExport = (value: any, isExcel: boolean = false): string => {
  if (value === null || value === undefined) return ''
  
  // Handle arrays
  if (Array.isArray(value)) {
    if (value.length === 0) return ''
    if (value[0] && typeof value[0] === 'object' && value[0].name) {
      return value.map(item => item.name).join('; ')
    }
    if (typeof value[0] !== 'object') {
      return value.join('; ')
    }
    return `${value.length} items`
  }
  
  // Handle objects
  if (typeof value === 'object') {
    if (value.name) return String(value.name)
    if (value.title) return String(value.title)
    if (value.label) return String(value.label)
    if (value.line1) {
      return `${value.line1}${value.line2 ? ', ' + value.line2 : ''}${value.postal_code ? ', ' + value.postal_code : ''}`
    }
    return JSON.stringify(value)
  }
  
  // Handle booleans
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  
  // Handle phone numbers - preserve as text
  const strValue = String(value)
  if (strValue.match(/^[+]?[0-9]{10,15}$/)) {
    return isExcel ? `="${strValue}"` : `'${strValue}`
  }
  
  // Handle numbers
  if (typeof value === 'number') {
    if (value > 100 && Number.isInteger(value)) {
      return isExcel ? String(value) : `₹${value.toLocaleString('en-IN')}`
    }
    return String(value)
  }
  
  return strValue
}

export const exportToCSV = (data: any[], filename: string, columns?: { key: string; label: string }[]) => {
  if (!data || data.length === 0) {
    alert('No data to export')
    return
  }

  const headers = columns ? columns.map(col => col.label) : Object.keys(data[0])
  const keys = columns ? columns.map(col => col.key) : Object.keys(data[0])

  const BOM = '\uFEFF'
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      keys.map(key => {
        let value = formatValueForExport(row[key], false)
        value = String(value).replace(/"/g, '""')
        if (String(value).includes(',') || String(value).includes('"') || String(value).includes('\n') || String(value).includes(';')) {
          value = `"${value}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')

  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

export const printTable = (data: any[], title: string, columns?: { key: string; label: string }[]) => {
  if (!data || data.length === 0) {
    alert('No data to print')
    return
  }

  const headers = columns 
    ? columns.map(col => col.label)
    : Object.keys(data[0])

  const keys = columns 
    ? columns.map(col => col.key)
    : Object.keys(data[0])

  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const tableRows = data.map(row => 
    `<tr>${keys.map(key => {
      let value = formatValueForExport(row[key])
      
      // Handle null/undefined values
      if (value === null || value === undefined) value = ''
      
      // Escape HTML characters
      value = String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
      
      return `<td style="padding: 8px; border: 1px solid #ddd; word-wrap: break-word; max-width: 200px;">${value}</td>`
    }).join('')}</tr>`
  ).join('')

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
        h1 { color: #333; text-align: center; margin-bottom: 20px; font-size: 18px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; table-layout: fixed; }
        th { background-color: #f5f5f5; padding: 8px 6px; border: 1px solid #ddd; font-weight: bold; text-align: left; font-size: 11px; }
        td { padding: 6px; border: 1px solid #ddd; word-wrap: break-word; font-size: 10px; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .print-date { text-align: right; margin-bottom: 20px; font-size: 10px; color: #666; }
        .summary { margin-bottom: 15px; font-size: 11px; color: #666; }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
          table { font-size: 9px; }
          th, td { padding: 4px; }
        }
      </style>
    </head>
    <body>
      <div class="print-date">Generated on: ${new Date().toLocaleString()}</div>
      <h1>${title}</h1>
      <div class="summary">Total Records: ${data.length}</div>
      <table>
        <thead>
          <tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          }
        }
      </script>
    </body>
    </html>
  `

  printWindow.document.write(printContent)
  printWindow.document.close()
}

// Utility function to filter data based on search term
export const filterData = (data: any[], searchTerm: string, searchFields: string[]) => {
  if (!searchTerm) return data
  
  const lowercaseSearch = searchTerm.toLowerCase()
  
  return data.filter(item => 
    searchFields.some(field => {
      let value = item[field]
      
      // Handle nested objects
      if (typeof value === 'object' && value !== null) {
        if (value.name) value = value.name
        else if (Array.isArray(value)) return false // Skip arrays for search
        else value = JSON.stringify(value)
      }
      
      return String(value || '').toLowerCase().includes(lowercaseSearch)
    })
  )
}

// Utility function to sort data
export const sortData = (data: any[], sortKey: string, sortDirection: 'asc' | 'desc') => {
  return [...data].sort((a, b) => {
    let aValue = a[sortKey]
    let bValue = b[sortKey]
    
    // Handle nested objects
    if (typeof aValue === 'object' && aValue !== null && aValue.name) {
      aValue = aValue.name
    }
    if (typeof bValue === 'object' && bValue !== null && bValue.name) {
      bValue = bValue.name
    }
    
    // Handle null/undefined values
    if (aValue === null || aValue === undefined) aValue = ''
    if (bValue === null || bValue === undefined) bValue = ''
    
    // Convert to strings for comparison
    aValue = String(aValue).toLowerCase()
    bValue = String(bValue).toLowerCase()
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })
}

export const exportToExcel = (data: any[], filename: string, columns?: { key: string; label: string }[]) => {
  if (!data || data.length === 0) {
    alert('No data to export')
    return
  }

  const headers = columns ? columns.map(col => col.label) : Object.keys(data[0])
  const keys = columns ? columns.map(col => col.key) : Object.keys(data[0])

  // Create HTML table that Excel can read perfectly
  let htmlContent = `
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        table { border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .number { mso-number-format: "0"; }
        .text { mso-number-format: "\@"; }
      </style>
    </head>
    <body>
      <table>
        <thead>
          <tr>
  `

  // Add headers
  headers.forEach(header => {
    htmlContent += `<th>${header}</th>`
  })
  htmlContent += '</tr></thead><tbody>'

  // Add data rows
  data.forEach(row => {
    htmlContent += '<tr>'
    keys.forEach(key => {
      let value = formatValueForExport(row[key], true)
      let cellClass = 'text'
      
      // Check if it's a number (but not phone number)
      if (typeof row[key] === 'number' && !String(row[key]).match(/^[+]?[0-9]{10,15}$/)) {
        cellClass = 'number'
        value = String(row[key])
      }
      
      // Escape HTML characters
      value = String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      
      htmlContent += `<td class="${cellClass}">${value}</td>`
    })
    htmlContent += '</tr>'
  })

  htmlContent += '</tbody></table></body></html>'

  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.xls`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

// Enhanced export function that provides both CSV and Excel options
export const exportData = (data: any[], filename: string, format: 'csv' | 'excel' = 'excel', columns?: { key: string; label: string }[]) => {
  if (format === 'excel') {
    exportToExcel(data, filename, columns)
  } else {
    exportToCSV(data, filename, columns)
  }
}

// Utility function to paginate data
export const paginateData = (data: any[], currentPage: number, itemsPerPage: number) => {
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  
  return {
    data: data.slice(startIndex, endIndex),
    totalPages: Math.ceil(data.length / itemsPerPage),
    totalItems: data.length
  }
}