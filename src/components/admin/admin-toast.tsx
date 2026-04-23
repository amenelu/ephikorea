"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

type AdminToastProps = {
  status?: string;
  message?: string;
};

export function AdminToast({ status, message }: AdminToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!message || !isVisible) {
    return null;
  }

  const isError = status === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[70] w-[calc(100vw-2rem)] max-w-sm sm:right-6 sm:top-6">
      <div
        className={`pointer-events-auto rounded-2xl border shadow-xl backdrop-blur ${
          isError
            ? "border-red-200 bg-white text-red-700"
            : "border-green-200 bg-white text-green-700"
        }`}
      >
        <div className="flex items-start gap-3 px-4 py-4">
          <div
            className={`mt-0.5 rounded-full p-1 ${
              isError ? "bg-red-50" : "bg-green-50"
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-6 text-gray-900">
              {isError ? "Action failed" : "Action completed"}
            </p>
            <p className="mt-1 text-sm leading-6 text-gray-600">{message}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
