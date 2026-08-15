# Invoice Examples

This folder contains working examples of invoice download implementations.

## Available Examples

### InvoiceExamples.tsx

Contains 8 different implementation patterns:

1. **SimpleDownloadButton** - Basic download button
2. **DownloadButtonWithLoading** - Download with loading state
3. **DownloadWithFallback** - Supports invoice number or order ID
4. **InvoicePreviewModal** - Full modal with preview
5. **OrderTableRow** - Table row action button
6. **ManualFetchExample** - Manual fetch implementation
7. **InvoiceActionsDropdown** - Dropdown menu with actions
8. **BulkInvoiceDownload** - Download multiple invoices

## How to Use

### Import an Example

```tsx
import { SimpleDownloadButton } from '@/examples/InvoiceExamples'

// Use in your component
<SimpleDownloadButton invoiceNumber="INV-1234567890" />
```

### Copy and Customize

You can copy any example and customize it for your needs:

```tsx
// Copy the code from InvoiceExamples.tsx
export function MyCustomDownloadButton({ invoiceNumber }: { invoiceNumber: string }) {
  // Customize as needed
  return (
    <button onClick={() => downloadInvoiceByNumber(invoiceNumber)}>
      Download
    </button>
  )
}
```

## Example Descriptions

### 1. SimpleDownloadButton

The most basic implementation - just a button that downloads the invoice.

**Use when**: You need a simple, no-frills download button.

```tsx
<SimpleDownloadButton invoiceNumber="INV-1234567890" />
```

### 2. DownloadButtonWithLoading

Includes loading state with spinner and disabled state during download.

**Use when**: You want to provide visual feedback during download.

```tsx
<DownloadButtonWithLoading invoiceNumber="INV-1234567890" />
```

### 3. DownloadWithFallback

Supports both invoice number and order ID, with automatic fallback.

**Use when**: You might have either invoice number or order ID.

```tsx
<DownloadWithFallback 
  invoiceNumber="INV-1234567890" 
  orderId={1233} 
/>
```

### 4. InvoicePreviewModal

Full-featured modal with iframe preview and download options.

**Use when**: You want users to preview before downloading.

```tsx
<InvoicePreviewModal 
  invoiceNumber="INV-1234567890"
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
/>
```

### 5. OrderTableRow

Example of integrating download button in a table row.

**Use when**: Building order tables or lists.

```tsx
<OrderTableRow order={orderData} />
```

### 6. ManualFetchExample

Shows how to manually fetch and download without utility functions.

**Use when**: You need full control over the download process.

```tsx
<ManualFetchExample invoiceNumber="INV-1234567890" />
```

### 7. InvoiceActionsDropdown

Dropdown menu with multiple invoice actions.

**Use when**: You have multiple actions for an invoice.

```tsx
<InvoiceActionsDropdown 
  invoiceNumber="INV-1234567890"
  orderId={1233}
/>
```

### 8. BulkInvoiceDownload

Download multiple invoices with progress tracking.

**Use when**: Users need to download multiple invoices at once.

```tsx
<BulkInvoiceDownload 
  invoiceNumbers={['INV-001', 'INV-002', 'INV-003']} 
/>
```

## Common Patterns

### Pattern 1: Simple Download

```tsx
import { downloadInvoiceByNumber } from '@/utils/invoiceUtils'

<button onClick={() => downloadInvoiceByNumber(invoiceNumber)}>
  Download
</button>
```

### Pattern 2: With Error Handling

```tsx
const handleDownload = async () => {
  try {
    await downloadInvoiceByNumber(invoiceNumber)
  } catch (error) {
    console.error('Download failed:', error)
    // Custom error handling
  }
}
```

### Pattern 3: With Loading State

```tsx
const [loading, setLoading] = useState(false)

const handleDownload = async () => {
  setLoading(true)
  try {
    await downloadInvoiceByNumber(invoiceNumber)
  } finally {
    setLoading(false)
  }
}
```

## Tips

1. **Always handle errors**: Use try-catch blocks
2. **Show loading states**: Improve user experience
3. **Disable during download**: Prevent multiple clicks
4. **Use utility functions**: They include error handling
5. **Test with real data**: Verify PDF downloads correctly

## Related Files

- **Utility Functions**: `src/utils/invoiceUtils.ts`
- **API Constants**: `src/Constant/Api.ts`
- **Demo Component**: `src/components/InvoiceViewer.tsx`
- **Documentation**: `INVOICE_IMPLEMENTATION.md`

## Need Help?

Check the main documentation:
- `INVOICE_IMPLEMENTATION.md` - Complete guide
- `INVOICE_QUICK_REFERENCE.md` - Quick reference
- `IMPLEMENTATION_SUMMARY.md` - Overview
