<!DOCTYPE html>

<html>
    <head>
        <meta charset="UTF-8">
        <title>OpenRisk</title>
        <link rel="stylesheet" href="cssjeu.css">
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
    </head>
<body>


<div id="map">

    <div id = menu>

        <div id = religion>
            <p id="religiontxt">50</p>
            <img id ="religionim" src = "./image/religion.png" width="80rem" alt = "logo religion">
        </div>

        <div id = peuple>
            <p id="peupletxt">50</p>
            <img id ="peupleim" src = "./image/peuple.png" width="80rem" alt = "logo religion">
        </div>

        <div id = armee>
            <p id="armeetxt">50</p>
            <img id ="armeeim" src = "./image/armee.png" width="80rem" alt = "logo religion">
        </div>

        <div id = argent>
            <p id="argenttxt">50</p>
            <img id ="argentim" src = "./image/argent.png" width="80rem" alt = "logo religion">
        </div>

        <div id="controls">
            <button id="resetButton" type="button">Reset</button>
        </div>

    </div>

    <div id="counterBox">
        <h3>Nombre de tour</h3>
        <p id="counterValue">0</p>
        <p id="turnLabel">Tour actuel : Équipe A</p>
        <button id="showEventButton" type="button">Afficher l'événement</button>
    </div>

    <button id="endTurnButton" type="button">Terminer le tour</button>

</div>




<script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>

<script src="scriptjeu.js"></script>

</body>
</html>