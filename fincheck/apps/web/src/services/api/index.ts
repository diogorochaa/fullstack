import { httpClient } from "../../lib/http-client";
import type {
  AuthResponse,
  BankAccount,
  Category,
  CurrentUser,
  Transaction,
} from "./types";

export function signup(payload: {
  name: string;
  email: string;
  password: string;
}) {
  return httpClient<AuthResponse>("/auth/signup", {
    method: "POST",
    body: payload,
    withAuth: false,
  });
}

export function signin(payload: { email: string; password: string }) {
  return httpClient<AuthResponse>("/auth/signin", {
    method: "POST",
    body: payload,
    withAuth: false,
  });
}

export function getCurrentUser() {
  return httpClient<CurrentUser>("/users/me");
}

export function getBankAccounts() {
  return httpClient<BankAccount[]>("/bank-accounts");
}

export function createBankAccount(payload: {
  name: string;
  initialBalance: number;
  type: "CHECKING" | "INVESTMENT" | "CASH";
  color: string;
}) {
  return httpClient<BankAccount>("/bank-accounts", {
    method: "POST",
    body: payload,
  });
}

export function updateBankAccount(
  bankAccountId: string,
  payload: {
    name: string;
    initialBalance: number;
  },
) {
  return httpClient<BankAccount>(`/bank-accounts/${bankAccountId}`, {
    method: "PUT",
    body: payload,
  });
}

export function getCategories() {
  return httpClient<Category[]>("/categories");
}

export function createCategory(payload: {
  name: string;
  type: "INCOME" | "EXPENSE";
  icon?: string;
}) {
  return httpClient<Category>("/categories", {
    method: "POST",
    body: payload,
  });
}

export function getTransactions(params: {
  month: number;
  year: number;
  bankAccountId?: string;
  type?: "INCOME" | "EXPENSE";
}) {
  return httpClient<Transaction[]>("/transactions", {
    params,
  });
}

export function createTransaction(payload: {
  bankAccountId: string;
  categoryId: string;
  name: string;
  value: number;
  date: string;
  type: "INCOME" | "EXPENSE";
}) {
  return httpClient<Transaction>("/transactions", {
    method: "POST",
    body: payload,
  });
}

export function deleteTransaction(transactionId: string) {
  return httpClient<null>(`/transactions/${transactionId}`, {
    method: "DELETE",
  });
}
