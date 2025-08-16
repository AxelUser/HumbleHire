export const loadableFontFamilies = [
	'Inter',
	'Roboto',
	'Montserrat',
	'Poppins',
	'"Playfair Display"',
	'Merriweather',
	'"JetBrains Mono"'
] as const;

export type LoadableFontFamily = (typeof loadableFontFamilies)[number];

export async function loadAppFonts(): Promise<void> {
	if (typeof document === 'undefined' || !document.fonts) return;
	const styles = ['normal', 'italic'];
	const weights = ['400', '700'];
	await Promise.all(
		loadableFontFamilies.flatMap((family) =>
			styles.flatMap((style) =>
				weights.map((weight) => document.fonts.load(`${style} ${weight} 1em ${family}`))
			)
		)
	);
	await document.fonts.ready;
}
