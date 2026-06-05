<script lang="ts">
	import {
		Code,
		Download,
		Folder,
		Split,
		HardDrive,
		Pencil,
		Combine,
		ArrowLeftRight
	} from '@lucide/svelte';
	import type { LucideIcon } from '@lucide/svelte';

	const features: {
		icon: LucideIcon;
		title: string;
		body: string;
	}[] = [
		{
			icon: Split,
			title: 'One master, many copies',
			body: 'A master holds your full record. Tailored copies branch off it for specific roles and stay linked back.'
		},
		{
			icon: Combine,
			title: 'Selective, one-way sync',
			body: "When the master changes, review each diff. Accept what's relevant; discarded changes are remembered."
		},
		{
			icon: HardDrive,
			title: 'Local-first storage',
			body: 'Your CVs live in your browser. No account, no cloud, no sync server. Your CV content never leaves your device.'
		},
		{
			icon: Pencil,
			title: 'Editor with live preview',
			body: 'What you see is what you get. Changes save automatically. Any block can be hidden without losing its content.'
		},
		{
			icon: Download,
			title: 'One-click ATS-friendly PDF',
			body: 'No surprises when exporting, all text is selectable and parseable. Just download and apply.'
		},
		{
			icon: Code,
			title: 'Free & open source',
			body: 'MIT-licensed, auditable, forkable. No paid tier hiding the useful stuff. Built in the open.'
		}
	];

	const portabilityFeature = {
		icon: ArrowLeftRight,
		title: 'Yours to take',
		body: 'Export any CV to JSON Resume, an open standard. Import any JSON Resume file as a new CV. Your data is a plain file you own.'
	};

	const PortabilityIcon = portabilityFeature.icon;

	const steps = [
		{
			num: '01',
			title: 'Write your master CV.',
			body: 'Start with a big full CV. Fill in the nine blocks — Full Name, Position, Location, Contacts, Highlights, Skills, Job History, Projects, and Education.',
			vis: [
				{ text: '┃ Senior Software Engineer', accent: false, muted: false },
				{ text: 'Berlin, DE · 8 years experience', accent: false, muted: true },
				{ text: '● saved · 2s ago', accent: true, muted: false }
			]
		},
		{
			num: '02',
			title: 'Branch a tailored copy.',
			body: "One click of a button makes a complete copy linked back to its source. Trim what doesn't fit the role. Add a company label so you remember which copy went where.",
			vis: [
				{ text: '● Senior SWE — master', accent: false, muted: false },
				{ text: '└─ ● Stripe · branched', accent: false, muted: true },
				{ text: '+ company: Stripe', accent: true, muted: false }
			]
		},
		{
			num: '03',
			title: 'Sync changes selectively.',
			body: 'Realized something is missing? When you update the master, each tailored copy shows what changed. Accept relevant bits, discard the rest.',
			vis: [
				{ text: '+ New highlight · ML pipeline', accent: true, muted: false },
				{ text: '− Removed: PHP gig (discard)', accent: false, muted: true },
				{ text: '1 accepted · 1 discarded', accent: true, muted: false }
			]
		},
		{
			num: '04',
			title: 'Export. Apply.',
			body: 'One click to PDF. The preview you saw is the file you send. Hidden blocks drop out, empty entries are skipped.',
			vis: [
				{ text: '⤓ cv_stripe_swe.pdf', accent: false, muted: false },
				{ text: '2 pages · 124 kb · ready', accent: false, muted: true },
				{ text: '● exported · just now', accent: true, muted: false }
			]
		}
	];

	const faq = [
		{
			q: 'Is there a free tier?',
			a: "The whole thing is free. No tiers, no paid features, no upsell. It's an open-source tool, not a SaaS funnel."
		},
		{
			q: 'Will I lose my CVs if I clear my browser?',
			a: "Yes. That's the trade for local-first. Export your CVs to PDF to keep what matters."
		},
		{
			q: 'Can I sync across devices?',
			a: "Not built-in. There's no cloud. However this might appear in the future as an extra feature."
		},
		{
			q: 'Is it ATS-friendly?',
			a: 'Yes. The nine-block structure is opinionated on purpose because it makes ATS parsing easier. No tables, no weird columns, no graphics.'
		},
		{
			q: 'Can I tailor a tailored copy?',
			a: 'No, by design. Tailored copies always come from a master. One level deep keeps the model intelligible — deeper chains get confusing fast.'
		}
	];
</script>

<!-- Problem -->
<section id="about" class="border-foreground border-b-2 px-6 py-20">
	<div class="mx-auto max-w-5xl">
		<div class="mb-10 flex flex-wrap items-end justify-between gap-6">
			<div>
				<p class="text-muted-foreground mb-2 text-[11px] font-extrabold tracking-widest uppercase">
					↳ The problem
				</p>
				<h2 class="text-3xl font-extrabold tracking-tight md:text-4xl">
					Your CV folder is a mess of FINAL2 files.
				</h2>
			</div>
			<p class="text-muted-foreground max-w-[480px] text-base font-medium">
				You are trying hard to make your CV fit every application. Dozens of applies later the
				folder is full. No record of which copy went where, no idea what changed when you tweaked
				the master, no easy way back in sync.
			</p>
		</div>

		<div class="grid gap-6 md:grid-cols-2">
			<!-- Before -->
			<div class="border-foreground bg-background shadow-brutal border-2 p-7">
				<p class="text-destructive mb-2 text-[11px] font-extrabold tracking-widest uppercase">
					■ Before
				</p>
				<h3 class="mb-4 text-xl font-extrabold">Files everywhere. Source of truth nowhere.</h3>
				<div class="text-muted-foreground font-mono text-sm leading-loose">
					<div class="flex flex-row items-center gap-2"><Folder class="mb-0.5 size-4" />cv/</div>
					<div>├─ cv_master.docx</div>
					<div class="line-through opacity-60">├─ cv_v2.docx</div>
					<div>├─ cv_v3_backend.pdf</div>
					<div>
						├─ cv_v3_backend_<span class="text-destructive">FINAL</span>.pdf
					</div>
					<div>
						├─ cv_v3_backend_FINAL_<span class="text-destructive">FINAL2</span>.pdf
					</div>
					<div>
						├─ cv_google.pdf <span class="text-destructive">← which master?</span>
					</div>
					<div>├─ cv_stripe_jan.pdf</div>
					<div>└─ cv_stripe_jan_<span class="text-foreground font-bold">use_this.pdf</span></div>
				</div>
			</div>

			<!-- After -->
			<div class="border-foreground bg-card shadow-brutal border-2 p-7">
				<p class="text-accent mb-2 text-[11px] font-extrabold tracking-widest uppercase">✦ After</p>
				<h3 class="mb-4 text-xl font-extrabold">One master. Many tailored copies.</h3>
				<div class="font-mono text-sm leading-loose">
					<div>
						<span class="text-accent">●</span> <strong>Senior Software Engineer</strong> — master
					</div>
					<div class="text-muted-foreground">
						├─ ○ Backend <span class="text-muted-foreground">· in sync</span>
					</div>
					<div class="text-muted-foreground">
						├─ ○ <strong class="text-foreground">Stripe</strong> · SWE
						<span class="text-accent">· master updated</span>
					</div>
					<div class="text-muted-foreground">
						└─ ○ <strong class="text-foreground">Google</strong> · SWE
						<span class="text-muted-foreground">· in sync</span>
					</div>
					<div
						class="border-foreground text-muted-foreground mt-4 border-t-2 pt-3 text-xs leading-relaxed"
					>
						Every copy remembers its master.<br />
						Every export is reproducible.<br />
						Every change is a deliberate decision.
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Features -->
<section class="border-foreground bg-card border-b-2 px-6 py-20">
	<div class="mx-auto max-w-5xl">
		<div class="mb-10 flex flex-col justify-between gap-6">
			<div>
				<p class="text-muted-foreground mb-2 text-[11px] font-extrabold tracking-widest uppercase">
					↳ Features
				</p>
				<h2 class="text-3xl font-extrabold tracking-tight md:text-4xl">
					Built around the four things you actually do.
				</h2>
			</div>
			<div class="text-muted-foreground max-w-[480px] text-base leading-relaxed font-medium">
				Write, tailor, sync, export.
			</div>
		</div>

		<div class="border-foreground border-2">
			<!-- Featured portability card -->
			<div class="border-foreground grid border-b-2 md:grid-cols-[1fr_auto]">
				<div class="border-foreground flex flex-col gap-4 p-8 md:border-r-2">
					<PortabilityIcon class="text-accent size-8 shrink-0" />
					<div>
						<h3 class="text-base font-extrabold tracking-tight">{portabilityFeature.title}</h3>
						<p class="text-muted-foreground mt-2 max-w-lg text-sm leading-relaxed">
							{portabilityFeature.body}
						</p>
					</div>
				</div>
				<div class="hidden flex-col justify-center gap-2.5 p-8 font-mono text-xs md:flex">
					<p
						class="text-muted-foreground mb-1 text-[10px] font-extrabold tracking-widest uppercase"
					>
						↳ both ways
					</p>
					<div class="flex items-center gap-3">
						<span class="text-accent w-16 font-bold">→ export</span>
						<span>resume.json</span>
					</div>
					<div class="flex items-center gap-3">
						<span class="text-accent w-16 font-bold">→ export</span>
						<span>.humblehire.json</span>
					</div>
					<div class="flex items-center gap-3">
						<span class="text-accent w-16 font-bold">← import</span>
						<span>resume.json</span>
					</div>
					<div class="border-foreground my-1 border-t-2"></div>
					<a
						href="https://humblehire.cv/schema/resume/v0.0.1.json"
						target="_blank"
						rel="noopener noreferrer"
						class="text-accent font-bold hover:underline">schema v0.0.1 ↗</a
					>
				</div>
			</div>
			<!-- Regular 6-card grid -->
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
				{#each features as f, i (f.title)}
					{@const Icon = f.icon}
					<div
						class="border-foreground flex flex-col gap-3 p-7"
						class:border-r-2={i % 3 !== 2}
						class:border-b-2={i < 3}
					>
						<Icon class="text-accent size-7 shrink-0" />
						<h3 class="text-base font-extrabold tracking-tight">{f.title}</h3>
						<p class="text-muted-foreground text-sm leading-relaxed">{f.body}</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<!-- How it works -->
<section id="how" class="border-foreground border-b-2 px-6 py-20">
	<div class="mx-auto max-w-5xl">
		<div class="mb-10">
			<p class="text-muted-foreground mb-2 text-[11px] font-extrabold tracking-widest uppercase">
				↳ How it works
			</p>
			<h2 class="text-3xl font-extrabold tracking-tight md:text-4xl">
				Three motions. Endless applications.
			</h2>
		</div>

		<div class="border-foreground border-2">
			{#each steps as s, i (i)}
				<div
					class="border-foreground grid items-center gap-8 border-b-2 p-8 last:border-b-0 md:grid-cols-[80px_1fr_320px]"
				>
					<span class="text-accent text-5xl leading-none font-extrabold tracking-tighter"
						>{s.num}</span
					>
					<div>
						<h3 class="mb-2 text-2xl font-extrabold tracking-tight">{s.title}</h3>
						<p class="text-muted-foreground max-w-md text-sm leading-relaxed">{s.body}</p>
					</div>
					<div
						class="border-foreground bg-background flex min-h-[80px] flex-col justify-center gap-1.5 border-2 p-4 font-mono text-xs"
					>
						{#each s.vis as line, j (j)}
							<div class:text-accent={line.accent} class:text-muted-foreground={line.muted}>
								{line.text}
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Portability / No lock-in -->
<section class="border-foreground bg-card border-b-2 px-6 py-20">
	<div class="mx-auto grid max-w-5xl items-center gap-16 md:grid-cols-2">
		<div>
			<p class="text-muted-foreground mb-2 text-[11px] font-extrabold tracking-widest uppercase">
				↳ No lock-in
			</p>
			<h2 class="mb-5 text-3xl font-extrabold tracking-tight md:text-4xl">
				Your CV is a file you own.
			</h2>
			<p class="text-muted-foreground mb-4 text-base leading-relaxed">
				Every CV exports to <a
					href="https://jsonresume.org"
					target="_blank"
					rel="noopener noreferrer"
					class="text-foreground font-bold underline underline-offset-2">JSON Resume</a
				>, an open standard. Edit it in another app, run it through an AI, or take it to a different
				tool. It's just a file.
			</p>
			<p class="text-muted-foreground text-base leading-relaxed">
				For a lossless round-trip, export HumbleHire JSON — it comes back exactly as it left. Any
				valid JSON Resume file imports straight in as a new CV.
			</p>
		</div>

		<div
			class="border-foreground bg-background shadow-brutal flex flex-col gap-3 border-2 p-7 font-mono text-sm"
		>
			<p class="text-muted-foreground mb-1 text-[11px] font-extrabold tracking-widest uppercase">
				↳ your data, both ways
			</p>
			<div class="flex items-center gap-3">
				<span class="text-accent w-16 font-bold">→ export</span>
				<span>resume.json</span>
				<span class="text-muted-foreground ml-auto text-xs">open std</span>
			</div>
			<div class="flex items-center gap-3">
				<span class="text-accent w-16 font-bold">→ export</span>
				<span>.humblehire.json</span>
				<span class="text-muted-foreground ml-auto text-xs">lossless</span>
			</div>
			<div class="flex items-center gap-3">
				<span class="text-accent w-16 font-bold">← import</span>
				<span>resume.json</span>
				<span class="text-muted-foreground ml-auto text-xs">new CV</span>
			</div>
			<hr class="border-foreground border-t-2" />
			<div class="flex justify-between">
				<span>standard</span>
				<a
					href="https://jsonresume.org"
					target="_blank"
					rel="noopener noreferrer"
					class="text-accent font-bold hover:underline">jsonresume.org ↗</a
				>
			</div>
			<div class="flex justify-between">
				<span>schema</span>
				<a
					href="https://humblehire.cv/schema/resume/v0.0.1.json"
					target="_blank"
					rel="noopener noreferrer"
					class="text-accent font-bold hover:underline">v0.0.1 ↗</a
				>
			</div>
		</div>
	</div>
</section>

<!-- Local-first -->
<section class="border-foreground border-b-2 px-6 py-20">
	<div class="mx-auto grid max-w-5xl items-center gap-16 md:grid-cols-2">
		<div>
			<p class="text-muted-foreground mb-2 text-[11px] font-extrabold tracking-widest uppercase">
				↳ Why local-first
			</p>
			<h2 class="mb-5 text-3xl font-extrabold tracking-tight md:text-4xl">
				Your CV is yours. Instant. No lock-in.
			</h2>
			<p class="text-muted-foreground mb-4 text-base leading-relaxed">
				HumbleHire is free to use and fully client-side. Everything you write is stored in your
				browser — no account required, no server in the loop. Every save is instant because nothing
				leaves your device.
			</p>
		</div>

		<div
			class="border-foreground bg-card shadow-brutal flex flex-col gap-3 border-2 p-7 font-mono text-sm"
		>
			<div class="flex items-center gap-3">
				<span class="border-foreground bg-accent h-2.5 w-2.5 shrink-0 border-2"></span>
				<span>CV content lives in</span>
				<span class="text-accent ml-auto font-bold">your browser</span>
			</div>
			<div class="flex items-center gap-3">
				<span class="border-foreground bg-card h-2.5 w-2.5 shrink-0 border-2"></span>
				<span>save latency</span>
				<span class="text-muted-foreground ml-auto">instant</span>
			</div>
			<div class="flex items-center gap-3 opacity-50">
				<span class="border-foreground h-2.5 w-2.5 shrink-0 border-2 border-dashed"></span>
				<span class="line-through">account · server · cloud sync</span>
			</div>
			<hr class="border-foreground border-t-2" />
			<div class="flex justify-between">
				<span>CV data uploaded</span>
				<strong>0 bytes</strong>
			</div>
			<div class="flex justify-between">
				<span>Cookies set</span>
				<strong>0</strong>
			</div>
			<div class="flex justify-between">
				<span>Account required</span>
				<strong>none</strong>
			</div>
		</div>
	</div>
</section>

<!-- FAQ -->
<section id="faq" class="border-foreground bg-card border-b-2 px-6 py-20">
	<div class="mx-auto max-w-5xl">
		<div class="mb-10">
			<p class="text-muted-foreground mb-2 text-[11px] font-extrabold tracking-widest uppercase">
				↳ Your questions
			</p>
			<h2 class="text-3xl font-extrabold tracking-tight md:text-4xl">Straight answers to them.</h2>
		</div>

		<div class="border-foreground grid border-2 sm:grid-cols-2">
			{#each faq as item, i (i)}
				<div
					class="border-foreground p-7"
					class:border-r-2={i % 2 === 0}
					class:border-b-2={i < faq.length - 2}
					class:sm-last-no-border={true}
				>
					<h4 class="mb-3 text-base font-extrabold tracking-tight">
						<span class="text-accent font-mono">?&nbsp;&nbsp;</span>{item.q}
					</h4>
					<p class="text-muted-foreground text-sm leading-relaxed">{item.a}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
