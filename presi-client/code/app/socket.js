/* functie van socket.js:
Het beheert één WebSocket-verbinding voor de hele SPA en heeft een dispatcher: een Map van type → handler.
Binnenkomende berichten worden op basis van msg.type naar de juiste handler gestuurd.
 */
let ws; // initialisatie v d websocket

const handlers = new Map(); // type -> fn; voor elke bericht type hou je de handler (wat je met dat bericht wil doen) bij
                            // voorbeeld van type handles in messages.js zijn clientId, roomCreated, joined, room, error

export function on(type, fn) { handlers.set(type, fn); } // registreet een nieuwe handler. als er al een bestond wordt de ouden overschreven
export function off(type) { handlers.delete(type); }

//uitgaande berichten krijgen een envelop. (type, data) --> VB (clientId, data {abc123})
export function send(type, data) {
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type, data }));
    else console.warn("WS not open, dropping", type, data);
}


// nog geen open socket? maak een nieuwe. bestaat die wel al gebruik dan de bestaande
export function openSocket(url = "ws://localhost:8080") {

    // Als er al een verbinding is (OPEN of CONNECTING), hergebruik die
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return ws;

    ws = new WebSocket(url); //creates websocket and starts connecting

    //eventlisteners
    ws.onopen = () => console.log("WS open:", url);
    ws.onclose = () => console.log("WS closed");
    ws.onerror = (e) => console.log("WS error", e);

    //this runs for every time a message is recieved from the server
    // recieved message looks like: vb:  {"type":"room","data":{...}}
    ws.onmessage = (recievedMessage) => {
        let msg;
        try {
            msg = JSON.parse(recievedMessage.data); //de payload van de message is in JSON dus moeten we dat eerst weer omzetten en assignen we het aan msg
        }
        catch {
            return;
        }

        const fn = handlers.get(msg.type);//handlers is your dispatcher Map (type → function), filled earlier by registerMessageHandlers() in messages.js.
        if (fn) fn(msg.data);// als de handler fn bestaat --> voer ze uit
        else console.warn("No handler for", msg.type, msg.data);
    };
    return ws;
}