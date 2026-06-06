<script lang="ts">
	import { InlineField } from '$lib/components/ui/inline-field';
	import { BlockWrapper } from '$lib/components/ui/block-wrapper';
	import { Button } from '$lib/components/ui/button';
	import { Trash2, Plus } from '@lucide/svelte';
	import { createObjectId, type Basics, type ObjectId } from '$lib/types/cv';

	interface Props {
		basics: Basics;
		hidden: string[];
	}

	let { basics = $bindable(), hidden = $bindable() }: Props = $props();

	function addProfile() {
		basics.profiles = [...basics.profiles, { objectId: createObjectId(), network: '', url: '' }];
	}

	function removeProfile(objectId: ObjectId) {
		basics.profiles = basics.profiles.filter((p) => p.objectId !== objectId);
	}
</script>

<BlockWrapper title="Contacts" path="basics/contacts/" bind:hidden>
	<div class="flex flex-col gap-2">
		<InlineField bind:value={basics.email} placeholder="Email" />
		<InlineField bind:value={basics.phone} placeholder="Phone" />
		<InlineField bind:value={basics.url} placeholder="Website" />

		{#each basics.profiles as profile (profile.objectId)}
			<div class="flex items-center gap-2">
				<InlineField bind:value={profile.network} placeholder="Network" class="w-32 shrink-0" />
				<InlineField bind:value={profile.url} placeholder="URL" class="flex-1" />
				<Button
					variant="ghost"
					size="icon"
					class="text-muted-foreground hover:text-destructive shrink-0"
					onclick={() => removeProfile(profile.objectId)}
				>
					<Trash2 class="h-4 w-4" />
				</Button>
			</div>
		{/each}

		<Button variant="outline" size="sm" class="mt-2 self-start" onclick={addProfile}>
			<Plus class="mr-1 h-4 w-4" />
			Add Profile
		</Button>
	</div>
</BlockWrapper>
