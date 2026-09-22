/** Workspace status banners — sit above all shells like PlaygroundBanner.
 * Full-width danger strips (not header pills).
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CancellationRequestNotice from "./CancellationRequestNotice";
import TrialOverNotice from "./TrialOverNotice";
import {
  useIsCancellationRevokeWorkspace,
  useIsTrialOverWorkspace,
} from "@/store/workspace";

export default function WorkspaceStatusBanner() {
  const navigate = useNavigate();
  const isCancellationWorkspace = useIsCancellationRevokeWorkspace();
  const isTrialOverWorkspace = useIsTrialOverWorkspace();
  const [revoked, setRevoked] = useState(false);

  useEffect(() => {
    setRevoked(false);
  }, [isCancellationWorkspace]);

  if (isTrialOverWorkspace) {
    return <TrialOverNotice onUpgrade={() => navigate("/upgrade")} />;
  }

  if (isCancellationWorkspace && !revoked) {
    return <CancellationRequestNotice onRevoke={() => setRevoked(true)} />;
  }

  return null;
}
