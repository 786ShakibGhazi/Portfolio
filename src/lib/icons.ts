import {
  Award,
  Braces,
  Cloud,
  Code,
  Cpu,
  Database,
  Github,
  Globe,
  Hexagon,
  Instagram,
  Layers,
  LayoutTemplate,
  Link as LinkIcon,
  Linkedin,
  Server,
  Terminal,
  Trophy,
  Twitter,
  Workflow,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { SocialPlatform } from '@/types/content';

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  code: Code,
  layout: LayoutTemplate,
  server: Server,
  database: Database,
  workflow: Workflow,
  wrench: Wrench,
  cloud: Cloud,
  cpu: Cpu,
  globe: Globe,
  layers: Layers,
  terminal: Terminal,
};

export const SOCIAL_ICONS: Record<SocialPlatform, LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  geeksforgeeks: Code,
  leetcode: Braces,
  hackerrank: Hexagon,
  twitter: Twitter,
  instagram: Instagram,
  website: Globe,
  other: LinkIcon,
};

export const SOCIAL_OPTIONS: { value: SocialPlatform; label: string }[] = [
  { value: 'github', label: 'GitHub' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'geeksforgeeks', label: 'GeeksforGeeks' },
  { value: 'leetcode', label: 'LeetCode' },
  { value: 'hackerrank', label: 'HackerRank' },
  { value: 'twitter', label: 'X / Twitter' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'website', label: 'Website' },
  { value: 'other', label: 'Other' },
];

export function categoryIcon(key: string): LucideIcon {
  return CATEGORY_ICONS[key] ?? Code;
}

export function achievementIcon(platform: string | null): LucideIcon {
  switch ((platform ?? '').toLowerCase()) {
    case 'leetcode':
      return Braces;
    case 'geeksforgeeks':
      return Code;
    case 'hackerrank':
      return Hexagon;
    case 'newgen':
      return Trophy;
    default:
      return Award;
  }
}
