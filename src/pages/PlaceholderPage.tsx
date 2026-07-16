import { useLocation } from "react-router-dom";
import { iconForPath, pageLabel } from "../lib/nav";
import PageHeader from "../components/layout/PageHeader";

export default function PlaceholderPage() {
  const { pathname } = useLocation();

  return <PageHeader title={pageLabel(pathname)} icon={iconForPath(pathname)} />;
}
