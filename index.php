<!DOCTYPE html>

<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OpenRisk</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/js/all.min.js"></script>
  <link rel="shortcut icon" href="./imgage/background-menu.png" type="image/x-icon">
  <link rel="stylesheet" href="style.css">
</head>

<body>
  <div class="chat-header">
    <button id="logo"><i class="fa-solid fa-house fa-lg"></i></button>
    <h2>JEU BINOME</h2>
    <button id="loginButton" class="login"><i class="fa-solid fa-circle-user fa-xl"></i></button>
  </div>


  <div id="chat-input">

  

    <div class="flexbox">
      <button class="tab-btn">JOUER</button>
      <button class="tab-btn">CREATE LOBBY</button>
      <button class="tab-btn">JOIN LOBBY</button>
      <button class="tab-btn">FRIENDS</button>
      <button class="tab-btn">PARAMETERS</button>
    </div>
    
    <div class="tab-container">
      <div class="tab-header">
        <button id="closeTabBtn"><i class="fa-solid fa-arrow-left"></i> Retour</button>
        <h3 id="tabTitle"></h3>
      </div>

      <div class="tab-content">
        <div class="map-selector">
          <span class="map-selector-label">SELECT YOUR MAP</span>
          
          <div class="map-selector-grid">
            <button class="maps-btn" onclick="window.location.href='./jeu.php'">
              <div class="flexbox"id="map1">
              </div>
              <span class="map-label">GUERRE DE 100 ANS</span>
            </button>

            <button class="maps-btn locked">
              <i class="fa-solid fa-lock"></i>
              <span class="map-label">LOCKED</span>
            </button>

            <button class="maps-btn locked">
              <i class="fa-solid fa-lock"></i>
              <span class="map-label">LOCKED</span>
            </button>

            <button class="maps-btn locked">
              <i class="fa-solid fa-lock"></i>
              <span class="map-label">LOCKED</span>
            </button>

            <button class="maps-btn locked">
              <i class="fa-solid fa-lock"></i>
              <span class="map-label">LOCKED</span>
            </button>

          </div>
        </div>
      </div>

      <div class="tab-content">
          <div class="map-selector-grid">
            <button class="maps-btn">
              <div class="flexbox"id="map1">
              </div>
              <span class="map-label">GUERRE DE 100 ANS</span>
            </button>

            <button class="maps-btn locked">
              <i class="fa-solid fa-lock"></i>
              <span class="map-label">LOCKED</span>
            </button>

            <button class="maps-btn locked">
              <i class="fa-solid fa-lock"></i>
              <span class="map-label">LOCKED</span>
            </button>

            <button class="maps-btn locked">
              <i class="fa-solid fa-lock"></i>
              <span class="map-label">LOCKED</span>
            </button>
            
            <button class="maps-btn locked">
              <i class="fa-solid fa-lock"></i>
              <span class="map-label">LOCKED</span>
            </button>
          </div>
      </div>
      <div class="tab-content">JOIN LOBBY</div>
      <div class="tab-content">FRIENDS</div>
      <div class="tab-content">PARAMETERS</div>
    </div>
  </div>

  <div id="paraAide">
		  <button id="helpButton"><i class="fa-solid fa-circle-question fa-xl" style="color: white;"></i></button>
      <div id="footer">
        <a href="mailto:example@email.com">nous contacter</a>
        <a href="" target="_blank">condition d'utilisation</a>
        <a href="" target="_blank">confidentialité</a>
        <a href="" target="_blank">credits</a>
      </div>
		  <button id="settingsButton"><i class="fa-solid fa-gear fa-xl" style="color: white;"></i></button>
  </div>



  <script src="app.js"></script>

</body>
</html>