import { describe, expect, it } from 'vitest';
import { preprocessContent } from './preprocess';
import { makeMaster, makeSkill, makeWork, str } from '$lib/features/tailoring/_fixtures';

describe('preprocessContent', () => {
	it('keeps visible content intact', () => {
		const cv = makeMaster({
			work: [makeWork('Acme', 'Eng')],
			skills: [makeSkill('FE', ['React'])]
		});
		const out = preprocessContent(cv);
		expect(out.basics.fullName).toBe('John Doe');
		expect(out.work).toHaveLength(1);
		expect(out.skills).toHaveLength(1);
	});

	it('blanks hidden basics fields', () => {
		const cv = makeMaster({}, { hidden: ['basics/fullName/', 'basics/location/'] });
		const out = preprocessContent(cv);
		expect(out.basics.fullName).toBe('');
		expect(out.basics.location).toBe('');
		expect(out.basics.position).toBe('Engineer');
	});

	it('clears the whole contacts group when hidden', () => {
		const cv = makeMaster({}, { hidden: ['basics/contacts/'] });
		cv.content.basics.email = 'x@y.z';
		cv.content.basics.phone = '123';
		cv.content.basics.profiles = [{ objectId: 'p' as never, network: 'GH', url: 'gh.com' }];
		const out = preprocessContent(cv);
		expect(out.basics.email).toBe('');
		expect(out.basics.phone).toBe('');
		expect(out.basics.profiles).toEqual([]);
	});

	it('empties hidden list sections but leaves others', () => {
		const cv = makeMaster(
			{ work: [makeWork('Acme', 'Eng')], skills: [makeSkill('FE', ['React'])] },
			{ hidden: ['work/'] }
		);
		const out = preprocessContent(cv);
		expect(out.work).toEqual([]);
		expect(out.skills).toHaveLength(1);
	});

	it('hides highlights by clearing the list', () => {
		const cv = makeMaster({}, { hidden: ['basics/highlights/'] });
		cv.content.basics.highlights = [str('h')];
		expect(preprocessContent(cv).basics.highlights).toEqual([]);
	});

	it('does not mutate the source CV', () => {
		const cv = makeMaster({ work: [makeWork('Acme', 'Eng')] }, { hidden: ['work/'] });
		preprocessContent(cv);
		expect(cv.content.work).toHaveLength(1);
	});
});
