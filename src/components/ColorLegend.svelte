<script>
    import { scroll } from '../state.js';

    let scrollIndex = 0;

    const unsubscribeScroll = scroll.subscribe(({ index }) => {
        scrollIndex = index;
    });

    $: displayStyling = scrollIndex > 0 && scrollIndex < 6 ? "display: grid;" : "display: none;";
    $: legendTitle = scrollIndex < 4 ? "Staircase Height" : "Staircase Grade";
    $: legendLabels = scrollIndex < 4 ? ["Shorter", "Taller"] : ["Flatter", "Steeper"];

</script>

<style>
    .legend {
        position: absolute;
        top: 10%;
        right: 10%;
        z-index: 100;

        background-color: rgba(255, 255, 255, 0.8);
        padding: 0.4rem 1rem 0.7rem 1rem;
        border-radius: 5px;
        
        height: 3rem;
        width: 15rem;

        display: grid;
        grid-template-columns: 2fr 3fr 3fr 2fr;
        align-items: center;
        
        row-gap: 0.2rem;
        column-gap: 0.5rem;
    }

    @media only screen and (max-width: 900px) {
        .legend {
            left: 50%;
            transform: translateX(-50%);
        }
    }

    .legend__title {
        grid-column: 1 / 5;
        margin: 0 auto;
    }
     
    .legend__rect {
        background-image: linear-gradient(to right, rgba(255, 255, 0, 0.7) , rgba(255, 0, 0, 0.7));
        width: 100%;
        margin: auto;
        height: 1rem;
        grid-column: 2 / 4;
    }

    .legend__label {
        font-size: 0.8rem;
        /* max-width: 3rem; */
        /* position: absolute; */
        /* bottom: 0.5rem; */
    }

    .legend__left-label {
        /* left: 0.5rem; */
        grid-column: 1 / 2;
        justify-self: right;
    }

    .legend__right-label {
        /* right: 0.5rem; */
        justify-self: left;
        grid-column: 4 / 5;
    }


</style>

<div class="legend" style={displayStyling}>
    <div class="legend__title">{legendTitle}</div>
    <div class="legend__label legend__left-label">{legendLabels[0]}</div>
    <div class="legend__rect"></div>
    <div class="legend__label legend__right-label">{legendLabels[1]}</div>
</div>