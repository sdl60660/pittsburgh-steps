<script>
    import { onMount } from 'svelte';
    import * as d3 from 'd3';

    import { coordinates, scroll } from '../state.js';
    import { lineTransition } from '../utils'

    export let stepsData;
    export let populationData;
    export let imageData;

    let viz;
    let height;
    let width;
    let scrollIndex = 0;
    let scrollProgress = 0;
    let scrollDirection = "down";

    const mobileBreakpoint = 900;

    let tooltip;
    let tooltipTop = 0;
    let tooltipLeft = 0;
    let tooltipVisible = false;
    let selectedImage = "";
    let selectedName = "";
    $: imageSize = width < mobileBreakpoint ? 75 : 125;
    $: blockSize = width < mobileBreakpoint ? 4 : 7;

    stepsData = stepsData.sort((a, b) => +a.id - +b.id).sort((a, b) => a.image === "" ? 1 : b.image === "" ? -1 : 0 )
    let usableChartData = stepsData
        .filter( d => d.number_of_steps !== "" && d.length !== "0" && d.length !== "");
    let stepsWithImages = stepsData.filter(({ image }) => image );

    let latitudeBounds = d3.extent(stepsData, d => d.latitude);
    let longitudeBounds = d3.extent(stepsData, d => d.longitude);

    const heightAccessor = d => +d.number_of_steps*(7.5 / 12);
    const totalLength = stepsData.map(d => parseInt(d.length)).filter(d => ! isNaN(d)).reduce((a, b) => a + b, 0);
    const totalStepsHeight = stepsData.filter(d => d.number_of_steps > 0).map(d => heightAccessor(d)).reduce((a, b) => a + b, 0);

    const sortedGrades = usableChartData.filter(d => d.length > 40 && d.number_of_steps > 4).sort((a, b) => (heightAccessor(b) / +b.length) - (heightAccessor(a) / +a.length))
    const angleGradeData = [sortedGrades.find(d => d.id === "182210601"), sortedGrades[0], { number_of_steps: 2, length: 3.378, id: 'canton' }];
    const populationExamples = [populationData[populationData.length-1], populationData.slice().sort((a,b) => b.population - a.population)[0]];
    
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

    $: line = d3.line()
        .defined(d => !isNaN(d.population))
        .x(d => timeX(d.year))
        .y(d => timeY(d.population))

    $: padding = { horizontal: width < mobileBreakpoint ? 45 : width / 8, vertical: width < mobileBreakpoint ? height / 5 : height / 10 };
    $: shorterAxisLength = Math.min(height - (padding.vertical*2), width - (padding.horizontal*2))

    $: scatterX = scrollIndex === 4 ? 
        d3.scaleLinear()
            .domain([0, d3.max(usableChartData, d => +d.length)])
            .range([padding.horizontal, width - padding.horizontal])
        :
        d3.scaleLinear()
            .domain([0, d3.max(usableChartData, d => +d.length)])
            .range([padding.horizontal, shorterAxisLength+padding.horizontal]);

    $: scatterY = scrollIndex === 4 ? 
                d3.scaleLinear()
                    .domain([0, d3.max(usableChartData, d => +d.number_of_steps)])
                    .range([height - padding.vertical, padding.vertical])
                :
                d3.scaleLinear()
                    .domain([0, d3.max(usableChartData, d => +d.length)])
                    .range([height - padding.vertical, height - shorterAxisLength - padding.vertical])

    $: geoY = d3.scaleLinear()
        .domain(latitudeBounds)
        .range([height, 0])

    $: geoX = d3.scaleLinear()
        .domain(longitudeBounds)
        .range([0, width])
    
    const heightZoomFactor = 5;
    $: heightScaleZoom = d3.scaleLinear()
        .domain([0, totalStepsHeight / heightZoomFactor])
        .range([0, height - 2*padding.vertical])

    $: heightScale = d3.scaleLinear()
        .domain([0, totalStepsHeight])
        .range([0, height - 2*padding.vertical])

    $: yAxisHeightScale = d3.scaleLinear()
        .domain([0, totalStepsHeight])
        .range([height - padding.vertical, padding.vertical])
    
    $: yAxisHeightZoomScale = d3.scaleLinear()
        .domain([0, 2*(totalStepsHeight / heightZoomFactor)])
        .range([height - padding.vertical, padding.vertical - height])

    $: timeX = d3.scaleLinear()
        .domain(d3.extent(populationData, item => item.year))
        // .domain(d3.extent(stepsData.filter(item => item.year_built !== ""), item => item.year_built))
        .range([padding.horizontal, width - padding.horizontal])

    $: timeY = d3.scaleLinear()
        .domain([0, d3.max(populationData, item => item.population)])
        .range([ height-padding.vertical, padding.vertical ])

    const colorScale = d3.scaleLinear()
        .domain(d3.extent(usableChartData, d => heightAccessor(d) / +d.length))
        .range(["yellow", "red"])
        .unknown("gray")
    
    const qualityColorScale = d3.scaleLinear()
        .domain(d3.extent(stepsData, d => +d.overall_score))
        .range(["red", "white", "purple"])
        .unknown("gray")
    
    const stepsColorScale = d3.scaleLinear()
        .domain(d3.extent(stepsData.filter(d => d.number_of_steps), d => +d.number_of_steps))
        .range(["yellow", "red"])
        .unknown("gray")

    $: rows = Math.ceil( height / imageSize ) + 1;
    $: cols = Math.ceil( width / imageSize );

    onMount(() => {
        const svg = d3.select(viz);

        d3.selectAll(".step-image").style("opacity", 0.7);

        svg.append("g")
            .attr("class", "step-markers")
            .selectAll("rect")
            .data(stepsData, d => d.id)
            .join("rect")
                .attr("class", "step-marker")
                .attr("height", blockSize)
                .attr("width", blockSize)
                .style("opacity", 0.0)
                .style("fill", d => colorScale(heightAccessor(d) / parseInt(d.length)) || "gray")
                // .style("fill", d => qualityColorScale(d.overall_score))
                .style("stroke-width", 0)
                .style("stroke", "black")
                // .on("mouseover", (e, d) => {
                //     selectedImage = `images/compressed_images/${d.id}.jpg`;
                //     // selectedImage = d.image;

                //     tooltipTop = `${e.clientY - 10}px`;
                //     tooltipLeft = `${e.clientX}px`

                //     tooltipVisible = true;
                //     selectedName = d.name;

                // })
                // .on("mouseout", (e, d) => {
                //     tooltipVisible = false;
                // })
        
        svg.append("g")
            .attr("class", "y-axis axis");
        
        svg.append("g")
            .attr("class", "x-axis axis");

        const populationChart = svg.append("g")
            .attr("class", "population-chart")
        
        populationChart.append("text")
            .attr("class", "population-label label")
            .style("text-anchor", "end")
            .style("fill", "steelblue")
            .style("font-weight", "bold")
            .text("Population of Pittsburgh")
            
        populationChart.selectAll(".population-tip")
            .data(populationExamples)
            .join("text")
            .attr("class", "population-tip")
            .style("text-anchor", (d,i) => i === 0 && width > mobileBreakpoint ? "end" : "middle")
            .style("font-size", "0.75rem")
            .style("fill", "steelblue")
            .text(d => d3.format(",")(d.population))
        
        svg.append("text")
            .attr("class", "x-axis-label axis-label label")
            .style("text-anchor", "middle")
            .style("fill", "#333333")
        
        svg.append("text")
            .attr("class", "y-axis-label axis-label label")
            .style("text-anchor", "start")
            .style("fill", "#333333")

        svg.selectAll(".angle-line")
            .data(angleGradeData)
            .join("line")
            .attr("class", "angle-line angle-feature")
            .style("stroke-width", 1)
            .style("stroke", "#333")
            .style("stroke-dasharray", "5,2")
        
        svg.selectAll(".angle-tip")
            .data(angleGradeData)
            .join("text")
            .attr("class", "angle-tip angle-feature label")
            .attr("fill", "#333")
            .style("text-anchor", "middle")
            .text((d, i) => i === 2 ? 'Steepest U.S. Road' : `${d3.format(".0%")(1.0*heightAccessor(d) / d.length)} grade`)
            .style("display", "none")
        
        svg.selectAll(".angle-example")
            .data(angleGradeData)
            .join("rect")
            .attr("class", "angle-example angle-feature")
            .attr("x", 0)
            .attr("y", 0)
            .style("fill", d => `url(#${d.id})`)
            .attr("width", imageSize)
            .attr("height", imageSize)
            .style("rx", 5)
            .style("ry", 5)
            .style("stroke", "black")
            .style("stroke-width", "1px")
            .style("display", "none")
        
        svg.selectAll(".comparison-image")
            .data(imageData)
            .join("svg:image")
            .attr("class", "comparison-image")
            .attr("xlink:href", d => width < mobileBreakpoint ? d.mobile_image_link : d.image_link)
            .attr("x", width)
    })

    $: d3.select(".y-axis")
        .attr("transform", `translate(${padding.horizontal}, 0)`)
        .style("display", [4,5,6,7].includes(scrollIndex) ? "block" : "none");
    $: d3.select(".x-axis")
        .attr("transform", `translate(0, ${height - padding.vertical + 10})`)
        .style("display", [3,4,5].includes(scrollIndex) ? "block" : "none");

    $: d3.select(".x-axis-label")
        .transition()
        .duration(((scrollIndex === 5 && scrollDirection === "down") || (scrollIndex === 4 && scrollDirection === "up")) ? 1000 : 0 )
        .attr("x", scrollIndex === 3 ? (timeX.range()[0] + timeX.range()[1]) / 2 : (scatterX.range()[0] + scatterX.range()[1]) / 2)
        .attr("y", height - padding.vertical + 50)
        .style("display", [3,4,5].includes(scrollIndex) ? "block" : "none")
        .text( scrollIndex === 3 ? "Year Constructed" : "Length of Staircase (feet)")
    $: d3.select(".y-axis-label")
        .transition()
        .duration(((scrollIndex === 5 && scrollDirection === "down") || (scrollIndex === 4 && scrollDirection === "up")) ? 1000 : 0 )
        .attr("x", padding.horizontal + 10)
        .attr("y", scatterY.range()[1] + (width < mobileBreakpoint ? 10 : 10))
        .style("display", [4,5].includes(scrollIndex) ? "block" : "none")
        .text(scrollIndex === 4 ? "Number of Steps" : "Height of Staircase (feet)")


    $: xAxisScale = scrollIndex === 3 ? timeX : scatterX;
    $: yAxisScale = scrollIndex === 6 ? yAxisHeightZoomScale : scatterY;
    $: xAxis = d3.axisBottom()
        .scale(xAxisScale)
        .tickFormat(d3.format("d"))
        .ticks(4);
    $: yAxis = d3.axisLeft()
        .scale(yAxisScale)
        .tickFormat(d3.format(","))
        .ticks(4)
        // .ticks(scrollIndex === 6 ? 1 : 4)
        // .tickValues(scrollIndex === 6 ? [3000] : null)

    $: d3.select(".population-chart").style("display", scrollIndex === 3 ? "block" : "none");   
    $: d3.selectAll(".angle-feature").style("display", scrollIndex === 5 ? "block" : "none");
    $: d3.selectAll(".comparison-image").style("display", scrollIndex === 6 || scrollIndex === 7 ? "block" : "none")
    $: d3.selectAll(".step-image").style("opacity", scrollIndex > 1 ? 1.0 : 0.7);

    $: if (scrollIndex === 0) {
        const svg = d3.select(viz);

        svg.selectAll(".step-image")
            .transition()
            .duration(0)
            .attr("width", imageSize)
            .attr("height", imageSize)

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
            .attr("rx", 0)
            .attr("ry", 0)
            .style("opacity", 1.0)
            .transition()
            .duration(0)
            .style("fill", d => `url(#${d.id})`)    
    }

    $: if (scrollIndex === 1 || scrollIndex === 2) {
        const svg = d3.select(viz);
        const stepTransition = 1000;

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
            .attr("width", blockSize)
            .attr("height", blockSize)
            .attr("rx", blockSize / 2)
            .attr("ry", blockSize / 2)
            .style('opacity', 0.7)
            // .transition()
            // .duration(0)
            .style("fill", d => stepsColorScale(+d.number_of_steps))
            // .style("fill", d => colorScale(heightAccessor(d) / parseInt(d.length)) || "gray")
            // .on("end", function() { d3.selectAll(".step-marker").style("fill", d => colorScale(heightAccessor(d) / parseInt(d.length)) || "gray") })
    }

    $: if (scrollIndex === 3) {
        const svg = d3.select(viz);
        const blockTransitionTime = 1500;
        
        svg.selectAll(".step-marker")
            .style("display", d => d.year_built !== "" ? "block" : "none")
            .style("opacity", d => d.year_built !== "" ? 0.7 : 0.0)
            .transition()
                .duration(blockTransitionTime)
                .attr("rx", 0)
                .attr("ry", 0)
                .style("fill", d => stepsColorScale(+d.number_of_steps))
                // .style("fill", d => colorScale(heightAccessor(d) / parseInt(d.length)))
                .attr("width", width < mobileBreakpoint ? 3 : blockSize)
                .attr("height", width < mobileBreakpoint ? blockSize*1.5 : blockSize)
                .attr("x", d => d.year_built === "" ? width / 2 : timeX(d.year_built))
                // .attr("y", d => timeY(d.year_index))
                .attr("y", d => d.year_built === "" ? height - padding.vertical - 10 : height - padding.vertical - (d.year_index)*(width < mobileBreakpoint ? blockSize*1.5 : blockSize))
        
        svg.select(".population-chart").selectAll(".population-line")
            .data([populationData])
            .join("path")
            .attr("class", "population-line")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", line)
            .call(lineTransition, blockTransitionTime);

        svg.select(".population-label")
            .style("opacity", 0.0)
            .attr("x", timeX(populationData.reverse()[0].year))
            .attr("y", timeY(populationData.reverse()[0].population) + 40)
            .transition()
            .delay(blockTransitionTime)
            .style("opacity", 1.0)
        
        svg.selectAll(".population-tip")
            .style("opacity", 0.0)
            .attr("x", d => timeX(d.year))
            .attr("y", d => timeY(d.population) - 15)
            .transition()
            .delay(blockTransitionTime + 500)
            .style("opacity", 1.0);
        
        // X Axis  
        svg.select(".x-axis")
            .call(xAxis);
    }
    
    $: if (scrollIndex === 4 || scrollIndex === 5) {
        const svg = d3.select(viz);
        const blockTransitionTime = 1000;

        svg.selectAll(".step-marker")
            .style("display", d => d.number_of_steps !== "" && d.length !== "0" && d.length !== "" ? "block" : "none")
            .attr("rx", 0)
            .attr("ry", 0)
            .transition()
            .duration(blockTransitionTime)
            .style("fill", d => colorScale(heightAccessor(d) / parseInt(d.length)))
            .style("opacity", 0.7)
            .attr("x", d => scatterX(d.length))
            .attr("y", d => scatterY(scrollIndex === 4 ? d.number_of_steps : heightAccessor(d)) - (blockSize / 2))
            .attr("width", blockSize)
            .attr("height", blockSize)

        // X Axis  
        svg.select(".x-axis")
            .transition()
            .duration(((scrollIndex === 5 && scrollDirection === "down") || (scrollIndex === 4 && scrollDirection === "up")) ? blockTransitionTime : 0 )
            .call(xAxis);
        
        // Y Axis
        svg.select(".y-axis")
            // .call(d3.axisLeft().scale(dummyYScale).ticks(0))
            .transition()
            .duration((scrollIndex === 5 && scrollDirection === "up") ? 0 : blockTransitionTime)
            .call(yAxis);

    }

    $: if (scrollIndex === 5) {
        const svg = d3.select(viz);
        const lineEndLength = width > mobileBreakpoint ? 1250 : 1025;

        svg.selectAll(".angle-line")
            .attr("x1", scatterX(0))
            .attr("y1", scatterY(0))
            .attr("x2", scatterX(0))
            .attr("y2", scatterY(0))
            .transition()
            .delay(1000)
            .duration(1000)
            .attr("x2", d => scatterX(d.length * (lineEndLength / d.length)))
            .attr("y2", d => scatterY(heightAccessor(d) * (lineEndLength / d.length)))
        
        svg.selectAll(".angle-example")
            .attr("width", imageSize)
            .attr("height", imageSize)
            .style("opacity", 0)
            .attr("x",  d => scatterX(d.length * (lineEndLength / d.length)) + 5)
            .attr("y", d => scatterY(heightAccessor(d) * (lineEndLength / d.length)) - imageSize + 8)
            .transition()
            .delay(2000)
            .style("opacity", 1.0);
        
        svg.selectAll(".angle-tip")
            .style("opacity", 0)
            .attr("transform", d => {
                const translateX = scatterX((d.length * (lineEndLength / d.length)) * 0.9);
                const translateY = scatterY((heightAccessor(d) * (lineEndLength / d.length)) * 0.9) - 8;

                const slope = (1.0*heightAccessor(d) / d.length)
                const rotationAngle =  -1*Math.atan(slope) / Math.PI * 180;

                return `translate(${translateX}, ${translateY}) rotate(${rotationAngle})`;
            })
            .style("text-anchor", "end")
            .transition()
            .delay(2000)
            .style("opacity", 1);
            
    }
 
    let totalHeight = 0;
    $: if (scrollIndex === 6 && scrollDirection === "down") {
        const svg = d3.select(viz);

        // Y Axis
        svg.select(".y-axis")
            .transition()
            .call(yAxis)
            .transition()
            .delay(2000)
            .duration(800)
            .call(d3.axisLeft()
                .scale(yAxisHeightScale)
                .tickFormat(d3.format(","))
                // .ticks(1)
            );
        
        svg.selectAll(".step-marker")
            .style("display", d => d.number_of_steps !== "" ? "block" : "none")
            .transition()
                .duration(1000)
                .style("fill", d => colorScale(heightAccessor(d) / parseInt(d.length)))
                .attr("width", d => heightScaleZoom(d.length))
                .attr("height", d => heightScaleZoom(heightAccessor(d)))
                .attr("x", padding.horizontal + 3)
                .attr("y", (d, i) => {
                    const stepY = height - padding.vertical - heightScaleZoom(heightAccessor(d)) - heightScaleZoom(totalHeight);
                    totalHeight = i === 0 ? heightAccessor(d) : totalHeight + heightAccessor(d);
                    return stepY;
                })
                .transition()
                .delay(1000)
                .duration(1000)
                .attr("width", d => heightScale(d.length))
                .attr("height", d => heightScale(heightAccessor(d)))
                .attr("y", (d, i) => {
                    const stepY = height - padding.vertical - heightScale(heightAccessor(d)) - heightScale(totalHeight);
                    totalHeight = i === 0 ? heightAccessor(d) : totalHeight + heightAccessor(d);
                    return stepY;
                })

        const marginMultiplier = width < mobileBreakpoint ? width / 10 : width / 10;
        svg.selectAll(".comparison-image")
            .attr("y", d => height - padding.vertical - heightScaleZoom(+d.height))
            .attr("x", width)
            .attr("height", d => heightScaleZoom(+d.height))
            .transition("slide-in")
            .delay((d, i) => i*2000)
            .duration(1200)
                .attr("x", (d,i) => d.name === "Mt. Everest" ? padding.horizontal + (i+1)*marginMultiplier : padding.horizontal + heightZoomFactor*(i+1)*marginMultiplier)
                .attr("y", d => d.name === "Mt. Everest" ? height - padding.vertical - heightScale(+d.height) : height - padding.vertical - heightScaleZoom(+d.height))
                .attr("height", d => d.name === "Mt. Everest" ? heightScale(+d.height) : heightScaleZoom(+d.height))
            .transition("re-scale")
            .delay((d, i) => 1000-(i*1000))
            .duration(1000)
                .attr("x", (d,i) => padding.horizontal + (i+1)*marginMultiplier)
                .attr("y", d => height - padding.vertical - heightScale(+d.height))
                .attr("height", d => heightScale(+d.height))


    }

</script>

<style>
    .figure {
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
        background-color: rgba(255, 255, 255, 0.9);
        padding: 1rem;
        font-size: 0.9rem;
        z-index: 101;
    }

    .tooltip img {
        /* max-width: 150px; */
        height: auto;
    }

    :global(.step-marker) {
        /* cursor: crosshair; */
    }

    :global(.label) {
        font-size: 0.9rem; 
        font-family: 'Roboto', 'Inter'
        /* font-family: "Atlas Grotesk Web", sans-serif; */
    }
    @media only screen and (max-width: 900px) {
        :global(.label) {
            font-size: 0.8rem;
        }
    }
</style>

<figure class="figure" bind:clientWidth={width} bind:clientHeight={height}>
    <svg bind:this={viz} class="viz-tile">
        <defs>
            {#each stepsWithImages as { image, id }, i}
                <pattern patternUnits={"objectBoundingBox"} height={1} width={1} class={"step-image-pattern"} key={i} {id}>
                    <image href={`images/compressed_images/${id}.jpg`} id={`${id}-photo`} class={"step-image"} x={0} y={0} width={imageSize} height={imageSize} />
                </pattern>
            {/each}
            <pattern patternUnits={"objectBoundingBox"} height={1} width={1} class={"step-image-pattern"} key={'canton'} id={'canton'}>
                <image href={`images/compressed_images/canton.jpg`} id={`canton-photo`} class={"step-image"} x={0} y={0} width={imageSize} height={imageSize} />
            </pattern>
        </defs>
    </svg>
    <div bind:this={tooltip} class="tooltip" style="opacity: {tooltipVisible ? 1 : 0}; top: {tooltipTop}; left: {tooltipLeft}; transform: translate(-50%, -100%);">
        <!-- <img width={150} src={selectedImage} alt={selectedName}> -->
        <!-- <p>{selectedName}</p> -->
    </div>
</figure>

