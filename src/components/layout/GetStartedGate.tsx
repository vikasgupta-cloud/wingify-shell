/** Redirects locked Get Started workspace users to the onboarding page. */

import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GET_STARTED_PATH } from "@/lib/getStartedGate";
import { useIsGetStartedLocked } from "@/store/getStartedOnboarding";

export function GetStartedGate() {
  const locked = useIsGetStartedLocked();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!locked) return;
    if (location.pathname === GET_STARTED_PATH) return;
    navigate(GET_STARTED_PATH, { replace: true });
  }, [locked, location.pathname, navigate]);

  return null;
}
