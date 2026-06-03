import { computeBlockHashes } from '$lib/features/tailoring/hash';
import { createCV } from '$lib/services/cv/create';
import { createObjectId, type CV, type Tag } from '$lib/types/cv';

function tags(...values: string[]): Tag[] {
	return values.map((value) => ({ objectId: createObjectId(), value }));
}

export function createDummyCV(): CV {
	const cv = createCV({ name: 'Dummy — Dwight Schrute' });

	cv.blocks.fullName.value = 'Dwight K. Schrute';
	cv.blocks.position.value = 'Assistant Regional Manager';
	cv.blocks.location.value = 'Scranton, Pennsylvania';

	cv.blocks.contacts.value = [
		{ objectId: createObjectId(), label: 'Email', value: 'dwight@dundermifflin.com' },
		{ objectId: createObjectId(), label: 'Phone', value: '+1 570 555 0198' },
		{ objectId: createObjectId(), label: 'Website', value: 'schrutefarms.biz' },
		{ objectId: createObjectId(), label: 'LinkedIn', value: 'linkedin.com/in/dwightschrute' }
	];

	cv.blocks.highlights.value = [
		{
			objectId: createObjectId(),
			text: 'Top-performing Dunder Mifflin salesman for six consecutive quarters.'
		},
		{
			objectId: createObjectId(),
			text: 'Owner and proprietor of Schrute Farms, a working beet farm and bed & breakfast.'
		},
		{
			objectId: createObjectId(),
			text: "Volunteer sheriff's deputy with advanced training in hand-to-hand combat and surveillance."
		},
		{
			objectId: createObjectId(),
			text: 'Holds a black belt in Goju-Ryu karate and a brown belt in Judo.'
		}
	];

	cv.blocks.skills.value = [
		{
			objectId: createObjectId(),
			name: 'Sales',
			skills: tags('Paper Sales', 'Cold Calling', 'Account Management', 'Client Retention')
		},
		{
			objectId: createObjectId(),
			name: 'Agriculture',
			skills: tags('Beet Farming', 'Agritourism', 'Animal Husbandry', 'Beekeeping')
		},
		{
			objectId: createObjectId(),
			name: 'Security',
			skills: tags('Surveillance', 'Brazilian Jiu-Jitsu', 'Nunchucks', 'Volunteer Deputy Work')
		}
	];

	cv.blocks.jobHistory.value = [
		{
			objectId: createObjectId(),
			company: 'Dunder Mifflin Paper Company',
			role: 'Assistant Regional Manager',
			startDate: new Date('2004-03-24'),
			endDate: undefined,
			current: true,
			achievements: [
				{
					objectId: createObjectId(),
					text: 'Consistently led the Scranton branch in paper and office supply sales.'
				},
				{
					objectId: createObjectId(),
					text: 'Managed the safety committee, reducing workplace incidents by 40%.'
				},
				{
					objectId: createObjectId(),
					text: 'Instituted a branch-wide volunteer militia programme, improving morale by 73%.'
				},
				{
					objectId: createObjectId(),
					text: 'Served as Acting Regional Manager during three separate managerial vacancies.'
				}
			],
			skills: tags('Paper Sales', 'Team Leadership', 'Safety Compliance')
		},
		{
			objectId: createObjectId(),
			company: 'Schrute Farms',
			role: 'Owner & Proprietor',
			startDate: new Date('1998-05-01'),
			endDate: undefined,
			current: true,
			achievements: [
				{
					objectId: createObjectId(),
					text: 'Operates a 60-acre beet farm producing award-winning varieties of red and golden beets.'
				},
				{
					objectId: createObjectId(),
					text: 'Converted the farmhouse into a bed & breakfast with five themed guest rooms.'
				},
				{
					objectId: createObjectId(),
					text: "Featured in TripAdvisor's top 10 most haunted B&Bs in Pennsylvania."
				}
			],
			skills: tags('Farming', 'Hospitality', 'Business Operations')
		},
		{
			objectId: createObjectId(),
			company: "Lackawanna County Sheriff's Department",
			role: 'Volunteer Deputy',
			startDate: new Date('2003-01-01'),
			endDate: undefined,
			current: true,
			achievements: [
				{
					objectId: createObjectId(),
					text: 'Assisted with crowd control at three consecutive Steamtown Marathon events.'
				},
				{
					objectId: createObjectId(),
					text: 'Trained in prisoner transport, evidence handling, and report writing.'
				}
			],
			skills: tags('Law Enforcement', 'Crowd Control')
		}
	];

	cv.blocks.projects.value = [
		{
			objectId: createObjectId(),
			name: 'Schrute Farms B&B',
			description:
				'An agritourism bed & breakfast with five themed rooms, farm tours, and seasonal beet harvest experiences.',
			stack: tags('Hospitality', 'Agritourism', 'Marketing'),
			link: 'schrutefarms.biz'
		},
		{
			objectId: createObjectId(),
			name: 'Recyclops',
			description:
				'A grassroots office recycling programme that evolved into a full workplace environmental enforcement role.',
			stack: tags('Sustainability', 'Waste Management', 'Community Outreach'),
			link: ''
		}
	];

	cv.blocks.education.value = [
		{
			objectId: createObjectId(),
			institution: 'Penn State University',
			degree: 'B.A. Business Administration',
			startDate: new Date('1992-09-01'),
			endDate: new Date('1996-05-15'),
			current: false
		},
		{
			objectId: createObjectId(),
			institution: 'Lackawanna County Community College',
			degree: 'Certificate in Criminal Justice',
			startDate: new Date('2001-01-15'),
			endDate: new Date('2002-12-20'),
			current: false
		}
	];

	cv.blockHashes = computeBlockHashes(cv.blocks);
	return cv;
}
