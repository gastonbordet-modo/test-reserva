"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

export type SnackbarVariant = "success" | "error";

type SnackbarOptions = {
  variant?: SnackbarVariant;
  duration?: number;
};

type SnackbarItem = {
  id: number;
  message: string;
  variant: SnackbarVariant;
  duration: number;
};

type SnackbarContextValue = {
  show: (message: string, options?: SnackbarOptions) => void;
  dismiss: () => void;
};

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

const DEFAULT_DURATION: Record<SnackbarVariant, number> = {
  success: 3000,
  error: 8000,
};

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<SnackbarItem | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setCurrent(null);
  }, []);

  const show = useCallback(
    (message: string, options?: SnackbarOptions) => {
      const variant = options?.variant ?? "success";
      const duration = options?.duration ?? DEFAULT_DURATION[variant];
      idRef.current += 1;
      const id = idRef.current;
      if (timerRef.current) clearTimeout(timerRef.current);
      setCurrent({ id, message, variant, duration });
      timerRef.current = setTimeout(() => {
        setCurrent((prev) => (prev && prev.id === id ? null : prev));
        timerRef.current = null;
      }, duration);
    },
    []
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <SnackbarContext.Provider value={{ show, dismiss }}>
      {children}
      {current && (
        <div
          key={current.id}
          role={current.variant === "error" ? "alert" : "status"}
          aria-live={current.variant === "error" ? "assertive" : "polite"}
          className="snackbar-enter fixed left-4 right-4 z-50 max-w-md mx-auto rounded-modo-md shadow-modo"
          style={{
            bottom: "calc(1rem + env(safe-area-inset-bottom))",
          }}
        >
          <div
            className={`flex items-center gap-3 p-3 sm:p-4 rounded-modo-md ${
              current.variant === "success"
                ? "bg-system-success text-paper"
                : "bg-system-error text-paper"
            }`}
          >
            <FontAwesomeIcon
              icon={
                current.variant === "success"
                  ? faCircleCheck
                  : faCircleExclamation
              }
              className="text-lg flex-shrink-0"
            />
            <span className="flex-1 text-sm sm:text-base font-medium">
              {current.message}
            </span>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Cerrar"
              className="flex-shrink-0 p-1 -m-1 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
        </div>
      )}
    </SnackbarContext.Provider>
  );
}

export function useSnackbar(): SnackbarContextValue {
  const ctx = useContext(SnackbarContext);
  if (!ctx) {
    throw new Error("useSnackbar must be used within SnackbarProvider");
  }
  return ctx;
}
