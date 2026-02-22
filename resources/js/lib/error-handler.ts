import axios from "axios"
import { UseFormSetError, FieldValues, Path } from "react-hook-form"
import { toast } from "sonner"

/**
 * Handles server errors and maps validation errors to react-hook-form fields.
 * Shows a toast notification for non-validation errors.
 * Returns true if the error was handled, false otherwise.
 */
export function handleServerError<T extends FieldValues>(
    err: any,
    setError?: UseFormSetError<T>
): boolean {
    if (axios.isAxiosError(err)) {
        if (err.response?.status === 422) {
            const validationErrors = err.response.data.errors
            if (validationErrors && setError) {
                Object.keys(validationErrors).forEach((key) => {
                    setError(key as Path<T>, {
                        type: "server",
                        message: validationErrors[key][0],
                    })
                })
                return true
            }
        }

        // Handle other server errors (500, etc.) or validation errors without fields
        const message = err.response?.data?.message || "Something went wrong. Please try again."
        toast.error(message, {
            description: err.response?.data?.error || undefined,
            duration: 5000,
        })
        return true
    }

    return false
}
