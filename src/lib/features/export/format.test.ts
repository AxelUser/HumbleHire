import { describe, expect, it } from 'vitest';
import { formatDateRange, trimUrl, formatSkillCategory } from './format';

describe('formatDateRange', () => {
	it('formats a full date range', () => {
		const result = formatDateRange(new Date('2020-01-01'), new Date('2023-06-01'));
		expect(result).toMatch(/Jan 2020/);
		expect(result).toMatch(/Jun 2023/);
		expect(result).toContain(' – ');
	});

	it('uses Present when end date is missing', () => {
		const result = formatDateRange(new Date('2022-03-01'), undefined);
		expect(result).toMatch(/Mar 2022/);
		expect(result).toContain('Present');
	});

	it('returns undefined when start date is missing', () => {
		expect(formatDateRange(undefined, new Date('2023-01-01'))).toBeUndefined();
	});

	it('returns undefined when both dates are missing', () => {
		expect(formatDateRange(undefined, undefined)).toBeUndefined();
	});
});

describe('trimUrl', () => {
	it('removes https protocol', () => {
		expect(trimUrl('https://github.com/user/repo')).toBe('github.com/user/repo');
	});

	it('removes www prefix', () => {
		expect(trimUrl('https://www.example.com/path')).toBe('example.com/path');
	});

	it('removes trailing slash on root', () => {
		expect(trimUrl('https://github.com/')).toBe('github.com');
	});

	it('keeps path without trailing slash', () => {
		expect(trimUrl('https://github.com/user/repo/')).toBe('github.com/user/repo');
	});

	it('returns the original string for invalid URLs', () => {
		expect(trimUrl('not-a-url')).toBe('not-a-url');
	});

	it('handles empty string', () => {
		expect(trimUrl('')).toBe('');
	});
});

describe('formatSkillCategory', () => {
	it('prepends category name when non-empty', () => {
		expect(formatSkillCategory('Frontend', ['React', 'TypeScript'])).toBe(
			'Frontend: React, TypeScript'
		);
	});

	it('renders flat list when name is empty', () => {
		expect(formatSkillCategory('', ['React', 'TypeScript'])).toBe('React, TypeScript');
	});

	it('renders flat list when name is whitespace', () => {
		expect(formatSkillCategory('  ', ['Svelte'])).toBe('Svelte');
	});

	it('handles a single skill', () => {
		expect(formatSkillCategory('Backend', ['Go'])).toBe('Backend: Go');
	});
});
