<script>
    import * as d3 from 'd3';
    import { onMount } from 'svelte';
    import scrollama from 'scrollama';

    import { scroll } from '../state';
    import BeeSwarm from './BeeSwarm.svelte';
    import Loader from './Loader.svelte';
    import BackgroundMap from './BackgroundMap.svelte';
    import Header from './Header.svelte';
    import Footer from './Footer.svelte';
    import TitleCard from './TitleCard.svelte';
    import ColorLegend from './ColorLegend.svelte';

    import annotations from '../../public/data/annotation_text.json';
    
    let yearIndexMap = new Map();

    const dataFilePromises = [
        d3.csv("data/pittsburgh_steps.csv"),
        d3.csv("data/pittsburgh_population.csv"),
        d3.csv("data/image_data.csv")
    ];

    let dataLoad = Promise.all(dataFilePromises).then(data => {
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
                offset: 1.0,
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
        padding-left: 1rem;
        max-width: 25rem;
        margin: 0 10rem 0 0;
    }

    @media screen and (max-width: 900px) {
        article {
            position: relative;
            padding: 0;
            max-width: 20rem;
            margin: 0 auto 0 auto;
        }
    }

    .step {
        margin: 0 auto 0 auto;
        height: 100vh;
    }

    .card {
        padding: 1rem 1rem;
        background-color: rgba(255,255,255,0.9);
        border-radius: 3px;
        /* border: 1px solid black; */
        box-shadow: 4px 4px 3px rgba(80,80,80,0.5);
    }

    .step.phantom {
        height: 0;
        width: 0;
        opacity: 0;
        margin-bottom: 60vh;
    }

    @media screen and (min-width: 900px) {
        .card {
            border-radius: unset;
            border-top-right-radius: 5px;
            border-bottom-right-radius: 5px;
            border: unset;
            border-left: 3px solid black;
        }

        .step.step.phantom {
            margin-bottom: 80vh;
        }
    }

    .step:last-of-type {
        margin-bottom: 0;
    }

    .step p {
        margin: 0 !important;
    }

    /* .step:first-of-type {
        background-color: red;
        margin-top: -50vh;
        border: unset;
        border-radius: 5px;
        margin-left: 50vw;
        transform: translateX(-50%);
    } */

    .footer-section {
        background-color: #333;
        color: #f9f9f9;
    }

</style>

<svelte:window on:resize={() => { scroller.resize() } }/>

<!-- <Header /> -->
{#await dataLoad}
    <div />
{:then data}
    <TitleCard />
{/await}
<section class="wrapper">
    <figure>
        {#await dataLoad}
            <Loader />
        {:then data}
            <ColorLegend />
            <!-- <BackgroundMap bounds={getDataBounds(data[0])} visibleIndex={1} addTopo={false} mapStyle={'mapbox://styles/mapbox/light-v10'}/> -->
            <BackgroundMap bounds={getDataBounds(data[0])} visibleIndex={1} addTopo={true} mapStyle={'mapbox://styles/mapbox-map-design/ckhqrf2tz0dt119ny6azh975y'}/>
            <BackgroundMap bounds={getDataBounds(data[0])} visibleIndex={2} addTopo={true} mapStyle={'mapbox://styles/mapbox/light-v10'}/>
            <!-- <BackgroundMap bounds={getDataBounds(data[0])} visibleIndex={2} mapStyle={'mapbox://styles/mapbox/cjaudgl840gn32rnrepcb9b9g'}/> -->
            <BeeSwarm stepsData={data[0]} populationData={data[1]} imageData={data[2]} />
        {/await}
    </figure>

    <article>
        {#each annotations as { text }, i}
            <div class="step" class:phantom={i === 0 || i === (annotations.length - 1)} key={i}>
                <div class="card">
                    <p>{text}</p>
                </div>
            </div>
        {/each}
    </article>
</section>
<section class="footer-section">
    <Footer githubLink={"https://github.com/sdl60660/pittsburgh-steps"}/>
</section>