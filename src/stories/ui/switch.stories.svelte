<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Switch from '$lib/components/ui/switch/switch.svelte';
	import SwitchWrapper from './helpers/SwitchWrapper.svelte';

	const { Story } = defineMeta({
		title: 'UI/Switch',
		component: Switch,
		tags: ['autodocs']
	});
</script>

<Story name="Off" asChild>
		<Switch checked={false} />
</Story>

<Story name="On" asChild>
		<Switch checked={true} />
</Story>

<Story name="Interactive" asChild>
		<SwitchWrapper />
</Story>
