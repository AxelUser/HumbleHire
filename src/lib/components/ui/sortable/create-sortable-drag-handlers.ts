import { move } from '@dnd-kit/helpers';

type WithObjectId = { objectId: string };

type SortableSource = { id: string | number; index: number };

function reorderBySortableIndices<T extends WithObjectId>(
	items: T[],
	source: SortableSource
): T[] | null {
	const currentIndex = items.findIndex((item) => item.objectId === source.id);
	const toIndex = source.index;
	if (currentIndex === -1 || currentIndex === toIndex) {
		return null;
	}
	const next = items.slice();
	const [removed] = next.splice(currentIndex, 1);
	next.splice(toIndex, 0, removed);
	return next;
}

/** Items use `objectId`; the move() helper only matches `id`, so we add a transient alias. */
function moveWithObjectId<T extends WithObjectId>(
	items: T[],
	event: Parameters<typeof move>[1]
): T[] {
	const withId = items.map((item) => ({ ...item, id: item.objectId }));
	return move(withId as never, event) as T[];
}

export function createSortableDragHandlers<T extends WithObjectId>(
	getItems: () => T[],
	setItems: (items: T[]) => void
) {
	let snapshot: T[] = [];

	return {
		onDragStart() {
			snapshot = getItems().slice();
		},
		onDragOver(event: Parameters<typeof move>[1]) {
			const items = getItems();
			const { source, canceled } = event.operation;

			if (canceled) {
				return;
			}

			const sortableSource: SortableSource | null =
				source &&
				typeof source.id !== 'undefined' &&
				'index' in source &&
				typeof source.index === 'number'
					? { id: source.id, index: source.index }
					: null;

			let next: T[] | null = null;

			if (sortableSource) {
				next = reorderBySortableIndices(items, sortableSource);
			}

			if (!next) {
				next = moveWithObjectId(items, event);
			}

			const changed = items.some((item, index) => item.objectId !== next[index]?.objectId);
			if (changed) {
				setItems(next);
			}
		},
		onDragEnd(event: Parameters<typeof move>[1]) {
			if (event.operation.canceled) {
				setItems(snapshot);
			}
		}
	};
}
