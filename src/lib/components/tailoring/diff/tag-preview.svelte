<script lang="ts">
	import type { Tag } from '$lib/types/cv';
	import { Badge } from '$lib/components/ui/badge';

	interface Props {
		entry: Tag;
	}

	let { entry }: Props = $props();
</script>

<Badge variant="secondary" class="mt-1 text-xs">{entry.value}</Badge>
