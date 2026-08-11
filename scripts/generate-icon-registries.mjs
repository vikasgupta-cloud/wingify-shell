/**
 * Generates per-library icon registry maps (lucide name -> import alias).
 * Run: node scripts/generate-icon-registries.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "src/components/icons/registries/generated");

const protoLucide = fs.readFileSync(
  path.join(root, "src/components/icons/protoLucide.tsx"),
  "utf8"
);
const names = [
  ...protoLucide.matchAll(/^export const (\w+)/gm),
].map((m) => m[1]);

const lucideToKebab = (name) =>
  name
    .replace(/Icon$/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();

const PHOSPHOR = {
  Home: "House",
  Settings: "Gear",
  Search: "MagnifyingGlass",
  Menu: "List",
  Trash2: "Trash",
  Edit: "Pencil",
  Edit2: "PencilSimple",
  MoreHorizontal: "DotsThree",
  MoreVertical: "DotsThreeVertical",
  ExternalLink: "ArrowSquareOut",
  Loader2: "CircleNotch",
  BarChart3: "ChartBar",
  LineChart: "ChartLine",
  PieChart: "ChartPie",
  CheckCircle2: "CheckCircle",
  CircleHelp: "Question",
  HelpCircle: "Question",
  ChevronDown: "CaretDown",
  ChevronUp: "CaretUp",
  ChevronLeft: "CaretLeft",
  ChevronRight: "CaretRight",
  ChevronsLeft: "CaretDoubleLeft",
  ChevronsRight: "CaretDoubleRight",
  ChevronsUpDown: "CaretUpDown",
  SlidersHorizontal: "SlidersHorizontal",
  GripVertical: "DotsSixVertical",
  Wand2: "MagicWand",
  WandSparkles: "Sparkle",
  ShoppingCart: "ShoppingCartSimple",
  HeartPulse: "Heartbeat",
  Megaphone: "MegaphoneSimple",
  Database: "Database",
  LifeBuoy: "Lifebuoy",
  UserCircle: "UserCircle",
  FlaskConical: "Flask",
  Bot: "Robot",
  Mail: "Envelope",
  Bell: "Bell",
  EyeOff: "EyeSlash",
  Copy: "Copy",
  FileText: "FileText",
  FolderOpen: "FolderOpen",
  Link2: "Link",
  Share2: "ShareNetwork",
  Undo2: "ArrowCounterClockwise",
  Redo2: "ArrowClockwise",
  Maximize2: "ArrowsOut",
  Minimize2: "ArrowsIn",
  LogOut: "SignOut",
  Users: "Users",
  User: "User",
  Lock: "Lock",
  Unlock: "LockOpen",
  Download: "DownloadSimple",
  Upload: "UploadSimple",
  RefreshCw: "ArrowsClockwise",
  RotateCcw: "ArrowCounterClockwise",
  Play: "Play",
  Pause: "Pause",
  Plus: "Plus",
  Minus: "Minus",
  X: "X",
  Check: "Check",
  AlertCircle: "WarningCircle",
  AlertTriangle: "Warning",
  Info: "Info",
  Calendar: "Calendar",
  Clock: "Clock",
  Filter: "Funnel",
  SortAsc: "SortAscending",
  SortDesc: "SortDescending",
  Columns3: "Columns",
  Rows3: "Rows",
  LayoutGrid: "SquaresFour",
  LayoutList: "ListBullets",
  Image: "Image",
  Images: "Images",
  Video: "Video",
  Mic: "Microphone",
  Bookmark: "Bookmark",
  Star: "Star",
  Tag: "Tag",
  Target: "Target",
  Terminal: "Terminal",
  Sparkles: "Sparkle",
  Shield: "Shield",
  Award: "Medal",
  Building2: "Buildings",
  BookOpen: "BookOpen",
  Archive: "Archive",
  Clipboard: "Clipboard",
  Code: "Code",
  Code2: "Code",
  Braces: "BracketsCurly",
  Component: "PuzzlePiece",
  Blocks: "SquaresFour",
  AppWindow: "AppWindow",
  Contact: "AddressBook",
  CodeXml: "FileHtml",
  Monitor: "Monitor",
  Moon: "Moon",
  Sun: "Sun",
  Cloud: "Cloud",
  History: "ClockCounterClockwise",
  Layers: "Stack",
  Lightbulb: "Lightbulb",
  MessageSquare: "Chat",
  Pointer: "Cursor",
  Move: "ArrowsOutCardinal",
  MoveUp: "ArrowUp",
  MoveDown: "ArrowDown",
  Table: "Table",
  Text: "TextT",
  Type: "TextT",
  Bold: "TextB",
  Italic: "TextItalic",
  Underline: "TextUnderline",
  Strikethrough: "TextStrikethrough",
  List: "List",
  ListFilter: "FunnelSimple",
  ListOrdered: "ListNumbers",
  ThumbsUp: "ThumbsUp",
  ThumbsDown: "ThumbsDown",
  TrendingUp: "TrendUp",
  TrendingDown: "TrendDown",
  Shuffle: "Shuffle",
  Send: "PaperPlaneTilt",
  Save: "FloppyDisk",
  Flag: "Flag",
  Diff: "GitDiff",
  CreditCard: "CreditCard",
  CornerDownLeft: "ArrowBendDownLeft",
  UnfoldHorizontal: "ArrowsHorizontal",
  StopCircle: "StopCircle",
  CircleDashed: "CircleDashed",
  Circle: "Circle",
  ToggleLeft: "ToggleLeft",
  ToggleRight: "ToggleRight",
  CaseSensitive: "TextAa",
  CalendarCheck: "CalendarCheck",
  CalendarClock: "CalendarDots",
  CalendarDays: "CalendarDots",
  CalendarRange: "CalendarBlank",
  AlignLeft: "TextAlignLeft",
  AlignCenter: "TextAlignCenter",
  AlignRight: "TextAlignRight",
  AlignJustify: "TextAlignJustify",
  ChevronDownIcon: "CaretDown",
  ChevronLeftIcon: "CaretLeft",
  ChevronRightIcon: "CaretRight",
  CircleIcon: "Circle",
  Ellipsis: "DotsThree",
  Cog: "Gear",
  Pencil: "Pencil",
  File: "File",
  FileCode: "FileCode",
  FileJson: "FileJs",
  ArrowUpDown: "ArrowsDownUp",
  UserRound: "User",
};

const TABLER = {
  BarChart3: "ChartBar",
  Trash2: "Trash",
  CheckCircle2: "CircleCheck",
  HelpCircle: "CircleHelp",
  CircleHelp: "CircleHelp",
  Loader2: "Loader2",
  Settings: "Settings",
  Wand2: "Wand",
  WandSparkles: "Wand",
  ExternalLink: "ExternalLink",
  MoreHorizontal: "Dots",
  MoreVertical: "DotsVertical",
  SlidersHorizontal: "AdjustmentsHorizontal",
  GripVertical: "GripVertical",
  LogOut: "Logout",
  Undo2: "ArrowBackUp",
  Redo2: "ArrowForwardUp",
  Maximize2: "Maximize",
  Minimize2: "Minimize",
  Share2: "Share",
  Link2: "Link",
  HeartPulse: "HeartRateMonitor",
  FlaskConical: "Flask",
  Megaphone: "Speakerphone",
  ShoppingCart: "ShoppingCart",
  UserCircle: "UserCircle",
  LifeBuoy: "Lifebuoy",
  AppWindow: "AppWindow",
  CodeXml: "Code",
  Blocks: "Blocks",
  Rows3: "LayoutRows",
  Columns3: "LayoutColumns",
  LayoutGrid: "LayoutGrid",
  LayoutList: "LayoutList",
  PanelLeft: "LayoutSidebar",
  PanelRight: "LayoutSidebarRight",
  StopCircle: "PlayerStop",
  RefreshCw: "Refresh",
  RotateCcw: "Rotate",
  ChevronDownIcon: "ChevronDown",
  ChevronLeftIcon: "ChevronLeft",
  ChevronRightIcon: "ChevronRight",
  CircleIcon: "Circle",
  CaseSensitive: "LetterCase",
  CalendarClock: "CalendarTime",
  CalendarDays: "Calendar",
  CalendarRange: "CalendarStats",
  MoveUp: "ArrowUp",
  MoveDown: "ArrowDown",
  FileJson: "FileCode",
  Bot: "Robot",
  Braces: "Braces",
  Building2: "Building",
  BookOpen: "Book",
  MessageSquare: "Message",
  Pointer: "Pointer",
  Send: "Send",
  Sparkles: "Sparkles",
  TrendingUp: "TrendingUp",
  TrendingDown: "TrendingDown",
  ToggleLeft: "ToggleLeft",
  ToggleRight: "ToggleRight",
  UnfoldHorizontal: "ArrowsHorizontal",
  CornerDownLeft: "CornerDownLeft",
  ListFilter: "Filter",
  ListOrdered: "ListNumbers",
  Strikethrough: "Strikethrough",
  Type: "Typography",
  UserRound: "User",
};

const MATERIAL = {
  BarChart3: "BarChart",
  Trash2: "Delete",
  CheckCircle2: "CheckCircle",
  HelpCircle: "HelpOutlined",
  CircleHelp: "HelpOutlined",
  Loader2: "Autorenew",
  Search: "Search",
  Settings: "Settings",
  Home: "Home",
  X: "Close",
  Menu: "Menu",
  MoreHorizontal: "MoreHoriz",
  MoreVertical: "MoreVert",
  ExternalLink: "OpenInNew",
  Copy: "ContentCopy",
  Eye: "Visibility",
  EyeOff: "VisibilityOff",
  Mail: "Email",
  Calendar: "CalendarToday",
  User: "Person",
  Users: "People",
  LogOut: "Logout",
  SlidersHorizontal: "Tune",
  GripVertical: "DragIndicator",
  PanelLeft: "ViewSidebar",
  PanelRight: "ViewSidebar",
  Undo2: "Undo",
  Redo2: "Redo",
  Maximize2: "Fullscreen",
  Minimize2: "FullscreenExit",
  Share2: "Share",
  Link2: "Link",
  FileText: "Description",
  FolderOpen: "FolderOpen",
  Image: "Image",
  Video: "Videocam",
  Mic: "Mic",
  Bell: "Notifications",
  Bookmark: "Bookmark",
  Filter: "FilterList",
  SortAsc: "ArrowUpward",
  SortDesc: "ArrowDownward",
  Columns3: "ViewColumn",
  Rows3: "ViewStream",
  LayoutGrid: "GridView",
  LayoutList: "ViewList",
  Wand2: "AutoFixHigh",
  WandSparkles: "AutoAwesome",
  FlaskConical: "Science",
  Megaphone: "Campaign",
  HeartPulse: "MonitorHeart",
  ShoppingCart: "ShoppingCart",
  Database: "Storage",
  LifeBuoy: "Support",
  UserCircle: "AccountCircle",
  Contact: "Contacts",
  AppWindow: "WebAsset",
  Images: "Collections",
  Component: "Extension",
  CodeXml: "Code",
  Blocks: "Widgets",
  Bot: "SmartToy",
  Braces: "DataObject",
  CaseSensitive: "TextFields",
  CircleDot: "RadioButtonChecked",
  CircleDashed: "RadioButtonUnchecked",
  ToggleLeft: "ToggleOff",
  ToggleRight: "ToggleOn",
  ChevronDown: "KeyboardArrowDown",
  ChevronUp: "KeyboardArrowUp",
  ChevronLeft: "KeyboardArrowLeft",
  ChevronRight: "KeyboardArrowRight",
  ChevronsLeft: "FirstPage",
  ChevronsRight: "LastPage",
  ChevronsUpDown: "UnfoldMore",
  StopCircle: "StopCircle",
  RefreshCw: "Refresh",
  RotateCcw: "Replay",
  Play: "PlayArrow",
  Pause: "Pause",
  Download: "Download",
  Upload: "Upload",
  Lock: "Lock",
  Unlock: "LockOpen",
  Star: "Star",
  Flag: "Flag",
  Tag: "LocalOffer",
  Target: "TrackChanges",
  Terminal: "Terminal",
  Sparkles: "AutoAwesome",
  Shield: "Shield",
  Award: "EmojiEvents",
  Building2: "Business",
  BookOpen: "MenuBook",
  Archive: "Archive",
  Clipboard: "ContentPaste",
  Code: "Code",
  Code2: "Code",
  Monitor: "Monitor",
  Moon: "DarkMode",
  Sun: "LightMode",
  Cloud: "Cloud",
  History: "History",
  Layers: "Layers",
  Lightbulb: "Lightbulb",
  MessageSquare: "Chat",
  Pointer: "AdsClick",
  Move: "OpenWith",
  MoveUp: "ArrowUpward",
  MoveDown: "ArrowDownward",
  Table: "TableChart",
  Text: "TextFields",
  Type: "TextFields",
  Bold: "FormatBold",
  Italic: "FormatItalic",
  Underline: "FormatUnderlined",
  Strikethrough: "FormatStrikethrough",
  List: "List",
  ListFilter: "FilterList",
  ListOrdered: "FormatListNumbered",
  ThumbsUp: "ThumbUp",
  ThumbsDown: "ThumbDown",
  TrendingUp: "TrendingUp",
  TrendingDown: "TrendingDown",
  Shuffle: "Shuffle",
  Send: "Send",
  Save: "Save",
  Diff: "Difference",
  CreditCard: "CreditCard",
  CornerDownLeft: "SubdirectoryArrowLeft",
  UnfoldHorizontal: "UnfoldMore",
  Circle: "Circle",
  CircleIcon: "Circle",
  Ellipsis: "MoreHoriz",
  Cog: "Settings",
  Pencil: "Edit",
  Edit: "Edit",
  Edit2: "Edit",
  File: "InsertDriveFile",
  FileCode: "Code",
  FileJson: "DataObject",
  ArrowUpDown: "SwapVert",
  UserRound: "Person",
  CalendarCheck: "EventAvailable",
  CalendarClock: "Event",
  CalendarDays: "CalendarMonth",
  CalendarRange: "DateRange",
  AlignLeft: "FormatAlignLeft",
  AlignCenter: "FormatAlignCenter",
  AlignRight: "FormatAlignRight",
  AlignJustify: "FormatAlignJustify",
  ChevronDownIcon: "KeyboardArrowDown",
  ChevronLeftIcon: "KeyboardArrowLeft",
  ChevronRightIcon: "KeyboardArrowRight",
  Activity: "ShowChart",
  AlertCircle: "ErrorOutline",
  AlertTriangle: "WarningAmber",
  Info: "InfoOutline",
  ArrowDown: "ArrowDownward",
  ArrowUp: "ArrowUpward",
  ArrowLeft: "ArrowBack",
  ArrowRight: "ArrowForward",
  ArrowUpLeft: "NorthWest",
  ArrowUpRight: "NorthEast",
  ArrowDownRight: "SouthEast",
  Plus: "Add",
  Minus: "Remove",
  Check: "Check",
  Square: "CropSquare",
  Link: "Link",
  Eye: "Visibility",
  Search: "Search",
  Home: "Home",
};

const FA = {
  Home: "House",
  Settings: "Gear",
  Search: "MagnifyingGlass",
  Trash2: "Trash",
  BarChart3: "ChartColumn",
  CheckCircle2: "CircleCheck",
  Loader2: "Spinner",
  HelpCircle: "CircleQuestion",
  CircleHelp: "CircleQuestion",
  X: "Xmark",
  Menu: "Bars",
  MoreHorizontal: "Ellipsis",
  MoreVertical: "EllipsisVertical",
  ExternalLink: "ArrowUpRightFromSquare",
  Mail: "Envelope",
  User: "User",
  Users: "Users",
  LogOut: "RightFromBracket",
  Eye: "Eye",
  EyeOff: "EyeSlash",
  Calendar: "Calendar",
  Bell: "Bell",
  Copy: "Copy",
  Edit: "Pen",
  Edit2: "PenToSquare",
  Filter: "Filter",
  Wand2: "WandMagicSparkles",
  WandSparkles: "WandMagicSparkles",
  ShoppingCart: "CartShopping",
  Database: "Database",
  Megaphone: "Bullhorn",
  HeartPulse: "HeartPulse",
  LifeBuoy: "LifeRing",
  UserCircle: "CircleUser",
  FlaskConical: "Flask",
  Bot: "Robot",
  FileText: "FileLines",
  FolderOpen: "FolderOpen",
  Image: "Image",
  Video: "Video",
  Mic: "Microphone",
  Bookmark: "Bookmark",
  Link2: "Link",
  Share2: "ShareNodes",
  Undo2: "RotateLeft",
  Redo2: "RotateRight",
  Maximize2: "Maximize",
  Minimize2: "Minimize",
  GripVertical: "GripVertical",
  SlidersHorizontal: "Sliders",
  PanelLeft: "TableColumns",
  Columns3: "TableColumns",
  LayoutGrid: "Grip",
  LayoutList: "List",
  Circle: "Circle",
  Square: "Square",
  Minus: "Minus",
  Plus: "Plus",
  Check: "Check",
  AlertCircle: "CircleExclamation",
  AlertTriangle: "TriangleExclamation",
  Info: "CircleInfo",
  Lock: "Lock",
  Unlock: "LockOpen",
  Download: "Download",
  Upload: "Upload",
  RefreshCw: "ArrowsRotate",
  RotateCcw: "RotateLeft",
  Play: "Play",
  Pause: "Pause",
  ChevronDown: "ChevronDown",
  ChevronUp: "ChevronUp",
  ChevronLeft: "ChevronLeft",
  ChevronRight: "ChevronRight",
  ChevronsLeft: "AnglesLeft",
  ChevronsRight: "AnglesRight",
  ChevronsUpDown: "UpDown",
  Star: "Star",
  Tag: "Tag",
  Target: "Bullseye",
  Terminal: "Terminal",
  Sparkles: "WandMagicSparkles",
  Shield: "Shield",
  Award: "Award",
  Building2: "Building",
  BookOpen: "BookOpen",
  Archive: "BoxArchive",
  Clipboard: "Clipboard",
  Code: "Code",
  Code2: "Code",
  Braces: "Code",
  Component: "PuzzlePiece",
  Blocks: "Cubes",
  AppWindow: "WindowMaximize",
  Contact: "AddressBook",
  CodeXml: "Code",
  Monitor: "Desktop",
  Moon: "Moon",
  Sun: "Sun",
  Cloud: "Cloud",
  History: "ClockRotateLeft",
  Layers: "LayerGroup",
  Lightbulb: "Lightbulb",
  MessageSquare: "Comment",
  Pointer: "ArrowPointer",
  Move: "UpDownLeftRight",
  MoveUp: "ArrowUp",
  MoveDown: "ArrowDown",
  Table: "Table",
  Text: "Font",
  Type: "Font",
  Bold: "Bold",
  Italic: "Italic",
  Underline: "Underline",
  Strikethrough: "Strikethrough",
  List: "List",
  ListFilter: "Filter",
  ListOrdered: "ListOl",
  ThumbsUp: "ThumbsUp",
  ThumbsDown: "ThumbsDown",
  TrendingUp: "ArrowTrendUp",
  TrendingDown: "ArrowTrendDown",
  Shuffle: "Shuffle",
  Send: "PaperPlane",
  Save: "FloppyDisk",
  Flag: "Flag",
  Diff: "CodeCompare",
  CreditCard: "CreditCard",
  CornerDownLeft: "Reply",
  UnfoldHorizontal: "ArrowsLeftRight",
  StopCircle: "CircleStop",
  CircleDashed: "Circle",
  ToggleLeft: "ToggleOff",
  ToggleRight: "ToggleOn",
  CaseSensitive: "Font",
  CalendarCheck: "CalendarCheck",
  CalendarClock: "CalendarDays",
  CalendarDays: "CalendarDays",
  CalendarRange: "CalendarWeek",
  AlignLeft: "AlignLeft",
  AlignCenter: "AlignCenter",
  AlignRight: "AlignRight",
  AlignJustify: "AlignJustify",
  ChevronDownIcon: "ChevronDown",
  ChevronLeftIcon: "ChevronLeft",
  ChevronRightIcon: "ChevronRight",
  CircleIcon: "Circle",
  Ellipsis: "Ellipsis",
  Cog: "Gear",
  Pencil: "Pen",
  File: "File",
  FileCode: "FileCode",
  FileJson: "FileCode",
  ArrowUpDown: "ArrowsUpDown",
  UserRound: "User",
  Activity: "ChartLine",
  LineChart: "ChartLine",
  PieChart: "ChartPie",
  ArrowDown: "ArrowDown",
  ArrowUp: "ArrowUp",
  ArrowLeft: "ArrowLeft",
  ArrowRight: "ArrowRight",
  ArrowUpLeft: "ArrowUpLeft",
  ArrowUpRight: "ArrowUpRight",
  ArrowDownRight: "ArrowDownRight",
  Rows3: "Bars",
  LayoutGrid: "Grip",
  Images: "Images",
  Video: "Video",
  HeartPulse: "HeartPulse",
  Megaphone: "Bullhorn",
  Database: "Database",
  LifeBuoy: "LifeRing",
  ShoppingCart: "CartShopping",
  WandSparkles: "WandMagicSparkles",
};

import {
  HERO,
  REMIX,
  BOOTSTRAP,
  ICONOIR,
  RADIX,
  FLUENT,
  SOLAR,
} from "./icon-library-aliases.mjs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

async function loadModules() {
  const phosphor = await import("@phosphor-icons/react");
  const tabler = await import("@tabler/icons-react");
  const mui = await import("@mui/icons-material");
  const fa = await import("react-icons/fa6");
  const lucideDynamic = await import("lucide-react/dynamicIconImports.mjs");
  const heroOutline = await import("@heroicons/react/24/outline");
  const heroSolid = await import("@heroicons/react/24/solid");
  const heroMini = await import("@heroicons/react/20/solid");
  const remix = await import("@remixicon/react");
  const bootstrap = await import("react-bootstrap-icons");
  const iconoir = await import("iconoir-react");
  const radix = await import("@radix-ui/react-icons");
  const fluent = require("@fluentui/react-icons");
  const solar = require("solar-icon-set");
  return {
    phosphor,
    tabler,
    mui,
    fa,
    lucideDynamic: lucideDynamic.default,
    heroOutline,
    heroSolid,
    heroMini,
    remix,
    bootstrap,
    iconoir,
    radix,
    fluent,
    solar,
  };
}

function resolvePhosphor(phosphor, name) {
  const key = PHOSPHOR[name] ?? name.replace(/Icon$/, "");
  if (phosphor[key]) return key;
  const no2 = key.replace(/2$/, "");
  if (phosphor[no2]) return no2;
  return phosphor.Question ? "Question" : "Circle";
}

function resolveTabler(tabler, name, filled) {
  const base = TABLER[name] ?? name.replace(/Icon$/, "").replace(/2$/, "");
  const filledKey = `Icon${base}Filled`;
  const outlineKey = `Icon${base}`;
  if (filled && tabler[filledKey]) return filledKey;
  if (tabler[outlineKey]) return outlineKey;
  if (tabler.IconHelp) return filled ? "IconHelpFilled" : "IconHelp";
  return "IconQuestionMark";
}

function resolveMaterial(mui, name, variant) {
  const base = MATERIAL[name] ?? name.replace(/Icon$/, "");
  const suffixByVariant = {
    outlined: "Outlined",
    filled: "",
    rounded: "Rounded",
    sharp: "Sharp",
    twotone: "TwoTone",
  };
  const suffix = suffixByVariant[variant] ?? "Outlined";
  const candidates = suffix
    ? [`${base}${suffix}`, `${base}Outlined`, base]
    : [base, `${base}Outlined`];
  for (const key of candidates) {
    if (mui[key]) return key;
  }
  return mui.HelpOutlined ? "HelpOutlined" : "InfoOutlined";
}

function resolveFa(fa, name, variant) {
  const base = FA[name] ?? name.replace(/Icon$/, "");
  const regKey = "FaReg" + base;
  const solidKey = "Fa" + base;
  if (variant === "regular" && fa[regKey]) return regKey;
  if (fa[solidKey]) return solidKey;
  if (fa.FaRegCircleQuestion) return variant === "regular" ? "FaRegCircleQuestion" : "FaCircleQuestion";
  return "FaCircleQuestion";
}

function resolveLucide(lucideDynamic, name) {
  const kebab = lucideToKebab(name);
  if (lucideDynamic[kebab]) return kebab;
  const noIcon = lucideToKebab(name.replace(/Icon$/, ""));
  if (lucideDynamic[noIcon]) return noIcon;
  return lucideDynamic["circle-help"] ? "circle-help" : "help-circle";
}

function resolveHero(pack, name) {
  const key = HERO[name] ?? `${name.replace(/Icon$/, "")}Icon`;
  if (pack[key]) return key;
  if (pack.QuestionMarkCircleIcon) return "QuestionMarkCircleIcon";
  return "InformationCircleIcon";
}

function resolveRemix(remix, name, fill) {
  const base = REMIX[name] ?? name.replace(/Icon$/, "");
  const line = `Ri${base}Line`;
  const fillKey = `Ri${base}Fill`;
  if (fill && remix[fillKey]) return fillKey;
  if (remix[line]) return line;
  if (remix[fillKey]) return fillKey;
  return fill ? "RiQuestionFill" : "RiQuestionLine";
}

function resolveBootstrap(bi, name, fill) {
  const base = BOOTSTRAP[name] ?? name.replace(/Icon$/, "");
  const fillKey = `${base}Fill`;
  if (fill && bi[fillKey]) return fillKey;
  if (bi[base]) return base;
  if (bi[fillKey]) return fillKey;
  return bi.QuestionCircle ? "QuestionCircle" : "InfoCircle";
}

function resolveIconoir(io, name, solid) {
  const base = ICONOIR[name] ?? name.replace(/Icon$/, "");
  const solidKey = `${base}Solid`;
  if (solid && io[solidKey]) return solidKey;
  if (io[base]) return base;
  if (io[solidKey]) return solidKey;
  return io.HelpCircle ? "HelpCircle" : "InfoCircle";
}

function resolveRadix(rx, name) {
  const key = RADIX[name] ?? `${name.replace(/Icon$/, "")}Icon`;
  if (rx[key]) return key;
  return rx.QuestionMarkCircledIcon
    ? "QuestionMarkCircledIcon"
    : "InfoCircledIcon";
}

function resolveFluent(fluent, name, style) {
  const base = FLUENT[name] ?? name.replace(/Icon$/, "");
  const suffix =
    style === "filled" ? "Filled" : style === "light" ? "Light" : "Regular";
  const candidates = [
    `${base}24${suffix}`,
    `${base}20${suffix}`,
    `${base}24Regular`,
    `${base}20Regular`,
  ];
  for (const key of candidates) {
    if (fluent[key]) return key;
  }
  return fluent.QuestionCircle24Regular
    ? "QuestionCircle24Regular"
    : "Info24Regular";
}

function resolveSolar(solar, name, style) {
  const base = SOLAR[name] ?? name.replace(/Icon$/, "");
  const suffixByStyle = {
    linear: "Linear",
    outline: "Outline",
    bold: "Bold",
    broken: "Broken",
    lineduotone: "LineDuotone",
    boldduotone: "BoldDuotone",
  };
  const suffix = suffixByStyle[style] ?? "Linear";
  const candidates = [
    `${base}${suffix}`,
    `${base}Linear`,
    `${base}Outline`,
    `${base}Bold`,
  ];
  for (const key of candidates) {
    if (solar[key]) return key;
  }
  return solar.QuestionCircleLinear
    ? "QuestionCircleLinear"
    : "InfoCircleLinear";
}

function writeMaterialRegistryFile(variant, map) {
  const cap = variant.charAt(0).toUpperCase() + variant.slice(1);
  const filename = `material${cap}Registry.ts`;
  const exportName = `MATERIAL_${variant.toUpperCase()}_COMPONENTS`;
  const uniqueIcons = [...new Set(Object.values(map))].sort();
  const imports = uniqueIcons
    .map((iconName) => `import ${iconName} from "@mui/icons-material/${iconName}";`)
    .join("\n");
  const entries = Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `  ${JSON.stringify(k)}: ${v},`)
    .join("\n");
  const content = `// Auto-generated by scripts/generate-icon-registries.mjs — do not edit.
${imports}

export const ${exportName} = {
${entries}
} as const;
`;
  fs.writeFileSync(path.join(outDir, filename), content);
}

function writeMapFile(filename, exportName, map) {
  const lines = Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
  const content = `// Auto-generated by scripts/generate-icon-registries.mjs — do not edit.
export const ${exportName} = {
${lines.join("\n")}
} as const;
`;
  fs.writeFileSync(path.join(outDir, filename), content);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const mods = await loadModules();
  const {
    phosphor,
    tabler,
    mui,
    fa,
    lucideDynamic,
    heroOutline,
    remix,
    bootstrap,
    iconoir,
    radix,
    fluent,
    solar,
  } = mods;

  const phosphorMap = {};
  const tablerOutline = {};
  const tablerFilled = {};
  const materialMaps = {
    outlined: {},
    filled: {},
    rounded: {},
    sharp: {},
    twotone: {},
  };
  const faSolid = {};
  const faRegular = {};
  const lucideMap = {};
  const heroMap = {};
  const remixLine = {};
  const remixFill = {};
  const bootstrapOutline = {};
  const bootstrapFill = {};
  const iconoirRegular = {};
  const iconoirSolid = {};
  const radixMap = {};
  const fluentRegular = {};
  const fluentFilled = {};
  const fluentLight = {};
  const solarMaps = {
    linear: {},
    outline: {},
    bold: {},
    broken: {},
    lineduotone: {},
    boldduotone: {},
  };

  for (const name of names) {
    phosphorMap[name] = resolvePhosphor(phosphor, name);
    tablerOutline[name] = resolveTabler(tabler, name, false);
    tablerFilled[name] = resolveTabler(tabler, name, true);
    for (const v of Object.keys(materialMaps)) {
      materialMaps[v][name] = resolveMaterial(mui, name, v);
    }
    faSolid[name] = resolveFa(fa, name, "solid");
    faRegular[name] = resolveFa(fa, name, "regular");
    lucideMap[name] = resolveLucide(lucideDynamic, name);
    heroMap[name] = resolveHero(heroOutline, name);
    remixLine[name] = resolveRemix(remix, name, false);
    remixFill[name] = resolveRemix(remix, name, true);
    bootstrapOutline[name] = resolveBootstrap(bootstrap, name, false);
    bootstrapFill[name] = resolveBootstrap(bootstrap, name, true);
    iconoirRegular[name] = resolveIconoir(iconoir, name, false);
    iconoirSolid[name] = resolveIconoir(iconoir, name, true);
    radixMap[name] = resolveRadix(radix, name);
    fluentRegular[name] = resolveFluent(fluent, name, "regular");
    fluentFilled[name] = resolveFluent(fluent, name, "filled");
    fluentLight[name] = resolveFluent(fluent, name, "light");
    for (const v of Object.keys(solarMaps)) {
      solarMaps[v][name] = resolveSolar(solar, name, v);
    }
  }

  writeMapFile("phosphorMap.ts", "PHOSPHOR_ICON_MAP", phosphorMap);
  writeMapFile("tablerOutlineMap.ts", "TABLER_OUTLINE_MAP", tablerOutline);
  writeMapFile("tablerFilledMap.ts", "TABLER_FILLED_MAP", tablerFilled);
  writeMapFile("materialOutlinedMap.ts", "MATERIAL_OUTLINED_MAP", materialMaps.outlined);
  writeMapFile("materialFilledMap.ts", "MATERIAL_FILLED_MAP", materialMaps.filled);
  writeMapFile("materialRoundedMap.ts", "MATERIAL_ROUNDED_MAP", materialMaps.rounded);
  writeMapFile("materialSharpMap.ts", "MATERIAL_SHARP_MAP", materialMaps.sharp);
  writeMapFile("materialTwotoneMap.ts", "MATERIAL_TWOTONE_MAP", materialMaps.twotone);
  for (const [variant, map] of Object.entries(materialMaps)) {
    writeMaterialRegistryFile(variant, map);
  }
  writeMapFile("faSolidMap.ts", "FA_SOLID_MAP", faSolid);
  writeMapFile("faRegularMap.ts", "FA_REGULAR_MAP", faRegular);
  writeMapFile("lucideMap.ts", "LUCIDE_ICON_MAP", lucideMap);
  writeMapFile("heroiconsMap.ts", "HEROICONS_MAP", heroMap);
  writeMapFile("remixLineMap.ts", "REMIX_LINE_MAP", remixLine);
  writeMapFile("remixFillMap.ts", "REMIX_FILL_MAP", remixFill);
  writeMapFile("bootstrapOutlineMap.ts", "BOOTSTRAP_OUTLINE_MAP", bootstrapOutline);
  writeMapFile("bootstrapFillMap.ts", "BOOTSTRAP_FILL_MAP", bootstrapFill);
  writeMapFile("iconoirRegularMap.ts", "ICONOIR_REGULAR_MAP", iconoirRegular);
  writeMapFile("iconoirSolidMap.ts", "ICONOIR_SOLID_MAP", iconoirSolid);
  writeMapFile("radixMap.ts", "RADIX_MAP", radixMap);
  writeMapFile("fluentRegularMap.ts", "FLUENT_REGULAR_MAP", fluentRegular);
  writeMapFile("fluentFilledMap.ts", "FLUENT_FILLED_MAP", fluentFilled);
  writeMapFile("fluentLightMap.ts", "FLUENT_LIGHT_MAP", fluentLight);
  writeMapFile("solarLinearMap.ts", "SOLAR_LINEAR_MAP", solarMaps.linear);
  writeMapFile("solarOutlineMap.ts", "SOLAR_OUTLINE_MAP", solarMaps.outline);
  writeMapFile("solarBoldMap.ts", "SOLAR_BOLD_MAP", solarMaps.bold);
  writeMapFile("solarBrokenMap.ts", "SOLAR_BROKEN_MAP", solarMaps.broken);
  writeMapFile("solarLineduotoneMap.ts", "SOLAR_LINEDUOTONE_MAP", solarMaps.lineduotone);
  writeMapFile("solarBoldduotoneMap.ts", "SOLAR_BOLDDUOTONE_MAP", solarMaps.boldduotone);

  console.log(`Generated maps for ${names.length} icons in ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
