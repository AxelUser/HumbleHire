import { browser } from '$app/environment';

function detectIos(): boolean {
	if (!browser) return false;
	return (
		/iphone|ipad|ipod/i.test(navigator.userAgent) ||
		(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
	);
}

class PwaInstallState {
	#deferred: BeforeInstallPromptEvent | null = $state(null);
	#installed = $state(false);
	#ios = $state(false);

	get canInstall(): boolean {
		return this.#deferred !== null && !this.#installed;
	}

	get isIos(): boolean {
		return this.#ios && !this.#installed;
	}

	get isInstalled(): boolean {
		return this.#installed;
	}

	init(): void {
		this.#ios = detectIos();

		if (window.matchMedia('(display-mode: standalone)').matches) {
			this.#installed = true;
			return;
		}

		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			this.#deferred = e;
		});

		window.addEventListener('appinstalled', () => {
			this.#installed = true;
			this.#deferred = null;
		});
	}

	async trigger(): Promise<void> {
		if (!this.#deferred) return;
		await this.#deferred.prompt();
		const { outcome } = await this.#deferred.userChoice;
		if (outcome === 'accepted') {
			this.#installed = true;
		}
		this.#deferred = null;
	}
}

export const pwaInstall = new PwaInstallState();
