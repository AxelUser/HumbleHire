export function splitByRanges(
	text: string,
	ranges?: ReadonlyArray<readonly [number, number]>
): Array<{ text: string; highlight: boolean }> {
	if (!ranges?.length) return [{ text, highlight: false }];

	const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
	const merged: Array<readonly [number, number]> = [];
	for (const r of sorted) {
		const last = merged.at(-1);
		if (last && r[0] <= last[1] + 1) merged[merged.length - 1] = [last[0], Math.max(last[1], r[1])];
		else merged.push(r);
	}

	const out: Array<{ text: string; highlight: boolean }> = [];
	let cursor = 0;
	for (const [s, e] of merged) {
		if (cursor < s) out.push({ text: text.slice(cursor, s), highlight: false });
		out.push({ text: text.slice(s, e + 1), highlight: true }); // Fuse indices are inclusive
		cursor = e + 1;
	}
	if (cursor < text.length) out.push({ text: text.slice(cursor), highlight: false });
	return out;
}
