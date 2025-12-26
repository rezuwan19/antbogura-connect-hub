import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session, AuthMFAGetAuthenticatorAssuranceLevelResponse } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type MfaAssuranceLevel = AuthMFAGetAuthenticatorAssuranceLevelResponse["data"];
type UserRole = 'admin' | 'manager' | 'user' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isManager: boolean;
  userRole: UserRole;
  isLoading: boolean;
  mfaLevel: MfaAssuranceLevel | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshMfaLevel: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mfaLevel, setMfaLevel] = useState<MfaAssuranceLevel | null>(null);

  const refreshMfaLevel = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (error) throw error;
      setMfaLevel(data);
    } catch (error) {
      console.error("Error getting MFA level:", error);
    }
  };

  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase.rpc("get_user_role", {
      _user_id: userId,
    });
    
    if (error) {
      console.error("Error fetching user role:", error);
      return null;
    }
    
    return data as UserRole;
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer role check with setTimeout to prevent deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id).then((role) => {
              setUserRole(role);
              setIsAdmin(role === 'admin');
              setIsManager(role === 'manager');
            });
          }, 0);
        } else {
          setIsAdmin(false);
          setIsManager(false);
          setUserRole(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id).then((role) => {
          setUserRole(role);
          setIsAdmin(role === 'admin');
          setIsManager(role === 'manager');
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setIsManager(false);
    setUserRole(null);
    setMfaLevel(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        isManager,
        userRole,
        isLoading,
        mfaLevel,
        signIn,
        signUp,
        signOut,
        refreshMfaLevel,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
