<script lang="ts">
	import SyncModal from '$lib/components/sync/sync-modal.svelte';
	import type { CV, ObjectId } from '$lib/types/cv';

	const IDS = {
		fn: 'mock-fn' as unknown as ObjectId,
		pos: 'mock-pos' as unknown as ObjectId,
		loc: 'mock-loc' as unknown as ObjectId,
		cb: 'mock-cb' as unknown as ObjectId,
		hb: 'mock-hb' as unknown as ObjectId,
		sb: 'mock-sb' as unknown as ObjectId,
		jb: 'mock-jb' as unknown as ObjectId,
		pb: 'mock-pb' as unknown as ObjectId,
		eb: 'mock-eb' as unknown as ObjectId
	};

	function mkBlocks(position: string) {
		return {
			fullName: { objectId: IDS.fn, value: 'Alex Smith' },
			position: { objectId: IDS.pos, value: position },
			location: { objectId: IDS.loc, value: 'San Francisco, CA' },
			contactsBlockId: IDS.cb,
			contacts: [],
			highlightsBlockId: IDS.hb,
			highlights: [],
			skillsBlockId: IDS.sb,
			skills: [],
			jobHistoryBlockId: IDS.jb,
			jobHistory: [],
			projectsBlockId: IDS.pb,
			projects: [],
			educationBlockId: IDS.eb,
			education: []
		};
	}

	const masterCv: CV = {
		id: 'master-2',
		name: 'Master CV',
		notes: '',
		version: 2,
		createdAt: Date.now() - 86400000 * 7,
		updatedAt: Date.now() - 3600000,
		blocks: mkBlocks('Senior Software Engineer'),
		hiddenBlockIds: []
	};

	let open = $state(true);
	let tailoredCv = $state<CV>({
		id: 'tailored-2',
		name: 'Google — Engineer',
		notes: '',
		version: 1,
		createdAt: Date.now() - 86400000 * 3,
		updatedAt: Date.now() - 86400000,
		blocks: mkBlocks('Senior Software Engineer'),
		hiddenBlockIds: [],
		sourceId: 'master-2'
	});
</script>

<SyncModal {masterCv} bind:tailoredCv bind:open onClose={() => (open = false)} />
