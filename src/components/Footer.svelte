<script>
    export let githubLink;
</script>

<style>
    .footer {
        font-size: 0.9rem;
        padding-top: 3rem;
        padding-bottom: 3rem;
        min-height: 10vh;
        font-family: "Helvetica Neue", helvetica, arial, sans-serif;
        margin: 0 auto 0 auto;

        width: 50rem;
        max-width: 55vw;  
    }
    @media screen and (max-width: 900px) {
        .footer {
            min-height: calc(100vh - 6rem);
            max-width: 83vw;
        }
    }

    @media only screen and  (max-width: 360px) {
        .footer p {
            font-size: 12px;
        }
    }

    .footer a {
        text-decoration: none;
    }

    .footer__section {
        margin-bottom: 2rem;
    }

    .icon-img {
        height: 14px;
        width: 14px;
        padding: 0px 2px;
        fill: white;
    }

    .footer hr {
        margin-bottom: 2rem;
    }

    a {
        color: rgb(113, 177, 240)
    }

</style>

<div class={"footer"}>
    <hr />
    <div class="footer__section">
        <p><strong>Visualization by <a target="_blank" href="https://www.samlearner.com">Sam Learner</a></strong> |
            <a target="_blank" href="mailto:learnersd@gmail.com"><img class="icon-img" src="/images/email.svg" alt="email link"/></a> |
            <a target="_blank" href="https://twitter.com/sam_learner"><img class="icon-img" src="/images/twitter.svg" alt="twitter link"/></a> |
            <a target="_blank" href="https://github.com/sdl60660"><img class="icon-img" src="/images/github.svg" alt="github link"/></a>
        </p>
        <p>
            Code and data for this project lives <a target="_blank" href={githubLink}>here</a>.
        </p> 
    </div>

    <div class="footer__section">
        <p>
            <strong>Sources</strong>
        </p>
        <p>
            All step data comes from the WPRDC's <a target="_blank" href="https://data.wprdc.org/dataset/city-steps">City Steps dataset</a>, 
            which depended on data collection efforts by University of Pittsburgh Professor Bob Regan, as well as data collected as part of 
            Pittsburgh's 2017 <a href="https://pittsburghpa.gov/citysteps/">Citywide Steps Assessment</a>. Pittsburgh historical 
            population numbers come from the U.S. Census.
        </p>
    </div>
    
    <div class="footer__section">
        <p>
            <strong>Notes</strong>
        </p>
        <p>
            Staircase height is not directly provided in the dataset and is instead calculated using number of stairs 
            and assuming a standard stair height of 7.5 inches.
        </p>
    </div>

    <p>Last Updated: March 2021</p>
</div>