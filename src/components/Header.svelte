<script>

</script>

<style>
    .header {
        height: 6vh;
        max-height: 4rem;
	    min-height: 3rem;
        width: 100%;
        position: absolute;
        z-index: 100;
        background-color: rgba(224, 224, 224, 0.8);
        display: flex;
    }

    .header__main-site-link {
        align-self: center;
        margin-right: 3vw;
        position: absolute;
        right: 0vw;
    }

    .header__main-site-link button {
        background-color: rgba(48, 112, 196, 0.8);
        color: white;
        padding: 0.4rem 0.6rem;
        border-radius: 3px;
        font-size: 0.9rem;
        text-decoration: none;
        border-color: rgb(133, 133, 133);
        border-bottom-color: rgb(83, 83, 83);
        border-right-color: rgb(83, 83, 83);
        border-width: 2px;
        font: 400 13.3333px Arial;
    }
</style>

<div class="header">
    <div class={"header__main-site-link"}>
        <a href="https://bit.ly/main-project-site">
            <button>More Projects</button>
        </a>
    </div>
</div>