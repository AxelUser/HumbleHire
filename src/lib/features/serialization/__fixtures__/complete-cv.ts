import { createObjectId, type CV, type CVBlocks } from '$lib/types/cv';
import { computeBlockHashes } from '$lib/features/tailoring/hash';

export function makeCompleteCV(overrides: Partial<CV> = {}): CV {
	const blocks: CVBlocks = {
		fullName: { objectId: createObjectId(), value: 'Jane Doe' },
		position: { objectId: createObjectId(), value: 'Senior Engineer' },
		location: { objectId: createObjectId(), value: 'Berlin, DE' },
		contacts: {
			objectId: createObjectId(),
			value: [
				{ objectId: createObjectId(), label: 'Email', value: 'jane@example.com' },
				{ objectId: createObjectId(), label: 'GitHub', value: 'https://github.com/jane' }
			]
		},
		highlights: {
			objectId: createObjectId(),
			value: [
				{ objectId: createObjectId(), text: '10 years building distributed systems' },
				{ objectId: createObjectId(), text: 'Led a platform team of 6' }
			]
		},
		skills: {
			objectId: createObjectId(),
			value: [
				{
					objectId: createObjectId(),
					name: 'Languages',
					skills: [
						{ objectId: createObjectId(), value: 'Go' },
						{ objectId: createObjectId(), value: 'TypeScript' }
					]
				}
			]
		},
		jobHistory: {
			objectId: createObjectId(),
			value: [
				{
					objectId: createObjectId(),
					company: 'Acme',
					role: 'Senior Engineer',
					startDate: new Date(2020, 0, 1),
					endDate: undefined,
					current: true,
					achievements: [{ objectId: createObjectId(), text: 'Cut p99 latency by 40%' }],
					skills: [
						{ objectId: createObjectId(), value: 'Go' },
						{ objectId: createObjectId(), value: 'Kubernetes' }
					]
				}
			]
		},
		education: {
			objectId: createObjectId(),
			value: [
				{
					objectId: createObjectId(),
					institution: 'TU Berlin',
					degree: 'BSc Computer Science',
					startDate: new Date(2014, 8, 1),
					endDate: new Date(2018, 5, 1),
					current: false
				}
			]
		},
		projects: {
			objectId: createObjectId(),
			value: [
				{
					objectId: createObjectId(),
					name: 'Inventory service',
					description: 'Event-sourced ledger',
					stack: [
						{ objectId: createObjectId(), value: 'Rust' },
						{ objectId: createObjectId(), value: 'Postgres' }
					],
					link: 'https://example.com'
				}
			]
		}
	};

	return {
		id: 'test-id',
		name: 'Jane Doe',
		createdAt: 0,
		updatedAt: 0,
		hiddenBlockIds: [],
		blocks,
		blockHashes: computeBlockHashes(blocks),
		...overrides
	};
}
