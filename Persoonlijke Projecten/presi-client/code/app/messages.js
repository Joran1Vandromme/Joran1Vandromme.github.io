/* Functie van messages.js:

Dient als een catalogus die bepaalt wat er moet gebeuren bij het ontvangen van elk
mogelijk type bericht van de server.


 */

import { setState, getState } from "./state.js"; //zodat we de state van kunnen veranderen en UI refresh triggeren
import { refreshSettingsUI, applySettingsHostMode } from "./screens/settings.js";
import { showScreen } from "./router.js"; //nodig om te wisselen tussen lobby en home section
import { on } from "./socket.js";
import { renderPlayersFromSnapshot } from "./screens/lobby.js";
import { renderGameFromSnapshot } from "./screens/game.js";
import { showSlagPopup } from "./screens/game.js"; // make sure path matches your layout




export function registerMessageHandlers() {
    // als we van de server een bericht met type: clientId krijgen. --> haal clientId uit data en geef mee aan de state
    on("clientId", ({ clientId }) => {
        setState({ clientId }); // your existing code

        const s = getState();
        if (s.roomId && s.name) {
            // Try to rejoin the last known room with the same name.
            // - If the server didn’t restart: you’ll rejoin fine (as a player).
            // - If the server restarted: you'll receive error:room_not_found and remain on your current screen.
            send("joinRoom", { roomId: s.roomId, name: s.name });
        }
    });

    // als we van de server een bericht met type: roomCreated. --> zet deze speler als host, bewaar de meegegeven roomId, zet phase naar lobby en toon de lobby html section
    on("roomCreated", ({ roomId }) => {
        setState({ isHost: true, roomId, phase: "lobby" });
        showScreen("screen-lobby");
    });

    // als we van de server een bericht met type: joined. --> dwz dat de speler succesvol een room is gejoined, zet isHost false, bewaar roomId, zet phase lobby en toon lobby html section
    on("joined", ({ roomId }) => {
        setState({ isHost: false, roomId, phase: "lobby" });
        showScreen("screen-lobby");
    });

    // als we van de server een bericht met type: room. --> dit wordt gecalled telkens er een verandering aan de room gebeurt.
    // vb bij leaver, kick, nieuwe speler, ...  --> de server stuurt een snapshot door van de huidige room situatie
    //snapshot bevat :
    /*
    "roomId": "ABCD12",
     "hostId": "xyz123",
    "started": false,
    "players": [
      { "id": "xyz123", "name": "Alice" },
      { "id": "abc789", "name": "Bob" } ]

    dan zullen we met de functie renderFromSnapshot de spelerlijst opnieuw laden
     */
    on("room", (snapshot) => {
        // update lokale state zodat isHost klopt bij host-wissel
         const s = getState();
         const iAmHost = snapshot.hostId === s.clientId;
         // eigen naam uit snapshot bijwerken (optioneel maar handig)
         const me = snapshot.players?.find(p => p.id === s.clientId);
         setState({
             isHost: iAmHost,
             name: me?.name ?? s.name,
             // roomId uit snapshot als “bron van waarheid”
             roomId: snapshot.roomId
         });
          // daarna UI tekenen met de nieuwe state (host-knoppen worden correct ge-enable’d)
         renderPlayersFromSnapshot(snapshot);
    });

    on("left", ({ roomId }) => {
        // verlaat de room lokaal; socket blijft verbonden
        setState({isHost: false, roomId: "", phase: "home"});
        showScreen("screen-home");
    });

    on("kicked", ({ roomId }) => {
        // terug naar Home; verbinding blijft open
        setState({ isHost: false, roomId: "", phase: "home" });
        showScreen("screen-home");
        // (optioneel) alert("You were kicked from the lobby.");
    });

    on("settings", ({ roomId, settings }) => {
        // bewaar op de client; render UI accuraat voor host/non-host
        setState({ settings });
        refreshSettingsUI();
    });

    on("conn", ({ connected }) => {
        // status pill
        const el = document.getElementById("status");
        if (el) {
            el.textContent = connected ? "connected" : "disconnected";
            el.style.background = connected ? "#2e7d32" : "#000";
            el.style.color      = connected ? "#fff"     : "#76c85e";
        }

        const s = getState();

        // HOME: disable Make/Join when offline (+ A: join needs 6 chars)
        const btnMake   = document.getElementById("makeRoom");
        const btnJoin   = document.getElementById("joinRoom");
        const roomInput = document.getElementById("room");

        if (btnMake) btnMake.disabled = !connected;

        // helper so we can also call it from the input listener (B)
        const updateJoinEnabled = () => {
            if (!btnJoin) return;
            const code = (roomInput?.value ?? "").trim();
            const validCode = code.length === 6;     // rule: exactly 6 chars
            // A: depends on connection AND validity
            // B: this will be called on every input too
            const isConnectedNow =
                (document.getElementById("status")?.textContent === "connected");
            btnJoin.disabled = !isConnectedNow || !validCode;
        };

        // initial apply for current conn state (A)
        updateJoinEnabled();

        // B: keep join disabled/enabled while typing; avoid duplicate listeners
        if (roomInput && !roomInput.dataset.joinListenerAttached) {
            roomInput.addEventListener("input", updateJoinEnabled);
            roomInput.dataset.joinListenerAttached = "1";
        }

        // LOBBY:
        // - Start Game disabled if offline or not host
        const btnStart = document.getElementById("btnStartGame");
        if (btnStart) btnStart.disabled = !connected || !s.isHost;

        // - Keep Settings button enabled so everyone can view the panel,
        //   but make the panel controls read-only when offline or non-host.
        applySettingsHostMode(connected && s.isHost);
        // ensure visible values are in sync after the toggle
        refreshSettingsUI();

        // - Disable Kick buttons when offline (host-only action)
        const list = document.getElementById("playerList");
        if (list) {
            list.querySelectorAll(".js-kick").forEach(b => {
                b.disabled = !connected || !s.isHost;
            });
        }
    });

    on("gameStarted", (snap) => {
        setState({ phase: "playing" });
        showScreen("screen-game");
        renderGameFromSnapshot(snap);
    });

    on("game", (snap) => {
        // generic game-state update
        renderGameFromSnapshot(snap);
    });

    on("slagWon", (data) => {
        // data: { type, byId, byName, cards, value? }
        showSlagPopup(data);
    });

    // server tells all clients to return to the lobby (reason optional)
    on("backToLobby", (data) => {
        console.log("📥 backToLobby received:", data);

        try {
            // stop any visual timer if available
            if (typeof window.stopTurnTimerUI === "function") window.stopTurnTimerUI();

            // clear game state
            setState({ game: null, phase: "lobby" });

            // optional UX notice
            const reason = data?.reason || "unknown reason";
            if (typeof window.showTransientNotice === "function") {
                window.showTransientNotice(`Returned to lobby: ${reason}`);
            } else {
                console.log(`Returned to lobby: ${reason}`);
            }

            // show the lobby
            showScreen("screen-lobby");
        } catch (err) {
            console.error("backToLobby handler failed:", err);
            alert("An error occurred returning to lobby. Reloading...");
            location.reload();
        }
    });




    // als we van de server een bericht met type: error --> error afhandeling
    on("error", ({ reason, max }) => {
        if (reason === "room_full") {
            alert(`Room is full. Maximum ${max ?? 8} players allowed.`);
            return;
        }
        if (reason === "room_not_found") {
            alert("Room not found.");
            return;
        }
        if (reason === "bad_name") {
            alert("Please enter a valid name.");
            return;
        }
        if (reason === "not_host") {
            alert("Only the host can do that.");
            return;
        }
        if (reason === "player_not_in_room") {
            alert("Player is no longer in the room.");
            return;
        }
        // fallback
        console.warn("Server error:", reason);
    });
}
