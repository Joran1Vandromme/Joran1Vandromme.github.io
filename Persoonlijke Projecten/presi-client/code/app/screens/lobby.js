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


function roleToClass(role) {
    if (!role) return "citizen";
    return role.toLowerCase();
}

function roleToLabel(role) {
    const map = {
        President: "President",
        Vice: "Vice",
        Citizen: "Citizen",
        Scum: "Scum",
    };
    return map[role] || "Citizen";
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

    const btnSettings  = document.getElementById("btnSettings");
    const btnStartGame = document.getElementById("btnStartGame");

    if (btnSettings)  btnSettings.disabled  = false;
    if (btnStartGame) btnStartGame.disabled = !state.isHost;

    applySettingsHostMode(state.isHost);

    const list = document.getElementById("playerList");
    const tpl  = document.getElementById("tplPlayerRow");
    const code = document.getElementById("roomCode");

    if (code) code.textContent = snap?.roomId || "—";
    if (!list || !tpl) return;

    list.innerHTML = "";
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

    for (const p of players) {
        const li = tpl.content.firstElementChild.cloneNode(true);
        li.dataset.playerId = p.id;

        const nameEl = li.querySelector(".js-name");
        const roleEl = li.querySelector(".js-role");
        const btnKick = li.querySelector(".js-kick");

        // --- New role pill ---
        const rolePill = document.createElement("span");
        rolePill.className = `role-pill ${roleToClass(p.role || "Citizen")}`;
        rolePill.textContent = roleToLabel(p.role || "Citizen");
        roleEl.textContent = (p.id === snap.hostId ? "host" : "player");

        // name + crown
        nameEl.textContent = p.name + (p.id === snap.hostId ? " 👑" : "");

        // Insert role pill before the name
        nameEl.parentNode.insertBefore(rolePill, nameEl);

        if (p.id === state.clientId) li.setAttribute("aria-current", "true");
        if (!state.isHost || p.id === state.clientId) btnKick.style.display = "none";

        list.appendChild(li);
    }
}

