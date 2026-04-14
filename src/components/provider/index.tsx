"use client";

import { MedusaProvider, CartProvider } from "medusa-react";
import { QueryClient } from "@tanstack/react-query";
import React, { useState } from "react";

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <MedusaProvider
      queryClientProviderProps={{
        client: queryClient,
      }}
      baseUrl={MEDUSA_BACKEND_URL}
    >
      <CartProvider>{children}</CartProvider>
    </MedusaProvider>
  );
}
