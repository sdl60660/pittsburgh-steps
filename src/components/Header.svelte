<script>
    import { scroll } from '../state.js';

    const mobileBreakpoint = 900;
    let width = 700;
    let scrollIndex = 0;

    const unsubscribeScroll = scroll.subscribe(({ index }) => {
        scrollIndex = index;
        console.log(scrollIndex);
    })
    
</script>

<style>
    .header {
        height: 6vh;
        max-height: 4rem;
	    min-height: 3rem;
        width: 12rem;
        position: fixed;
        z-index: 2;
        /* background-color: rgba(224, 224, 224, 0.8); */
        display: flex;
    }

    .header__main-site-link {
        /* align-self: center; */
        margin: auto;
        padding: 1rem;
        text-align: center;
        /* position: absolute; */
        /* right: 0vw; */
        
    }

    .header__main-site-link a {
        text-decoration-color: #333;
    }

    .header__main-site-link span {
        font-family: 'Montserrat';
        color: #333 !important;
        font-weight: 700;
        font-size: 1.5rem;
        -webkit-text-stroke-width: 0.8px;
        -webkit-text-stroke-color: white;   
    }

</style>

<svelte:window bind:innerWidth={width}/>

<div class="header" style="display: {(width > mobileBreakpoint && scrollIndex < 7 && scrollIndex > 0) ? 'block' : 'none'}">
    <div class={"header__main-site-link"}>
        <a href="https://bit.ly/main-project-site" target="_blank">
            <span>Main Site</span>
        </a>
    </div>
</div>