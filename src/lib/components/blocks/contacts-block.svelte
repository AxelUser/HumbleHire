<script lang="ts">
	import { InlineField } from '$lib/components/ui/inline-field';
	import { BlockWrapper } from '$lib/components/ui/block-wrapper';
	import { Button } from '$lib/components/ui/button';
	import { Trash2, Plus, GripVertical } from '@lucide/svelte';
	import { DragDropProvider, DragOverlay } from '@dnd-kit/svelte';
	import { createSortable } from '@dnd-kit/svelte/sortable';
	import { move } from '@dnd-kit/helpers';
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

	function onDragOver(event: any) {
		contacts = move(contacts, event);
	}

	function onDragEnd(event: any) {
		contacts = move(contacts, event);
	}
</script>

<BlockWrapper title="Contacts" bind:visible>
	<div class="flex flex-col gap-2">
		<DragDropProvider {onDragEnd} {onDragOver}>
			{#each contacts as contact, index (contact.id)}
				{@const sortable = createSortable({ id: contact.id, index: (() => index) as any })}
				<div
					class="flex items-center gap-2 {sortable.isDragging
						? 'border-2 border-dashed border-muted rounded'
						: ''}"
					{@attach sortable.attach}
				>
					<div class="flex items-center gap-2 flex-1 {sortable.isDragging ? 'invisible' : ''}">
						<span {@attach sortable.attachHandle} class="shrink-0 text-muted-foreground cursor-grab">
							<GripVertical class="h-4 w-4" />
						</span>
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
				</div>
			{/each}
			<Button variant="outline" size="sm" class="mt-2 self-start" onclick={addContact}>
				<Plus class="h-4 w-4 mr-1" />
				Add Contact
			</Button>
			<DragOverlay>
				{#snippet children(source: any)}
					{@const contact = contacts.find((c) => c.id === source.id)}
					{#if contact}
						<div class="flex items-center gap-2 bg-background shadow-lg rounded px-2 py-1">
							<GripVertical class="h-4 w-4 shrink-0 text-muted-foreground" />
							<span class="w-32 shrink-0 text-sm">{contact.label || 'Label'}</span>
							<span class="flex-1 text-sm text-muted-foreground">{contact.value || 'Value'}</span>
						</div>
					{/if}
				{/snippet}
			</DragOverlay>
		</DragDropProvider>
	</div>
</BlockWrapper>
