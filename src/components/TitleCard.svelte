<script>

import App from "./App.svelte";

</script>

<style>
    .title-card {
        position: absolute;
        top: 40vh;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 1rem 2rem;
        background-color: rgba(255, 255, 255, 0.88);
        border-radius: 5px;
        z-index: 100;
        width: 35rem;
        max-width: 80vw;
        box-shadow: 5px 3px 3px rgba(80, 80, 80, 0.5);
    }

    .title-card__content h1 {
        text-align: center;
    }

    @media only screen and (max-width: 900px) {
        .title-card {
            max-width: 75vw;
            top: 45vh;
        }

        .title-card__content h1 {
            font-size: 2.6rem;
        }
    }

    @media only screen and  (max-width: 425px) {
        .title-card__content h1 {
            font-size: 2.2rem;
        }
    }

    @media only screen and  (max-width: 375px) {
        .title-card__content h1 {
            font-size: 2rem;
        }
    }

    @media only screen and  (max-width: 325px) {
        .title-card__content h1 {
            font-size: 1.7rem;
        }
    }

    @media only screen and  (max-height: 670px) {
        .title-card {
            max-width: 75vw;
            top: 50vh;
        }
    }
</style>


<div class="title-card">
    <div class="title-card__content">
        <h1>Pittsburgh Steps</h1>
        <p>
            There are more than 800 sets of public outdoor stairways in Pittsburgh, more than any other city 
            in the United States. Along with over 400 bridges, they make life possible in a city built 
            into hills and rivers.
        </p>
        <p>
            The steps are used for exercise and exploration, but also form the backbone of many pedestrians' 
            commutes to school or work, particularly in lower- and middle-income areas. These stairways help 
            residents navigate the unusual urban landscape, moving along and between some of the steepest roads 
            in the world. The size, shape, conditions, and history of these stairways can be explored thanks 
            to data collection efforts by professor Bob Regan and a Steps Assessment undertaken by the city in 2017.
        </p>
    </div>
</div>