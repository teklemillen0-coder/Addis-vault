import { DigitalProduct, Language, PurchaseOrder } from "../types";
import { UI_TRANSLATIONS } from "../i18n/translations";
import { buildRealPdfBytes, triggerUint8Download } from "./documentExport";

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

export async function downloadProductFile(
  product: DigitalProduct,
  mode: "full" | "sample",
  language: Language,
  watermark?: string | null,
) {
  const title = product.title[language];
  const description = product.description[language];
  const sample = product.sampleExcerpt[language];
  const highlights = product.highlights[language];
  const prefix = slugify(title);
  const category = UI_TRANSLATIONS[language].categories[product.category];
  const metadata = [
    product.subject,
    product.gradeBand,
    product.department,
    product.uniYear,
    product.examType,
    product.sku,
  ].filter(Boolean).join(" · ");
  const pages = [
    {
      title: "ADDIS-VAULT",
      subtitle: title,
      metaLine: [category, product.format, metadata].filter(Boolean).join(" · "),
      sections: [
        { heading: "Overview", content: description },
        ...(product.subject ? [{ heading: "Subject", content: product.subject }] : []),
        ...(product.department ? [{ heading: "Department", content: product.department }] : []),
      ],
    },
    {
      title,
      subtitle: mode === "full" ? "Study edition" : "Study preview",
      metaLine: `${product.sku} · ${category}`,
      sections: [
        { heading: "Included topics", content: highlights.join("\n") || description },
        { heading: "Available preview", content: sample || description },
      ],
    },
    ...(product.videoChapters?.length
      ? [{
          title: `${title} — Chapter Outline`,
          subtitle: metadata,
          sections: [{ heading: "Published chapter titles", content: product.videoChapters.join("\n") }],
        }]
      : []),
  ];
  const pdfBytes = await buildRealPdfBytes({ watermark, pages });
  triggerUint8Download(`${prefix}.pdf`, pdfBytes, "application/pdf");
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
