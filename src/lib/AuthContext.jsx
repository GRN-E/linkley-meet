import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";

const AuthContext = createContext(null);
export const AuthCtxForTest = AuthContext;   // test-only handle, tree-shaken from the bundle

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId) => {
    if (!userId) { setProfile(null); return; }
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (data) { setProfile(data); return; }
    // No profile row. The signup trigger swallows its own errors, so this can happen
    // even though the account exists. Repair it instead of leaving a half-logged-in user.
    const { data: healed } = await supabase.rpc("ensure_my_profile");
    setProfile(healed || null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      loadProfile(data.session?.user?.id).finally(() => setLoading(false));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSession(sess);
      loadProfile(sess?.user?.id);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const refreshProfile = useCallback(() => loadProfile(session?.user?.id), [session, loadProfile]);

  const signOut = useCallback(async () => { await supabase.auth.signOut(); setProfile(null); }, []);

  return (
    <AuthContext.Provider value={{ session, user: session?.user || null, profile, loading, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
