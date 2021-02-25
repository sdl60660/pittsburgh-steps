<script>
    import { Map, Geocoder, Marker, controls } from '@beyonk/svelte-mapbox'
    import { onMount } from 'svelte';

    export let bounds;

    let mapComponent;
    let height;
    let width;

    onMount(() => {
        mapComponent.fitBounds(bounds, { animate: false, padding: 0 });
        // mapComponent.setCenter([lng,lat],zoom) // zoom is optional
        // mapComponent.flyTo({center:[lng,lat]}) // documentation (https://docs.mapbox.com/mapbox-gl-js/example/flyto)
    })


    $: console.log(mapComponent);

</script>

<style>
    :global(.mapboxgl-map) {
        height: 100vh;
        width: 100vw;
        position: absolute !important;
    }
</style>

<Map
    accessToken="pk.eyJ1Ijoic2FtbGVhcm5lciIsImEiOiJja2IzNTFsZXMwaG44MzRsbWplbGNtNHo0In0.BmjC6OX6egwKdm0fAmN_Nw"
    bind:this={mapComponent}
    options={{ scrollZoom: false }}
    style="mapbox://styles/mapbox/light-v10"
    version="v2.1.1"
    >
    <!-- <NavigationControl /> -->
    <!-- <ScaleControl /> -->
</Map>