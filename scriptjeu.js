var equipeSelectionnee;
var pollIntervalId = null;
var gameOver = false;
var eventPending = false;



var width = 1656;
var height = 1173;



var map = L.map('map', {
    crs: L.CRS.Simple,
    preferCanvas: true
});


var bounds = [[0,0], [height, width]];
L.imageOverlay('./image/carte.png', bounds).addTo(map);
map.fitBounds(bounds);



var turnNumber = 1;
var currentTurnTeam = 'Equipe A';
var lastFetchedTurn = null;
var counterValueEl = document.getElementById('counterValue');
var turnLabelEl = document.getElementById('turnLabel');
var gridRects = {};
var MAX_TURNS = 30;



function choisirEquipe() {
    return new Promise(function(resolve) {
        var overlay = document.createElement('div');
        overlay.id = 'teamModalOverlay';
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.background = 'rgba(0, 0, 0, 0.65)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '9999';

        var modal = document.createElement('div');
        modal.style.background = '#ffeac4';
        modal.style.borderRadius = '16px';
        modal.style.padding = '24px';
        modal.style.boxShadow = '0 20px 50px rgba(0,0,0,0.25)';
        modal.style.textAlign = 'center';
        modal.style.minWidth = '280px';
        modal.style.fontFamily = 'Arial, sans-serif';

        var title = document.createElement('h2');
        title.textContent = 'Choisir une équipe';
        title.style.margin = '0 0 14px';
        title.style.fontSize = '1.3rem';
        modal.appendChild(title);

        var text = document.createElement('p');
        text.textContent = 'Cliquez sur l’équipe de votre choix pour commencer.';
        text.style.margin = '0 0 20px';
        text.style.color = '#333';
        modal.appendChild(text);

        ['Equipe A', 'Equipe B'].forEach(function(name, index) {
            var button = document.createElement('button');
            button.type = 'button';
            button.textContent = name;
            button.style.margin = index === 0 ? '0 8px 0 0' : '0';
            button.style.padding = '12px 16px';
            button.style.border = 'none';
            button.style.borderRadius = '10px';
            button.style.cursor = 'pointer';
            button.style.fontSize = '1rem';
            button.style.fontWeight = '600';
            button.style.minWidth = '110px';
            button.style.background = index === 0 ? '#d64541' : '#2f86eb';
            button.style.color = '#fff';

            button.addEventListener('click', function() {
                document.body.removeChild(overlay);
                resolve(name);
            });
            modal.appendChild(button);
        });

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    });
}


choisirEquipe().then(function(equipe) {
    equipeSelectionnee = equipe;
    console.log('Équipe sélectionnée :', equipeSelectionnee);
    fetchTurnInfo().then(function() {
        loadResources();
        startTurnPolling();
    });
    var resetButton = document.getElementById('resetButton');
    if (resetButton) {
        resetButton.addEventListener('click', resetGame);
    }
    var endTurnButton = document.getElementById('endTurnButton');
    if (endTurnButton) {
        endTurnButton.addEventListener('click', endTurn);
    }
    var showEventButton = document.getElementById('showEventButton');
    if (showEventButton) {
        showEventButton.addEventListener('click', function() {
            triggerRandomEvent();
        });
    }
});









function deriveTeamFromTurn(turn) {
    return turn % 2 === 1 ? 'Equipe A' : 'Equipe B';
}

function updateTurnDisplay() {
    if (counterValueEl) {
        counterValueEl.textContent = turnNumber;
    }
    if (turnLabelEl) {
        turnLabelEl.textContent = 'Tour actuel : ' + currentTurnTeam;
    }
}

function updateEventButton() {
    var showEventButton = document.getElementById('showEventButton');
    if (!showEventButton) return;

    if (gameOver) {
        showEventButton.disabled = true;
        showEventButton.textContent = 'Partie terminée';
        return;
    }

    var equipe = getTeamCode();
    var isActiveTeam = equipe === getTeamCodeFromTurn();

    if (!isActiveTeam) {
        showEventButton.disabled = true;
        showEventButton.textContent = 'Tour de l’autre équipe';
    } else if (!eventPending) {
        showEventButton.disabled = true;
        showEventButton.textContent = 'Événement fait';
    } else {
        showEventButton.disabled = false;
        showEventButton.textContent = 'Afficher l’événement';
    }
}

function updateEndButton() {
    var endTurnButton = document.getElementById('endTurnButton');
    if (!endTurnButton) return;

    var equipe = getTeamCode();
    var isActiveTeam = equipe === getTeamCodeFromTurn();

    if (gameOver) {
        endTurnButton.disabled = true;
        endTurnButton.textContent = 'Partie terminée';
        endTurnButton.style.opacity = '0.6';
        endTurnButton.style.cursor = 'default';
        return;
    }

    if (!isActiveTeam) {
        endTurnButton.disabled = true;
        endTurnButton.textContent = 'Tour de l’autre équipe';
        endTurnButton.style.opacity = '0.6';
        endTurnButton.style.cursor = 'default';
    } else if (eventPending) {
        endTurnButton.disabled = true;
        endTurnButton.textContent = 'Événement requis';
        endTurnButton.style.opacity = '0.6';
        endTurnButton.style.cursor = 'default';
    } else {
        endTurnButton.disabled = false;
        endTurnButton.textContent = 'Terminer le tour';
        endTurnButton.style.opacity = '1';
        endTurnButton.style.cursor = 'pointer';
    }
}

function getTeamCodeFromTurn() {
    return currentTurnTeam === 'Equipe A' ? 'a' : 'b';
}

function disableGame() {
    gameOver = true;
    if (pollIntervalId) {
        clearInterval(pollIntervalId);
        pollIntervalId = null;
    }
    var endTurnButton = document.getElementById('endTurnButton');
    if (endTurnButton) {
        endTurnButton.disabled = true;
        endTurnButton.textContent = 'Partie terminée';
        endTurnButton.style.opacity = '0.6';
        endTurnButton.style.cursor = 'default';
    }
}

function declareWinner(winnerTeam) {
    if (gameOver) return;
    disableGame();
    var label = winnerTeam === 'A' ? 'Equipe A' : winnerTeam === 'B' ? 'Equipe B' : winnerTeam;
    alert('equipe ' + label + ' gagne !');
    resetGame();
}

function countColoredCells() {
    var rouge = 0;
    var bleu = 0;
    Object.values(coordStates).forEach(function(etat) {
        if (etat === 'rouge') rouge++;
        if (etat === 'bleu') bleu++;
    });
    return { rouge: rouge, bleu: bleu };
}

function checkMaxTurnWinner() {
    if (gameOver || turnNumber <= MAX_TURNS) {
        return;
    }

    var counts = countColoredCells();
    if (counts.rouge === counts.bleu) {
        disableGame();
        alert('Égalité au bout de ' + MAX_TURNS + ' tours.');
        return;
    }

    var winner = counts.rouge > counts.bleu ? 'A' : 'B';
    fetch('./php/declare_winner.php?winner=' + winner)
        .then(parseJsonResponse)
        .then(function(data) {
            if (data.success) {
                declareWinner(data.winner);
            } else {
                console.error(data.error || 'Erreur en déclarant le vainqueur');
                declareWinner(winner);
            }
        })
        .catch(function() {
            declareWinner(winner);
        });
}

function checkGameOver(resources) {
    if (!resources || gameOver) {
        return;
    }

    var fields = ['arme', 'peuple', 'argent', 'religion'];
    for (var i = 0; i < fields.length; i++) {
        var key = fields[i];
        if (typeof resources[key] === 'number' && resources[key] < 0) {
            var loser = getTeamCode().toUpperCase();
            var winner = loser === 'A' ? 'B' : 'A';
            fetch('./php/declare_winner.php?winner=' + winner)
                .then(parseJsonResponse)
                .then(function(data) {
                    if (data.success) {
                        declareWinner(data.winner);
                        resetGame();
                    }
                });
            return;
        }
    }
}

function EventJoueurA() {
    eventPending = true;
    updateEventButton();
}

function EventJoueurB() {
    eventPending = true;
    updateEventButton();
}

function executeTurnEvent(resources) {
    return resources;
}

var randomEvents = [
    {
        title: 'Grande récolte',
        description: 'Les greniers débordent, vendre les quelques recources ?.',
        choices: [
            { text: 'Accepter', effect: { argent: 20, peuple: -10 } },
            { text: 'Refuser', effect: { argent: -10, peuple: 20 } }
        ]
    },
    {
        title: 'Grande récolte',
        description: 'Les greniers débordent, vendre les quelques recources ?.',
        choices: [
            { text: 'Accepter', effect: { argent: 20, peuple: -10 } },
            { text: 'Refuser', effect: { argent: -10, peuple: 20 } }
        ]
    },
    {
        title: 'Grande récolte',
        description: 'Les greniers débordent, vendre les quelques recources ?.',
        choices: [
            { text: 'Accepter', effect: { argent: 20, peuple: -10 } },
            { text: 'Refuser', effect: { argent: -10, peuple: 20 } }
        ]
    },
    {
        title: 'Trésor',
        description: 'Trésor découvert, le donner à l’église ?.',
        choices: [
            { text: 'Accepter', effect: { argent: -10, religion: 20 } },
            { text: 'Refuser', effect: { religion: -10, argent: 20 } }
        ]
    },
    {
        title: 'Pénurie de ressources',
        description: 'Les ressources se font rares, envoyer l’armée se battre pour en obtenir ?.',
        choices: [
            { text: 'Accepter', effect: { argent: +10, arme: -20, peuple: +10, religion: 10 } },
            { text: 'Refuser', effect: {  peuple: -20 } }
        ]
    },
    {
        title: 'Soutien populaire',
        description: 'Un groupe de villageois propose de vous aider.',
        choices: [
            { text: 'Accepter leur aide', effect: { peuple: 20, religion: -10 } },
            { text: 'Les ignorer', effect: { arme: 20, argent: 10 } }
        ]
    },
    {
        title: 'Jeanne d’Arc',
        description: 'Jeanne d’Arc veut rejoindre votre cause',
        choices: [
            { text: 'Accepter', effect: { argent: -10, arme: 20, peuple: 20 } },
            { text: 'Refuser', effect: { religion: 20, argent: 20 } }
        ]
    },
    {
        title: 'Épidémie sur le front',
        description: 'Une maladie foudroyante se propage sur le front de bataille, envoyez-vous de l’argent pour soigner les soldats ?',
        choices: [
            { text: 'Accepter d’envoyer', effect: { peuple: 10, arme: 20, argent: -20 } },
            { text: 'Ignorer', effect: { arme: -20, argent: +10 } }
        ]
    },
    {
        title: 'Tempête soudaine',
        description: 'Une tempête menace vos récoltes.',
        choices: [
            { text: 'Protéger les champs', effect: { peuple: 10, argent: -10 } },
            { text: 'Laisser faire', effect: { peuple: -10, argent: 10 } }
        ]
    }
];

function getRandomEvent() {
    return randomEvents[Math.floor(Math.random() * randomEvents.length)];
}

function triggerRandomEvent(team) {
    if (gameOver) {
        return;
    }
    var eventTeam = team || getTeamCodeFromTurn();
    if (eventTeam !== getTeamCode()) {
        return;
    }
    if (!eventPending) {
        return;
    }
    var eventData = getRandomEvent();
    showRandomEvent(eventData);
}

function getCurrentResources() {
    return {
        arme: parseInt(document.getElementById('armeetxt').textContent, 10) || 0,
        peuple: parseInt(document.getElementById('peupletxt').textContent, 10) || 0,
        argent: parseInt(document.getElementById('argenttxt').textContent, 10) || 0,
        religion: parseInt(document.getElementById('religiontxt').textContent, 10) || 0
    };
}

function applyResourceEffect(effect) {
    var equipe = getTeamCode();
    if (!equipe) {
        return;
    }

    var params = new URLSearchParams({ equipe: equipe });
    ['arme', 'peuple', 'argent', 'religion'].forEach(function(key) {
        if (effect[key] !== undefined) {
            params.set(key + 'Delta', effect[key]);
        }
    });

    return fetch('./php/update_resources.php?' + params.toString())
        .then(parseJsonResponse)
        .then(function(data) {
            if (data.success === false) {
                throw new Error(data.error || 'Erreur serveur');
            }
            updateResourceDisplay(data.resources);
        })
        .catch(function(error) {
            console.error(error);
        });
}

function showRandomEvent(eventData) {
    var overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(0, 0, 0, 0.7)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';

    var modal = document.createElement('div');
    modal.style.background = '#ffeac4';
    modal.style.borderRadius = '18px';
    modal.style.padding = '24px';
    modal.style.maxWidth = '420px';
    modal.style.width = '100%';
    modal.style.boxShadow = '0 20px 50px rgba(0, 0, 0, 0.25)';
    modal.style.fontFamily = 'Arial, sans-serif';

    var title = document.createElement('h2');
    title.textContent = eventData.title;
    title.style.marginTop = '0';
    title.style.marginBottom = '12px';
    modal.appendChild(title);

    var description = document.createElement('p');
    description.textContent = eventData.description;
    description.style.margin = '0 0 18px';
    modal.appendChild(description);

    var buttons = document.createElement('div');
    buttons.style.display = 'flex';
    buttons.style.gap = '12px';

    eventData.choices.forEach(function(choice) {
        var button = document.createElement('button');
        button.type = 'button';
        button.textContent = choice.text;
        button.style.flex = '1';
        button.style.padding = '12px 14px';
        button.style.border = 'none';
        button.style.borderRadius = '10px';
        button.style.cursor = 'pointer';
        button.style.fontWeight = '600';
        button.style.background = '#2f86eb';
        button.style.color = '#fff';

        button.addEventListener('click', function() {
            applyResourceEffect(choice.effect).then(function() {
                eventPending = false;
                updateEventButton();
                updateEndButton();
            });
            document.body.removeChild(overlay);
        });
        buttons.appendChild(button);
    });

    modal.appendChild(buttons);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

function fetchTurnInfo() {
    return fetch('./php/tour.php')
        .then(parseJsonResponse)
        .then(function(data) {
            if (data.success === false) {
                throw new Error(data.error || 'Erreur serveur');
            }
            if (data.winner) {
                declareWinner(data.winner);
                return false;
            }
            var previousTurn = lastFetchedTurn;
            lastFetchedTurn = turnNumber;
            turnNumber = data.tour || 1;
            currentTurnTeam = deriveTeamFromTurn(turnNumber);
            updateTurnDisplay();
            updateEndButton();
            updateEventButton();
            var turnStartedForLocalTeam = (previousTurn === null && getTeamCode() === getTeamCodeFromTurn()) || (previousTurn !== turnNumber && getTeamCode() === getTeamCodeFromTurn());
            if (turnStartedForLocalTeam) {
                if (currentTurnTeam === 'Equipe A') {
                    EventJoueurA();
                } else {
                    EventJoueurB();
                }
                updateEventButton();
            }
            return turnStartedForLocalTeam;
        })
        .catch(function(error) {
            console.error(error);
            return false;
        });
}

function pollTurnAndMap() {
    fetchTurnInfo().then(function(turnChanged) {
        fetchCoordStates().then(function(states) {
            coordStates = states;
            refreshGridDisplay();
            checkMaxTurnWinner();
            if (turnChanged) {
                loadResources();
            }
        });
    });
}

function startTurnPolling() {
    if (pollIntervalId) {
        clearInterval(pollIntervalId);
    }
    pollIntervalId = setInterval(pollTurnAndMap, 1000);
}

function resetGridDefaults() {
    coordStates = {};
    resetDefaultCases.red.forEach(function(key) {
        coordStates[key] = 'rouge';
    });
    resetDefaultCases.blue.forEach(function(key) {
        coordStates[key] = 'bleu';
    });

    refreshGridDisplay();
}

function endTurn() {
    if (gameOver) {
        return Promise.reject('Partie terminée.');
    }

    var equipe = getTeamCode();
    if (!equipe) {
        alert('Équipe non définie.');
        return Promise.reject('Équipe non définie.');
    }

    var endTurnButton = document.getElementById('endTurnButton');
    if (endTurnButton) {
        endTurnButton.disabled = true;
        endTurnButton.textContent = 'En attente...';
        endTurnButton.style.opacity = '0.6';
        endTurnButton.style.cursor = 'default';
    }

    if (eventPending) {
        if (endTurnButton) {
            endTurnButton.disabled = false;
            endTurnButton.textContent = 'Terminer le tour';
            endTurnButton.style.opacity = '1';
            endTurnButton.style.cursor = 'pointer';
        }
        alert('Vous devez afficher l’événement avant de terminer le tour.');
        return Promise.reject('Événement requis');
    }

    return fetch('./php/fin_tour.php?equipe=' + equipe)
        .then(parseJsonResponse)
        .then(function(data) {
            if (data.success === false) {
                throw new Error(data.error || 'Erreur serveur');
            }
            turnNumber = data.tour || turnNumber;
            currentTurnTeam = deriveTeamFromTurn(turnNumber);
            updateTurnDisplay();
            updateEndButton();
            updateEventButton();
            checkMaxTurnWinner();

            return fetchCoordStates();
        })
        .then(function(states) {
            coordStates = states;
            refreshGridDisplay();
            loadResources();
        })
        .catch(function(error) {
            alert(error.message || 'Impossible de terminer le tour');
            if (endTurnButton) {
                endTurnButton.disabled = false;
                endTurnButton.textContent = 'Terminer le tour';
                endTurnButton.style.opacity = '1';
                endTurnButton.style.cursor = 'pointer';
            }
        });
}

function refreshGridDisplay() {
    Object.keys(gridRects).forEach(function(key) {
        var rect = gridRects[key];
        var etat = coordStates[key] || 'transparent';
        rect.setStyle({
            fillColor: getColorFromEtat(etat),
            fillOpacity: etat === 'transparent' ? 0 : 0.5
        });
    });
}

var cellSize = 69;
var coordStates = {};
var resetDefaultCases = {
    red: ['4_14', '5_14', '6_14', '7_14', '8_14', '9_14', '10_14', '11_14', '12_14', '13_14', '14_14',
        '4_15', '5_15', '6_15', '7_15', '8_15', '9_15', '10_15', '11_15', '12_15', '13_15', '14_15',
        '4_16', '5_16', '6_16', '7_16', '8_16', '9_16', '10_16', '11_16', '12_16', '13_16', '14_16', '15_16',
        '4_13', '5_13', '6_13', '7_13', '8_13', '9_13', '10_13', '11_13', '12_13', '13_13', '14_13', '15_14', '15_13', '16_13',
        '4_12', '5_12', '6_12', '7_12', '8_12', '9_12', '10_12', '11_12', '12_12', '13_12', '14_12'
       

    ],
    blue: ['9_1', '10_1', '11_1', '12_1', '13_1', '14_1',
        '8_2','9_2', '10_2', '11_2', '12_2', '13_2', '14_2', '15_2',
        '8_3','9_3', '10_3', '11_3', '12_3', '13_3', '14_3', '15_3', '16_3','17_3',
        '9_4', '10_4', '11_4', '12_4', '13_4', '14_4', '15_4','16_4', '17_4',
        '9_5', '10_5', '11_5', '12_5', '13_5', '14_5', '15_5','16_5','17_5','18_5',
        '9_6', '10_6', '11_6', '12_6', '13_6', '14_6', '15_6','16_6','17_6',
        '9_7', '10_7', '11_7', '12_7', '13_7', '14_7', '15_7',
    ]
};

function stateKey(gridX, gridY) {
    return gridX + '_' + gridY;
}

function getNeighborKeys(gridX, gridY) {
    return [
        stateKey(gridX - 1, gridY),
        stateKey(gridX + 1, gridY),
        stateKey(gridX, gridY - 1),
        stateKey(gridX, gridY + 1)
    ];
}

function canCaptureAt(gridX, gridY, placementEtat) {
    if (placementEtat !== 'rouge' && placementEtat !== 'bleu') {
        return false;
    }

    var neighbors = getNeighborKeys(gridX, gridY);
    for (var i = 0; i < neighbors.length; i++) {
        var neighborEtat = coordStates[neighbors[i]];
        if (neighborEtat === placementEtat) {
            return true;
        }
    }
    return false;
}

function getColorFromEtat(etat) {
    if (etat === 'rouge') return 'red';
    if (etat === 'bleu') return 'blue';
    return 'transparent';
}

function getAllowedPlacementEtat() {
    if (equipeSelectionnee === 'Equipe A') return 'rouge';
    if (equipeSelectionnee === 'Equipe B') return 'bleu';
    return 'transparent';
}

function getPlacementLabel() {
    var etat = getAllowedPlacementEtat();
    return etat === 'rouge' ? 'Rouge' : 'Bleu';
}

function getTeamCode() {
    if (equipeSelectionnee === 'Equipe A') return 'a';
    if (equipeSelectionnee === 'Equipe B') return 'b';
    return '';
}

function updateResourceDisplay(resources) {
    if (!resources) return;
    var arme = document.getElementById('armeetxt');
    var peuple = document.getElementById('peupletxt');
    var argent = document.getElementById('argenttxt');
    var religion = document.getElementById('religiontxt');

    if (arme) arme.textContent = resources.arme;
    if (peuple) peuple.textContent = resources.peuple;
    if (argent) argent.textContent = resources.argent;
    if (religion) religion.textContent = resources.religion;

    checkGameOver(resources);
}

function parseJsonResponse(response) {
    return response.text().then(function(text) {
        if (!response.ok) {
            throw new Error('Erreur réseau ' + response.status + ': ' + (text || response.statusText));
        }
        try {
            return JSON.parse(text);
        } catch (err) {
            throw new Error('Réponse JSON invalide du serveur:\n' + text);
        }
    });
}

function loadResources() {
    var equipe = getTeamCode();
    if (!equipe) return;

    fetch('./php/joueur.php?equipe=' + equipe)
        .then(parseJsonResponse)
        .then(function(data) {
            if (data.success === false) {
                throw new Error(data.error || 'Erreur serveur');
            }
            updateResourceDisplay(data);
        })
        .catch(function(error) {
            console.error(error);
        });
}

function resetGame() {
    if (!confirm('Réinitialiser la carte, le nombre de tour et les ressources ?')) {
        return;
    }

    var equipe = getTeamCode();
    fetch('./php/reset.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                equipe: equipe,
                defaultRed: resetDefaultCases.red,
                defaultBlue: resetDefaultCases.blue
            })
        })
        .then(parseJsonResponse)
        .then(function(data) {
            if (data.success === false) {
                throw new Error(data.error || 'Erreur serveur');
            }

            
            fetchTurnInfo().then(function() {
                return fetchCoordStates();
            }).then(function(states) {
                coordStates = states;
                refreshGridDisplay();
            }).catch(function(error) {
                console.error('Erreur lors de la synchro après reset :', error);
            });

            if (data.resources) {
                updateResourceDisplay(data.resources);
            } else {
                loadResources();
            }
        })
        .catch(function(error) {
            alert(error.message || 'Impossible de réinitialiser');
        });
}

function fetchCoordStates() {
    return fetch('./php/coordonnee.php')
        .then(parseJsonResponse)
        .then(function(rows) {
            return rows.reduce(function(map, row) {
                map[stateKey(row.x, row.y)] = row.etat;
                return map;
            }, {});
        })
        .catch(function() {
            return {};
        });
}

function saveCoordState(gridX, gridY, etat) {
    var equipe = getTeamCode();
    if (!equipe) {
        return Promise.reject('Équipe non définie.');
    }

    return fetch('./php/save_coordonnee.php?x=' + gridX + '&y=' + gridY + '&etat=' + encodeURIComponent(etat) + '&equipe=' + equipe)
        .then(parseJsonResponse)
        .then(function(result) {
            if (!result.success) {
                return Promise.reject(result.error || 'Erreur lors de la sauvegarde');
            }

            coordStates[stateKey(gridX, gridY)] = etat;
            if (result.resources) {
                updateResourceDisplay(result.resources);
            }

            return result;
        });
}

function buildGrid() {
    var cols = Math.floor(width / cellSize);
    var rows = Math.floor(height / cellSize);

    for (let gridX = 0; gridX < cols; gridX++) {
        for (let gridY = 0; gridY < rows; gridY++) {
            var key = stateKey(gridX, gridY);
            var etat = coordStates[key] || 'transparent';
            var fillColor = getColorFromEtat(etat);
            var fillOpacity = fillColor === 'transparent' ? 0 : 0.5;
            var x = gridX * cellSize;
            var y = gridY * cellSize;

            let rect = L.rectangle([
                [y, x],
                [y + cellSize, x + cellSize]
            ], {
                color: 'black',
                weight: 1,
                fillColor: fillColor,
                fillOpacity: fillOpacity
            }).addTo(map);

            gridRects[key] = rect;

            // interaction
            rect.on('click', function(event) {
                if (gameOver) {
                    return;
                }
                if (event.originalEvent) {
                    event.originalEvent.stopPropagation();
                    event.originalEvent.preventDefault();
                }

                if (equipeSelectionnee !== currentTurnTeam) {
                    alert('Ce n’est pas ton tour.');
                    return;
                }

                var placementEtat = getAllowedPlacementEtat();
                var placementLabel = getPlacementLabel();
                var buttonColor = placementEtat === 'rouge' ? '#f56565' : '#4c7cf3';
                var popupContent = '<div style="display:flex; flex-direction:column; gap:6px; min-width:140px;">'
                    + '<button data-etat="' + placementEtat + '" type="button" style="padding:8px; border:1px solid #444; border-radius:4px; background:' + buttonColor + '; color:#fff; width:100%;">Placer ' + placementLabel + '</button>'
                    + '</div>';

                var popup = L.popup({
                    closeButton: true,
                    autoClose: true,
                    closeOnClick: false,
                    className: 'action-popup'
                })
                .setLatLng(event.latlng || rect.getBounds().getCenter())
                .setContent(popupContent)
                .openOn(map);

                popup.getElement().querySelectorAll('button').forEach(function(button) {
                    button.addEventListener('click', function(clickEvent) {
                        var newEtat = clickEvent.target.getAttribute('data-etat');
                        var currentEtat = coordStates[stateKey(gridX, gridY)];
                        if (newEtat === placementEtat && currentEtat !== placementEtat && !canCaptureAt(gridX, gridY, placementEtat)) {
                            alert('Capture impossible : choisissez une case adjacente à votre couleur.');
                            return;
                        }
                        saveCoordState(gridX, gridY, newEtat).then(function() {
                            return fetchCoordStates();
                        }).then(function(states) {
                            coordStates = states;
                            refreshGridDisplay();
                            updateTurnDisplay();
                            loadResources();
                        }).catch(function(error) {
                            alert(error || 'Impossible de capturer cette case.');
                        });
                    });
                });
            });
        }
    }
}

fetchCoordStates().then(function(states) {
    coordStates = states;
    buildGrid();
    updateTurnDisplay();
});

L.TileLayer.RepeatedImage = L.TileLayer.extend({
  getTileUrl: function(coords) {
    return './image/ocean.png';
  }
});

var layer = new L.TileLayer.RepeatedImage('', {
  tileSize: 512,
  noWrap: true,
  continuousWorld: false
}).addTo(map);
