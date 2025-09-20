// knoppen en input velden globaal definieren
let gameStatus;
let roomInput;
let nameInput;
let btnJoinRoom;
let btnStart;
let btnMakeRoom;

//de lengte van een geldige roomId
const roomIdLength = 6;

const state = {
    isHost: false,
    name: "",
    roomId: "",
    phase: "lobby", // later: "playing", "ended", ...
};

// setup wordt mee geladen met het openen van de website
const setup = () => {
    //link leggen tot de knoppen en input velden zodat ik later de waardes ervan kan uitlezen en aanpassen
    gameStatus = document.getElementById("status");
    roomInput  = document.getElementById("room");
    nameInput  = document.getElementById("playerName");
    btnJoinRoom    = document.getElementById("joinRoom");
    btnStart   = document.getElementById("start");
    btnMakeRoom = document.getElementById("makeRoom");

    //eventlisteners koppelen
    roomInput.addEventListener("input", roomInputChanged);
    btnJoinRoom.addEventListener("click", playerClickedJoinRoom);
    btnStart.addEventListener("click", playerClickedStart);
    btnMakeRoom.addEventListener("click", playerClickedMakeRoom);


    renderUI();
}



// helper om state te updaten + UI te refreshen
const setState = (patch) => {
    Object.assign(state, patch);
    renderUI();
};

// zet de UI in de juiste stand obv state
const renderUI = () => {
    // status tekst
    gameStatus.textContent = state.phase;

    // veranderd state.room naar wat er in het inputveld staat als wat in het inputveld staat 6charachters lang is
    if (roomInput.value.trim() !== state.roomId && state.roomId.length === roomIdLength) {
        roomInput.value = state.roomId; // houd veld in sync als we later automatisch invullen
    }

    // joinknop moet alleen enabled zijn als lengte klopt
    btnJoinRoom.disabled = (roomInput.value.trim().length !== roomIdLength);

    // startknop moet alleen enabled zijn voor host
    btnStart.disabled = !state.isHost;
};

// als de join button wordt geklikt
const playerClickedJoinRoom = () => {
    const name = nameInput.value.trim();
    const desiredRoom = roomInput.value.trim();

    if (!name) {
        alert("Please choose a username first.");
        nameInput.focus();
        return;
    }

    // hier moeten we nog bericht krijgen van de server of de room succesvol gejoined is indien ja, moeten we setstate doen met de juiste roomId


    console.log("Join room requested:", { name, desiredRoom });
}

const playerClickedMakeRoom = () => {
    const name = nameInput.value.trim();
    const generatedRoom = generateRoomId();

    if (!name) {
        alert("Please choose a username first.");
        nameInput.focus();
        return;
    }

    setState({ isHost: true, name, roomId: generatedRoom, phase: "lobby" });

    console.log("Make room requested by:", {name, generatedRoom});

}

// tijdelijke roomId generator (client-side)
// maakt een random string van 6 karakters uit letters/cijfers
const generateRoomId = (len = roomIdLength) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // geen 0 of O
    return Array.from({ length: len }, () =>
        chars[Math.floor(Math.random() * chars.length)]
    ).join("");
};

const playerClickedStart = () => {
    //hier komt later de logica voor het starten van de game
    console.log("Start requested");
}
//checked of het aantal charachters in het input veld van room ID wel evenveel is als de lengte van een roomID
const roomInputChanged = () => {
    const roomId = roomInput.value.trim();
    console.log("typing:", roomInput.value)
    renderUI();
}






window.addEventListener("load", setup);