// Settings → Accounts → General (and pattern for all Accounts stubs).
// @summary Page heading removed — Coming soon only. Design controller kept @undo below.

import ComingSoonState from "@/components/empty/ComingSoonState";
// @undo — PageHeader + Appearance controller while Accounts is Coming soon
// import { Palette } from "@/components/icons/protoLucide";
// import PageHeader from "@/components/layout/PageHeader";
// import { Card, CardContent } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Switch } from "@/components/ui/switch";
// import {
//   DESIGN_CONTROLLER_ENABLED,
//   useDesignControllerStore,
// } from "@/store/designController";

export default function AccountGeneralPage() {
  // @undo — restore design controller UI
  // const tabVisible = useDesignControllerStore((s) => s.tabVisible);
  // const setTabVisible = useDesignControllerStore((s) => s.setTabVisible);
  // const openController = useDesignControllerStore((s) => s.openController);

  return (
    <div className="flex min-h-full flex-col">
      <ComingSoonState title="Coming soon" />
    </div>
  );
}
