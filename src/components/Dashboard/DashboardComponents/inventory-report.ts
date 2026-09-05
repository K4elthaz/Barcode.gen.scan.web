import type { InventoryItem } from '@/lib/types'
import { formatCurrency } from '@/utils/currency'

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

/** Build the standalone print window's HTML for the given items. */
export function buildInventoryReportHtml(items: InventoryItem[]) {
  const totalUnits = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  )
  const generatedAt = new Date().toLocaleString('en-PH', {
    dateStyle: 'long',
    timeStyle: 'short',
  })

  const rows = items
    .map(
      (item) => `
        <tr>
          <td class="mono">${escapeHtml(item.sku || '-')}</td>
          <td>
            <div class="name">${escapeHtml(item.productName || '-')}</div>
            ${
              item.description
                ? `<div class="desc">${escapeHtml(item.description)}</div>`
                : ''
            }
          </td>
          <td>${escapeHtml(item.category || '-')}</td>
          <td class="num">${Number(item.quantity || 0)}</td>
          <td class="num">${formatCurrency(item.sellingPrice)}</td>
          <td>${escapeHtml(item.status || 'Unknown')}</td>
        </tr>`
    )
    .join('')

  return `
    <html>
      <head>
        <title>Inventory Items Report</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 32px;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12px;
            color: #111827;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            gap: 16px;
            border-bottom: 2px solid #111827;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          h1 { margin: 0; font-size: 20px; }
          .meta { font-size: 11px; color: #6b7280; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; }
          th {
            text-align: left;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #6b7280;
            border-bottom: 1px solid #d1d5db;
            padding: 6px 8px;
          }
          td {
            padding: 8px;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: top;
          }
          tbody tr:nth-child(even) { background: #f9fafb; }
          .num { text-align: right; white-space: nowrap; }
          .mono { font-family: Consolas, monospace; font-size: 11px; }
          .name { font-weight: 600; }
          .desc { font-size: 10px; color: #6b7280; margin-top: 2px; }
          .footer {
            display: flex;
            gap: 24px;
            margin-top: 16px;
            font-size: 11px;
            color: #6b7280;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>Inventory Items Report</h1>
            <div class="meta">Generated on ${generatedAt}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Item</th>
              <th>Category</th>
              <th class="num">Quantity</th>
              <th class="num">Selling Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="footer">
          <span><strong>${items.length}</strong> item${
            items.length === 1 ? '' : 's'
          } listed</span>
          <span><strong>${totalUnits}</strong> unit${
            totalUnits === 1 ? '' : 's'
          } on hand</span>
        </div>
        <script>
          window.onload = function () {
            setTimeout(function () { window.print(); }, 250);
          };
        </script>
      </body>
    </html>
  `
}

/** Open a print-friendly window with a plain, readable inventory list. */
export function printInventoryReport(items: InventoryItem[]) {
  const printWindow = window.open('', '_blank', 'width=1000,height=650')
  if (!printWindow) return

  printWindow.document.write(buildInventoryReportHtml(items))
  printWindow.document.close()
}
