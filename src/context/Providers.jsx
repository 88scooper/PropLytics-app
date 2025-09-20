"use client";

import { QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { PropertyDataProvider } from "@/context/PropertyDataContext";
import { MortgageProvider } from "@/context/MortgageContext";
import { queryClient } from "@/lib/query-client";

export default function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <PropertyDataProvider>
            <MortgageProvider>
              {children}
            </MortgageProvider>
          </PropertyDataProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}


