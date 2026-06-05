import type { MasterSeedContent } from '@humblehire/dev-bridge';

export const dwightContent: MasterSeedContent = {
	fullName: 'Dwight K. Schrute',
	position: 'Assistant Regional Manager',
	location: 'Scranton, Pennsylvania',
	contacts: [
		{ label: 'Email', value: 'dwight@dundermifflin.com' },
		{ label: 'Phone', value: '+1 570 555 0198' },
		{ label: 'Website', value: 'schrutefarms.biz' },
		{ label: 'LinkedIn', value: 'linkedin.com/in/dwightschrute' }
	],
	highlights: [
		{ text: 'Top-performing Dunder Mifflin salesman for six consecutive quarters.' },
		{ text: 'Owner and proprietor of Schrute Farms, a working beet farm and bed & breakfast.' },
		{
			text: "Volunteer sheriff's deputy with advanced training in hand-to-hand combat and surveillance."
		},
		{ text: 'Holds a black belt in Goju-Ryu karate and a brown belt in Judo.' }
	],
	skills: [
		{
			name: 'Sales',
			skills: ['Paper Sales', 'Cold Calling', 'Account Management', 'Client Retention']
		},
		{
			name: 'Agriculture',
			skills: ['Beet Farming', 'Agritourism', 'Animal Husbandry', 'Beekeeping']
		},
		{
			name: 'Security',
			skills: ['Surveillance', 'Brazilian Jiu-Jitsu', 'Nunchucks', 'Volunteer Deputy Work']
		}
	],
	jobHistory: [
		{
			company: 'Dunder Mifflin Paper Company',
			role: 'Assistant Regional Manager',
			startDate: '2004-03-24',
			current: true,
			achievements: [
				{ text: 'Consistently led the Scranton branch in paper and office supply sales.' },
				{ text: 'Managed the safety committee, reducing workplace incidents by 40%.' },
				{
					text: 'Instituted a branch-wide volunteer militia programme, improving morale by 73%.'
				},
				{
					text: 'Served as Acting Regional Manager during three separate managerial vacancies.'
				}
			],
			skills: ['Paper Sales', 'Team Leadership', 'Safety Compliance']
		},
		{
			company: 'Schrute Farms',
			role: 'Owner & Proprietor',
			startDate: '1998-05-01',
			current: true,
			achievements: [
				{
					text: 'Operates a 60-acre beet farm producing award-winning varieties of red and golden beets.'
				},
				{ text: 'Converted the farmhouse into a bed & breakfast with five themed guest rooms.' },
				{
					text: "Featured in TripAdvisor's top 10 most haunted B&Bs in Pennsylvania."
				}
			],
			skills: ['Farming', 'Hospitality', 'Business Operations']
		},
		{
			company: "Lackawanna County Sheriff's Department",
			role: 'Volunteer Deputy',
			startDate: '2003-01-01',
			current: true,
			achievements: [
				{ text: 'Assisted with crowd control at three consecutive Steamtown Marathon events.' },
				{ text: 'Trained in prisoner transport, evidence handling, and report writing.' }
			],
			skills: ['Law Enforcement', 'Crowd Control']
		}
	],
	projects: [
		{
			name: 'Schrute Farms B&B',
			description:
				'An agritourism bed & breakfast with five themed rooms, farm tours, and seasonal beet harvest experiences.',
			stack: ['Hospitality', 'Agritourism', 'Marketing'],
			link: 'schrutefarms.biz'
		},
		{
			name: 'Recyclops',
			description:
				'A grassroots office recycling programme that evolved into a full workplace environmental enforcement role.',
			stack: ['Sustainability', 'Waste Management', 'Community Outreach'],
			link: ''
		}
	],
	education: [
		{
			institution: 'Penn State University',
			degree: 'B.A. Business Administration',
			startDate: '1992-09-01',
			endDate: '1996-05-15'
		},
		{
			institution: 'Lackawanna County Community College',
			degree: 'Certificate in Criminal Justice',
			startDate: '2001-01-15',
			endDate: '2002-12-20'
		}
	]
};
