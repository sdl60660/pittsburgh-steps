<script>
    import * as d3 from 'd3';
    import { onMount } from 'svelte';
    import scrollama from 'scrollama';
    // import moment from 'moment';
    // import "intersection-observer";

    import { scroll } from './state';
    import BeeSwarm from './BeeSwarm.svelte';
    import Loader from './Loader.svelte';
    import BackgroundMap from './BackgroundMap.svelte';
    
    let yearIndexMap = new Map();

    const promises = [
        d3.csv("data/pittsburgh_steps.csv"),
        d3.csv("data/pittsburgh_population.csv"),
        d3.csv("data/image_data.csv")
    ];


    let dataLoad = Promise.all(promises).then(data => {
        data[0] = data[0].sort((a,b) => a.number_of_steps - b.number_of_steps).map(item => {
            const year = item.installed === "" ? "" : +item.installed.slice(0,4);
            const yearIndex = yearIndexMap.has(year) ? (yearIndexMap.get(year) + 1) : 0;
            yearIndexMap.set(year, yearIndex);

            return {
                    ...item,
                    year_built: year,
                    year_index: yearIndex
                }
        })

        data[1] = data[1].reverse();

        return data;
        // return data.filter( d => d.number_of_steps !== "" && d.length !== "0" && d.length !== "");
    })
    let scrollIndex = 0;
    let scrollProgress = 0;
    let scrollDirection = "down";
    const scroller = scrollama();

    const getDataBounds = (data) => {
        return [
            [d3.min(data, d => d.longitude), d3.min(data, d => d.latitude)],
            [d3.max(data, d => d.longitude), d3.max(data, d => d.latitude)]
        ]
    }

    onMount(() => {
        // setup the instance, pass callback functions
        scroller
            .setup({
                step: ".step",
                offset: 0.9,
                progress: false,
                // threshold: 4
            })
            .onStepProgress(({ element, index, progress }) => {
                scrollProgress = progress;
            })
            .onStepEnter(({ element, index, direction }) => {
                scrollIndex = index;
                scrollDirection = direction;
            })
            .onStepExit((response) => {
                // { element, index, direction }
            });
    })

    $: scroll.update(current => {
        scroller.resize();
        return {
            index: scrollIndex,
            progress: scrollProgress,
            direction: scrollDirection
        }
    })

</script>

<style>
    figure {
        position: sticky;
        left: 0;
        top: 0;
        width: 100%;
        margin: 0;
    }

    article {
        position: relative;
        padding-left: 0.5rem;
        max-width: 20rem;
        margin: 0 10rem 0 0;
    }

    @media screen and (max-width: 700px) {
        article {
            position: relative;
            padding: 0;
            max-width: 20rem;
            margin: 0 1rem 0 auto;
        }
    }

    .step {
        padding: 1rem 1rem;
        margin: 0 auto 100vh auto;
        background-color: rgba(255,255,255,0.9);
        border-radius: 5px;
        border: 1px solid black;
    }

    @media screen and (min-width: 700px) {
        .step {
            border-radius: unset;
            border-top-right-radius: 5px;
            border-bottom-right-radius: 5px;
            border: unset;
            border-left: 3px solid black;
        }
    }
</style>

<svelte:window on:resize={() => { scroller.resize() } }/>
<section class="wrapper">
    <figure>
        {#await dataLoad}
            <Loader />
        {:then data}
            <BackgroundMap bounds={getDataBounds(data[0])} visibleIndex={1} mapStyle={'mapbox://styles/mapbox/light-v10'}/>
            <BackgroundMap bounds={getDataBounds(data[0])} visibleIndex={2} mapStyle={'mapbox://styles/mapbox-map-design/ckhqrf2tz0dt119ny6azh975y'}/>
            <BeeSwarm stepsData={data[0]} populationData={data[1]} imageData={data[2]} />
        {/await}
    </figure>

    <article>
        {#each [...Array(8).keys()] as index (index)}
            <div class="step">{index}</div>
        {/each}
    </article>
</section>