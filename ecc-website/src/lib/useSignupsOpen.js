import { useEffect, useState } from "react";
import { internalTournament as t } from "../data/internalTournament";

const deadline = t.signupDeadline ? new Date(t.signupDeadline).getTime() : Infinity;

/** True until the sign-up deadline; flips to false at the deadline without a reload. */
export function useSignupsOpen() {
  const [open, setOpen] = useState(() => Date.now() < deadline);
  useEffect(() => {
    if (!open || deadline === Infinity) return undefined;
    // setTimeout can't wait longer than ~24.8 days; re-check daily if needed.
    const ms = Math.min(deadline - Date.now(), 86_400_000);
    const timer = setTimeout(() => setOpen(Date.now() < deadline), Math.max(0, ms) + 500);
    return () => clearTimeout(timer);
  }, [open]);
  return open;
}
