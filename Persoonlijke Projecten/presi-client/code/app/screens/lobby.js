//haalt de lokale clientstate op (o.a. isHost, clientId) om UI-beslissingen te nemen zoals Kick-knoppen verbergen
import { getState } from "../state.js";
import { send } from "../socket.js";
import { initSettingsPanel, applySettingsHostMode, refreshSettingsUI } from "./settings.js";

export function initLobby(){

    // wire up buttons that exist on the lobby screen
    const btnLeave = document.getElementById("btnLeave");
    if (btnLeave) {
        // koppel de eventlistener apart; laat die de bijhorende functie aanroepen
        btnLeave.addEventListener("click", playerLeaveRoom);
    }

    // Event voor kick-knoppen (één listener voor de hele lijst)
    const list = document.getElementById("playerList");
    if (list) {
        list.addEventListener("click", onLobbyListClick);
    }

    // Settings knop toggelt het settings-venster
    const btnSettings = document.getElementById("btnSettings");
    const panel = document.getElementById("settingsPanel");
    if (btnSettings && panel) {
        btnSettings.addEventListener("click", () => {
            panel.hidden = !panel.hidden;
            if (!panel.hidden) {
                // zorg dat de zichtbare waarden 100% sync zijn wanneer je het paneel opent
                refreshSettingsUI();
            }
        });
    }

    // Start Game (voor nu placeholder)
    // Start Game
    const btnStart = document.getElementById("btnStartGame");
    if (btnStart) {
        btnStart.addEventListener("click", () => {
            const s = getState();
            if (!s.isHost) return;

            // require at least 3 players
            const count = document.getElementById("playerList")?.children.length || 0;
            if (count < 3) {
                alert("Need at least 3 players in the lobby to start the game.");
                return;
            }

            // ask server to start
            send("startGame", { roomId: s.roomId });
        });
    }

    // Wire the settings panel controls & initial host enablement
    initSettingsPanel();
}



// stuurt leaveRoom; socket blijft open zodat client later kan opnieuw joinen/maken
export function playerLeaveRoom() {
    const s = getState();
    // stuur leave (socket blijft open; je kan later opnieuw joinen/maken)
    if (s.roomId) send("leaveRoom", {roomId: s.roomId});
    else send("leaveRoom", {roomId: ""}); // defensief
}

/* click-handler op de lijst: vangt clicks op .js-kick knoppen op */
export function onLobbyListClick(e) {
    const btn = e.target.closest(".js-kick");
    if (!btn) return;

    const li = btn.closest("li");
    const targetId = li?.dataset.playerId;
    const s = getState();

    // Alleen host mag kicken; niet jezelf
    if (!s.isHost || !targetId || targetId === s.clientId) return;

    // Bevestiging tonen met de naam van de target
    const targetName = li?.querySelector(".js-name")?.textContent?.replace(" 👑", "") ?? "this player";
    if (!confirm(`Kick ${targetName}?`)) return;

    send("kickPlayer", { roomId: s.roomId, playerId: targetId });
}




export function renderPlayersFromSnapshot(snap) {
    const state = getState();

    // pakte de juiste DOM-elementen om de knoppen juist weer te geven
    const btnSettings  = document.getElementById("btnSettings");
    const btnStartGame = document.getElementById("btnStartGame");

    //checkt of de knoppen enabled moeten zijn (host-only)
    // Settings button blijft NU altijd enabled zodat non-hosts het paneel kunnen openen (read-only)
    if (btnSettings)  btnSettings.disabled  = false;
    if (btnStartGame) btnStartGame.disabled = !state.isHost;

    // disable/enable inputs inside settings panel as well
    applySettingsHostMode(state.isHost);

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

    const players = [...snap.players];
    players.sort((a, b) => {
        if (a.id === snap.hostId && b.id !== snap.hostId) return -1;
        if (b.id === snap.hostId && a.id !== snap.hostId) return 1;
        const me = getState().clientId;
        if (a.id === me && b.id !== me) return -1;
        if (b.id === me && a.id !== me) return 1;
        return a.name.localeCompare(b.name);
    });

    for (const p of players) { // voor elke speler in de players list van het snapshot object
        const li = tpl.content.firstElementChild.cloneNode(true); //Clone de template-inhoud en maak er een echte LI van
        li.dataset.playerId = p.id;                                     //Bewaar playerId op het element via data-player-id (handig voor later: kick, highlight, etc.)

        // --- mini patch: host markeren + eigen naam vet (via CSS) ---
        const nameEl = li.querySelector(".js-name");
        const roleEl = li.querySelector(".js-role");
        const btnKick = li.querySelector(".js-kick");

        const isHostPlayer = p.id === snap.hostId;
        roleEl.textContent = (isHostPlayer ? "host" : "player");

        // naam invullen + 👑 bij host
        nameEl.textContent = p.name + (isHostPlayer ? " 👑" : "");

        // eigen item markeren voor CSS (maakt jouw naam vet via style.css)
        if (p.id === state.clientId) {
            li.setAttribute("aria-current", "true");
        }
        // --- einde mini patch ---

        //Kick verbergen voor niet-hosts en voor jezelf (je mag jezelf niet kicken).
        if (!state.isHost || p.id === state.clientId) btnKick.style.display = "none";

        list.appendChild(li);
    }
}
