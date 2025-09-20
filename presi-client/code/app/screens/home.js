import { send } from "../socket.js"; // gebruik je om data te verpakken in type, data en dat naar de server te sturen

export function initHome() {
    const nameInput = document.getElementById("playerName");
    const roomInput = document.getElementById("room");
    const btnJoin   = document.getElementById("joinRoom");
    const btnMake   = document.getElementById("makeRoom");

    //zet de join knop enkel op enabled als de roomInput exact 6 charachters is
    const enableJoin = () => btnJoin.disabled = roomInput.value.trim().length !== 6;
    roomInput.addEventListener("input", enableJoin);
    enableJoin();

    /* leest, trimt en checkt dat de username niet leeg is
    verstuurt createRoom met { name }. De server antwoordt  met roomCreated → de message-handlers zetten daarna de UI naar  lobby-html
     */
    btnMake.addEventListener("click", () => {
        const name = nameInput.value.trim();
        if (!name) return alert("Choose a username first.");
        send("createRoom", { name });
    });

    /*Leest naam en roomcode; normaliseert roomcode naar uppercase (handig tegen “ab12cd” vs “AB12CD”).
      Valideert: naam verplicht, roomcode exact 6 tekens.
      Verstuurt joinRoom met { roomId, name }. Server antwoordt o.a. met joined en room (snapshot), waarna lobby rendert    */
    btnJoin.addEventListener("click", () => {
        const name = nameInput.value.trim();
        const roomId = roomInput.value.trim().toUpperCase();
        if (!name) return alert("Choose a username first.");
        if (roomId.length !== 6) return alert("Room code must be 6 chars.");
        send("joinRoom", { roomId, name });
    });
}
