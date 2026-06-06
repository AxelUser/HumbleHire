import { describe, expect, it } from 'vitest';
import { describeDiff, formatPeriod, formatValue } from './present';
import { diffCVs } from './diff';
import { makeMaster, makeTailored, makeWork, str } from './_fixtures';

describe('formatValue', () => {
	it('renders a Date as month and year', () => {
		expect(formatValue(new Date(2021, 0, 15))).toBe('Jan 2021');
	});
	it('renders empty values as a placeholder', () => {
		expect(formatValue('')).toBe('(empty)');
		expect(formatValue(undefined)).toBe('(empty)');
	});
	it('renders a plain string unchanged', () => {
		expect(formatValue('Senior Engineer')).toBe('Senior Engineer');
	});
});

describe('formatPeriod', () => {
	it('returns undefined when both dates are missing and not current', () => {
		expect(formatPeriod(undefined, undefined)).toBeUndefined();
	});
	it('uses "Present" when current is true', () => {
		expect(formatPeriod(new Date(2021, 0, 1), undefined, true)).toBe('Jan 2021 – Present');
	});
	it('renders a full range', () => {
		expect(formatPeriod(new Date(2021, 0, 1), new Date(2023, 5, 1))).toBe('Jan 2021 – Jun 2023');
	});
});

describe('describeDiff', () => {
	it('describes a modified basics scalar with a descriptor breadcrumb', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		master.content.basics.fullName = 'Jane Smith';
		const item = diffCVs(master, tailored)[0];
		const meta = describeDiff(item, master, tailored);
		expect(meta.breadcrumb).toEqual(['Basics', 'Full Name']);
		expect(meta.description).toBe('Changed Full Name');
		expect(meta.change).toBe('modified');
	});

	it('describes a modified field inside a list entry, titling the entry by its value label', () => {
		const job = makeWork('Acme', 'Eng');
		const master = makeMaster({ work: [job] });
		const tailored = makeTailored(master);
		master.content.work[0].position = 'Lead';
		const item = diffCVs(master, tailored)[0];
		const meta = describeDiff(item, master, tailored);
		expect(meta.breadcrumb).toEqual(['Work', 'Acme', 'Position']);
		expect(meta.description).toBe('Changed Position');
	});

	it('describes an added entry using the list item label and the master entry title', () => {
		const master = makeMaster();
		const tailored = makeTailored(master);
		master.content.work.push(makeWork('Acme', 'Eng'));
		const item = diffCVs(master, tailored)[0];
		const meta = describeDiff(item, master, tailored);
		expect(meta.breadcrumb).toEqual(['Work', 'Acme']);
		expect(meta.description).toBe('Added Job');
	});

	it('describes a removed entry using the tailored entry title', () => {
		const job = makeWork('Acme', 'Eng');
		const master = makeMaster({ work: [job] });
		const tailored = makeTailored(master);
		master.content.work = [];
		const item = diffCVs(master, tailored)[0];
		const meta = describeDiff(item, master, tailored);
		expect(meta.breadcrumb).toEqual(['Work', 'Acme']);
		expect(meta.description).toBe('Removed Job');
	});

	it('describes a nested added string entry down to its value', () => {
		const job = makeWork('Acme', 'Eng');
		const master = makeMaster({ work: [job] });
		const tailored = makeTailored(master);
		master.content.work[0].highlights.push(str('Shipped it'));
		const item = diffCVs(master, tailored)[0];
		const meta = describeDiff(item, master, tailored);
		expect(meta.breadcrumb).toEqual(['Work', 'Acme', 'Highlights', 'Shipped it']);
		expect(meta.description).toBe('Added Highlight');
	});

	it('falls back to the first non-empty scalar when the value label is empty', () => {
		const job = makeWork('', 'Engineer'); // name (itemValueLabel) is empty
		const master = makeMaster({ work: [job] });
		const tailored = makeTailored(master);
		master.content.work[0].location = 'Berlin';
		const item = diffCVs(master, tailored)[0];
		const meta = describeDiff(item, master, tailored);
		expect(meta.breadcrumb[1]).toBe('Engineer');
	});
});
