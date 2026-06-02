export type ZoomMode = 'fit-width' | 'fit-page' | 'custom';
export interface ZoomState {
	mode: ZoomMode;
	zoom: number;
}

export const ZOOM_STOPS = [0.25, 0.33, 0.5, 0.67, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0];
export const ZOOM_DEFAULT: ZoomState = { mode: 'custom', zoom: 1.0 };
