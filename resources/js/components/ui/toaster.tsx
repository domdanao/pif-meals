import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  // Debug: Log toasts
  console.log('Toaster: Current toasts:', toasts);

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        console.log('Rendering toast:', { id, title, description, props });
        return (
          <Toast key={id} {...props} className="border-4 border-red-500 bg-red-100 text-black z-[9999]">
            <div className="grid gap-1">
              {title && <ToastTitle className="text-black font-bold">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-black">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport className="z-[9999]" />
    </ToastProvider>
  )
}
