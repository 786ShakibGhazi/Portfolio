import type { PortfolioContent } from '@/types/content';

export interface NavItem {
  id: string;
  label: string;
}

/** Only sections that have content appear in navigation. */
export function buildNav(content: PortfolioContent): NavItem[] {
  const items: NavItem[] = [{ id: 'about', label: 'About' }];
  if (content.skill_categories.length) items.push({ id: 'skills', label: 'Skills' });
  if (content.experiences.length) items.push({ id: 'experience', label: 'Experience' });
  if (content.projects.length) items.push({ id: 'projects', label: 'Projects' });
  if (content.education.length || content.certifications.length) items.push({ id: 'education', label: 'Education' });
  if (content.achievements.length) items.push({ id: 'achievements', label: 'Achievements' });
  items.push({ id: 'contact', label: 'Contact' });
  return items;
}
