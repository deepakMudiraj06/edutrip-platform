/** Payment states reserved for a future server-side gateway integration. */
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

/** The current product state: no payment provider or payment records exist yet. */
export type PaymentAvailability = "NOT_AVAILABLE";

export type PaymentReadySummary = {
  availability: PaymentAvailability;
  message: "Payment integration coming soon";
};
