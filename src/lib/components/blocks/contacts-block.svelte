<script lang="ts">
	import { InlineField } from '$lib/components/ui/inline-field';
	import { BlockWrapper } from '$lib/components/ui/block-wrapper';
	import { Button } from '$lib/components/ui/button';
	import { Trash2, Plus } from '@lucide/svelte';
	import type { ContactEntry } from '$lib/types/cv';

	interface Props {
		contacts: ContactEntry[];
		visible: boolean;
	}

	let { contacts = $bindable(), visible = $bindable() }: Props = $props();

	function addContact() {
		contacts = [...contacts, { id: crypto.randomUUID(), label: '', value: '' }];
	}

	function removeContact(id: string) {
		contacts = contacts.filter((c) => c.id !== id);
	}
</script>

<BlockWrapper title="Contacts" bind:visible>
	<div class="flex flex-col gap-2">
		{#each contacts as contact (contact.id)}
			<div class="flex items-center gap-2">
				<InlineField bind:value={contact.label} placeholder="Label" class="w-32 shrink-0" />
				<InlineField bind:value={contact.value} placeholder="Value" class="flex-1" />
				<Button
					variant="ghost"
					size="icon"
					class="shrink-0 text-muted-foreground hover:text-destructive"
					onclick={() => removeContact(contact.id)}
				>
					<Trash2 class="h-4 w-4" />
				</Button>
			</div>
		{/each}
		<Button variant="outline" size="sm" class="mt-1 self-start" onclick={addContact}>
			<Plus class="h-4 w-4 mr-1" />
			Add Contact
		</Button>
	</div>
</BlockWrapper>
