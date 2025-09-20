/* Functie van messages.js:

Dient als een catalogus die bepaalt wat er moet gebeuren bij het ontvangen van elk
mogelijk type bericht van de server.


 */

import { setState } from "./state.js"; //zodat we de state van kunnen veranderen en UI refresh triggeren
import { showScreen } from "./router.js"; //nodig om te wisselen tussen lobby en home section
import { on } from "./socket.js";
import { renderPlayersFromSnapshot } from "./screens/lobby.js";

export function registerMessageHandlers() {
    // als we van de server een bericht met type: clientId krijgen. --> haal clientId uit data en geef mee aan de state
    on("clientId", ({ clientId }) => setState({ clientId }));

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
        renderPlayersFromSnapshot(snapshot);
    });

    // als we van de server een bericht met type: error --> error afhandeling
    on("error", ({ reason }) => alert(`Error: ${reason || "unknown"}`));
}
