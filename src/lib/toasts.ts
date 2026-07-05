import { toast } from "sonner";

/** Success toast */
export function showSuccess(message: string) {
  toast.success(message);
}

/** Error toast with user-friendly message */
export function showError(error: unknown, fallback = "Something went wrong. Please try again.") {
  const message = error instanceof Error ? error.message : fallback;
  // Clean up technical messages for users
  const userMessage = message
    .replace(/^Error: /, "")
    .replace(/Uncaught /, "")
    .replace(/mutation failed:?\s*/i, "");
  toast.error(userMessage || fallback);
}

/** Warning toast */
export function showWarning(message: string) {
  toast.warning(message);
}

/** Info toast */
export function showInfo(message: string) {
  toast.info(message);
}

/** Loading toast that resolves to success/error */
export function showLoading(message: string) {
  return toast.loading(message);
}

/** Dismiss a toast */
export function dismissToast(id: string | number) {
  toast.dismiss(id);
}

/** Wrap an async action with loading/success/error toasts */
export async function withToast<T>(
  action: () => Promise<T>,
  opts: { loading?: string; success?: string; error?: string }
): Promise<T | null> {
  const id = toast.loading(opts.loading ?? "Processing...");
  try {
    const result = await action();
    toast.success(opts.success ?? "Done!", { id });
    return result;
  } catch (err) {
    showError(err, opts.error);
    toast.dismiss(id);
    return null;
  }
}
