/*
  Icon-Register des Themes. Icons kommen aus dem Lucide-Set — dasselbe,
  das auch die Folien des Design-Systems verwenden. Sie werden statisch
  importiert, damit nur die tatsächlich gebrauchten im Bundle landen;
  ein neues Icon also hier eintragen und dann per Name verwenden:
    <Card icon="layers" …>
*/
import type { Component } from 'vue'

import Lightbulb from '~icons/lucide/lightbulb'
import Quote from '~icons/lucide/quote'
import CircleHelp from '~icons/lucide/circle-help'
import GraduationCap from '~icons/lucide/graduation-cap'
import BookOpen from '~icons/lucide/book-open'
import Layers from '~icons/lucide/layers'
import Cpu from '~icons/lucide/cpu'
import AppWindow from '~icons/lucide/app-window'
import Database from '~icons/lucide/database'
import Sigma from '~icons/lucide/sigma'
import Clock from '~icons/lucide/clock'
import Network from '~icons/lucide/network'
import Puzzle from '~icons/lucide/puzzle'
import Package from '~icons/lucide/package'
import Boxes from '~icons/lucide/boxes'
import Box from '~icons/lucide/box'
import Hourglass from '~icons/lucide/hourglass'
import Wrench from '~icons/lucide/wrench'
import Ruler from '~icons/lucide/ruler'
import TrendingUp from '~icons/lucide/trending-up'
import ShieldCheck from '~icons/lucide/shield-check'
import Users from '~icons/lucide/users'
import Building2 from '~icons/lucide/building-2'
import Briefcase from '~icons/lucide/briefcase'
import Archive from '~icons/lucide/archive'
import Globe from '~icons/lucide/globe'
import Code from '~icons/lucide/code'
import Check from '~icons/lucide/check'
import X from '~icons/lucide/x'
import Info from '~icons/lucide/info'
import TriangleAlert from '~icons/lucide/triangle-alert'
import History from '~icons/lucide/history'
import Factory from '~icons/lucide/factory'
import MessageSquare from '~icons/lucide/message-square'
import Sparkles from '~icons/lucide/sparkles'
import Bot from '~icons/lucide/bot'
import Target from '~icons/lucide/target'
import GitBranch from '~icons/lucide/git-branch'
import Calendar from '~icons/lucide/calendar'
import FileText from '~icons/lucide/file-text'
import Library from '~icons/lucide/library'
import Hand from '~icons/lucide/hand'
import Repeat from '~icons/lucide/repeat'
import Scale from '~icons/lucide/scale'
import Gauge from '~icons/lucide/gauge'
import Replace from '~icons/lucide/replace'
import Timer from '~icons/lucide/timer'
import Server from '~icons/lucide/server'
import PencilRuler from '~icons/lucide/pencil-ruler'
import Play from '~icons/lucide/play'
import Pause from '~icons/lucide/pause'
import Binary from '~icons/lucide/binary'
import Calculator from '~icons/lucide/calculator'
import Workflow from '~icons/lucide/workflow'
import Landmark from '~icons/lucide/landmark'
import Handshake from '~icons/lucide/handshake'
import Plane from '~icons/lucide/plane'
import Cog from '~icons/lucide/cog'
import FolderTree from '~icons/lucide/folder-tree'
import FlaskConical from '~icons/lucide/flask-conical'
import BookMarked from '~icons/lucide/book-marked'
import ListChecks from '~icons/lucide/list-checks'
import BadgeEuro from '~icons/lucide/badge-euro'
import Compass from '~icons/lucide/compass'
import Milestone from '~icons/lucide/milestone'
import Blocks from '~icons/lucide/blocks'
import ChartLine from '~icons/lucide/chart-line'
import Monitor from '~icons/lucide/monitor'
import LayoutGrid from '~icons/lucide/layout-grid'
import Gem from '~icons/lucide/gem'
import UserRound from '~icons/lucide/user-round'
import Smile from '~icons/lucide/smile'
import ListOrdered from '~icons/lucide/list-ordered'
import ArrowRight from '~icons/lucide/arrow-right'
import ArrowLeft from '~icons/lucide/arrow-left'
import Bug from '~icons/lucide/bug'
import Search from '~icons/lucide/search'
import Map from '~icons/lucide/map'
import Printer from '~icons/lucide/printer'
import ThumbsUp from '~icons/lucide/thumbs-up'
import ThumbsDown from '~icons/lucide/thumbs-down'
import MousePointerClick from '~icons/lucide/mouse-pointer-click'
import Link from '~icons/lucide/link'
import BookA from '~icons/lucide/book-a'
import Lock from '~icons/lucide/lock'
import Eye from '~icons/lucide/eye'
import EyeOff from '~icons/lucide/eye-off'
import Unlink from '~icons/lucide/unlink'
import Split from '~icons/lucide/split'
import Equal from '~icons/lucide/equal'
import Copy from '~icons/lucide/copy'
import RefreshCwOff from '~icons/lucide/refresh-cw-off'
import Hammer from '~icons/lucide/hammer'
import HardDrive from '~icons/lucide/hard-drive'
import Activity from '~icons/lucide/activity'
import Cable from '~icons/lucide/cable'
import Download from '~icons/lucide/download'
import CopyPlus from '~icons/lucide/copy-plus'
import Power from '~icons/lucide/power'
import LifeBuoy from '~icons/lucide/life-buoy'
import DatabaseBackup from '~icons/lucide/database-backup'
import Languages from '~icons/lucide/languages'
import Waypoints from '~icons/lucide/waypoints'
import ComponentIcon from '~icons/lucide/component'
import ArrowDown from '~icons/lucide/arrow-down'
import ArrowDownRight from '~icons/lucide/arrow-down-right'
import Route from '~icons/lucide/route'
import Shapes from '~icons/lucide/shapes'
import FileCode from '~icons/lucide/file-code'
import Recycle from '~icons/lucide/recycle'
import Award from '~icons/lucide/award'
import Toolbox from '~icons/lucide/toolbox'
import Pointer from '~icons/lucide/pointer'
import Bird from '~icons/lucide/bird'
import Frown from '~icons/lucide/frown'
import Braces from '~icons/lucide/braces'
import Stamp from '~icons/lucide/stamp'
import Terminal from '~icons/lucide/terminal'
import KeyRound from '~icons/lucide/key-round'
import GitMerge from '~icons/lucide/git-merge'
import GitCommitHorizontal from '~icons/lucide/git-commit-horizontal'
import RotateCcw from '~icons/lucide/rotate-ccw'
import CloudUpload from '~icons/lucide/cloud-upload'
import Folder from '~icons/lucide/folder'
import FileIcon from '~icons/lucide/file'
import Laptop from '~icons/lucide/laptop'
import Rocket from '~icons/lucide/rocket'
import ClipboardCheck from '~icons/lucide/clipboard-check'
import RefreshCw from '~icons/lucide/refresh-cw'
import ClipboardList from '~icons/lucide/clipboard-list'
import Zap from '~icons/lucide/zap'
import Construction from '~icons/lucide/construction'
import ScrollText from '~icons/lucide/scroll-text'
import LockKeyhole from '~icons/lucide/lock-keyhole'
import Signpost from '~icons/lucide/signpost'
import Tags from '~icons/lucide/tags'
import CornerUpLeft from '~icons/lucide/corner-up-left'

export const icons: Record<string, Component> = {
  'lightbulb': Lightbulb,
  'quote': Quote,
  'circle-help': CircleHelp,
  'graduation-cap': GraduationCap,
  'book-open': BookOpen,
  'layers': Layers,
  'cpu': Cpu,
  'app-window': AppWindow,
  'database': Database,
  'sigma': Sigma,
  'clock': Clock,
  'network': Network,
  'puzzle': Puzzle,
  'package': Package,
  'boxes': Boxes,
  'box': Box,
  'hourglass': Hourglass,
  'wrench': Wrench,
  'ruler': Ruler,
  'trending-up': TrendingUp,
  'shield-check': ShieldCheck,
  'users': Users,
  'building-2': Building2,
  'briefcase': Briefcase,
  'archive': Archive,
  'globe': Globe,
  'code': Code,
  'check': Check,
  'x': X,
  'info': Info,
  'triangle-alert': TriangleAlert,
  'history': History,
  'factory': Factory,
  'message-square': MessageSquare,
  'sparkles': Sparkles,
  'bot': Bot,
  'target': Target,
  'git-branch': GitBranch,
  'calendar': Calendar,
  'file-text': FileText,
  'library': Library,
  'hand': Hand,
  'repeat': Repeat,
  'scale': Scale,
  'gauge': Gauge,
  'replace': Replace,
  'timer': Timer,
  'server': Server,
  'pencil-ruler': PencilRuler,
  'play': Play,
  'pause': Pause,
  'binary': Binary,
  'calculator': Calculator,
  'workflow': Workflow,
  'landmark': Landmark,
  'handshake': Handshake,
  'plane': Plane,
  'cog': Cog,
  'folder-tree': FolderTree,
  'flask-conical': FlaskConical,
  'book-marked': BookMarked,
  'list-checks': ListChecks,
  'badge-euro': BadgeEuro,
  'compass': Compass,
  'milestone': Milestone,
  'blocks': Blocks,
  'chart-line': ChartLine,
  'monitor': Monitor,
  'layout-grid': LayoutGrid,
  'gem': Gem,
  'user-round': UserRound,
  'smile': Smile,
  'list-ordered': ListOrdered,
  'arrow-right': ArrowRight,
  'arrow-left': ArrowLeft,
  'bug': Bug,
  'search': Search,
  'map': Map,
  'printer': Printer,
  'thumbs-up': ThumbsUp,
  'thumbs-down': ThumbsDown,
  'mouse-pointer-click': MousePointerClick,
  'link': Link,
  'book-a': BookA,
  'lock': Lock,
  'eye': Eye,
  'eye-off': EyeOff,
  'unlink': Unlink,
  'split': Split,
  'equal': Equal,
  'copy': Copy,
  'refresh-cw-off': RefreshCwOff,
  'hammer': Hammer,
  'hard-drive': HardDrive,
  'activity': Activity,
  'cable': Cable,
  'download': Download,
  'copy-plus': CopyPlus,
  'power': Power,
  'life-buoy': LifeBuoy,
  'database-backup': DatabaseBackup,
  'languages': Languages,
  'waypoints': Waypoints,
  'component': ComponentIcon,
  'arrow-down': ArrowDown,
  'arrow-down-right': ArrowDownRight,
  'route': Route,
  'shapes': Shapes,
  'file-code': FileCode,
  'recycle': Recycle,
  'award': Award,
  'toolbox': Toolbox,
  'pointer': Pointer,
  'bird': Bird,
  'frown': Frown,
  'braces': Braces,
  'stamp': Stamp,
  'terminal': Terminal,
  'key-round': KeyRound,
  'git-merge': GitMerge,
  'git-commit-horizontal': GitCommitHorizontal,
  'rotate-ccw': RotateCcw,
  'cloud-upload': CloudUpload,
  'folder': Folder,
  'file': FileIcon,
  'laptop': Laptop,
  'rocket': Rocket,
  'clipboard-check': ClipboardCheck,
  'refresh-cw': RefreshCw,
  'clipboard-list': ClipboardList,
  'zap': Zap,
  'construction': Construction,
  'scroll-text': ScrollText,
  'lock-keyhole': LockKeyhole,
  'signpost': Signpost,
  'tags': Tags,
  'corner-up-left': CornerUpLeft,
}
