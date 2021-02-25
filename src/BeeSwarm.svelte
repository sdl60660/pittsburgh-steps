<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { coordinates, scroll } from './state.js';

    export let stepsData;

    let viz;
    let height;
    let width;
    let scrollIndex = 0;
    let scrollProgress = 0;

    let tooltip;
    let tooltipTop = 0;
    let tooltipLeft = 0;
    let tooltipVisible = false;
    let selectedImage = "";
    let selectedName = "";

    let usableChartData = stepsData.filter( d => d.number_of_steps !== "" && d.length !== "0" && d.length !== "");
    // const exampleIds = ["1025433108", "778711269", "870567808", "41759992"];
    // let examples = stepsData.filter( d => exampleIds.includes(d.id) );

    let latitudeBounds = d3.extent(stepsData, d => d.latitude);
    let longitudeBounds = d3.extent(stepsData, d => d.longitude);

    const heightAccessor = d => +d.number_of_steps*(7.5 / 12);
    const totalLength = stepsData.map(d => parseInt(d.length)).filter(d => ! isNaN(d)).reduce((a, b) => a + b, 0);
    const totalStepsHeight = usableChartData.map(d => heightAccessor(d)).reduce((a, b) => a + b, 0);

    // const everestHeight = 29032;
    const colorScale = d3.scaleLinear()
        .domain(d3.extent(usableChartData, d => heightAccessor(d) / +d.length))
        .range(["yellow", "red"])
    
    const unsubscribeCoordinates = coordinates.subscribe(coords => {
        if (coords) {
            latitudeBounds = coords[0];
            longitudeBounds = coords[1];
        }
	});

    const unsubscribeScroll = scroll.subscribe(({ index, progress }) => {
        scrollIndex = index;
        scrollProgress = progress;

        console.log(scrollIndex, scrollProgress);
    })

    $: padding = height / 4;
    $: scatterX = d3.scaleLinear()
        .domain([0, d3.max(usableChartData, d => +d.length)])
        .range([padding, width - padding])

    $: scatterY = d3.scaleLinear()
        .domain([0, d3.max(usableChartData, d => heightAccessor(d))])
        .range([height - padding, padding])

    $: geoY = d3.scaleLinear()
        .domain(latitudeBounds)
        .range([height, 0])

    $: geoX = d3.scaleLinear()
        .domain(longitudeBounds)
        .range([0, width])

    $: heightScale = d3.scaleLinear()
        .domain([0, totalStepsHeight])
        .range([0, height*.5])

    onMount(() => {
        d3.select(viz)
            // .attr("viewBox", [0, 0, width, height])
            .append("g")
            .attr("class", "step-markers")
            .selectAll("rect")
            .data(usableChartData, d => d.id)
            .join(
                enter => {
                    enter.append("rect")
                        .attr("class", "step-marker")
                        .attr("height", 7)
                        .attr("width", 7)
                        .style("opacity", 0.7)
                        .style("fill", d => colorScale(heightAccessor(d) / parseInt(d.length)) || "gray")
                        .style("stroke-width", 0)
                        .style("stroke", "black")
                        .on("mouseover", (e, d) => {
                            // selectedImage = `images/${d.id}.jpg`;
                            selectedImage = d.image;

                            tooltipTop = `${e.clientY - 10}px`;
                            tooltipLeft = `${e.clientX}px`

                            tooltipVisible = true;
                            selectedName = d.name;

                        })
                        .on("mouseout", (e, d) => {
                            tooltipVisible = false;
                        })
                }
            )
    })

    $: if (scrollIndex === 0) {
        const svg = d3.select(viz);

        d3.selectAll(".step-marker")
            .transition("dimension-plot")
            .attr("x", d => scatterX(d.length))
            .attr("y", d => scatterY(heightAccessor(d)))

        // X Axis
        const xAxis = d3.axisBottom()
            .scale(scatterX)
            .ticks(5);

        svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", `translate(0, ${height - padding + 10})`)
            .call(xAxis);
        
        // Y Axis
        const yAxis = d3.axisLeft()
            .scale(scatterY)
            .ticks(4);

        svg.append("g")
            .attr("class", "y-axis axis")
            .attr("transform", `translate(${padding}, 0)`)
            .call(yAxis);
    }
    $: if (scrollIndex === 1) {
            d3.select(viz).selectAll(".axis").remove();

            d3.selectAll(".step-marker")
                .transition("geo-plot")
                .duration(1000)
                .attr("x", d => geoX(d.longitude) - 3.5)
                .attr("y", d => geoY(d.latitude) - 3.5)
                .attr("width", 7)
                .attr("height", 7)
        }
    
    $: if (scrollIndex === 2) {
        d3.selectAll(".step-marker")
            .transition("change-shape")
                .duration(1000)
                .attr("width", d => heightScale(d.length))
                .attr("height", d => heightScale(heightAccessor(d)))
    }

</script>

<style>
    .figure {
        /* position: sticky; */
        /* background-color: green; */
        width: 100vw;
        height: 100vh;
        margin: 0;
    }

    .viz-tile {
        height: 100%;
        width: 100%;
    }

    .tooltip {
        position: absolute;
        top: 0;
    }

    .tooltip img {
        /* max-width: 150px; */
        height: auto;
    }
</style>

<figure class="figure" bind:clientWidth={width} bind:clientHeight={height}>
    <svg bind:this={viz} class="viz-tile"></svg>
    <div bind:this={tooltip} class="tooltip" style="opacity: {tooltipVisible ? 1 : 0}; top: {tooltipTop}; left: {tooltipLeft}; transform: translate(-50%, -100%);">
        <img width={150} src={selectedImage} alt={selectedName}>
    </div>
</figure>

