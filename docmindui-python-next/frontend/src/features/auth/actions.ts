"use server"

import { requestLogin, requestRegister } from "@/features/auth/api"

export async function loginAction(email: string, password: string) {
  const data = await requestLogin(email, password)
  return {
    accessToken: data.access_token,
    email: email.trim().toLowerCase(),
  }
}

export async function registerAction(email: string, password: string) {
  await requestRegister(email, password)
  return loginAction(email, password)
}
