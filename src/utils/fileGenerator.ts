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

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
}

function csvCell(value: string): string {
  const safeValue = /^[\s]*[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safeValue.replace(/"/g, '""')}"`;
}

export function downloadProductFile(
  product: DigitalProduct,
  mode: "full" | "sample",
  language: Language,
) {
  const title = product.title[language];
  const description = product.description[language];
  const sample = product.sampleExcerpt[language];
  const highlights = product.highlights[language];
  const prefix = slugify(title);
  const category = UI_TRANSLATIONS[language].categories[product.category];
  const exportNotice =
    mode === "full"
      ? "This catalog record does not include the product source files. This export contains only the published listing information."
      : "Catalog preview only. Product source files are not attached to this listing.";
  const rows = [
    ["Title", title],
    ["SKU", product.sku],
    ["Category", category],
    ["Format", product.format],
    ["Description", description],
    ["Highlights", highlights.join(" | ")],
    ["Available preview", sample],
    ["Export note", exportNotice],
  ];

  if (product.fileExtension === "csv") {
    const csv = "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\n");
    triggerDownload(
      `${prefix}-${mode === "full" ? "catalog" : "preview"}.csv`,
      csv,
      "text/csv;charset=utf-8;",
    );
    return;
  }

  const list = highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const html = `<!doctype html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    :root{font:16px/1.6 system-ui,sans-serif;color:#1f2937;background:#f8fafc}
    body{max-width:760px;margin:3rem auto;padding:0 1.25rem}
    main{background:white;border:1px solid #e2e8f0;border-radius:1rem;padding:2rem}
    h1{line-height:1.2} .note{padding:1rem;background:#fef3c7;border-radius:.5rem}
    pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f1f5f9;padding:1rem;border-radius:.5rem}
  </style>
</head>
<body>
  <main>
    <p>${escapeHtml(category)} · ${escapeHtml(product.format)}</p>
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(description)}</p>
    <h2>Highlights</h2>
    <ul>${list}</ul>
    <h2>Available catalog preview</h2>
    <pre>${escapeHtml(sample)}</pre>
    <p class="note">${escapeHtml(exportNotice)}</p>
  </main>
</body>
</html>`;

  triggerDownload(
    `${prefix}-${mode === "full" ? "catalog" : "preview"}.html`,
    html,
    "text/html;charset=utf-8;",
  );
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
