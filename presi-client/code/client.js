// knoppen en input velden globaal definieren
let gameStatus;     // <span id="status"> op homescreen
let roomInput;      // <input id="room">
let nameInput;      // <input id="playerName">
let btnJoinRoom;    // <button id="joinRoom">
let btnMakeRoom;    // <button id="makeRoom">

// --- Lobby elements (SPA) ---
let elRoomCode;     // <span id="roomCode">
let elConnStatus;   // <div id="connStatus">
let btnSettings;    // <button id="btnSettings">
let btnStartGame;   // <button id="btnStartGame">
let btnNewGame;     // <button id="btnNewGame">
let btnLeave;       // <button id="btnLeave">
let elPlayerList;   // <ul id="playerList">
let elTplPlayerRow; // <template id="tplPlayerRow">

const roomIdLength = 6;

// === APP STATE (SPA) ===
const state = {
    isHost: false,
    name: "",
    roomId: "",
    phase: "home",        // "home" | "lobby" | later: "playing"
    clientId: "",         // assigned by server
};

// === WEBSOCKET (one socket for the whole SPA) ===
let ws = null;

const setup = () => {
    gameStatus  = document.getElementById("status");
    roomInput   = document.getElementById("room");
    nameInput   = document.getElementById("playerName");
    btnJoinRoom = document.getElementById("joinRoom");
    btnMakeRoom = document.getElementById("makeRoom");

    elRoomCode     = document.getElementById("roomCode");
    elConnStatus   = document.getElementById("connStatus");
    btnSettings    = document.getElementById("btnSettings");
    btnStartGame   = document.getElementById("btnStartGame");
    btnNewGame     = document.getElementById("btnNewGame");
    btnLeave       = document.getElementById("btnLeave");
    elPlayerList   = document.getElementById("playerList");
    elTplPlayerRow = document.getElementById("tplPlayerRow");

    roomInput.addEventListener("input", roomInputChanged);
    btnJoinRoom.addEventListener("click", playerClickedJoinRoom);
    btnMakeRoom.addEventListener("click", playerClickedMakeRoom);

    if (btnLeave) {
        btnLeave.addEventListener("click", () => {
            setState({ phase: "home", isHost: false, roomId: "" });
        });
    }
    if (btnStartGame) btnStartGame.addEventListener("click", () => {
        if (!state.isHost) return;
        console.log("Start Game requested");
        // later: ws.send(JSON.stringify({ type: "startGame", data: { roomId: state.roomId } }));
    });
    if (btnSettings) btnSettings.addEventListener("click", () => {
        if (!state.isHost) return;
        console.log("Open Game Settings");
    });
    if (btnNewGame) btnNewGame.addEventListener("click", () => {
        if (!state.isHost) return;
        console.log("New Game requested");
    });

    openSocket();
    renderUI();
};

// === SPA screen switcher ===
const showScreen = (id) => {
    document.querySelectorAll('section[id^="screen-"]').forEach(s => (s.hidden = true));
    const el = document.getElementById(id);
    if (el) el.hidden = false;
};

// helper om state te updaten + UI te refreshen
const setState = (patch) => {
    Object.assign(state, patch);
    renderUI();
};

const renderUI = () => {
    if (gameStatus) gameStatus.textContent = state.phase === "home" ? "home" : state.phase;

    if (btnJoinRoom && roomInput) {
        btnJoinRoom.disabled = (roomInput.value.trim().length !== roomIdLength);
    }

    if (elRoomCode) elRoomCode.textContent = state.roomId || "———";
    if (btnSettings)  btnSettings.disabled  = !state.isHost;
    if (btnStartGame) btnStartGame.disabled = !state.isHost;
    if (btnNewGame)   btnNewGame.disabled   = !state.isHost;

    if (state.phase === "lobby") {
        showScreen("screen-lobby");
        if (elConnStatus) {
            elConnStatus.textContent = ws && ws.readyState === WebSocket.OPEN ? "connected" : "connecting…";
        }
    } else {
        showScreen("screen-home");
    }
};

// === WebSocket openen (SPA: één keer) ===
const openSocket = () => {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        return;
    }
    const WS_URL = "ws://localhost:8080";
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
        console.log("✅ socket open:", WS_URL);
        if (elConnStatus) elConnStatus.textContent = "connected";
    };

    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        console.log("←", msg);

        if (msg.type === "clientId") {
            const clientId = msg.data.clientId;
            setState({ clientId });
            console.log("I am client:", clientId);
            return;
        }

        if (msg.type === "roomCreated") {
            const roomId = msg.data.roomId;
            const name   = nameInput.value.trim();
            setState({ isHost: true, name, roomId, phase: "lobby" });
            console.log("✅ room created:", roomId);
            return;
        }

        if (msg.type === "joined") {
            const roomId = msg.data.roomId;
            const name   = nameInput.value.trim();
            setState({ isHost: false, name, roomId, phase: "lobby" });
            console.log("✅ joined room:", roomId);
            return;
        }

        if (msg.type === "room") {
            // update lobby player list
            renderPlayersFromSnapshot(msg.data);
            return;
        }

        if (msg.type === "error") {
            alert(`Error: ${msg.data?.reason || "unknown"}`);
            return;
        }
    };

    ws.onclose = () => {
        console.log("❌ socket closed");
        if (elConnStatus) elConnStatus.textContent = "disconnected";
    };
    ws.onerror = (e) => console.log("❗ socket error", e);
};

const playerClickedJoinRoom = () => {
    const name = nameInput.value.trim();
    const desiredRoom = roomInput.value.trim().toUpperCase();

    if (!name) {
        alert("Please choose a username first.");
        nameInput.focus();
        return;
    }
    if (desiredRoom.length !== roomIdLength) {
        alert(`Room code must be ${roomIdLength} characters long.`);
        roomInput.focus();
        return;
    }
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        alert("Connecting… try again in a moment.");
        return;
    }

    ws.send(JSON.stringify({ type: "joinRoom", data: { roomId: desiredRoom, name } }));
    console.log("→ Join room requested:", { name, desiredRoom });
};



const playerClickedMakeRoom = () => {
    openSocket();
    const name = nameInput.value.trim();

    if (!name) {
        alert("Please choose a username first.");
        nameInput.focus();
        return;
    }
    if (!ws || ws.readyState !== WebSocket.OPEN) {
        alert("Connecting… try again in a moment.");
        return;
    }

    ws.send(JSON.stringify({ type: "createRoom", data: { name } }));
    console.log("→ Make room requested by:", { name });
};


const roomInputChanged = () => {
    renderUI();
};

const renderPlayersFromSnapshot = (snap) => {
    if (!snap || !Array.isArray(snap.players) || !elPlayerList || !elTplPlayerRow) return;

    elPlayerList.innerHTML = "";

    for (const p of snap.players) {
        const li = elTplPlayerRow.content.firstElementChild.cloneNode(true);
        li.dataset.playerId = p.id;
        li.querySelector("#tpl_name").textContent = p.name;
        li.querySelector("#tpl_role").textContent = p.id === snap.hostId ? "host" : "player";

        const btnKick = li.querySelector("#tpl_kick");
        if (!state.isHost || p.id === state.clientId) {
            btnKick.style.display = "none";
        } else {
            btnKick.addEventListener("click", () => {
                console.log("kick requested for", p.id);
                // later: ws.send(JSON.stringify({ type: "kickPlayer", data: { roomId: state.roomId, playerId: p.id } }));
            });
        }
        elPlayerList.appendChild(li);
    }
};

window.addEventListener("load", setup);
