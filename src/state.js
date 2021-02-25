import { writable } from 'svelte/store';

const coordinates = writable([[], []]);
const scroll = writable({
    index: 0,
    progress: 0
})

export { coordinates, scroll };