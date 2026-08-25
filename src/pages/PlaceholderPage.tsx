// Product switcher stubs omit PageHeader; Home / settings / other stubs keep it.
import { useLocation } from "react-router-dom";
import { PRODUCT_SWITCHER_PATHS, WEB_EXPERIMENT_OLD_PATH } from "../config/navigation";
import { iconForPath, pageLabel } from "../lib/nav";
import PageHeader from "../components/layout/PageHeader";
import ComingSoonState from "../components/empty/ComingSoonState";

function isProductPath(pathname: string): boolean {
  if (
    pathname === WEB_EXPERIMENT_OLD_PATH ||
    pathname.startsWith(`${WEB_EXPERIMENT_OLD_PATH}/`)
  ) {
    return true;
  }
  return PRODUCT_SWITCHER_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export default function PlaceholderPage() {
  const { pathname } = useLocation();
  const title = pageLabel(pathname);
  const icon = iconForPath(pathname);
  const showHeader = !isProductPath(pathname);

  return (
    <div className="flex min-h-full flex-col">
      {showHeader && <PageHeader title={title} icon={icon} />}
      <ComingSoonState title={title} icon={icon} />
    </div>
  );
}
