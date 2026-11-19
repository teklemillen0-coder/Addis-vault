import { DigitalProduct, Language, PurchaseOrder } from "../types";
import { UI_TRANSLATIONS } from "../i18n/translations";

function triggerDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function csvCell(value: string): string {
  const safeValue = /^[\s]*[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safeValue.replace(/"/g, '""')}"`;
}

export function downloadProductFile(): never {
  throw new Error("PDF Uploading Soon");
}

export function downloadSalesCsv(orders: PurchaseOrder[]) {
  const headers = [
    "Order ID",
    "Created At",
    "Payment Method",
    "FT / Ref Number",
    "Promo Code",
    "Subtotal (ETB)",
    "Discount (ETB)",
    "Total (ETB)",
    "Items",
    "Buyer Contact",
  ];

  const rows = orders.map((order) => [
    order.id,
    order.createdAt,
    order.paymentMethod.toUpperCase(),
    order.refNumber,
    order.promoCode || "",
    order.subtotalEtb.toString(),
    order.discountEtb.toString(),
    order.totalEtb.toString(),
    order.items.map((item) => `${item.titleSnapshot} x${item.quantity}`).join("; "),
    order.buyerContact || "",
  ]);
  const csv = "\uFEFF" + [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");

  triggerDownload(
    `addisvault-sales-ledger-${new Date().toISOString().slice(0, 10)}.csv`,
    csv,
    "text/csv;charset=utf-8;",
  );
}
