import { Link, useLocation } from "react-router-dom";
import { getEntities } from "../config/entities";
import { pageLabel, resolveBreadcrumb } from "../lib/nav";

export default function PlaceholderPage() {
  const { pathname } = useLocation();
  // Only real leaf pages (not the catch-all) get the detail entry link.
  const { item, leaf } = resolveBreadcrumb(pathname);
  const isLeafPage = leaf ? leaf.path === pathname : item?.path === pathname;
  const firstEntity = isLeafPage ? getEntities(pathname)[0] : undefined;

  return (
    <div className="pt-10 pl-12">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        {pageLabel(pathname)}
      </h1>
      {/* TEMP dev entry — remove once list pages link into detail routes. */}
      {firstEntity && (
        <Link
          to={`${pathname}/c/${firstEntity.id}`}
          className="mt-6 inline-block rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Open sample detail →
        </Link>
      )}
    </div>
  );
}
