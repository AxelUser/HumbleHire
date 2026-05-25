<script lang="ts">
	import SyncDrawer from '$lib/components/tailoring/sync-drawer.svelte';
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
			contacts: { objectId: IDS.cb, value: [] },
			highlights: { objectId: IDS.hb, value: [] },
			skills: { objectId: IDS.sb, value: [] },
			jobHistory: { objectId: IDS.jb, value: [] },
			projects: { objectId: IDS.pb, value: [] },
			education: { objectId: IDS.eb, value: [] }
		};
	}

	const masterCv: CV = {
		id: 'master-2',
		name: 'Master CV',
		version: 2,
		createdAt: Date.now() - 86400000 * 7,
		updatedAt: Date.now() - 3600000,
		blocks: mkBlocks('Senior Software Engineer'),
		hiddenBlockIds: []
	};

	const tailoredCv: CV = {
		id: 'tailored-2',
		name: 'Google — Engineer',
		version: 1,
		createdAt: Date.now() - 86400000 * 3,
		updatedAt: Date.now() - 86400000,
		blocks: mkBlocks('Senior Software Engineer'),
		hiddenBlockIds: [],
		sourceId: 'master-2'
	};

	let open = $state(false);
</script>

<SyncDrawer {masterCv} {tailoredCv} onSync={() => {}} bind:open />
