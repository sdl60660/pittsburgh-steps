<script>
    import * as d3 from 'd3';
    import { onMount } from 'svelte';
    import scrollama from 'scrollama';
    // import moment from 'moment';
    // import "intersection-observer";

    import { scroll } from './state';
    import BeeSwarm from './BeeSwarm.svelte';
    import BackgroundMap from './BackgroundMap.svelte';
    
    let yearIndexMap = new Map();

    const promises = [
        d3.csv("data/pittsburgh_steps.csv"),
        d3.csv("data/pittsburgh_population.csv")
    ];


    let dataLoad = Promise.all(promises).then(data => {
        data[0] = data[0].map(item => {
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
        padding: 0;
        max-width: 20rem;
        margin: 0 10rem 0 0;
    }

    .step {
        padding: 2rem;
        margin: 0 auto 100vh auto;
        background-color: rgba(0,0,0,0.2);
    }
</style>

<svelte:window on:resize={() => { scroller.resize() } }/>
<section class="wrapper">
    <figure>
        {#await dataLoad}
            <p>Loading data...</p>
        {:then data}
            <BackgroundMap bounds={getDataBounds(data[0])}/>
            <BeeSwarm stepsData={data[0]} populationData={data[1]} />
        {/await}
    </figure>

    <article>
        {#each [1,2,3,4,5,6,7] as index (index)}
            <div class="step">{index}</div>
        {/each}
    </article>
</section>