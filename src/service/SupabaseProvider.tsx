// SupabaseProvider.tsx
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { type PropsWithChildren, useState } from "react";
import { supabase } from "../service/supabaseClient";

export default function SupabaseProvider({ children }: PropsWithChildren) {
{supabase}
  const [client] = useState(() => supabase);
  return (
    <SessionContextProvider supabaseClient={client}>
      {children}
    </SessionContextProvider>
  );
}
