export type SocialPlatform =
  | 'github'
  | 'linkedin'
  | 'geeksforgeeks'
  | 'leetcode'
  | 'hackerrank'
  | 'twitter'
  | 'instagram'
  | 'website'
  | 'other';

export interface StatItem {
  value: string;
  label: string;
}

export interface FocusArea {
  title: string;
  description: string;
}

export interface Profile {
  full_name: string;
  title: string;
  headline: string;
  intro: string;
  bio: string;
  roles: string[];
  stats: StatItem[];
  focus_areas: FocusArea[];
  email: string | null;
  phone: string | null;
  location: string | null;
  resume_path: string | null;
  avatar_path: string | null;
}

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  label: string;
  url: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  icon: string;
  skills: Skill[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  summary: string | null;
  highlights: string[];
  tech: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  period: string | null;
  tech: string[];
  image_path: string | null;
  live_url: string | null;
  repo_url: string | null;
  is_featured: boolean;
}

export interface Education {
  id: string;
  institution: string;
  qualification: string;
  period: string | null;
  grade_label: string | null;
  grade_value: string | null;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  issued_on: string | null;
  credential_url: string | null;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  metric: string | null;
  platform: string | null;
  url: string | null;
}

/** Shape of the published snapshot (and of the admin draft preview). */
export interface PortfolioContent {
  profile: Profile;
  social_links: SocialLink[];
  skill_categories: SkillCategory[];
  experiences: Experience[];
  projects: Project[];
  education: Education[];
  certifications: Certification[];
  achievements: Achievement[];
}

/** Generic database row used by the admin CRUD screens. */
export interface Row {
  id: string;
  sort_order?: number;
  [key: string]: unknown;
}
