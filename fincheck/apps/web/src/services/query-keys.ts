export const queryKeys = {
  currentUser: ["current-user"] as const,
  bankAccounts: ["bank-accounts"] as const,
  categories: ["categories"] as const,
  transactions: (filters: {
    month: number;
    year: number;
    bankAccountId?: string;
    type?: "INCOME" | "EXPENSE";
  }) => ["transactions", filters] as const,
};
