import { DigitalProduct } from "../types";

export type UniversityTypeFilter = "all" | "exams" | "modules" | "bundles";

export function matchesUniversityType(
  product: DigitalProduct,
  type: UniversityTypeFilter,
): boolean {
  if (type === "all") return true;

  const courseOptionPrefix = "uni-coursepack-";
  if (product.id.startsWith(courseOptionPrefix)) {
    return (
      (type === "exams" && product.id.endsWith("-exam")) ||
      (type === "modules" && product.id.endsWith("-module")) ||
      (type === "bundles" && product.id.endsWith("-bundle"))
    );
  }

  const details = `${product.examType ?? ""} ${product.format}`.toLowerCase();
  const isBundle = details.includes("bundle") || /\+\s*(course|module)/.test(details);
  if (type === "bundles") return isBundle;
  if (isBundle) return false;
  if (type === "modules") return /module|lecture note/.test(details);
  return /exam|paper/.test(details);
}
