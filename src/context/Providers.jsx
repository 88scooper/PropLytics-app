"use client";

import { QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { PropertyProvider } from "@/context/PropertyContext";
import { MortgageProvider } from "@/context/MortgageContext";
import { queryClient } from "@/lib/query-client";

export default function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <PropertyProvider>
            <MortgageProvider>
              {children}
            </MortgageProvider>
          </PropertyProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}


