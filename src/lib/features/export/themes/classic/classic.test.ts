import { describe, expect, it } from 'vitest';
import { classicTheme } from './classic';
import {
	emptyBasics,
	emptyContent,
	makeEducation,
	makeProject,
	makeSkill,
	makeWork,
	str
} from '$lib/features/tailoring/_fixtures';

const blank = () =>
	emptyContent({ basics: emptyBasics({ fullName: '', position: '', location: '' }) });

describe('classicTheme.build', () => {
	it('returns A4 page size with correct margins', () => {
		const doc = classicTheme.build(emptyContent());
		expect(doc.pageSize).toBe('A4');
		expect(doc.pageMargins).toEqual([42.5, 56.7, 42.5, 56.7]);
	});

	it('uses Roboto as the default font', () => {
		expect(classicTheme.build(emptyContent()).defaultStyle!.font).toBe('Roboto');
	});

	it('produces non-empty content for a full CV', () => {
		const content = emptyContent({
			basics: emptyBasics({ highlights: [str('Led a team')] }),
			skills: [makeSkill('Frontend', ['React'])],
			work: [makeWork('Acme', 'Engineer', { highlights: [str('Shipped features')] })],
			projects: [makeProject('MyApp', { description: 'Cool app', url: 'https://github.com/u/a' })],
			education: [makeEducation('University', { studyType: 'BSc', area: 'CS' })]
		});
		const doc = classicTheme.build(content);
		expect(Array.isArray(doc.content)).toBe(true);
		expect((doc.content as unknown[]).length).toBeGreaterThan(0);
	});

	it('produces an empty content array for blank content', () => {
		expect(classicTheme.build(blank()).content).toEqual([]);
	});

	it('includes section headings for present sections', () => {
		const content = emptyContent({ work: [makeWork('Acme', 'Dev')] });
		expect(JSON.stringify(classicTheme.build(content).content)).toContain('EXPERIENCE');
	});

	it('formats skill categories, with no colon for an unnamed category', () => {
		const content = emptyContent({
			skills: [makeSkill('Backend', ['Go', 'Postgres']), makeSkill('', ['Docker'])]
		});
		const str = JSON.stringify(classicTheme.build(content).content);
		expect(str).toContain('Backend: Go, Postgres');
		expect(str).toContain('Docker');
		expect(str).not.toContain(': Docker');
	});

	it('joins studyType and area for education', () => {
		const content = emptyContent({
			education: [makeEducation('Uni', { studyType: 'BSc', area: 'CS' })]
		});
		expect(JSON.stringify(classicTheme.build(content).content)).toContain('BSc CS');
	});

	it('uses Present for a current job', () => {
		const content = emptyContent({
			work: [makeWork('Startup', 'Lead', { startDate: new Date('2022-06-01'), current: true })]
		});
		expect(JSON.stringify(classicTheme.build(content).content)).toContain('Present');
	});

	it('does not say Present for a non-current job with no end date', () => {
		const content = emptyContent({
			work: [makeWork('Past Co', 'Eng', { startDate: new Date('2022-06-01'), current: false })]
		});
		expect(JSON.stringify(classicTheme.build(content).content)).not.toContain('Present');
	});

	it('trims project URLs', () => {
		const content = emptyContent({
			projects: [makeProject('Repo', { url: 'https://github.com/user/repo' })]
		});
		expect(JSON.stringify(classicTheme.build(content).content)).toContain('github.com/user/repo');
	});

	it('applies pageBreak avoid to the first job container', () => {
		const content = emptyContent({ work: [makeWork('Co', 'Dev')] });
		const hasAvoid = (classicTheme.build(content).content as unknown[]).some(
			(item) => (item as { pageBreak?: string }).pageBreak === 'avoid'
		);
		expect(hasAvoid).toBe(true);
	});
});
