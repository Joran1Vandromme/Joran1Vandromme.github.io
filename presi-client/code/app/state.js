// Central state + tiny pub/sub
//je state zorgt ervoor dat elke client zijn UI kan updaten met 1 object af te lezen.
const state = {
    isHost: false,
    name: "",
    roomId: "",
    phase: "home",
    clientId: "",
};

//listeners zijn een hoop functies die moeten uitgevoerd worden telkens de state veranderd (waarschijnlijk omdat ze de UI veranderen.
const listeners = new Set();

export function getState() { return state; }

export function setState(patch) {
    Object.assign(state, patch);
    for (const fn of listeners) fn(state);
}

//subscribe(fn) = voeg zo’n functie toe aan die Set. Hij wordt daarna automatisch aangeroepen bij elke setState.
export function subscribe(fn) {
    listeners.add(fn);
}