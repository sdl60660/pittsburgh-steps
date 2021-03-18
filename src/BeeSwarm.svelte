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
    let scrollDirection = "down";

    let tooltip;
    let tooltipTop = 0;
    let tooltipLeft = 0;
    let tooltipVisible = false;
    let selectedImage = "";
    let selectedName = "";
    const imageSize = 125;

    stepsData = stepsData.sort((a, b) => a.image === "" ? 1 : b.image === "" ? -1 : 0 )
    let usableChartData = stepsData
        .filter( d => d.number_of_steps !== "" && d.length !== "0" && d.length !== "");
    let stepsWithImages = stepsData.filter(({ image }) => image );

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

    const unsubscribeScroll = scroll.subscribe(({ index, progress, direction }) => {
        scrollIndex = index;
        scrollProgress = progress;
        scrollDirection = direction;
    })

    $: padding = width / 6;
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
        .range([0, height * 10])

    $: timeX = d3.scaleLinear()
        .domain(d3.extent(stepsData.filter(item => item.year_built !== ""), item => item.year_built))
        .range([padding, width - padding])

    $: timeY = d3.scaleLinear()
        .domain(d3.extent(stepsData, item => item.year_index))
        .range([ height-padding, padding ])

    $: rows = Math.ceil( height / imageSize ) + 1;
    $: cols = Math.ceil( width / imageSize );

    onMount(() => {
        const svg = d3.select(viz);

        svg.append("g")
            .attr("class", "step-markers")
            .selectAll("rect")
            .data(stepsData, d => d.id)
            .join("rect")
                .attr("class", "step-marker")
                .attr("height", 7)
                .attr("width", 7)
                .style("opacity", 0.0)
                .style("fill", d => colorScale(heightAccessor(d) / parseInt(d.length)) || "gray")
                .style("stroke-width", 0)
                .style("stroke", "black")
                // .on("mouseover", (e, d) => {
                //     // selectedImage = `images/${d.id}.jpg`;
                //     selectedImage = d.image;

                //     tooltipTop = `${e.clientY - 10}px`;
                //     tooltipLeft = `${e.clientX}px`

                //     tooltipVisible = true;
                //     selectedName = d.name;

                // })
                // .on("mouseout", (e, d) => {
                //     tooltipVisible = false;
                // })
        
        svg.append("g")
            .attr("class", "y-axis axis")
        
        svg.append("g")
            .attr("class", "x-axis axis")
    })

    $: d3.select(".y-axis")
        .attr("transform", `translate(${padding}, 0)`)
        .style("display", [3].includes(scrollIndex) ? "block" : "none");
    $: d3.select(".x-axis")
        .attr("transform", `translate(0, ${height - padding + 10})`)
        .style("display", [2,3].includes(scrollIndex) ? "block" : "none");

    $: xAxisScale = scrollIndex === 2 ? timeX : scatterX;
    $: yAxisScale = scatterY
    $: xAxis = d3.axisBottom()
        .scale(xAxisScale)
        .tickFormat(d3.format("d"))
        // .ticks(5);
    $: yAxis = d3.axisLeft()
        .scale(yAxisScale)
        .ticks(4);
    
    


    $: if (scrollIndex === 0) {
        const svg = d3.select(viz);

        svg.selectAll(".step-image")
            .attr("width", imageSize)
            .attr("height", imageSize)

        svg.style("opacity", 0.7);
        svg.selectAll(".step-marker")
            .transition()
            .duration(scrollDirection === "up" ? 1000 : 0)
            .attr("width", imageSize)
            .attr("height", imageSize)
            .attr("x", (d, i) => {
                return imageSize * Math.floor(i / rows);
            })
            .attr("y", (d, i) => {
                return imageSize * ( i % rows);
            })
            .style("opacity", 1.0)
            .transition()
            .duration(0)
            .style("fill", d => `url(#${d.id})`)
                
    }


    $: if (scrollIndex === 1) {
        const svg = d3.select(viz);
        const stepTransition = 1000;

        // svg.selectAll(".axis").remove();

        svg.selectAll(".step-image")
            .transition()
            .ease(d3.easeCubicOut)
            .duration(stepTransition)
            .attr("width", 7)
            .attr("height", 7)

        svg.selectAll(".step-marker")
            .style("display", "block")
            .transition()
            .ease(d3.easeCubicOut)
            .duration((d, i) => {
                if ( scrollDirection === "down" ) {
                    return i > rows * cols ? 0 : stepTransition
                }
                else {
                    return stepTransition
                }      
            })
            .attr("x", d => geoX(d.longitude) - 3.5)
            .attr("y", d => geoY(d.latitude) - 3.5)
            .attr("width", 7)
            .attr("height", 7)
            .style('opacity', 0.7)
            // .transition()
            // .duration(0)
            .style("fill", d => colorScale(heightAccessor(d) / parseInt(d.length)) || "gray")
            // .on("end", function() { d3.selectAll(".step-marker").style("fill", d => colorScale(heightAccessor(d) / parseInt(d.length)) || "gray") })
 
        svg
            .transition()
            .duration(stepTransition)
            .style("opacity", 1.0);
    }

    $: if (scrollIndex === 2) {
        const svg = d3.select(viz);
        
        svg.selectAll(".step-marker")
            .style("display", d => d.year_built !== "" ? "block" : "none")
            .style("opacity", d => d.year_built !== "" ? 0.7 : 0.0)
            .transition()
                .duration(1500)
                .style("fill", d => colorScale(heightAccessor(d) / parseInt(d.length)) || "gray")
                .attr("width", 7)
                .attr("height", 7)
                .attr("x", d => d.year_built === "" ? width / 2 : timeX(d.year_built))
                // .attr("y", d => timeY(d.year_index))
                .attr("y", d => d.year_built === "" ? height - padding - 10 : height - padding - 7*(d.year_index))
        
        // X Axis  
        svg.select(".x-axis")
            .call(xAxis);
    }
    
    $: if (scrollIndex === 3) {
        const svg = d3.select(viz);
        // svg.selectAll(".axis").remove();

        svg.selectAll(".step-marker")
            .style("display", d => d.number_of_steps !== "" && d.length !== "0" && d.length !== "" ? "block" : "none")
            .transition()
            .duration(d => d.year_built === "" ? 1000 : 1000)
            .delay(d => d.year_built === "" ? 0 : 0)
            .style("opacity", 0.7)
            .attr("x", d => scatterX(d.length))
            .attr("y", d => scatterY(heightAccessor(d)))
            .attr("width", 7)
            .attr("height", 7)

        // X Axis  
        svg.select(".x-axis")
            .call(xAxis);
        
        // Y Axis
        svg.select(".y-axis")
            .call(yAxis);
    }
    
    let totalHeight = 0;

    $: if (scrollIndex === 4) {
        const svg = d3.select(viz);

        // svg.selectAll(".axis").remove();

        heightScale.range([0, height * 0.5])
        
        svg.selectAll(".step-marker")
            .style("display", d => d.number_of_steps !== "" ? "block" : "none")
            .transition()
                .duration(1500)
                .style("fill", d => colorScale(heightAccessor(d) / parseInt(d.length)) || "gray")
                .attr("width", d => heightScale(d.length))
                .attr("height", d => heightScale(heightAccessor(d)))
                .attr("x", width / 2 - 200)
                .attr("y", (d, i) => {
                    const stepY = height - padding - heightScale(heightAccessor(d)) - heightScale(totalHeight);
                    totalHeight = i === 0 ? heightAccessor(d) : totalHeight + heightAccessor(d);
                    return stepY;
                })
    }

    // $: if (scrollIndex === 4) {
    //     const svg = d3.select(viz);

    //     heightScale.range([0, height * 0.5])
        
    //     svg.selectAll(".step-marker")
    //         .transition()
    //             .duration(1500)
    //             .attr("height", d => heightScale(heightAccessor(d)))
    //             .attr("y", (d, i) => {
    //                 const stepY = height - padding - heightScale(heightAccessor(d)) - heightScale(totalHeight);
    //                 totalHeight = i === 0 ? heightAccessor(d) : totalHeight + heightAccessor(d);
    //                 return stepY;
    //             })
    // }

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

    /* .step-image {
        min-width: 100px;
        height: auto;
    } */
</style>

<figure class="figure" bind:clientWidth={width} bind:clientHeight={height}>
    <svg bind:this={viz} class="viz-tile">
        <defs>
            {#each stepsWithImages as { image, id }, i}
                <pattern patternUnits={"objectBoundingBox"} height={1} width={1} class={"step-image-pattern"} key={i} {id}>
                    <image href={`images/compressed_images/${id}.jpg`} id={`${id}-photo`} class={"step-image"} x={0} y={0} width={imageSize} height={imageSize} />
                </pattern>
            {/each}
        </defs>
    </svg>
    <div bind:this={tooltip} class="tooltip" style="opacity: {tooltipVisible ? 1 : 0}; top: {tooltipTop}; left: {tooltipLeft}; transform: translate(-50%, -100%);">
        <img width={150} src={selectedImage} alt={selectedName}>
    </div>
</figure>

