"use client";

import { Suspense } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { ProgressProvider } from "@/context/ProgressContext";
import { Sidebar } from "./Sidebar";

export function Providers({ children }) {
  return (
    <AuthProvider>
      <ProgressProvider>
        <Suspense>
          <Sidebar />
        </Suspense>
        <main className="ml-0 lg:ml-72 min-h-screen pt-14 lg:pt-0">{children}</main>
      </ProgressProvider>
    </AuthProvider>
  );
}
