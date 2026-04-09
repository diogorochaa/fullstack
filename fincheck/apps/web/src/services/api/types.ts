export type AuthResponse = {
  accessToken: string;
};

export type CurrentUser = {
  name: string;
  email: string;
};

export type BankAccount = {
  id: string;
  userId: string;
  name: string;
  initialBalance: number;
  currentBalance: number;
  type: "CHECKING" | "INVESTMENT" | "CASH";
  color: string;
};

export type Category = {
  id: string;
  userId: string;
  name: string;
  icon: string;
  type: "INCOME" | "EXPENSE";
};

export type Transaction = {
  id: string;
  userId: string;
  bankAccountId: string;
  categoryId: string | null;
  value: number;
  date: string;
  name: string;
  type: "INCOME" | "EXPENSE";
};
