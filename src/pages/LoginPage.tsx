// Login.tsx
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

export default function Login() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (session) {
      navigate(from, { replace: true });
    }
  }, [session, navigate, from]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={["github", "google"]}
        theme="light"
      />
    </div>
  );
}
