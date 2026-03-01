import { GoalCategory } from '../types/goal';

export interface CategoryInfo {
  id: GoalCategory;
  nameKey: string;
  iconName: string;
  color: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'work',
    nameKey: 'common.categories.work',
    iconName: 'briefcase',
    color: '#3B82F6', // Blue
  },
  {
    id: 'health',
    nameKey: 'common.categories.health',
    iconName: 'heart',
    color: '#EF4444', // Red
  },
  {
    id: 'personal',
    nameKey: 'common.categories.personal',
    iconName: 'user',
    color: '#A855F7', // Purple
  },
  {
    id: 'finance',
    nameKey: 'common.categories.finance',
    iconName: 'dollar-sign',
    color: '#F59E0B', // Amber
  },
  {
    id: 'other',
    nameKey: 'common.categories.other',
    iconName: 'tag',
    color: '#6B7280', // Gray
  },
];

export const getCategoryById = (id: GoalCategory): CategoryInfo => {
  return CATEGORIES.find((cat) => cat.id === id) || CATEGORIES[CATEGORIES.length - 1];
};
