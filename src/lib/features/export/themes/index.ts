import { classicTheme } from './classic/classic';
import type { ThemeModule } from '../types';

export const themes: Record<string, ThemeModule> = {
	classic: classicTheme
};

export const DEFAULT_THEME_KEY = 'classic';
