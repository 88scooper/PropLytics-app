"use client";

import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { PropertyDataProvider } from "@/context/PropertyDataContext";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <PropertyDataProvider>
          {children}
        </PropertyDataProvider>
      </ToastProvider>
    </AuthProvider>
  );
}


