<script>
	import { onMount, setContext } from 'svelte';
	import { mapbox } from './mapbox.js';
	import { coordinates, scroll } from './state';

	export let bounds;
	export let visibleIndex;
	export let mapStyle;

	let container;
	let map;
	let mapBounds = bounds;
	let scrollIndex = 0;
	let scrollProgress = 0;
	

	onMount(() => {
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = 'https://unpkg.com/mapbox-gl/dist/mapbox-gl.css';

		link.onload = () => {
			map = new mapbox.Map({
				container,
				style: mapStyle,
				center: [0, 0],
				zoom: 9
			});
			map.scrollZoom.disable();
			map.fitBounds(bounds, { animate: false, padding: 10 });
			mapBounds = map.getBounds();
		};

		document.head.appendChild(link);

		return () => {
			map.remove();
			link.parentNode.removeChild(link);
		};
	});

	// $: if (map) { map.style = scrollIndex === 1 ? 'mapbox://styles/mapbox/light-v10' : 'mapbox://styles/mapbox-map-design/ckhqrf2tz0dt119ny6azh975y' };

	const handleResize = () => {
		mapBounds = map.getBounds();
	}

	$: coordinates.update(() => {
		if (mapBounds._sw) {
			return [
				[mapBounds._sw.lat, mapBounds._ne.lat],
				[mapBounds._sw.lng, mapBounds._ne.lng]
			]
		}
	})

	const unsubscribeScroll = scroll.subscribe(({ index, progress }) => {
        scrollIndex = index;
        scrollProgress = progress;
    })

</script>

<style>
	div {
		position: absolute;
		width: 100vw;
		height: 100vh;
	}
</style>

<svelte:window on:resize={handleResize}/>

<div style="opacity: {scrollIndex === visibleIndex ? 1 : 0}" bind:this={container}>
	{#if map}
		<slot></slot>
	{/if}
</div>