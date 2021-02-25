<script>
    import * as d3 from 'd3';
    import { onMount } from 'svelte';
    import scrollama from 'scrollama';
    import "intersection-observer";

    import { scroll } from './state';
    import BeeSwarm from './BeeSwarm.svelte';
    import CustomMap from './CustomMap.svelte';
    
    let dataLoad = d3.csv("data/pittsburgh_steps.csv").then(data => {
        return data;
        // return data.filter( d => d.number_of_steps !== "" && d.length !== "0" && d.length !== "");
    })
    let scrollIndex = 0;
    let scrollProgress = 0;

    const getDataBounds = (data) => {
        return [
            [d3.min(data, d => d.longitude), d3.min(data, d => d.latitude)],
            [d3.max(data, d => d.longitude), d3.max(data, d => d.latitude)]
        ]
    }

    onMount(() => {

        // instantiate the scrollama
        const scroller = scrollama();

        // setup the instance, pass callback functions
        scroller
            .setup({
                step: ".step",
                offset: 0.9,
                progress: true,
                threshold: 4
            })
            .onStepProgress(({ element, index, progress }) => {
                scrollProgress = progress;
            })
            .onStepEnter(({ element, index, direction }) => {
                scrollIndex = index;
            })
            .onStepExit((response) => {
                // { element, index, direction }
            });

        // setup resize event
        window.addEventListener("resize", scroller.resize);

    })

    $: scroll.update(current => {
        return {
            index: scrollIndex,
            progress: scrollProgress
        }
    })

</script>

<style>
    .wrapper {
        height: 300vh;
    }

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

<section class="wrapper">
    <figure>
        {#await dataLoad}
            <p>Loading data...</p>
        {:then data}
            <CustomMap bounds={getDataBounds(data)}/>
            <BeeSwarm stepsData={data} />
        {/await}
    </figure>

    <article>
        <div class="step">1</div>
        <div class="step">2</div>
        <div class="step">3</div>
    </article>
</section>