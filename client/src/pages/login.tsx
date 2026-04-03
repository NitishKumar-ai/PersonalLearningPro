import { useEffect } from "react";
import { useLocation } from "wouter";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { FirebaseAuthDialog } from "@/components/auth/firebase-auth-dialog";

export default function LoginPage() {
  const { currentUser: { profile } } = useFirebaseAuth();
  const [, setLocation] = useLocation();

  // Already logged in — go home
  useEffect(() => {
    if (profile) setLocation("/");
  }, [profile, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <FirebaseAuthDialog />
    </div>
  );
}
