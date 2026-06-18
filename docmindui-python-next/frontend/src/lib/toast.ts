import { toast as notify } from "react-toastify"

const defaultOptions = {
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
}

export function toastSuccess(message: string) {
  notify.success(message, defaultOptions)
}

export function toastError(message: string) {
  notify.error(message, { ...defaultOptions, role: "alert" })
}

export function toastWarning(message: string) {
  notify.warning(message, defaultOptions)
}

export function toastInfo(message: string) {
  notify.info(message, defaultOptions)
}
