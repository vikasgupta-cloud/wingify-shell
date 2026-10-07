// @summary JD avatar flyout: user card + notifications, destinations, language, theme, stubs, Logout.
// Feedback modal mounts in ExpandedNav (not here) so closing the flyout does not unmount it.
import { NavLink, useLocation } from "react-router-dom";
import { ExternalLink, History, Sparkles } from "@/components/icons/protoLucide";
import {
  CURRENT_USER,
  LOGOUT_PATH,
  PROFILE_DETAILS_PATH,
  type NavItem,
} from "../../config/navigation";
import { cn } from "../../lib/utils";
import {
  useIsOldNavigationWorkspace,
  useWorkspaceStore,
} from "@/store/workspace";
import ColorModeToggle from "./ColorModeToggle";
import LanguageMenu from "./LanguageMenu";
import NotificationsMenu from "./NotificationsMenu";
import ProfileAvatar from "./ProfileAvatar";

const PANEL_WIDTH = 280;

function ProfileMenuDivider() {
  return <div className="my-1.5 h-px bg-border" role="separator" />;
}

/**
 * Avatar flyout — max 3 dividers (no line after the profile card):
 * 1. User card + destinations (Configuration / Settings / Upgrade)
 * 2. Product updates + Language / Theme
 * 3. Navigation switch
 * 4. Logout
 *
 * `welcomeChrome` keeps user card, Language, Theme, and Logout.
 */
export default function ProfileMenuPanel({
  item,
  onRequestClose,
  onSwitchToOldNav,
  welcomeChrome: welcomeChromeProp,
}: {
  item: NavItem;
  onRequestClose?: () => void;
  onSwitchToOldNav?: () => void;
  welcomeChrome?: boolean;
}) {
  const { pathname } = useLocation();
  const welcomeChrome =
    welcomeChromeProp ?? pathname === "/design/welcome-start";
  const onOldNavigation = useIsOldNavigationWorkspace();
  const leaveOldNavigation = useWorkspaceStore((s) => s.leaveOldNavigation);

  if (!item.sections) return null;

  const destinationLeaves = item.sections
    .flatMap((section) => section.items)
    .filter(
      (leaf) =>
        leaf.path !== PROFILE_DETAILS_PATH && leaf.path !== LOGOUT_PATH
    );
  const logoutLeaf = item.sections
    .flatMap((section) => section.items)
    .find((leaf) => leaf.path === LOGOUT_PATH);
  const LogoutIcon = logoutLeaf?.icon;

  return (
    <nav
      className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-lg"
      style={{ width: PANEL_WIDTH }}
    >
      {/* Group 1 — identity + destinations (no divider after profile) */}
      {welcomeChrome ? (
        <div className="flex items-center gap-3 rounded-md bg-muted/40 px-3 py-2.5">
          <ProfileAvatar initials={CURRENT_USER.initials} size="lg" />
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-sm font-semibold tracking-tight text-foreground">
              {CURRENT_USER.name}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {CURRENT_USER.email}
            </span>
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-1 rounded-md bg-muted/40 px-1.5 py-1.5">
          <NavLink
            to={PROFILE_DETAILS_PATH}
            onClick={() => onRequestClose?.()}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-md px-1.5 py-1.5 transition-colors hover:bg-muted"
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
          <NotificationsMenu />
        </div>
      )}

      {!welcomeChrome &&
        destinationLeaves.map((leaf) => {
          const Icon = leaf.icon;
          return (
            <NavLink
              key={leaf.path}
              to={leaf.path}
              onClick={() => onRequestClose?.()}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted",
                  isActive && "bg-accent font-medium"
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

      {/* Divider 1 — utilities / preferences */}
      <ProfileMenuDivider />
      {!welcomeChrome && (
        <button
          type="button"
          title="Opens in a new tab"
          onClick={() => onRequestClose?.()}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
        >
          <ExternalLink
            className="h-4 w-4 shrink-0 text-muted-foreground"
            strokeWidth={1.75}
            aria-hidden
          />
          <span className="min-w-0 flex-1 truncate">Product updates</span>
        </button>
      )}
      <LanguageMenu />
      <ColorModeToggle className="rounded-md px-3" />

      {/* Divider 2 — navigation switch */}
      {!welcomeChrome ? (
        <>
          <ProfileMenuDivider />
          <button
            type="button"
            onClick={() => {
              onRequestClose?.();
              if (onOldNavigation) leaveOldNavigation();
              else onSwitchToOldNav?.();
            }}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
          >
            {onOldNavigation ? (
              <Sparkles
                className="h-4 w-4 shrink-0 text-muted-foreground"
                strokeWidth={1.75}
              />
            ) : (
              <History
                className="h-4 w-4 shrink-0 text-muted-foreground"
                strokeWidth={1.75}
              />
            )}
            <span className="min-w-0 flex-1 truncate">
              {onOldNavigation
                ? "Switch to new Navigation"
                : "Switch to old Navigation"}
            </span>
          </button>
        </>
      ) : null}

      {/* Divider 3 — session */}
      {logoutLeaf ? (
        <>
          <ProfileMenuDivider />
          <NavLink
            to={logoutLeaf.path}
            onClick={() => onRequestClose?.()}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
          >
            {LogoutIcon && (
              <LogoutIcon
                className="h-4 w-4 shrink-0 text-muted-foreground"
                strokeWidth={1.75}
              />
            )}
            <span className="min-w-0 flex-1 truncate">{logoutLeaf.label}</span>
          </NavLink>
        </>
      ) : null}
    </nav>
  );
}
