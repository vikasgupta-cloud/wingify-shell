/** Sidebar nav icons from wingify-sidebar-icons-by-nav-name.zip — keyed by nav label. */
import type { ReactNode, SVGProps } from "react";
import { cn } from "@/lib/utils";

type NavGlyphProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
  strokeWidth?: number;
};

function glyph(viewBox: string, children: ReactNode) {
  return function NavGlyph({
    className,
    size = 16,
    strokeWidth: _strokeWidth,
    ...props
  }: NavGlyphProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={viewBox}
        width={size}
        height={size}
        fill="currentColor"
        aria-hidden
        className={cn("h-4 w-4 shrink-0", className)}
        {...props}
      >
        {children}
      </svg>
    );
  };
}

/** `A-B` */
export const NavABIcon = glyph("0 0 32 32", (
  <>
    <path d="M19 3V29" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M19 6H8C6.93913 6 5.92172 6.42143 5.17157 7.17157C4.42143 7.92172 4 8.93913 4 10C4 11.0609 4.42143 12.0783 5.17157 12.8284C5.92172 13.5786 6.93913 14 8 14H19M19 18H8C6.93913 18 5.92172 18.4214 5.17157 19.1716C4.42143 19.9217 4 20.9391 4 22C4 23.0609 4.42143 24.0783 5.17157 24.8284C5.92172 25.5786 6.93913 26 8 26H19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M23 6H24C25.0609 6 26.0783 6.42143 26.8284 7.17157C27.5786 7.92172 28 8.93913 28 10C28 11.0609 27.5786 12.0783 26.8284 12.8284C26.0783 13.5786 25.0609 14 24 14H23M23 18H24C25.0609 18 26.0783 18.4214 26.8284 19.1716C27.5786 19.9217 28 20.9391 28 22C28 23.0609 27.5786 24.0783 26.8284 24.8284C26.0783 25.5786 25.0609 26 24 26H23" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M8 11.25C8.69036 11.25 9.25 10.6904 9.25 10C9.25 9.30964 8.69036 8.75 8 8.75C7.30964 8.75 6.75 9.30964 6.75 10C6.75 10.6904 7.30964 11.25 8 11.25Z" fill="currentColor"></path><path d="M8 23.25C8.69036 23.25 9.25 22.6904 9.25 22C9.25 21.3096 8.69036 20.75 8 20.75C7.30964 20.75 6.75 21.3096 6.75 22C6.75 22.6904 7.30964 23.25 8 23.25Z" fill="currentColor"></path>
  </>
));

/** `Agents` */
export const NavAgentsIcon = glyph("0 0 256 256", (
  <>
    <rect x="32" y="56" width="192" height="160" rx="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></rect><rect x="72" y="144" width="112" height="40" rx="20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></rect><line x1="148" y1="144" x2="148" y2="184" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="108" y1="144" x2="108" y2="184" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="128" y1="56" x2="128" y2="16" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><circle fill="currentColor" cx="84" cy="108" r="12"></circle><circle fill="currentColor" cx="172" cy="108" r="12"></circle>
  </>
));

/** `Attributes` */
export const NavAttributesIcon = glyph("0 0 256 256", (
  <>
    <line x1="88" y1="64" x2="216" y2="64" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="88" y1="128" x2="216" y2="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="88" y1="192" x2="216" y2="192" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><circle fill="currentColor" cx="44" cy="64" r="12"></circle><circle fill="currentColor" cx="44" cy="128" r="12"></circle><circle fill="currentColor" cx="44" cy="192" r="12"></circle>
  </>
));

/** `Audit (lock badge)` */
export const NavAuditLockBadgeIcon = glyph("0 0 256 256", (
  <>
    <rect x="40" y="88" width="176" height="128" rx="8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></rect><circle fill="currentColor" cx="128" cy="152" r="12"></circle><path d="M88,88V56a40,40,0,0,1,80,0V88" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
  </>
));

/** `Audit` */
export const NavAuditIcon = glyph("0 0 256 256", (
  <>
    <path d="M54.46,201.54c-9.2-9.2-3.1-28.53-7.78-39.85C41.82,150,24,140.5,24,128s17.82-22,22.68-33.69C51.36,83,45.26,63.66,54.46,54.46S83,51.36,94.31,46.68C106.05,41.82,115.5,24,128,24S150,41.82,161.69,46.68c11.32,4.68,30.65-1.42,39.85,7.78s3.1,28.53,7.78,39.85C214.18,106.05,232,115.5,232,128S214.18,150,209.32,161.69c-4.68,11.32,1.42,30.65-7.78,39.85s-28.53,3.1-39.85,7.78C150,214.18,140.5,232,128,232s-22-17.82-33.69-22.68C83,204.64,63.66,210.74,54.46,201.54Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><polyline points="88 136 112 160 168 104" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polyline>
  </>
));

/** `Behavior Analytics` */
export const NavBehaviorAnalyticsIcon = glyph("0 0 32 32", (
  <>
    <path d="M14.7489 13.5679L14.9313 13.6125L27.0917 17.5107C28.1239 17.8421 28.2604 19.2472 27.3108 19.7708L22.0346 22.678L19.7902 26.836C19.2827 27.7755 17.9028 27.6733 17.5393 26.6693L13.3918 15.2112C13.0641 14.306 13.8444 13.4173 14.7489 13.5679ZM18.8282 24.5444L20.4307 21.5781L20.5252 21.4298C20.6305 21.2878 20.7656 21.1693 20.9216 21.0833L24.9562 18.8573L15.6939 15.8884L18.8282 24.5444Z" fill="currentColor"></path><path fillRule="evenodd" clipRule="evenodd" d="M14.2885 25.1546C14.2474 25.0531 14.1489 24.9866 14.0393 24.9866H6.52432C6.22741 24.9866 5.98672 24.7459 5.98672 24.449V6.99697C5.98672 6.70007 6.22741 6.45938 6.52432 6.45938H23.3254C23.6223 6.45938 23.863 6.70007 23.863 6.99697V13.4296C23.863 13.5456 23.9374 13.6485 24.0475 13.6849L25.4458 14.1465C25.6197 14.204 25.7989 14.0744 25.7989 13.8913V6.1365C25.7989 5.24578 25.0766 4.52344 24.1858 4.52344H5.66384L5.49847 4.53131C4.68528 4.61398 4.05078 5.3015 4.05078 6.1365V25.3095C4.05078 26.1445 4.68528 26.832 5.49847 26.9147L5.66384 26.9226H14.6051C14.7958 26.9226 14.9258 26.7296 14.8543 26.5529L14.2885 25.1546Z" fill="currentColor"></path>
  </>
));

/** `Chat` */
export const NavChatIcon = glyph("0 0 256 256", (
  <>
    <path d="M71.58,144,32,176V48a8,8,0,0,1,8-8H168a8,8,0,0,1,8,8v88a8,8,0,0,1-8,8Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><path d="M80,144v40a8,8,0,0,0,8,8h96.42L224,224V96a8,8,0,0,0-8-8H176" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
  </>
));

/** `Collapse sidebar` */
export const NavCollapseSidebarIcon = glyph("0 0 256 256", (
  <>
    <line x1="88" y1="48" x2="88" y2="208" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><rect x="32" y="48" width="192" height="160" rx="8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></rect><line x1="32" y1="80" x2="56" y2="80" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="32" y1="112" x2="56" y2="112" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="32" y1="144" x2="56" y2="144" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
  </>
));

/** `Concept Test` */
export const NavConceptTestIcon = glyph("0 0 256 256", (
  <>
    <line x1="88" y1="232" x2="168" y2="232" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><path d="M78.7,167A79.87,79.87,0,0,1,48,104.45C47.76,61.09,82.72,25,126.07,24a80,80,0,0,1,51.34,142.9A24.3,24.3,0,0,0,168,186v6a8,8,0,0,1-8,8H96a8,8,0,0,1-8-8v-6A24.11,24.11,0,0,0,78.7,167Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><path d="M136,56c20,3.37,36.61,20,40,40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
  </>
));

/** `Configurations` */
export const NavConfigurationsIcon = glyph("0 0 256 256", (
  <>
    <circle cx="104" cy="80" r="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></circle><circle cx="168" cy="176" r="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></circle><line x1="128" y1="80" x2="216" y2="80" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="40" y1="80" x2="80" y2="80" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="192" y1="176" x2="216" y2="176" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="40" y1="176" x2="144" y2="176" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
  </>
));

/** `Conversion` */
export const NavConversionIcon = glyph("0 0 256 256", (
  <>
    <line x1="128" y1="72" x2="128" y2="88" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="128" y1="168" x2="128" y2="184" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></circle><path d="M104,168h36a20,20,0,0,0,0-40H116a20,20,0,0,1,0-40h36" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
  </>
));

/** `Dashboard` */
export const NavDashboardIcon = glyph("0 0 256 256", (
  <>
    <path d="M224,120v96a8,8,0,0,1-8,8H160a8,8,0,0,1-8-8V164a4,4,0,0,0-4-4H108a4,4,0,0,0-4,4v52a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V120a16,16,0,0,1,4.69-11.31l80-80a16,16,0,0,1,22.62,0l80,80A16,16,0,0,1,224,120Z" fill="currentColor"></path>
  </>
));

/** `Data Platform` */
export const NavDataPlatformIcon = glyph("0 0 20 20", (
  <>
    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.25" d="M15 3.75H5a2.5 2.5 0 1 0 0 5h10a2.5 2.5 0 1 0 0-5Zm0 7.5H5a2.5 2.5 0 0 0 0 5h10a2.5 2.5 0 1 0 0-5Z"></path><path fill="currentColor" d="M5 7.03a.78.78 0 1 0 0-1.56.78.78 0 0 0 0 1.56m0 7.5a.78.78 0 1 0 0-1.56.78.78 0 0 0 0 1.56"></path>
  </>
));

/** `Events` */
export const NavEventsIcon = glyph("0 0 256 256", (
  <>
    <polyline points="40 144 96 200 224 72" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polyline>
  </>
));

/** `Expand caret` */
export const NavExpandCaretIcon = glyph("0 0 256 256", (
  <>
    <polyline points="208 96 128 176 48 96" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polyline>
  </>
));

/** `Experimentation` */
export const NavExperimentationIcon = glyph("0 0 256 256", (
  <>
    <line x1="88" y1="32" x2="168" y2="32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><path d="M152,32V99.14l62.85,104.74A8,8,0,0,1,208,216H48a8,8,0,0,1-6.86-12.12L104,99.14V32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><path d="M71.63,153.08c13.23-2.48,32-1.41,56.37,10.92,32.25,16.33,54.75,12.91,67.5,7.65" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
  </>
));

/** `External link` */
export const NavExternalLinkIcon = glyph("0 0 256 256", (
  <>
    <polyline points="216 104 215.99 40.01 152 40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polyline><line x1="136" y1="120" x2="216" y2="40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><path d="M184,136v72a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8h72" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
  </>
));

/** `Feature Rollouts` */
export const NavFeatureRolloutsIcon = glyph("0 0 256 256", (
  <>
    <circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></circle><line x1="160" y1="96" x2="96" y2="160" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><polyline points="112 96 160 96 160 144" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polyline>
  </>
));

/** `Feature Tests` */
export const NavFeatureTestsIcon = glyph("0 0 256 256", (
  <>
    <line x1="104" y1="48" x2="104" y2="208" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="152" y1="48" x2="152" y2="208" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="152" y1="128" x2="232" y2="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="24" y1="128" x2="104" y2="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><polyline points="200 96 232 128 200 160" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polyline><polyline points="56 96 24 128 56 160" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polyline>
  </>
));

/** `Features` */
export const NavFeaturesIcon = glyph("0 0 256 256", (
  <>
    <path d="M32,200H187.72a8,8,0,0,0,6.65-3.56L240,128,194.37,59.56A8,8,0,0,0,187.72,56H32l48,72Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
  </>
));

/** `Form Analytics` */
export const NavFormAnalyticsIcon = glyph("0 0 256 256", (
  <>
    <line x1="40" y1="64" x2="216" y2="64" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="40" y1="104" x2="168" y2="104" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="40" y1="144" x2="216" y2="144" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="40" y1="184" x2="168" y2="184" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
  </>
));

/** `FullStack` */
export const NavFullStackIcon = glyph("0 0 256 256", (
  <>
    <path d="M191.11,112.89c24-24,25.5-52.55,24.75-65.28a8,8,0,0,0-7.47-7.47c-12.73-.75-41.26.73-65.28,24.75L80,128l48,48Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><path d="M136,72H74.35a8,8,0,0,0-5.65,2.34L34.35,108.69a8,8,0,0,0,4.53,13.57L80,128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><path d="M184,120v61.65a8,8,0,0,1-2.34,5.65l-34.35,34.35a8,8,0,0,1-13.57-4.53L128,176" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><path d="M94.56,187.82C90.69,196.31,77.65,216,40,216c0-37.65,19.69-50.69,28.18-54.56" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
  </>
));

/** `Funnel Reports` */
export const NavFunnelReportsIcon = glyph("0 0 256 256", (
  <>
    <line x1="64" y1="136" x2="192" y2="136" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="24" y1="88" x2="232" y2="88" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="104" y1="184" x2="152" y2="184" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
  </>
));

/** `Funnels` */
export const NavFunnelsIcon = glyph("0 0 256 256", (
  <>
    <line x1="64" y1="136" x2="192" y2="136" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="24" y1="88" x2="232" y2="88" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="104" y1="184" x2="152" y2="184" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
  </>
));

/** `Goals` */
export const NavGoalsIcon = glyph("0 0 256 256", (
  <>
    <line x1="48" y1="224" x2="48" y2="56" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><path d="M48,176c64-55.43,112,55.43,176,0V56C160,111.43,112,.57,48,56" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
  </>
));

/** `Heatmaps` */
export const NavHeatmapsIcon = glyph("0 0 256 256", (
  <>
    <path d="M136,192c20-3.37,36.61-20,40-40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><path d="M112,96l26.27-72C159.86,41.92,208,88.15,208,144a80,80,0,0,1-160,0c0-30.57,14.42-58.26,31-80Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
  </>
));

/** `Hypotheses` */
export const NavHypothesesIcon = glyph("0 0 256 256", (
  <>
    <line x1="88" y1="232" x2="168" y2="232" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><path d="M78.7,167A79.87,79.87,0,0,1,48,104.45C47.76,61.09,82.72,25,126.07,24a80,80,0,0,1,51.34,142.9A24.3,24.3,0,0,0,168,186v6a8,8,0,0,1-8,8H96a8,8,0,0,1-8-8v-6A24.11,24.11,0,0,0,78.7,167Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><path d="M136,56c20,3.37,36.61,20,40,40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
  </>
));

/** `Ideas` */
export const NavIdeasIcon = glyph("0 0 256 256", (
  <>
    <line x1="88" y1="232" x2="168" y2="232" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="128" y1="200" x2="128" y2="144" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><polyline points="96 112 128 144 160 112" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polyline><path d="M78.7,167A79.87,79.87,0,0,1,48,104.45C47.76,61.09,82.72,25,126.07,24a80,80,0,0,1,51.34,142.9A24.3,24.3,0,0,0,168,186v6a8,8,0,0,1-8,8H96a8,8,0,0,1-8-8v-6A24.11,24.11,0,0,0,78.7,167Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
  </>
));

/** `Integrations` */
export const NavIntegrationsIcon = glyph("0 0 256 256", (
  <>
    <line x1="144" y1="64" x2="184" y2="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="232" y1="72" x2="192" y2="112" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="224" y1="144" x2="112" y2="32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><path d="M212,132l-58.63,58.63a32,32,0,0,1-45.25,0L65.37,147.88a32,32,0,0,1,0-45.25L124,44" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><line x1="86.75" y1="169.25" x2="32" y2="224" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
  </>
));

/** `Introduction` */
export const NavIntroductionIcon = glyph("0 0 256 256", (
  <>
    <circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></circle><path d="M120,120a8,8,0,0,1,8,8v40a8,8,0,0,0,8,8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><circle fill="currentColor" cx="124" cy="84" r="12"></circle>
  </>
));

/** `Metric Reports` */
export const NavMetricReportsIcon = glyph("0 0 256 256", (
  <>
    <polyline points="24 128 56 128 96 40 160 208 200 128 232 128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polyline>
  </>
));

/** `Metrics` */
export const NavMetricsIcon = glyph("0 0 256 256", (
  <>
    <polyline points="24 128 56 128 96 40 160 208 200 128 232 128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polyline>
  </>
));

/** `Mobile App A-B` */
export const NavMobileAppABIcon = glyph("0 0 32 32", (
  <>
    <path d="M13 25H8C7.46957 25 6.96086 24.7893 6.58579 24.4142C6.21071 24.0391 6 23.5304 6 23V5C6 4.46957 6.21071 3.96086 6.58579 3.58579C6.96086 3.21071 7.46957 3 8 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M25 9H15C13.8954 9 13 9.89543 13 11V27C13 28.1046 13.8954 29 15 29H25C26.1046 29 27 28.1046 27 27V11C27 9.89543 26.1046 9 25 9Z" fill="none" stroke="currentColor" strokeWidth="2"></path><path d="M20 26C20.8284 26 21.5 25.3284 21.5 24.5C21.5 23.6716 20.8284 23 20 23C19.1716 23 18.5 23.6716 18.5 24.5C18.5 25.3284 19.1716 26 20 26Z" fill="currentColor"></path>
  </>
));

/** `Mobile Recordings` */
export const NavMobileRecordingsIcon = glyph("0 0 32 32", (
  <>
    <path d="M22 2H10C9.20435 2 8.44129 2.31607 7.87868 2.87868C7.31607 3.44129 7 4.20435 7 5V27C7 27.7956 7.31607 28.5587 7.87868 29.1213C8.44129 29.6839 9.20435 30 10 30H22C22.7956 30 23.5587 29.6839 24.1213 29.1213C24.6839 28.5587 25 27.7956 25 27V5C25 4.20435 24.6839 3.44129 24.1213 2.87868C23.5587 2.31607 22.7956 2 22 2ZM23 27C23 27.2652 22.8946 27.5196 22.7071 27.7071C22.5196 27.8946 22.2652 28 22 28H10C9.73478 28 9.48043 27.8946 9.29289 27.7071C9.10536 27.5196 9 27.2652 9 27V5C9 4.73478 9.10536 4.48043 9.29289 4.29289C9.48043 4.10536 9.73478 4 10 4H22C22.2652 4 22.5196 4.10536 22.7071 4.29289C22.8946 4.48043 23 4.73478 23 5V27Z" fill="currentColor"></path><path d="M20.1004 16.005C20.1007 16.1161 20.0722 16.2254 20.0177 16.3223C19.9632 16.4191 19.8846 16.5002 19.7895 16.5577L13.8953 20.1637C13.7959 20.2245 13.6821 20.2577 13.5656 20.2599C13.4491 20.262 13.3341 20.2331 13.2326 20.1759C13.132 20.1197 13.0482 20.0377 12.9898 19.9383C12.9314 19.8389 12.9006 19.7258 12.9004 19.6105V12.3995C12.9006 12.2842 12.9314 12.1711 12.9898 12.0717C13.0482 11.9723 13.132 11.8903 13.2326 11.8341C13.3341 11.7769 13.4491 11.748 13.5656 11.7501C13.6821 11.7523 13.7959 11.7855 13.8953 11.8463L19.7895 15.4523C19.8846 15.5098 19.9632 15.5909 20.0177 15.6877C20.0722 15.7846 20.1007 15.8939 20.1004 16.005Z" fill="currentColor"></path>
  </>
));

/** `Observations` */
export const NavObservationsIcon = glyph("0 0 256 256", (
  <>
    <path d="M128,56C48,56,16,128,16,128s32,72,112,72,112-72,112-72S208,56,128,56Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><circle cx="128" cy="128" r="40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></circle>
  </>
));

/** `Pages` */
export const NavPagesIcon = glyph("0 0 256 256", (
  <>
    <polyline points="168 168 216 168 216 40 88 40 88 88" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polyline><rect x="40" y="88" width="128" height="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></rect>
  </>
));

/** `Plan` */
export const NavPlanIcon = glyph("0 0 256 256", (
  <>
    <rect x="40" y="40" width="176" height="176" rx="8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></rect><line x1="176" y1="24" x2="176" y2="56" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="80" y1="24" x2="80" y2="56" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="40" y1="88" x2="216" y2="88" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
  </>
));

/** `Profiles` */
export const NavProfilesIcon = glyph("0 0 256 256", (
  <>
    <circle cx="80" cy="104" r="40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></circle><line x1="160" y1="80" x2="248" y2="80" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="160" y1="128" x2="248" y2="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="184" y1="176" x2="248" y2="176" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><path d="M16,192c7.1-27.6,34.18-48,64-48s56.9,20.4,64,48" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
  </>
));

/** `Projects` */
export const NavProjectsIcon = glyph("0 0 32 32", (
  <>
    <path fill="currentColor" fillRule="evenodd" d="M5.379 7.11a1.6 1.6 0 0 1 .179-.163c.304-.24.83-.515 1.597-.771 1.52-.507 3.704-.843 6.178-.843s4.659.336 6.178.843c.768.256 1.291.531 1.597.771q.128.104.179.163a1.6 1.6 0 0 1-.179.165c-.304.24-.829.515-1.597.771-1.52.506-3.704.843-6.176.843-2.475 0-4.659-.336-6.179-.843-.768-.256-1.291-.531-1.597-.771a1.6 1.6 0 0 1-.179-.165m15.968.083-.003-.003v-.006zm-.005-.158.003-.006zM6.312 3.648c1.858-.619 4.341-.979 7.021-.979 2.682 0 5.163.36 7.022.979.922.307 1.763.704 2.403 1.206C23.382 5.347 24 6.099 24 7.112q0 .176-.024.341.024.12.024.251v8a1.333 1.333 0 0 1-2.667 0V10.2q-.469.206-.978.376c-1.859.619-4.341.979-7.022.979-2.68 0-5.163-.36-7.021-.979a11.2 11.2 0 0 1-.979-.376v5.438l.006.006c.045.064.158.187.394.342.478.317 1.264.646 2.355.915 1.074.267 2.346.451 3.712.531 1.363.08 2.765.051 4.086-.08a1.333 1.333 0 1 1 .266 2.653 29.184 29.184 0 0 1-4.509.09 23.36 23.36 0 0 1-4.197-.605 12.8 12.8 0 0 1-2.112-.704v5.048l.003.029a.48.48 0 0 0 .05.101c.064.102.197.256.443.44.501.374 1.32.757 2.45 1.066 1.115.304 2.43.506 3.834.581 1.402.075 2.827.019 4.152-.16a1.333 1.333 0 0 1 .358 2.643 24.954 24.954 0 0 1-4.653.179 21.28 21.28 0 0 1-4.392-.672c-1.312-.357-2.48-.853-3.344-1.499-.85-.635-1.578-1.552-1.568-2.726V7.11c0-1.013.616-1.765 1.24-2.258.64-.504 1.483-.899 2.405-1.206m15.779 25.389c-.336 0-.664 0-.942-.022a2.72 2.72 0 0 1-1.027-.269 2.672 2.672 0 0 1-1.165-1.165 2.72 2.72 0 0 1-.267-1.026c-.022-.278-.022-.606-.022-.944v-3.817c0-.336 0-.664.022-.941.024-.304.083-.664.267-1.027a2.676 2.676 0 0 1 1.165-1.165 2.733 2.733 0 0 1 1.027-.269c.277-.022.605-.022.942-.022h3.818c.336 0 .664 0 .942.022.304.026.664.085 1.026.269.502.256.91.664 1.166 1.165.184.362.242.722.267 1.027.022.277.022.605.022.941v3.819c0 .336 0 .664-.022.941a2.647 2.647 0 0 1-.269 1.027c-.256.502-.662.91-1.165 1.165a2.72 2.72 0 0 1-1.026.269 12.8 12.8 0 0 1-.942.022zm-.744-2.699v.016l.019.003c.155.013.371.013.768.013h3.731c.397 0 .613 0 .768-.013l.018-.002v-.018c.014-.155.016-.373.016-.768v-3.733c0-.395-.002-.611-.016-.768v-.016l-.018-.003a11.2 11.2 0 0 0-.768-.013h-3.733c-.395 0-.611 0-.768.013l-.016.003-.002.016a11.2 11.2 0 0 0-.014.768v3.733c0 .395 0 .613.014.768" clipRule="evenodd"></path>
  </>
));

/** `Push notification` */
export const NavPushNotificationIcon = glyph("0 0 256 256", (
  <>
    <path d="M160,80V200.67a8,8,0,0,0,3.56,6.65l11,7.33a8,8,0,0,0,12.2-4.72L200,160" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><path d="M40,200a8,8,0,0,0,13.15,6.12C105.55,162.16,160,160,160,160h40a40,40,0,0,0,0-80H160S105.55,77.84,53.15,33.89A8,8,0,0,0,40,40Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
  </>
));

/** `Segments` */
export const NavSegmentsIcon = glyph("0 0 256 256", (
  <>
    <circle cx="84" cy="108" r="52" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></circle><path d="M10.23,200a88,88,0,0,1,147.54,0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><path d="M172,160a87.93,87.93,0,0,1,73.77,40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><path d="M152.69,59.7A52,52,0,1,1,172,160" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
  </>
));

/** `Session Recordings` */
export const NavSessionRecordingsIcon = glyph("0 0 32 32", (
  <>
    <path d="M23.865 14.3984C24.042 14.7534 24.237 15.1004 24.393 15.4634C24.55 15.8264 24.805 16.5764 24.805 16.5764C24.805 16.5764 25.027 17.3424 25.084 17.7314C25.141 18.1204 25.172 18.5224 25.148 18.9134C25.123 19.3034 25.052 19.7024 24.937 20.0734C24.822 20.4434 24.658 20.8114 24.458 21.1384C24.258 21.4654 24.008 21.7744 23.736 22.0374C23.464 22.2994 23.149 22.5234 22.825 22.7134C22.502 22.9034 22.149 23.0724 21.796 23.1774C21.444 23.2814 21.067 23.3354 20.712 23.3394C20.357 23.3444 19.994 23.2874 19.666 23.2024C19.338 23.1174 19.04 22.9824 18.743 22.8314C18.446 22.6804 18.154 22.5024 17.883 22.2974C17.612 22.0934 17.374 21.8514 17.117 21.6024C16.859 21.3534 16.598 21.0824 16.337 20.8054C16.076 20.5274 15.809 20.2324 15.551 19.9364C15.293 19.6404 15.037 19.3314 14.788 19.0284C14.54 18.7254 14.303 18.4144 14.061 18.1174C13.819 17.8204 13.577 17.5234 13.337 17.2464C13.098 16.9684 12.887 16.6884 12.622 16.4514C12.358 16.2144 12.064 15.9964 11.75 15.8214C11.436 15.6474 11.089 15.5064 10.739 15.4054C10.389 15.3054 10.021 15.2284 9.65205 15.2214C9.28205 15.2144 8.89205 15.2674 8.52305 15.3654C8.15405 15.4644 7.78505 15.6304 7.43905 15.8124C7.09305 15.9954 6.75405 16.2174 6.44705 16.4624C6.14105 16.7084 5.83605 16.9764 5.59905 17.2864C5.36205 17.5954 5.16405 17.9574 5.02605 18.3204C4.88705 18.6834 4.81205 19.0794 4.76705 19.4664C4.72105 19.8524 4.71605 20.2544 4.75305 20.6384C4.79105 21.0234 4.88905 21.4024 4.99205 21.7754C5.09405 22.1494 5.23005 22.5134 5.37105 22.8774C5.51105 23.2414 5.66705 23.6054 5.83705 23.9614C6.00605 24.3174 6.29405 24.8384 6.38505 25.0134" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M21.6807 5.96443L21.7027 5.98043L27.1698 10.3384L27.1957 10.3594C27.3107 10.4524 27.4577 10.5694 27.5747 10.6794L27.5767 10.6824C27.6727 10.7734 27.9927 11.0764 28.0887 11.5674C28.1374 11.8191 28.1261 12.0788 28.0557 12.3253C27.9854 12.5718 27.858 12.7983 27.6838 12.9864C27.3448 13.3544 26.9157 13.4444 26.7847 13.4724H26.7827C26.6247 13.5044 26.4367 13.5284 26.2897 13.5464L26.2577 13.5494L23.4077 13.8934L21.2177 15.7474L21.1938 15.7684C21.0798 15.8644 20.9357 15.9864 20.8037 16.0784V16.0804C20.6917 16.1574 20.3347 16.4104 19.8357 16.4104C19.5791 16.4096 19.3263 16.3484 19.0978 16.2316C18.8694 16.1149 18.6717 15.9459 18.5208 15.7384C18.2268 15.3354 18.2218 14.8964 18.2188 14.7624V14.7604C18.2188 14.5984 18.2318 14.4104 18.2428 14.2644L18.2458 14.2304L18.7717 7.25943V7.23043C18.7817 7.11243 18.7937 6.94543 18.8197 6.80143C18.8417 6.65743 18.9107 6.28943 19.2037 5.96343C19.3607 5.78633 19.5544 5.64543 19.7713 5.55063C19.9881 5.45583 20.2231 5.40943 20.4597 5.41443C20.8977 5.42443 21.2147 5.62443 21.3347 5.70443C21.4577 5.78443 21.5877 5.88943 21.6807 5.96443Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M26.5 6C27.3284 6 28 5.32843 28 4.5C28 3.67157 27.3284 3 26.5 3C25.6716 3 25 3.67157 25 4.5C25 5.32843 25.6716 6 26.5 6Z" fill="currentColor"></path>
  </>
));

/** `Settings (User Feedback)` */
export const NavSettingsUserFeedbackIcon = glyph("0 0 256 256", (
  <>
    <circle cx="128" cy="128" r="40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></circle><path d="M41.43,178.09A99.14,99.14,0,0,1,31.36,153.8l16.78-21a81.59,81.59,0,0,1,0-9.64l-16.77-21a99.43,99.43,0,0,1,10.05-24.3l26.71-3a81,81,0,0,1,6.81-6.81l3-26.7A99.14,99.14,0,0,1,102.2,31.36l21,16.78a81.59,81.59,0,0,1,9.64,0l21-16.77a99.43,99.43,0,0,1,24.3,10.05l3,26.71a81,81,0,0,1,6.81,6.81l26.7,3a99.14,99.14,0,0,1,10.07,24.29l-16.78,21a81.59,81.59,0,0,1,0,9.64l16.77,21a99.43,99.43,0,0,1-10,24.3l-26.71,3a81,81,0,0,1-6.81,6.81l-3,26.7a99.14,99.14,0,0,1-24.29,10.07l-21-16.78a81.59,81.59,0,0,1-9.64,0l-21,16.77a99.43,99.43,0,0,1-24.3-10l-3-26.71a81,81,0,0,1-6.81-6.81Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
  </>
));

/** `Settings` */
export const NavSettingsIcon = glyph("0 0 256 256", (
  <>
    <circle cx="128" cy="128" r="40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></circle><path d="M41.43,178.09A99.14,99.14,0,0,1,31.36,153.8l16.78-21a81.59,81.59,0,0,1,0-9.64l-16.77-21a99.43,99.43,0,0,1,10.05-24.3l26.71-3a81,81,0,0,1,6.81-6.81l3-26.7A99.14,99.14,0,0,1,102.2,31.36l21,16.78a81.59,81.59,0,0,1,9.64,0l21-16.77a99.43,99.43,0,0,1,24.3,10.05l3,26.71a81,81,0,0,1,6.81,6.81l26.7,3a99.14,99.14,0,0,1,10.07,24.29l-16.78,21a81.59,81.59,0,0,1,0,9.64l16.77,21a99.43,99.43,0,0,1-10,24.3l-26.71,3a81,81,0,0,1-6.81,6.81l-3,26.7a99.14,99.14,0,0,1-24.29,10.07l-21-16.78a81.59,81.59,0,0,1-9.64,0l-21,16.77a99.43,99.43,0,0,1-24.3-10l-3-26.71a81,81,0,0,1-6.81-6.81Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
  </>
));

/** `Surveys` */
export const NavSurveysIcon = glyph("0 0 256 256", (
  <>
    <line x1="96" y1="152" x2="160" y2="152" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="96" y1="120" x2="160" y2="120" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><path d="M160,40h40a8,8,0,0,1,8,8V216a8,8,0,0,1-8,8H56a8,8,0,0,1-8-8V48a8,8,0,0,1,8-8H96" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><path d="M88,72V64a40,40,0,0,1,80,0v8Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
  </>
));

/** `Synthetic A-B` */
export const NavSyntheticABIcon = glyph("0 0 32 32", (
  <>
    <path fill="none" d="M8.99908 6H12.9991M10.9991 6V13L2.99908 25C2.82616 25.2991 2.73364 25.6378 2.73055 25.9832C2.72746 26.3287 2.81389 26.669 2.98143 26.9711C3.14897 27.2732 3.39191 27.5268 3.68657 27.7071C3.98123 27.8874 4.31758 27.9883 4.66283 28H22.3353C22.6806 27.9883 23.0169 27.8874 23.3116 27.7071C23.6062 27.5268 23.8492 27.2732 24.0167 26.9711C24.1843 26.669 24.2707 26.3287 24.2676 25.9832C24.2645 25.6378 24.172 25.2991 23.9991 25L16.4991 17M6.97908 19.03C11.6428 18.6763 16.3066 23.2288 20.9716 21.77" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path fill="none" d="M22.5 4.25C23 6.75 24.25 8.375 27.5 9.625C24.25 10.875 23 12.5 22.5 15C22 12.5 20.75 10.875 17.5 9.625C20.75 8.375 22 6.75 22.5 4.25Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
  </>
));

/** `Templates` */
export const NavTemplatesIcon = glyph("0 0 256 256", (
  <>
    <path d="M128,88a32,32,0,0,1,32-32h72V200H160a32,32,0,0,0-32,32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><path d="M24,200H96a32,32,0,0,1,32,32V88A32,32,0,0,0,96,56H24Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
  </>
));

/** `Triggers` */
export const NavTriggersIcon = glyph("0 0 256 256", (
  <>
    <polygon points="160 16 144 96 208 120 96 240 112 160 48 136 160 16" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polygon>
  </>
));

/** `Updates` */
export const NavUpdatesIcon = glyph("0 0 256 256", (
  <>
    <path d="M40.49,205.52,93,61.14a7.79,7.79,0,0,1,12.84-2.85l91.88,91.88A7.79,7.79,0,0,1,194.86,163L50.48,215.51A7.79,7.79,0,0,1,40.49,205.52Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><path d="M168,72s0-24,24-24,24-24,24-24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><line x1="144" y1="16" x2="144" y2="40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="216" y1="112" x2="232" y2="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="216" y1="80" x2="240" y2="72" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="78.09" y1="102.09" x2="153.91" y2="177.91" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="101.11" y1="197.11" x2="58.89" y2="154.89" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
  </>
));

/** `Upgrade` */
export const NavUpgradeIcon = glyph("0 0 256 256", (
  <>
    <polygon points="160 16 144 96 208 120 96 240 112 160 48 136 160 16" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polygon>
  </>
));

/** `User Feedback` */
export const NavUserFeedbackIcon = glyph("0 0 256 256", (
  <>
    <circle cx="108" cy="108" r="60" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></circle><path d="M24,208c20.55-24.45,49.56-40,84-40s63.45,15.55,84,40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><path d="M200,68.74a100.33,100.33,0,0,1,0,78.52" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><path d="M229.36,56a132.39,132.39,0,0,1,0,104" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
  </>
));

/** `Video Library` */
export const NavVideoLibraryIcon = glyph("0 0 256 256", (
  <>
    <rect x="32" y="48" width="192" height="144" rx="16" transform="translate(256 240) rotate(180)" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></rect><line x1="160" y1="224" x2="96" y2="224" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><polygon points="160 120 112 88 112 152 160 120" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polygon>
  </>
));

/** `Web Experimentation` */
export const NavWebExperimentationIcon = glyph("0 0 32 32", (
  <>
    <path d="M9 26H5C4.73478 26 4.48043 25.8946 4.29289 25.7071C4.10536 25.5196 4 25.2652 4 25V7C4 6.73478 4.10536 6.48043 4.29289 6.29289C4.48043 6.10536 4.73478 6 5 6H27C27.2652 6 27.5196 6.10536 27.7071 6.29289C27.8946 6.48043 28 6.73478 28 7V13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M4 12H28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M7 10C7.55228 10 8 9.55228 8 9C8 8.44772 7.55228 8 7 8C6.44772 8 6 8.44772 6 9C6 9.55228 6.44772 10 7 10Z" fill="currentColor"></path><path d="M10 10C10.5523 10 11 9.55228 11 9C11 8.44772 10.5523 8 10 8C9.44772 8 9 8.44772 9 9C9 9.55228 9.44772 10 10 10Z" fill="currentColor"></path><path d="M23.8779 14.9004C24.074 14.9005 24.2617 14.9785 24.4004 15.1172C24.5391 15.2559 24.6171 15.4435 24.6172 15.6396C24.6172 15.8359 24.5392 16.0243 24.4004 16.1631C24.2617 16.3017 24.074 16.3798 23.8779 16.3799H23.3379V20.8066L28.2305 28.9619H28.2314L28.2607 29.0098C28.3863 29.2192 28.454 29.459 28.457 29.7031C28.46 29.9472 28.3986 30.188 28.2783 30.4004C28.158 30.6127 27.9833 30.7892 27.7725 30.9121C27.5615 31.0351 27.3213 31.0996 27.0771 31.0996H14.2773C14.0334 31.0991 13.7936 31.0343 13.583 30.9111C13.3725 30.788 13.1981 30.6108 13.0781 30.3984C12.9583 30.1862 12.8972 29.9459 12.9004 29.7021C12.9036 29.4582 12.9712 29.219 13.0967 29.0098L18.0176 20.8066V16.3799H17.4775C17.2813 16.3799 17.0929 16.3019 16.9541 16.1631C16.8154 16.0243 16.7373 15.8358 16.7373 15.6396C16.7374 15.4437 16.8156 15.2559 16.9541 15.1172C17.0929 14.9784 17.2813 14.9004 17.4775 14.9004H23.8779ZM20.3408 26.8604C18.9712 26.1666 17.7229 25.8852 16.6201 26.0078L14.4541 29.6201H26.9014L25.7422 27.7002C25.2481 27.8344 24.7388 27.9026 24.2266 27.9004V27.9014C23.1691 27.9014 21.8732 27.6354 20.3408 26.8604ZM19.4971 21.0107C19.4973 21.1446 19.4607 21.2759 19.3916 21.3906L17.5186 24.5176C18.6212 24.5836 19.7908 24.9242 21.0117 25.542C22.7204 26.4068 24.0181 26.5161 24.9453 26.3662L21.9629 21.3916C21.8936 21.2768 21.8572 21.1448 21.8574 21.0107V16.3799H19.4971V21.0107Z" fill="currentColor" stroke="currentColor" strokeWidth="0.2"></path>
  </>
));

/** `Web Personalization` */
export const NavWebPersonalizationIcon = glyph("0 0 256 256", (
  <>
    <polyline points="180 40 216 40 216 76" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polyline><polyline points="180 216 216 216 216 180" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polyline><polyline points="76 216 40 216 40 180" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polyline><polyline points="76 40 40 40 40 76" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polyline><circle cx="128" cy="112" r="32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></circle><path d="M80,168a60,60,0,0,1,96,0" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
  </>
));

/** `Web Rollout` */
export const NavWebRolloutIcon = glyph("0 0 256 256", (
  <>
    <polygon points="128 160 176 216 80 216 128 160" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></polygon><path d="M56,192H48a16,16,0,0,1-16-16V64A16,16,0,0,1,48,48H208a16,16,0,0,1,16,16V176a16,16,0,0,1-16,16h-8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path>
  </>
));

/** `Wingz` */
export const NavWingzIcon = glyph("0 0 256 256", (
  <>
    <path d="M84.27,171.73l-55.09-20.3a7.92,7.92,0,0,1,0-14.86l55.09-20.3,20.3-55.09a7.92,7.92,0,0,1,14.86,0l20.3,55.09,55.09,20.3a7.92,7.92,0,0,1,0,14.86l-55.09,20.3-20.3,55.09a7.92,7.92,0,0,1-14.86,0Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><line x1="176" y1="16" x2="176" y2="64" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="224" y1="72" x2="224" y2="104" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="152" y1="40" x2="200" y2="40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><line x1="208" y1="88" x2="240" y2="88" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
  </>
));

/** `Workflows` */
export const NavWorkflowsIcon = glyph("0 0 256 256", (
  <>
    <path d="M80,168V144a16,16,0,0,1,16-16h88a16,16,0,0,0,16-16V88" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><line x1="80" y1="88" x2="80" y2="168" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line><circle cx="80" cy="64" r="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></circle><circle cx="200" cy="64" r="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></circle><circle cx="80" cy="192" r="24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></circle>
  </>
));

/** Lookup by exact nav label from the icon pack index. */
export const SIDEBAR_NAV_ICON_BY_LABEL = {
  "A-B": NavABIcon,
  "Agents": NavAgentsIcon,
  "Attributes": NavAttributesIcon,
  "Audit (lock badge)": NavAuditLockBadgeIcon,
  "Audit": NavAuditIcon,
  "Behavior Analytics": NavBehaviorAnalyticsIcon,
  "Chat": NavChatIcon,
  "Collapse sidebar": NavCollapseSidebarIcon,
  "Concept Test": NavConceptTestIcon,
  "Configurations": NavConfigurationsIcon,
  "Conversion": NavConversionIcon,
  "Dashboard": NavDashboardIcon,
  "Data Platform": NavDataPlatformIcon,
  "Events": NavEventsIcon,
  "Expand caret": NavExpandCaretIcon,
  "Experimentation": NavExperimentationIcon,
  "External link": NavExternalLinkIcon,
  "Feature Rollouts": NavFeatureRolloutsIcon,
  "Feature Tests": NavFeatureTestsIcon,
  "Features": NavFeaturesIcon,
  "Form Analytics": NavFormAnalyticsIcon,
  "FullStack": NavFullStackIcon,
  "Funnel Reports": NavFunnelReportsIcon,
  "Funnels": NavFunnelsIcon,
  "Goals": NavGoalsIcon,
  "Heatmaps": NavHeatmapsIcon,
  "Hypotheses": NavHypothesesIcon,
  "Ideas": NavIdeasIcon,
  "Integrations": NavIntegrationsIcon,
  "Introduction": NavIntroductionIcon,
  "Metric Reports": NavMetricReportsIcon,
  "Metrics": NavMetricsIcon,
  "Mobile App A-B": NavMobileAppABIcon,
  "Mobile Recordings": NavMobileRecordingsIcon,
  "Observations": NavObservationsIcon,
  "Pages": NavPagesIcon,
  "Plan": NavPlanIcon,
  "Profiles": NavProfilesIcon,
  "Projects": NavProjectsIcon,
  "Push notification": NavPushNotificationIcon,
  "Segments": NavSegmentsIcon,
  "Session Recordings": NavSessionRecordingsIcon,
  "Settings (User Feedback)": NavSettingsUserFeedbackIcon,
  "Settings": NavSettingsIcon,
  "Surveys": NavSurveysIcon,
  "Synthetic A-B": NavSyntheticABIcon,
  "Templates": NavTemplatesIcon,
  "Triggers": NavTriggersIcon,
  "Updates": NavUpdatesIcon,
  "Upgrade": NavUpgradeIcon,
  "User Feedback": NavUserFeedbackIcon,
  "Video Library": NavVideoLibraryIcon,
  "Web Experimentation": NavWebExperimentationIcon,
  "Web Personalization": NavWebPersonalizationIcon,
  "Web Rollout": NavWebRolloutIcon,
  "Wingz": NavWingzIcon,
  "Workflows": NavWorkflowsIcon,
} as const;

export type SidebarNavIconLabel = keyof typeof SIDEBAR_NAV_ICON_BY_LABEL;
