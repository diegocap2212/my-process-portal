import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import type { User } from "firebase/auth";

interface Permissions {
  canViewHistory: boolean;
  loading: boolean;
}

export function useUserPermissions(user: User | null): Permissions {
  const [canViewHistory, setCanViewHistory] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCanViewHistory(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    getDoc(doc(db, "users", user.uid))
      .then((snap) => {
        if (snap.exists()) {
          setCanViewHistory(snap.data()?.canViewHistory === true);
        } else {
          setCanViewHistory(false);
        }
      })
      .catch(() => setCanViewHistory(false))
      .finally(() => setLoading(false));
  }, [user]);

  return { canViewHistory, loading };
}
