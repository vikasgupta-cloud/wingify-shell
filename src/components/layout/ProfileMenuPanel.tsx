import { NavLink } from "react-router-dom";
import {
  CURRENT_USER,
  LOGOUT_PATH,
  PROFILE_DETAILS_PATH,
  type NavItem,
} from "../../config/navigation";
import { cn } from "../../lib/utils";
import ProfileAvatar from "./ProfileAvatar";

const PANEL_WIDTH = 280;

/**
 * Avatar flyout: user card header, grouped destinations, Logout. Rows come from
 * the Profile item's sections so the rail and the expanded nav stay in sync.
 */
export default function ProfileMenuPanel({
  item,
  onRequestClose,
}: {
  item: NavItem;
  onRequestClose?: () => void;
}) {
  if (!item.sections) return null;

  const sections = item.sections
    .map((section) => ({
      ...section,
      items: section.items.filter((leaf) => leaf.path !== PROFILE_DETAILS_PATH),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <nav
      className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-lg border border-border bg-popover text-popover-foreground shadow-lg"
      style={{ width: PANEL_WIDTH }}
    >
      <NavLink
        to={PROFILE_DETAILS_PATH}
        onClick={() => onRequestClose?.()}
        className="flex items-center gap-3 border-b border-border bg-muted/40 px-4 py-3.5 transition-colors hover:bg-muted"
      >
        <ProfileAvatar initials={CURRENT_USER.initials} size="lg" />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold tracking-tight text-foreground">
            {CURRENT_USER.name}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {CURRENT_USER.email}
          </span>
        </span>
      </NavLink>

      {sections.map((section, i) => (
        <div key={section.heading ?? i} className="border-t border-border">
          {section.items.map((leaf) => {
            const Icon = leaf.icon;
            const isLogout = leaf.path === LOGOUT_PATH;
            return (
              <NavLink
                key={leaf.path}
                to={leaf.path}
                onClick={() => onRequestClose?.()}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted",
                    isActive && !isLogout && "bg-accent font-medium"
                  )
                }
              >
                {Icon && (
                  <Icon
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                )}
                <span className="min-w-0 flex-1 truncate">{leaf.label}</span>
              </NavLink>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
