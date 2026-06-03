<script lang="ts">
	import { InlineField } from '$lib/components/ui/inline-field';
	import { BlockWrapper } from '$lib/components/ui/block-wrapper';
	import { Button } from '$lib/components/ui/button';
	import { SortableItem, createSortableDragHandlers } from '$lib/components/ui/sortable';
	import { DragDropProvider, DragOverlay } from '@dnd-kit/svelte';
	import type { Draggable } from '@dnd-kit/dom';
	import { Trash2, Plus, GripVertical } from '@lucide/svelte';
	import { createObjectId, type ContactEntry, type ObjectId } from '$lib/types/cv';

	interface Props {
		contacts: ContactEntry[];
		blockId: ObjectId;
		hiddenBlockIds: ObjectId[];
	}

	let { contacts = $bindable(), blockId, hiddenBlockIds = $bindable() }: Props = $props();

	const drag = createSortableDragHandlers(
		() => contacts,
		(items) => {
			contacts = items;
		}
	);

	function addContact() {
		contacts = [...contacts, { objectId: createObjectId(), label: '', value: '' }];
	}

	function removeContact(objectId: ObjectId) {
		contacts = contacts.filter((c) => c.objectId !== objectId);
	}
</script>

<BlockWrapper title="Contacts" {blockId} bind:hiddenBlockIds>
	<DragDropProvider {...drag}>
		<div class="flex flex-col">
			<div class="flex flex-col gap-2">
				{#each contacts as contact, index (contact.objectId)}
					<SortableItem
						id={contact.objectId}
						{index}
						class="flex items-center gap-2 rounded"
						borderWhenIdle={false}
					>
						{#snippet children({ attachHandle, isDragging })}
							<div class="flex flex-1 items-center gap-2 {isDragging ? 'invisible' : ''}">
								<span {@attach attachHandle} class="text-muted-foreground shrink-0 cursor-grab">
									<GripVertical class="h-4 w-4" />
								</span>
								<InlineField bind:value={contact.label} placeholder="Label" class="w-32 shrink-0" />
								<InlineField bind:value={contact.value} placeholder="Value" class="flex-1" />
								<Button
									variant="ghost"
									size="icon"
									class="text-muted-foreground hover:text-destructive shrink-0"
									onclick={() => removeContact(contact.objectId)}
								>
									<Trash2 class="h-4 w-4" />
								</Button>
							</div>
						{/snippet}
					</SortableItem>
				{/each}
			</div>
			<Button variant="outline" size="sm" class="mt-2 self-start" onclick={addContact}>
				<Plus class="mr-1 h-4 w-4" />
				Add Contact
			</Button>
		</div>
		<DragOverlay>
			{#snippet children(source: Draggable)}
				{@const contact = contacts.find((c) => c.objectId === source.id)}
				{#if contact}
					<div class="bg-background flex items-center gap-2 rounded px-2 py-1 shadow-lg">
						<GripVertical class="text-muted-foreground h-4 w-4 shrink-0" />
						<span class="w-32 shrink-0 text-sm">{contact.label || 'Label'}</span>
						<span class="text-muted-foreground flex-1 text-sm">{contact.value || 'Value'}</span>
					</div>
				{/if}
			{/snippet}
		</DragOverlay>
	</DragDropProvider>
</BlockWrapper>
