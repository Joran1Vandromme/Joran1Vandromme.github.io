import { openSocket } from "./socket.js";
import { registerMessageHandlers } from "./messages.js";
import { showScreen } from "./router.js";
import { subscribe } from "./state.js";
import { initHome } from "./screens/home.js";
import { initLobby } from "./screens/lobby.js";

window.addEventListener("load", () => {

    registerMessageHandlers(); //registreet alle type messages dat je van de server zou binnen kunnen krijgen
    openSocket(); //open de socket als die nog niet open is
    initHome();
    initLobby();

    // keep simple: show home by default; lobby shown by message handlers
    showScreen("screen-home");

    //subscribe(() => { /* update small bits if you want */ });
});