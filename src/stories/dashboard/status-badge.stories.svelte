<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import StatusBadge from '$lib/components/dashboard/status-badge.svelte';
	import type { ComponentProps } from 'svelte';

	type Props = ComponentProps<typeof StatusBadge>;

	const { Story } = defineMeta({
		title: 'Dashboard/StatusBadge',
		component: StatusBadge,
		tags: ['autodocs']
	});
</script>

<Story name="InSync" args={{ updatesAvailable: false }}>
	{#snippet template(args: Props)}
		<div class="p-4">
			<StatusBadge {...args} />
		</div>
	{/snippet}
</Story>

<Story name="MasterUpdated" args={{ updatesAvailable: true }}>
	{#snippet template(args: Props)}
		<div class="p-4">
			<StatusBadge {...args} />
		</div>
	{/snippet}
</Story>
