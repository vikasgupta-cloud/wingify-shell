import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowDown,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Copy,
  Download,
  Eye,
  FlaskConical,
  Play,
  Sparkles,
  ThumbsUp,
  Trophy,
  X,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import {
  copyEmailerPrompt,
  downloadEmailerHtml,
  downloadEmailerPrompt,
  downloadEmailerTokensJson,
  snapshotEmailerAppearance,
  type EmailerTokenPack,
} from "@/config/emailerTokens";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_MASCOT_ID, mascotAsset } from "@/config/mascots";
import { useFontStore } from "@/store/fonts";
import { useThemeStore } from "@/store/theme";

type ThemeSnap = Pick<
  EmailerTokenPack,
  "fonts" | "radius" | "roles" | "cta" | "semantic"
>;

function useEmailerTheme(): ThemeSnap | null {
  const themeId = useThemeStore((s) => s.themeId);
  const colorMode = useThemeStore((s) => s.colorMode);
  const ctaTokenId = useThemeStore((s) => s.ctaTokenId);
  const backgroundTokenId = useThemeStore((s) => s.backgroundTokenId);
  const headerTokenId = useThemeStore((s) => s.headerTokenId);
  const assignments = useFontStore((s) => s.assignments);
  const [snap, setSnap] = useState<ThemeSnap | null>(null);

  useEffect(() => {
    setSnap(snapshotEmailerAppearance(assignments));
  }, [
    themeId,
    colorMode,
    ctaTokenId,
    backgroundTokenId,
    headerTokenId,
    assignments,
  ]);

  return snap;
}

function useExportOptions() {
  const themeId = useThemeStore((s) => s.themeId);
  const colorMode = useThemeStore((s) => s.colorMode);
  const ctaTokenId = useThemeStore((s) => s.ctaTokenId);
  const backgroundTokenId = useThemeStore((s) => s.backgroundTokenId);
  const headerTokenId = useThemeStore((s) => s.headerTokenId);
  const fontAssignments = useFontStore((s) => s.assignments);
  return {
    themeId,
    colorMode,
    ctaTokenId,
    backgroundTokenId,
    headerTokenId,
    fontAssignments,
  };
}

type MailProps = { t: ThemeSnap };

type DetailRow = {
  label: string;
  value: ReactNode;
};

function Logo({ t }: MailProps) {
  const colorMode = useThemeStore((s) => s.colorMode);
  return (
    <div
      role="img"
      aria-label="Wingify"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
      }}
    >
      <img
        src={mascotAsset(DEFAULT_MASCOT_ID, colorMode)}
        alt=""
        style={{
          display: "block",
          height: 32,
          width: "auto",
          objectFit: "contain",
        }}
      />
      <span
        style={{
          fontFamily: t.fonts.title.stack,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: t.roles["--foreground"],
          lineHeight: 1,
        }}
      >
        Wingify
      </span>
    </div>
  );
}

function PrimaryButton({ t, label }: MailProps & { label: string }) {
  return (
    <a
      href="#"
      onClick={(e) => e.preventDefault()}
      style={{
        display: "inline-block",
        background: t.cta.background,
        color: t.cta.text,
        fontFamily: t.fonts.cta.stack,
        fontSize: 15,
        fontWeight: 600,
        textDecoration: "none",
        padding: "14px 28px",
        borderRadius: 8,
      }}
    >
      {label}
    </a>
  );
}

function Chip({
  t,
  tone,
  children,
}: MailProps & { tone: keyof ThemeSnap["semantic"] | "neutral"; children: string }) {
  const pair =
    tone === "neutral"
      ? { bg: t.roles["--muted"], fg: t.roles["--muted-foreground"] }
      : t.semantic[tone];
  return (
    <span
      style={{
        display: "inline-block",
        background: pair.bg,
        color: pair.fg,
        fontFamily: t.fonts.body.stack,
        fontSize: 12,
        fontWeight: 500,
        padding: "4px 10px",
        borderRadius: 4,
      }}
    >
      {children}
    </span>
  );
}

function Details({ t, rows }: MailProps & { rows: DetailRow[] }) {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "separate",
        borderSpacing: 0,
        border: `1px solid ${t.roles["--border"]}`,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <tbody>
        {rows.map((row, i) => (
          <tr key={row.label}>
            <td
              style={{
                width: 148,
                padding: i === 0 ? "20px 16px 8px 24px" : "8px 16px 8px 24px",
                paddingBottom: i === rows.length - 1 ? 20 : 8,
                fontFamily: t.fonts.body.stack,
                fontSize: 14,
                lineHeight: "20px",
                color: t.roles["--muted-foreground"],
                verticalAlign: "top",
                whiteSpace: "nowrap",
              }}
            >
              {row.label}
            </td>
            <td
              style={{
                padding: i === 0 ? "20px 24px 8px 8px" : "8px 24px 8px 8px",
                paddingBottom: i === rows.length - 1 ? 20 : 8,
                fontFamily: t.fonts.body.stack,
                fontSize: 14,
                lineHeight: "20px",
                fontWeight: 600,
                color: t.roles["--foreground"],
                verticalAlign: "top",
              }}
            >
              {row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SocialIcon({
  t,
  label,
  children,
}: MailProps & { label: string; children: ReactNode }) {
  return (
    <a
      href="#"
      aria-label={label}
      onClick={(e) => e.preventDefault()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: 999,
        background: t.roles["--card"],
        color: t.roles["--muted-foreground"],
      }}
    >
      {children}
    </a>
  );
}

function Footer({ t }: MailProps) {
  const icon = { width: 16, height: 16, fill: "currentColor" } as const;
  return (
    <div style={{ textAlign: "center", paddingTop: 32 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <SocialIcon t={t} label="LinkedIn">
          <svg viewBox="0 0 24 24" {...icon}>
            <path d="M6.5 9H4V20h2.5V9ZM5.25 4A1.75 1.75 0 1 0 5.25 7.5 1.75 1.75 0 0 0 5.25 4ZM20 20h-2.5v-5.6c0-1.54-.55-2.4-1.7-2.4-1.16 0-1.8.78-1.8 2.4V20H11.5V9h2.4v1.5c.5-.9 1.5-1.7 3.15-1.7 2.3 0 3.95 1.5 3.95 4.7V20Z" />
          </svg>
        </SocialIcon>
        <SocialIcon t={t} label="X">
          <svg viewBox="0 0 24 24" {...icon}>
            <path d="M17.5 4h2.6l-5.7 6.5L21 20h-4.8l-3.8-5-4.3 5H5.5l6.1-7L3.7 4h4.9l3.4 4.6L17.5 4Zm-1.7 14.4h1.4L8.3 5.5H6.8l9 12.9Z" />
          </svg>
        </SocialIcon>
        <SocialIcon t={t} label="Instagram">
          <svg viewBox="0 0 24 24" {...icon}>
            <path d="M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8Zm8.5 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM12 8.5A3.5 3.5 0 1 1 12 15.5 3.5 3.5 0 0 1 12 8.5Z" />
          </svg>
        </SocialIcon>
        <SocialIcon t={t} label="YouTube">
          <svg viewBox="0 0 24 24" {...icon}>
            <path d="M22 8.2a3 3 0 0 0-2.1-2.1C18.2 5.7 12 5.7 12 5.7s-6.2 0-7.9.4A3 3 0 0 0 2 8.2 32 32 0 0 0 2 12a32 32 0 0 0 .1 3.8 3 3 0 0 0 2.1 2.1c1.7.4 7.9.4 7.9.4s6.2 0 7.9-.4a3 3 0 0 0 2.1-2.1A32 32 0 0 0 22 12a32 32 0 0 0 0-3.8ZM10 15.2V8.8L16 12l-6 3.2Z" />
          </svg>
        </SocialIcon>
      </div>
      <div
        style={{
          width: 120,
          height: 1,
          background: t.roles["--border"],
          margin: "0 auto 20px",
        }}
      />
      <p
        style={{
          margin: "0 0 10px",
          fontFamily: t.fonts.body.stack,
          fontSize: 13,
        }}
      >
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          style={{ color: t.roles["--muted-foreground"] }}
        >
          Blog
        </a>
        <span style={{ color: t.roles["--border"], margin: "0 10px" }}>|</span>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          style={{ color: t.roles["--muted-foreground"] }}
        >
          Privacy
        </a>
      </p>
      <p
        style={{
          margin: 0,
          fontFamily: t.fonts.body.stack,
          fontSize: 12,
          lineHeight: "18px",
          color: t.roles["--muted-foreground"],
        }}
      >
        11th Floor, KJ Tower, Netaji Subhash Place&nbsp;&nbsp;Delhi 110034,
        India
      </p>
    </div>
  );
}

function Frame({ t, children }: MailProps & { children: ReactNode }) {
  return (
    <div
      style={{
        background: t.roles["--canvas"],
        padding: "40px 32px 48px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Logo t={t} />
      <div
        style={{
          marginTop: 32,
          marginLeft: "auto",
          marginRight: "auto",
          width: 600,
          maxWidth: "100%",
          background: t.roles["--card"],
          color: t.roles["--card-foreground"],
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
      <Footer t={t} />
    </div>
  );
}

function SignOff({ t }: MailProps) {
  return (
    <p
      style={{
        margin: "32px 0 0",
        fontFamily: t.fonts.body.stack,
        fontSize: 14,
        lineHeight: "22px",
        color: t.roles["--foreground"],
      }}
    >
      Happy Optimizing
      <br />
      VWO Team
    </p>
  );
}

function P({
  t,
  children,
  muted,
  center,
  size = 15,
}: MailProps & {
  children: ReactNode;
  muted?: boolean;
  center?: boolean;
  size?: number;
}) {
  return (
    <p
      style={{
        margin: "0 0 16px",
        fontFamily: t.fonts.body.stack,
        fontSize: size,
        lineHeight: size >= 16 ? "26px" : "24px",
        color: muted ? t.roles["--muted-foreground"] : t.roles["--foreground"],
        textAlign: center ? "center" : "left",
      }}
    >
      {children}
    </p>
  );
}

function Glyph({
  t,
  tone,
  children,
}: MailProps & {
  tone: keyof ThemeSnap["semantic"];
  children: ReactNode;
}) {
  return (
    <div
      style={{
        width: 72,
        height: 72,
        borderRadius: 999,
        margin: "8px auto 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: t.semantic[tone].bg,
        color: t.semantic[tone].fg,
      }}
    >
      {children}
    </div>
  );
}

function DetailsMail({
  t,
  title,
  cta,
  rows,
}: MailProps & { title: string; cta: string; rows: DetailRow[] }) {
  return (
    <Frame t={t}>
      <div style={{ padding: "40px 40px 36px" }}>
        <h2
          style={{
            fontFamily: t.fonts.title.stack,
            fontSize: 24,
            lineHeight: "32px",
            fontWeight: 700,
            color: t.roles["--foreground"],
            margin: "0 0 20px",
          }}
        >
          {title}
        </h2>
        <Details t={t} rows={rows} />
        <div style={{ marginTop: 28 }}>
          <PrimaryButton t={t} label={cta} />
        </div>
        <SignOff t={t} />
      </div>
    </Frame>
  );
}

function NoticeMail({
  t,
  children,
  cta,
  afterCta,
  banner,
}: MailProps & {
  children: ReactNode;
  cta: string;
  afterCta?: ReactNode;
  banner?: ReactNode;
}) {
  return (
    <Frame t={t}>
      <div style={{ padding: "40px 40px 36px", textAlign: "center" }}>
        {children}
        <div style={{ marginTop: 28 }}>
          <PrimaryButton t={t} label={cta} />
        </div>
        {afterCta}
      </div>
      {banner}
    </Frame>
  );
}

function MetaCell({
  t,
  label,
  value,
}: MailProps & { label: string; value: string }) {
  return (
    <div>
      <p
        style={{
          margin: 0,
          fontFamily: t.fonts.body.stack,
          fontSize: 11,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: t.roles["--muted-foreground"],
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: "6px 0 0",
          fontFamily: t.fonts.body.stack,
          fontSize: 14,
          fontWeight: 600,
          lineHeight: "20px",
          color: t.roles["--foreground"],
        }}
      >
        {value}
      </p>
    </div>
  );
}

function StatePill({
  t,
  tone,
  children,
}: MailProps & { tone: "neutral" | "success"; children: string }) {
  const solid = tone === "success";
  const pair = solid ? t.semantic.success : null;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: solid ? pair!.bg : "transparent",
        color: solid ? pair!.fg : t.roles["--muted-foreground"],
        border: solid ? "1px solid transparent" : `1px solid ${t.roles["--border"]}`,
        fontFamily: t.fonts.body.stack,
        fontSize: 14,
        fontWeight: solid ? 600 : 500,
        lineHeight: "20px",
        padding: "7px 14px",
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: solid ? pair!.fg : t.roles["--border"],
        }}
      />
      {children}
    </span>
  );
}

function StatusFlow({ t }: MailProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        background: t.roles["--muted"],
        borderRadius: 12,
        padding: "18px 22px",
        marginBottom: 32,
      }}
    >
      <StatePill t={t} tone="neutral">
        Paused
      </StatePill>
      <span
        aria-hidden
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          minWidth: 24,
        }}
      >
        <span
          style={{
            flex: 1,
            height: 1,
            background: t.roles["--border"],
          }}
        />
        <svg
          viewBox="0 0 8 8"
          style={{ width: 8, height: 8, display: "block", marginLeft: -1 }}
          fill={t.roles["--border"]}
        >
          <path d="M0 0 8 4 0 8Z" />
        </svg>
      </span>
      <StatePill t={t} tone="success">
        Running
      </StatePill>
    </div>
  );
}

function MetaGrid({
  t,
  rows,
}: MailProps & { rows: Array<[DetailRow, DetailRow]> }) {
  const hairline = `1px solid ${t.roles["--border"]}`;
  return (
    <div style={{ borderTop: hairline, borderBottom: hairline }}>
      {rows.map(([left, right], i) => (
        <div
          key={left.label}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            padding: "18px 0",
            borderTop: i === 0 ? "none" : hairline,
          }}
        >
          <MetaCell t={t} label={left.label} value={String(left.value)} />
          <MetaCell t={t} label={right.label} value={String(right.value)} />
        </div>
      ))}
    </div>
  );
}

function CampaignStatusChangedAlt({ t }: MailProps) {
  return (
    <Frame t={t}>
      <div style={{ padding: "44px 48px 40px" }}>
        <p
          style={{
            margin: "0 0 12px",
            fontFamily: t.fonts.body.stack,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: t.roles["--muted-foreground"],
          }}
        >
          Campaign status changed
        </p>
        <h2
          style={{
            fontFamily: t.fonts.title.stack,
            fontSize: 24,
            lineHeight: "32px",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: t.roles["--foreground"],
            margin: "0 0 24px",
          }}
        >
          Deploy software — Only select users for Testing (Cloned) and used on
          live website
        </h2>

        <StatusFlow t={t} />

        <MetaGrid
          t={t}
          rows={[
            [
              { label: "Campaign type", value: "Multivariate testing" },
              { label: "Campaign ID", value: "#3322344" },
            ],
            [
              { label: "Changed by", value: "John Doe" },
              { label: "Changed on", value: "20 Aug 2026, 4:12 PM" },
            ],
            [
              { label: "Account", value: "Content feedback" },
              { label: "Account ID", value: "#3452223" },
            ],
          ]}
        />

        <div style={{ marginTop: 32 }}>
          <PrimaryButton t={t} label="View Campaign" />
        </div>

        <div
          style={{
            marginTop: 36,
            paddingTop: 24,
            borderTop: `1px solid ${t.roles["--border"]}`,
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: t.fonts.body.stack,
              fontSize: 13,
              lineHeight: "22px",
              color: t.roles["--muted-foreground"],
            }}
          >
            Happy Optimizing
            <br />
            VWO Team
          </p>
        </div>
      </div>
    </Frame>
  );
}

function CampaignLaunched({ t }: MailProps) {
  return (
    <DetailsMail
      t={t}
      title="Campaign status changed"
      cta="View Campaign"
      rows={[
        {
          label: "Campaign Name",
          value:
            "Deploy software - Only select users for Testing (Cloned) and used on live website",
        },
        { label: "Campaign Type", value: "Multivariate testing" },
        { label: "Campaign ID", value: "#3322344" },
        {
          label: "Current Status",
          value: (
            <Chip t={t} tone="success">
              Running
            </Chip>
          ),
        },
        {
          label: "Previous Status",
          value: (
            <Chip t={t} tone="neutral">
              Paused
            </Chip>
          ),
        },
        { label: "Changed By", value: "John Doe" },
        { label: "Account", value: "Content feedback" },
        { label: "Account ID", value: "#3452223" },
      ]}
    />
  );
}

function NewUserAdded({ t }: MailProps) {
  return (
    <DetailsMail
      t={t}
      title="New user added"
      cta="View Campaign"
      rows={[
        { label: "Account Name", value: "Main Account - #3322344" },
        { label: "New User", value: "John Doe" },
        {
          label: "Role",
          value: (
            <Chip t={t} tone="warning">
              Publish
            </Chip>
          ),
        },
        { label: "Timestamp", value: "22 Jul, 2024, 10:00AM" },
      ]}
    />
  );
}

function UserDeleted({ t }: MailProps) {
  return (
    <DetailsMail
      t={t}
      title="User deleted"
      cta="View Campaign"
      rows={[
        { label: "Account Name", value: "Main Account - #3322344" },
        { label: "Removed User", value: "John Doe" },
        {
          label: "Role",
          value: (
            <Chip t={t} tone="warning">
              Publish
            </Chip>
          ),
        },
      ]}
    />
  );
}

function UserRoleChanged({ t }: MailProps) {
  return (
    <DetailsMail
      t={t}
      title="User role changed"
      cta="View Campaign"
      rows={[
        { label: "Account Name", value: "Main Account - #3322344" },
        { label: "User", value: "John Doe" },
        {
          label: "New role",
          value: (
            <Chip t={t} tone="warning">
              Publish
            </Chip>
          ),
        },
        {
          label: "Old role",
          value: (
            <Chip t={t} tone="neutral">
              Admin
            </Chip>
          ),
        },
        { label: "Timestamp", value: "22 Jul, 2024, 10:00AM" },
      ]}
    />
  );
}

function FeatureRow({
  t,
  title,
  body,
  icon,
}: MailProps & { title: string; body: string; icon: ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 14, marginBottom: 18, textAlign: "left" }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 999,
          background: t.roles["--muted"],
          color: t.roles["--foreground"],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            margin: 0,
            fontFamily: t.fonts.body.stack,
            fontSize: 15,
            fontWeight: 600,
            color: t.roles["--foreground"],
          }}
        >
          {title}
        </p>
        <p
          style={{
            margin: "4px 0 0",
            fontFamily: t.fonts.body.stack,
            fontSize: 13,
            lineHeight: "20px",
            color: t.roles["--muted-foreground"],
          }}
        >
          {body}
        </p>
      </div>
    </div>
  );
}

function WelcomeSmartCode({ t }: MailProps) {
  return (
    <Frame t={t}>
      <div style={{ padding: "40px 40px 36px" }}>
        <P t={t}>Hi John,</P>
        <P t={t}>
          Welcome to VWO! Let’s activate the full power of your account.
        </P>
        <P t={t}>
          There’s just one step to unlock everything: installing the VWO
          SmartCode. It’s a single, lightweight snippet of code that enables all
          of VWO’s optimization and insights features on your website.
        </P>
        <h3
          style={{
            fontFamily: t.fonts.title.stack,
            fontSize: 20,
            margin: "8px 0 16px",
            color: t.roles["--foreground"],
          }}
        >
          What you’ll unlock the moment it’s installed:
        </h3>
        <FeatureRow
          t={t}
          icon={<FlaskConical className="size-4" strokeWidth={1.75} />}
          title="Find out which headline converts better"
          body="Run powerful A/B tests to make data-driven decisions instead of guessing."
        />
        <FeatureRow
          t={t}
          icon={<Eye className="size-4" strokeWidth={1.75} />}
          title="See exactly where your visitors get stuck"
          body="Watch real user session recordings and visualize clicks with heatmaps to find and fix friction points."
        />
        <FeatureRow
          t={t}
          icon={<Sparkles className="size-4" strokeWidth={1.75} />}
          title="Let AI optimize your site for you"
          body="Let VWO’s AI automatically test combinations and drive traffic to the winning version, faster."
        />
        <div
          style={{
            marginTop: 8,
            padding: 24,
            borderRadius: 8,
            background: t.roles["--foreground"],
            color: t.roles["--background"],
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              fontFamily: t.fonts.title.stack,
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            Quick installation options:
          </p>
          <ul
            style={{
              margin: "0 0 16px",
              paddingLeft: 18,
              fontFamily: t.fonts.body.stack,
              fontSize: 13,
              lineHeight: "22px",
            }}
          >
            <li>Direct: Add code to your site’s header</li>
            <li>CMS: Works with WordPress, Shopify, Drupal & more</li>
          </ul>
          <PrimaryButton t={t} label="Install VWO SmartCode" />
        </div>
        <h3
          style={{
            fontFamily: t.fonts.title.stack,
            fontSize: 20,
            margin: "28px 0 12px",
            color: t.roles["--foreground"],
          }}
        >
          P.S. Still have questions? Your concerns, addressed:
        </h3>
        <P t={t} size={14}>
          <strong>Will it slow down my site?</strong>
          <br />
          No, our SmartCode is asynchronous and loads in less than 50ms. It’s
          designed for high performance.
        </P>
        <P t={t} size={14}>
          <strong>Is it secure?</strong>
          <br />
          VWO is ISO 27001 certified with enterprise-grade security and a focus
          on privacy.
        </P>
        <p
          style={{
            margin: "24px 0 0",
            fontFamily: t.fonts.body.stack,
            fontSize: 14,
            lineHeight: "22px",
          }}
        >
          Happy optimizing,
          <br />
          Team VWO
        </p>
      </div>
    </Frame>
  );
}

function SmartCodeActive({ t }: MailProps) {
  const blocks = [
    {
      title: "Launch A/B tests in minutes",
      body: "Visually edit any element on your page and test it to find a winner. No code or developer help is needed to get started.",
    },
    {
      title: "Watch real user journeys",
      body: "See your site through your visitors’ eyes by watching recordings of their clicks, scrolls, and frustrations to understand their true behavior.",
    },
    {
      title: "Visualize user behavior",
      body: "Instantly generate heatmaps and scrollmaps to see exactly where users are focusing their attention on your site.",
    },
  ];
  return (
    <Frame t={t}>
      <div style={{ padding: "40px 40px 36px" }}>
        <P t={t}>Hi John,</P>
        <P t={t}>
          You’re one step away from seeing your website in a whole new way. It
          only takes a couple of minutes, and once installed, you’ll be able to
          track visitor behavior, run A/B tests, and make data-driven decisions
          and many more things.
        </P>
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            padding: 16,
            border: `1px solid ${t.roles["--border"]}`,
            borderRadius: 8,
            marginBottom: 20,
          }}
        >
          <div style={{ flex: 1, textAlign: "left" }}>
            <p
              style={{
                margin: 0,
                fontFamily: t.fonts.body.stack,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Watch: How to Add the VWO SmartCode
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 13,
                lineHeight: "20px",
                color: t.roles["--muted-foreground"],
                fontFamily: t.fonts.body.stack,
              }}
            >
              Need a quick refresher? This short video walks you through the
              simple steps to add the VWO SmartCode to your website. Watch now
              and get set up in minutes!
            </p>
          </div>
          <div
            style={{
              width: 88,
              height: 64,
              borderRadius: 8,
              background: t.roles["--muted"],
              color: t.roles["--foreground"],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Play className="size-5" strokeWidth={1.75} />
          </div>
        </div>
        <PrimaryButton t={t} label="Install Smartcode" />
        <h3
          style={{
            fontFamily: t.fonts.title.stack,
            fontSize: 20,
            margin: "28px 0 16px",
          }}
        >
          Once the SmartCode is active, you can immediately:
        </h3>
        {blocks.map((b) => (
          <div key={b.title} style={{ marginBottom: 20, textAlign: "left" }}>
            <div
              style={{
                height: 88,
                borderRadius: 8,
                background: t.roles["--muted"],
                marginBottom: 10,
              }}
            />
            <p
              style={{
                margin: 0,
                fontWeight: 600,
                fontFamily: t.fonts.body.stack,
              }}
            >
              {b.title}
            </p>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 13,
                lineHeight: "20px",
                color: t.roles["--muted-foreground"],
                fontFamily: t.fonts.body.stack,
              }}
            >
              {b.body}
            </p>
          </div>
        ))}
        <div
          style={{
            marginTop: 8,
            padding: 20,
            borderRadius: 8,
            background: t.roles["--foreground"],
            color: t.roles["--background"],
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: t.fonts.title.stack,
              fontSize: 16,
              fontWeight: 600,
              textAlign: "left",
            }}
          >
            Don’t miss out on revenue, traffic, or opportunities.
          </p>
          <PrimaryButton t={t} label="Install Smartcode" />
        </div>
        <p
          style={{
            margin: "24px 0 0",
            fontFamily: t.fonts.body.stack,
            fontSize: 14,
            lineHeight: "22px",
          }}
        >
          Happy optimizing,
          <br />
          Team VWO
        </p>
      </div>
    </Frame>
  );
}

function TrialEnding({ t }: MailProps) {
  const misses = [
    "No visitor data collected",
    "No A/B tests run",
    "No user insights generated",
    "No heatmaps to analyze",
  ];
  return (
    <Frame t={t}>
      <div style={{ padding: "40px 40px 36px" }}>
        <P t={t}>Hi John,</P>
        <P t={t}>
          I noticed your VWO trial is ending soon, but the{" "}
          <span style={{ color: t.semantic.danger.fg, fontWeight: 600 }}>
            SmartCode hasn’t been installed yet
          </span>
          . This means you’re missing out on the insights that could transform
          your conversion, and I don’t want you to miss the chance to see the
          full value of VWO.
        </P>
        <div
          style={{
            border: `1px solid ${t.roles["--border"]}`,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            background: t.semantic.danger.bg,
            color: t.semantic.danger.fg,
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              fontWeight: 600,
              fontFamily: t.fonts.body.stack,
              fontSize: 14,
            }}
          >
            Trial expires in 2 days. Here’s what you’re missing
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {misses.map((m) => (
              <div
                key={m}
                style={{
                  display: "flex",
                  gap: 6,
                  alignItems: "flex-start",
                  fontSize: 13,
                  fontFamily: t.fonts.body.stack,
                }}
              >
                <X className="size-3.5 shrink-0" strokeWidth={2} />
                {m}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <p
            style={{
              margin: 0,
              flex: 1,
              fontFamily: t.fonts.body.stack,
              fontSize: 14,
              lineHeight: "22px",
            }}
          >
            Install <strong>SmartCode</strong> now to{" "}
            <strong>extend your trial</strong> and start seeing results.
          </p>
          <PrimaryButton t={t} label="Extend trial by installing" />
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            padding: 16,
            border: `1px solid ${t.roles["--border"]}`,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 88,
              height: 64,
              borderRadius: 8,
              background: t.roles["--muted"],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Play className="size-5" strokeWidth={1.75} />
          </div>
          <div>
            <p
              style={{
                margin: 0,
                fontWeight: 600,
                fontFamily: t.fonts.body.stack,
                fontSize: 14,
              }}
            >
              Watch: How to Add the VWO SmartCode
            </p>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 13,
                color: t.roles["--muted-foreground"],
                fontFamily: t.fonts.body.stack,
                lineHeight: "20px",
              }}
            >
              Need a quick refresher? This short video walks you through the
              simple steps to add the VWO SmartCode to your website. Watch now
              and get set up in minutes!
            </p>
          </div>
        </div>
        <div
          style={{
            border: `1px solid ${t.roles["--border"]}`,
            borderRadius: 8,
            padding: 20,
            background: t.semantic.info.bg,
            color: t.semantic.info.fg,
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              fontWeight: 600,
              fontFamily: t.fonts.body.stack,
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <CircleHelp className="size-4" strokeWidth={1.75} />
            Need help installing SmartCode?
          </p>
          <p
            style={{
              margin: "0 0 14px",
              fontFamily: t.fonts.body.stack,
              fontSize: 14,
              lineHeight: "22px",
            }}
          >
            Don’t let technical setup slow you down.{" "}
            <strong>
              Reply to this email or set up a quick call
            </strong>{" "}
            with me, and I’ll personally help you install SmartCode in no time.
          </p>
          <p
            style={{
              margin: "0 0 14px",
              fontSize: 13,
              fontFamily: t.fonts.body.stack,
            }}
          >
            Our team has helped 1000+ companies get up and running quickly.
          </p>
          <PrimaryButton t={t} label="Setup a quick call" />
        </div>
        <p
          style={{
            margin: "24px 0 0",
            fontFamily: t.fonts.body.stack,
            fontSize: 14,
            lineHeight: "22px",
            color: t.roles["--foreground"],
          }}
        >
          Happy optimizing,
          <br />
          Team VWO
        </p>
      </div>
    </Frame>
  );
}

function NoticeIntro({
  t,
  line,
}: MailProps & { line: string }) {
  return (
    <>
      <P t={t} center muted={false} size={16}>
        Hi Siddharth,
        <br />
        {line}
        <br />
        <strong>‘Home Page Layout test’</strong>
      </P>
      <p
        style={{
          margin: "-8px 0 20px",
          textAlign: "center",
          fontFamily: t.fonts.body.stack,
          fontSize: 13,
          color: t.roles["--muted-foreground"],
        }}
      >
        AccountName #4279247924
      </p>
    </>
  );
}

function SupportLine({ t }: MailProps) {
  return (
    <p
      style={{
        margin: "24px 0 0",
        fontFamily: t.fonts.body.stack,
        fontSize: 15,
        lineHeight: "24px",
        color: t.roles["--foreground"],
        textAlign: "center",
      }}
    >
      If you need assistance or have any questions, feel free to reach us at{" "}
      <a
        href="#"
        onClick={(e) => e.preventDefault()}
        style={{ color: t.roles["--link"] }}
      >
        support@vwo.com
      </a>
      . We’re here to help!
    </p>
  );
}

function FeatureBanner({ t }: MailProps) {
  return (
    <div
      style={{
        padding: "16px 40px",
        background: t.roles["--muted"],
        display: "flex",
        gap: 12,
        alignItems: "center",
        textAlign: "left",
      }}
    >
      <Sparkles className="size-5 shrink-0" strokeWidth={1.75} />
      <p
        style={{
          margin: 0,
          fontFamily: t.fonts.body.stack,
          fontSize: 14,
          lineHeight: "20px",
          color: t.roles["--foreground"],
        }}
      >
        Get featured on VWO website and inspire our{" "}
        <strong>350K monthly visitors</strong>. Share your win with us via{" "}
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          style={{ color: t.roles["--link"] }}
        >
          form
        </a>
        .
      </p>
    </div>
  );
}

function VariationNotBetter({ t }: MailProps) {
  return (
    <NoticeMail t={t} cta="View Report">
      <NoticeIntro t={t} line="We have an update on your campaign" />
      <Glyph t={t} tone="danger">
        <ArrowDown className="size-7" strokeWidth={1.75} />
      </Glyph>
      <h2
        style={{
          fontFamily: t.fonts.title.stack,
          fontSize: 22,
          lineHeight: "30px",
          margin: "0 0 12px",
        }}
      >
        ‘Blue button test’ is not better than baseline.
      </h2>
      <P t={t} center>
        You can disable the variation and divert traffic to other variations for
        faster conclusion of the campaign.
      </P>
    </NoticeMail>
  );
}

function WinnerLift({ t }: MailProps) {
  return (
    <NoticeMail t={t} cta="View Report" banner={<FeatureBanner t={t} />}>
      <NoticeIntro t={t} line="You have a winner on your campaign" />
      <Glyph t={t} tone="success">
        <Trophy className="size-7" strokeWidth={1.75} />
      </Glyph>
      <h2
        style={{
          fontFamily: t.fonts.title.stack,
          fontSize: 22,
          lineHeight: "30px",
          margin: "0 0 12px",
        }}
      >
        &lt;Variation X&gt; is better than baseline by X%.
      </h2>
      <P t={t} center>
        We recommend you roll out this variation and pause the campaign.
      </P>
    </NoticeMail>
  );
}

function WinnerBestChoice({ t }: MailProps) {
  return (
    <NoticeMail t={t} cta="View Report" banner={<FeatureBanner t={t} />}>
      <NoticeIntro t={t} line="You have a winner on your campaign" />
      <Glyph t={t} tone="success">
        <Trophy className="size-7" strokeWidth={1.75} />
      </Glyph>
      <h2
        style={{
          fontFamily: t.fonts.title.stack,
          fontSize: 22,
          lineHeight: "30px",
          margin: "0 0 12px",
        }}
      >
        &lt;Variation X&gt; outperforms the baseline &lt;Control&gt; with the
        highest uplift of Y%, making it the best choice.
      </h2>
      <P t={t} center>
        We recommend you roll out this variation and pause the campaign now.
      </P>
    </NoticeMail>
  );
}

function StickToBaseline({ t }: MailProps) {
  return (
    <NoticeMail t={t} cta="View Report">
      <NoticeIntro t={t} line="Here is the final conclusion on your campaign" />
      <Glyph t={t} tone="success">
        <ThumbsUp className="size-7" strokeWidth={1.75} />
      </Glyph>
      <h2
        style={{
          fontFamily: t.fonts.title.stack,
          fontSize: 22,
          lineHeight: "30px",
          margin: "0 0 12px",
        }}
      >
        Stick to baseline &lt;Control&gt; as no variation performed better than
        baseline.
      </h2>
      <P t={t} center>
        No variation has reached the X% threshold needed to declare a winner.
      </P>
    </NoticeMail>
  );
}

function LowTraffic({ t }: MailProps) {
  return (
    <NoticeMail t={t} cta="Review Campaign Configuration" afterCta={<SupportLine t={t} />}>
      <NoticeIntro t={t} line="We have an update on your campaign" />
      <Glyph t={t} tone="warning">
        <AlertTriangle className="size-7" strokeWidth={1.75} />
      </Glyph>
      <h2
        style={{
          fontFamily: t.fonts.title.stack,
          fontSize: 22,
          lineHeight: "30px",
          margin: "0 0 12px",
        }}
      >
        Low traffic reported
        <br />
        Only X visitors collected in the past 7 days.
      </h2>
      <P t={t} center>
        VWO expects a minimum of 500 visitors and 1 conversion in 7 days to
        obtain results in a reasonable duration.
      </P>
      <P t={t} center>
        We recommend you review the target audience or pause the campaign.
      </P>
    </NoticeMail>
  );
}

function ShortDuration({ t }: MailProps) {
  return (
    <NoticeMail t={t} cta="Extend Campaign Duration" afterCta={<SupportLine t={t} />}>
      <NoticeIntro t={t} line="Here is an update on your campaign" />
      <Glyph t={t} tone="warning">
        <AlertTriangle className="size-7" strokeWidth={1.75} />
      </Glyph>
      <h2
        style={{
          fontFamily: t.fonts.title.stack,
          fontSize: 22,
          lineHeight: "30px",
          margin: "0 0 12px",
        }}
      >
        Estimated campaign duration below 7 days.
      </h2>
      <P t={t} center>
        Considering weekly patterns in visitor behaviour, we recommend you run
        the campaign for at least 7 days till &lt;date&gt; for reliable results.
      </P>
    </NoticeMail>
  );
}

function NoDataCollected({ t }: MailProps) {
  return (
    <NoticeMail t={t} cta="Review Campaign Configuration" afterCta={<SupportLine t={t} />}>
      <NoticeIntro t={t} line="We have an update on your campaign" />
      <Glyph t={t} tone="warning">
        <AlertTriangle className="size-7" strokeWidth={1.75} />
      </Glyph>
      <h2
        style={{
          fontFamily: t.fonts.title.stack,
          fontSize: 22,
          lineHeight: "30px",
          margin: "0 0 12px",
        }}
      >
        No data collected in the campaign.
      </h2>
      <P t={t} center>
        No visitors have become part of the campaign in the last 3 days. We
        recommend reviewing the setup and target audience.
      </P>
    </NoticeMail>
  );
}

function WeeklyDigest({ t }: MailProps) {
  return (
    <DetailsMail
      t={t}
      title="Your weekly experiment digest"
      cta="Open digest"
      rows={[
        { label: "Workspace", value: "Wingify Delhi" },
        { label: "Running", value: "12" },
        { label: "In analysis", value: "4" },
        { label: "Ready to conclude", value: "1" },
        { label: "Needs attention", value: "Homepage CTA test has a winner" },
      ]}
    />
  );
}

function TeammateInvite({ t }: MailProps) {
  return (
    <DetailsMail
      t={t}
      title="You’ve been invited to a workspace"
      cta="Accept invite"
      rows={[
        { label: "Invited by", value: "Alex Chen" },
        { label: "Workspace", value: "Wingify Delhi" },
        { label: "Role", value: "Editor" },
        { label: "Expires", value: "7 days" },
      ]}
    />
  );
}

function QuotaWarning({ t }: MailProps) {
  return (
    <DetailsMail
      t={t}
      title="Monthly MTU is almost full"
      cta="Review plan"
      rows={[
        { label: "Account", value: "Content feedback" },
        { label: "Account ID", value: "#3452223" },
        { label: "Usage", value: "460k of 500k MTU" },
        {
          label: "Current Status",
          value: (
            <Chip t={t} tone="warning">
              92% used
            </Chip>
          ),
        },
        { label: "Period ends", value: "31 Aug" },
      ]}
    />
  );
}

function PasswordReset({ t }: MailProps) {
  return (
    <DetailsMail
      t={t}
      title="Reset your password"
      cta="Choose a new password"
      rows={[
        { label: "Account", value: "john.doe@wingify.com" },
        { label: "Request", value: "Password reset" },
        { label: "Expires", value: "30 minutes" },
      ]}
    />
  );
}



const EMAILERS = [
  {
    id: "campaign-status-changed",
    title: "Campaign status changed",
    blurb: "Details table from the product mail.",
    Preview: CampaignLaunched,
  },
  {
    id: "campaign-status-changed-alt",
    title: "Campaign status changed · redesign",
    blurb: "Status transition first, then campaign facts.",
    Preview: CampaignStatusChangedAlt,
  },
  {
    id: "new-user-added",
    title: "New user added",
    blurb: "Account, user, role chip, timestamp.",
    Preview: NewUserAdded,
  },
  {
    id: "user-deleted",
    title: "User deleted",
    blurb: "Removed user and role.",
    Preview: UserDeleted,
  },
  {
    id: "user-role-changed",
    title: "User role changed",
    blurb: "New and old role chips.",
    Preview: UserRoleChanged,
  },
  {
    id: "welcome-smartcode",
    title: "Welcome · SmartCode",
    blurb: "Onboarding letter and install CTA.",
    Preview: WelcomeSmartCode,
  },
  {
    id: "smartcode-active",
    title: "Install SmartCode",
    blurb: "Video row, features, install CTA.",
    Preview: SmartCodeActive,
  },
  {
    id: "trial-ending",
    title: "Trial ending",
    blurb: "Missing SmartCode, extend trial.",
    Preview: TrialEnding,
  },
  {
    id: "variation-not-better",
    title: "Variation not better",
    blurb: "Centered campaign update.",
    Preview: VariationNotBetter,
  },
  {
    id: "winner-lift",
    title: "Winner · lift vs baseline",
    blurb: "Trophy notice and feature banner.",
    Preview: WinnerLift,
  },
  {
    id: "winner-best-choice",
    title: "Winner · best choice",
    blurb: "Highest uplift recommendation.",
    Preview: WinnerBestChoice,
  },
  {
    id: "stick-to-baseline",
    title: "Stick to baseline",
    blurb: "No variation beat control.",
    Preview: StickToBaseline,
  },
  {
    id: "low-traffic",
    title: "Low traffic",
    blurb: "Visitor threshold warning.",
    Preview: LowTraffic,
  },
  {
    id: "short-duration",
    title: "Duration below 7 days",
    blurb: "Extend campaign duration.",
    Preview: ShortDuration,
  },
  {
    id: "no-data",
    title: "No data collected",
    blurb: "Setup and audience warning.",
    Preview: NoDataCollected,
  },
  {
    id: "weekly-digest",
    title: "Weekly digest",
    blurb: "Weekly counts in the details card.",
    Preview: WeeklyDigest,
  },
  {
    id: "teammate-invite",
    title: "Teammate invite",
    blurb: "Invite fields and accept CTA.",
    Preview: TeammateInvite,
  },
  {
    id: "quota-warning",
    title: "Quota warning",
    blurb: "Usage rows and warning chip.",
    Preview: QuotaWarning,
  },
  {
    id: "password-reset",
    title: "Password reset",
    blurb: "Reset request in the same body layout.",
    Preview: PasswordReset,
  },
] as const;

export default function EmailerGallery() {
  const t = useEmailerTheme();
  const exportOptions = useExportOptions();
  const previewRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [activeId, setActiveId] = useState<(typeof EMAILERS)[number]["id"]>(
    "campaign-status-changed-alt"
  );

  const activeIndex = EMAILERS.findIndex((e) => e.id === activeId);
  const current = EMAILERS[activeIndex] ?? EMAILERS[0];
  const Preview = current.Preview;

  const go = (dir: -1 | 1) => {
    const next = (activeIndex + dir + EMAILERS.length) % EMAILERS.length;
    setActiveId(EMAILERS[next].id);
  };

  if (!t) {
    return (
      <p className="text-sm text-muted-foreground">
        Reading the active theme…
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-foreground">
            {current.title}
          </h3>
          <p className="text-xs text-muted-foreground">{current.blurb}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Previous emailer"
            onClick={() => go(-1)}
          >
            <ChevronLeft className="size-4" strokeWidth={1.75} />
          </Button>
          <Select
            value={activeId}
            onValueChange={(id) =>
              setActiveId(id as (typeof EMAILERS)[number]["id"])
            }
          >
            <SelectTrigger className="h-8 w-[240px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EMAILERS.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Next emailer"
            onClick={() => go(1)}
          >
            <ChevronRight className="size-4" strokeWidth={1.75} />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              const root = previewRef.current;
              if (!root) return;
              downloadEmailerHtml({
                slug: current.id,
                title: current.title,
                markup: root.innerHTML,
              });
            }}
          >
            <Download className="size-3.5" strokeWidth={1.75} />
            HTML
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => downloadEmailerTokensJson(exportOptions)}
          >
            <Download className="size-3.5" strokeWidth={1.75} />
            Tokens
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => downloadEmailerPrompt(exportOptions)}
          >
            <Download className="size-3.5" strokeWidth={1.75} />
            Prompt
          </Button>
          <Button
            type="button"
            size="sm"
            className="gap-1.5"
            onClick={async () => {
              await copyEmailerPrompt(exportOptions);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
            }}
          >
            {copied ? (
              <Check className="size-3.5" strokeWidth={1.75} />
            ) : (
              <Copy className="size-3.5" strokeWidth={1.75} />
            )}
            {copied ? "Copied" : "Copy prompt"}
          </Button>
        </div>
      </div>

      <div
        ref={previewRef}
        className="w-full overflow-hidden rounded-lg border border-border"
      >
        <Preview t={t} />
      </div>
    </div>
  );
}
