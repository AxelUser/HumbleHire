import { computeHashes } from '$lib/features/tailoring/hash';
import { createCV } from '$lib/services/cv/create';
import { createObjectId, type CV, type StringEntry } from '$lib/types/cv';

function strs(...values: string[]): StringEntry[] {
	return values.map((value) => ({ objectId: createObjectId(), value }));
}

export function createDummyCV(): CV {
	const cv = createCV({ name: 'Dummy — Dwight Schrute' });
	const c = cv.content;

	c.basics.fullName = 'Dwight K. Schrute';
	c.basics.position = 'Assistant Regional Manager';
	c.basics.location = 'Scranton, Pennsylvania';
	c.basics.email = 'dwight@dundermifflin.com';
	c.basics.phone = '+1 570 555 0198';
	c.basics.url = 'schrutefarms.biz';
	c.basics.profiles = [
		{ objectId: createObjectId(), network: 'LinkedIn', url: 'linkedin.com/in/dwightschrute' }
	];

	c.basics.highlights = strs(
		'Top-performing Dunder Mifflin salesman for six consecutive quarters.',
		'Owner and proprietor of Schrute Farms, a working beet farm and bed & breakfast.',
		"Volunteer sheriff's deputy with advanced training in hand-to-hand combat and surveillance.",
		'Holds a black belt in Goju-Ryu karate and a brown belt in Judo.'
	);

	c.skills = [
		{
			objectId: createObjectId(),
			name: 'Sales',
			keywords: strs('Paper Sales', 'Cold Calling', 'Account Management', 'Client Retention')
		},
		{
			objectId: createObjectId(),
			name: 'Agriculture',
			keywords: strs('Beet Farming', 'Agritourism', 'Animal Husbandry', 'Beekeeping')
		},
		{
			objectId: createObjectId(),
			name: 'Security',
			keywords: strs('Surveillance', 'Brazilian Jiu-Jitsu', 'Nunchucks', 'Volunteer Deputy Work')
		}
	];

	c.work = [
		{
			objectId: createObjectId(),
			name: 'Dunder Mifflin Paper Company',
			position: 'Assistant Regional Manager',
			startDate: new Date('2004-03-24'),
			endDate: undefined,
			current: true,
			highlights: strs(
				'Consistently led the Scranton branch in paper and office supply sales.',
				'Managed the safety committee, reducing workplace incidents by 40%.',
				'Instituted a branch-wide volunteer militia programme, improving morale by 73%.',
				'Served as Acting Regional Manager during three separate managerial vacancies.'
			),
			keywords: strs('Paper Sales', 'Team Leadership', 'Safety Compliance')
		},
		{
			objectId: createObjectId(),
			name: 'Schrute Farms',
			position: 'Owner & Proprietor',
			startDate: new Date('1998-05-01'),
			endDate: undefined,
			current: true,
			highlights: strs(
				'Operates a 60-acre beet farm producing award-winning varieties of red and golden beets.',
				'Converted the farmhouse into a bed & breakfast with five themed guest rooms.',
				"Featured in TripAdvisor's top 10 most haunted B&Bs in Pennsylvania."
			),
			keywords: strs('Farming', 'Hospitality', 'Business Operations')
		},
		{
			objectId: createObjectId(),
			name: "Lackawanna County Sheriff's Department",
			position: 'Volunteer Deputy',
			startDate: new Date('2003-01-01'),
			endDate: undefined,
			current: true,
			highlights: strs(
				'Assisted with crowd control at three consecutive Steamtown Marathon events.',
				'Trained in prisoner transport, evidence handling, and report writing.'
			),
			keywords: strs('Law Enforcement', 'Crowd Control')
		}
	];

	c.projects = [
		{
			objectId: createObjectId(),
			name: 'Schrute Farms B&B',
			description:
				'An agritourism bed & breakfast with five themed rooms, farm tours, and seasonal beet harvest experiences.',
			current: false,
			highlights: [],
			keywords: strs('Hospitality', 'Agritourism', 'Marketing'),
			roles: [],
			url: 'schrutefarms.biz'
		},
		{
			objectId: createObjectId(),
			name: 'Recyclops',
			description:
				'A grassroots office recycling programme that evolved into a full workplace environmental enforcement role.',
			current: false,
			highlights: [],
			keywords: strs('Sustainability', 'Waste Management', 'Community Outreach'),
			roles: [],
			url: ''
		}
	];

	c.education = [
		{
			objectId: createObjectId(),
			institution: 'Penn State University',
			studyType: 'B.A.',
			area: 'Business Administration',
			startDate: new Date('1992-09-01'),
			endDate: new Date('1996-05-15'),
			current: false,
			courses: []
		},
		{
			objectId: createObjectId(),
			institution: 'Lackawanna County Community College',
			studyType: 'Certificate',
			area: 'Criminal Justice',
			startDate: new Date('2001-01-15'),
			endDate: new Date('2002-12-20'),
			current: false,
			courses: []
		}
	];

	cv.hashes = computeHashes(cv.content);
	return cv;
}
