import { useLocation } from "react-router-dom";
import { iconForPath, pageLabel } from "../lib/nav";
import PageHeader from "../components/layout/PageHeader";
import ComingSoonState from "../components/empty/ComingSoonState";

export default function PlaceholderPage() {
  const { pathname } = useLocation();
  const title = pageLabel(pathname);
  const icon = iconForPath(pathname);

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader title={title} icon={icon} />
      <ComingSoonState title={title} icon={icon} />
    </div>
  );
}
