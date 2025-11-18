"use client";

import Layout from "@/components/Layout";
import { RequireAuth } from "@/context/AuthContext";

export default function Loading() {
  return (
    <RequireAuth>
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#205A3E] mx-auto"></div>
          <h1 className="text-2xl font-semibold mt-4">Loading property...</h1>
        </div>
      </Layout>
    </RequireAuth>
  );
}

