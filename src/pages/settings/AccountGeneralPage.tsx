// Settings → Account → General. Currently hosts the prototype's advanced
// switches; the rest of the page is still placeholder territory.

import { Palette } from "@/components/icons/protoLucide";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DESIGN_CONTROLLER_ENABLED,
  useDesignControllerStore,
} from "@/store/designController";

export default function AccountGeneralPage() {
  const tabVisible = useDesignControllerStore((s) => s.tabVisible);
  const setTabVisible = useDesignControllerStore((s) => s.setTabVisible);
  const openController = useDesignControllerStore((s) => s.openController);

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader title="General" icon={Palette} />

      <div className="px-12 py-8">
        {DESIGN_CONTROLLER_ENABLED ? (
          <section className="max-w-md space-y-2">
            <h2 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Advanced
            </h2>

            <Card className="border-border/60 bg-muted/30 shadow-none">
              <CardContent className="flex items-center justify-between gap-4 p-3">
                <div className="min-w-0">
                  <Label
                    htmlFor="appearance-tab"
                    className="text-xs font-normal text-muted-foreground"
                  >
                    Appearance controller
                  </Label>
                  {tabVisible ? (
                    <button
                      type="button"
                      onClick={openController}
                      className="ml-2 text-xs text-link hover:text-link-hover"
                    >
                      Open
                    </button>
                  ) : null}
                </div>
                <Switch
                  id="appearance-tab"
                  checked={tabVisible}
                  onCheckedChange={setTabVisible}
                  aria-label="Show the Appearance controller tab"
                  className="h-4 w-7 [&>[data-slot=switch-thumb]]:size-3 [&>[data-slot=switch-thumb]]:group-data-[state=checked]:translate-x-3"
                />
              </CardContent>
            </Card>
          </section>
        ) : null}
      </div>
    </div>
  );
}
