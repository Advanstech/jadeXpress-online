// Formatting helpers for the storefront (GHS currency, dates, order numbers).

export function formatGHS(amount: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateOrderNumber(): string {
  const now = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `JX-${now}${rand}`;
}

export function generatePaystackReference(orderNumber: string): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${orderNumber}-${rand}`;
}
