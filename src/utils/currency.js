export function formatRupees(amount) {
  const value = Math.max(0, Number(amount) || 0);

  if (value >= 100000) {
    const lakhs = (value / 100000).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });
    return `₹${lakhs}L`;
  }

  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}