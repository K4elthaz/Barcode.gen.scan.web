import { FirebaseError } from "firebase/app"

const firebaseErrorMessages: Record<string, string> = {
  "auth/invalid-credential": "The email or password is incorrect.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/network-request-failed": "A network error occurred. Check your connection and try again.",
  "auth/too-many-requests": "Too many attempts were made. Wait a moment and try again.",
  "auth/user-disabled": "This account has been disabled. Contact an administrator.",
  "database/permission-denied": "You do not have permission to perform this action.",
  "storage/canceled": "The upload was canceled before it finished.",
  "storage/invalid-format": "The selected file format is not supported.",
  "storage/object-not-found": "The requested file could not be found.",
  "storage/unauthorized": "You do not have permission to access this file.",
  "storage/unknown": "The file upload failed unexpectedly. Try again.",
}

function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  )
}

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
) {
  if (error instanceof FirebaseError) {
    return firebaseErrorMessages[error.code] ?? error.message ?? fallback
  }

  if (error instanceof Error) {
    return error.message.trim() || fallback
  }

  if (typeof error === "string") {
    return error.trim() || fallback
  }

  if (isErrorWithMessage(error)) {
    return error.message.trim() || fallback
  }

  return fallback
}

function formatList(items: string[]) {
  if (items.length === 0) {
    return "all required fields"
  }

  if (items.length === 1) {
    return items[0]
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`
  }

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`
}

export function getRequiredFieldsMessage(fields: string[]) {
  return `Please complete ${formatList(fields)}.`
}