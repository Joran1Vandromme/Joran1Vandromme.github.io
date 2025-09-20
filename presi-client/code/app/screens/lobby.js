//haalt de lokale clientstate op (o.a. isHost, clientId) om UI-beslissingen te nemen zoals Kick-knoppen verbergen
import { getState } from "../state.js";

export function initLobby() {
    // wire up buttons that exist on the lobby screen if needed later
}

export function renderPlayersFromSnapshot(snap) {
    const state = getState();

    // pakte de juiste DOM-elementen om de knoppen juist weer te geven
    const btnSettings  = document.getElementById("btnSettings");
    const btnStartGame = document.getElementById("btnStartGame");
    const btnNewGame   = document.getElementById("btnNewGame");

    //checkt of de knoppen enabled moeten zijn
    if (btnSettings)  btnSettings.disabled  = !state.isHost;
    if (btnStartGame) btnStartGame.disabled = !state.isHost;
    if (btnNewGame)   btnNewGame.disabled   = !state.isHost;

    //Pakt de benodigde DOM-elementen: de UL-lijst, het <template> voor één speler, en de roomcode-weergave. Haalt ook state op om host/zelf te kennen.
    const list = document.getElementById("playerList");
    const tpl  = document.getElementById("tplPlayerRow");
    const code = document.getElementById("roomCode");

    //Toont de roomcode (fallback “—” als snap of roomId ontbreekt). textContent is veilig tegen HTML-injectie.
    if (code) code.textContent = snap?.roomId || "—";

    //  veiligheidcheck**  eerst zeker zijn dat DOM er is
    if (!list || !tpl) return;

    // lijst altijd leegmaken. als er dan een geglitchte versie zou onstaan zijn door bv 2 mensen die samen leaven, dan neem je de foute player list niet over
    list.innerHTML = "";

    // als players ontbreekt, stop hier (geen crash / geen oude lijst)
    if (!snap?.players) return;

    //zonder lijst, template of spelers: stop. --> maakt de huidige playerlist leeg
    if (!list || !tpl || !snap?.players) return;
    list.innerHTML = "";

    for (const p of snap.players) { // voor elke speler in de players list van het snapshot object
        const li = tpl.content.firstElementChild.cloneNode(true); //Clone de template-inhoud en maak er een echte LI van
        li.dataset.playerId = p.id;                                     //Bewaar playerId op het element via data-player-id (handig voor later: kick, highlight, etc.)
        li.querySelector(".js-name").textContent = p.name;
        li.querySelector(".js-role").textContent = (p.id === snap.hostId ? "host" : "player");

        //Kick verbergen voor niet-hosts en voor jezelf (je mag jezelf niet kicken).
        const btnKick = li.querySelector(".js-kick");
        if (!state.isHost || p.id === state.clientId) btnKick.style.display = "none";
        // else: add kick click handler later
        list.appendChild(li);
    }
}
