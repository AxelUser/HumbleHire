<script lang="ts">
	import { InlineField } from '$lib/components/ui/inline-field';
	import { BlockWrapper } from '$lib/components/ui/block-wrapper';
	import { Button } from '$lib/components/ui/button';
	import { Trash2, Plus, GripVertical } from '@lucide/svelte';
	import { DragDropProvider, DragOverlay } from '@dnd-kit/svelte';
	import { createSortable } from '@dnd-kit/svelte/sortable';
	import { move } from '@dnd-kit/helpers';
	import type { ContactEntry, ObjectId } from '$lib/types/cv';
	import { createObjectId } from '$lib/types/cv';

	interface Props {
		contacts: ContactEntry[];
		blockId: ObjectId;
		hiddenBlockIds: ObjectId[];
	}

	let { contacts = $bindable(), blockId, hiddenBlockIds = $bindable() }: Props = $props();

	function addContact() {
		contacts = [...contacts, { objectId: createObjectId(), label: '', value: '' }];
	}

	function removeContact(objectId: ObjectId) {
		contacts = contacts.filter((c) => c.objectId !== objectId);
	}

	function onDragOver(event: any) {
		contacts = move(contacts as any, event) as ContactEntry[];
	}

	function onDragEnd(event: any) {
		contacts = move(contacts as any, event) as ContactEntry[];
	}
</script>

<BlockWrapper title="Contacts" {blockId} bind:hiddenBlockIds>
	<DragDropProvider {onDragEnd} {onDragOver}>
		<div class="flex flex-col">
			<div class="flex flex-col gap-2">
				{#each contacts as contact, index (contact.objectId)}
					{@const sortable = createSortable({ id: contact.objectId, index: (() => index) as any })}
					<div
						class="flex items-center gap-2 {sortable.isDragging
							? 'border-muted rounded border-2 border-dashed'
							: ''}"
						{@attach sortable.attach}
					>
						<div class="flex flex-1 items-center gap-2 {sortable.isDragging ? 'invisible' : ''}">
							<span
								{@attach sortable.attachHandle}
								class="text-muted-foreground shrink-0 cursor-grab"
							>
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
					</div>
				{/each}
			</div>
			<Button variant="outline" size="sm" class="mt-2 self-start" onclick={addContact}>
				<Plus class="mr-1 h-4 w-4" />
				Add Contact
			</Button>
		</div>
		<DragOverlay>
			{#snippet children(source: any)}
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
