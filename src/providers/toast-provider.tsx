"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      toastOptions={{
        duration: 4_000,
        style: {
          background: "#FFFFFF",
          border: "1px solid #E2EAE9",
          borderRadius: "12px",
          boxShadow: "0 18px 45px rgba(6, 47, 53, 0.12)",
          color: "#294348",
          fontFamily: "Inter Variable, Inter, sans-serif",
          maxWidth: "420px",
          padding: "14px 16px",
        },
        success: {
          ariaProps: {
            role: "status",
            "aria-live": "polite",
          },
          iconTheme: {
            primary: "#167451",
            secondary: "#EAF8F1",
          },
        },
        error: {
          ariaProps: {
            role: "alert",
            "aria-live": "assertive",
          },
          iconTheme: {
            primary: "#B83C4A",
            secondary: "#FFF0F2",
          },
        },
      }}
    />
  );
}
