// code/app/screens/game.js
import { send } from "../socket.js";
import { getState, setState } from "../state.js";

let badQuartetClicks = 0;

/* =========================
   Rank / Suit helpers
   ========================= */

const RANK_ORDER = ["3","4","5","6","7","8","9","10","J","Q","K","1","2","JK"];
const RANK_IDX   = Object.fromEntries(RANK_ORDER.map((r,i)=>[r,i]));

// Internal suit codes from the server: C,D,H,S plus V1..V4 for extra suits
const SUIT_ORDER = ["C","D","H","S","V1","V2","V3","V4"];
const SUIT_IDX   = Object.fromEntries(SUIT_ORDER.map((s,i)=>[s,i]));

function suitSymbol(code) {
    switch (code) {
        case "C":  return "♣";
        case "D":  return "♦";
        case "H":  return "♥";
        case "S":  return "♠";
        case "V1": return "■"; // square
        case "V2": return "●"; // circle
        case "V3": return "▲"; // triangle
        case "V4": return "✖"; // cross
        default:   return "";
    }
}

// Robust parser: rank is (10|2..9|J|Q|K|1); suit is C/D/H/S/V1..V4
function parseId(id) {
    if (id.startsWith("JK")) return { rank: "JK" };
    const m = /^((?:10|[2-9]|[JQK1]))(C|D|H|S|V1|V2|V3|V4)$/.exec(id);
    if (!m) return { rank: id, suit: "" };
    let rank = m[1];
    if (rank === "A") rank = "1"; // safety
    const suit = m[2];
    return { rank, suit };
}

function sortCardIds(ids) {
    return [...ids].sort((a, b) => {
        const A = parseId(a), B = parseId(b);
        const ra = RANK_IDX[A.rank] ?? 999, rb = RANK_IDX[B.rank] ?? 999;
        if (ra !== rb) return ra - rb;
        const sa = SUIT_IDX[A.suit] ?? 99, sb = SUIT_IDX[B.suit] ?? 99;
        return sa - sb;
    });
}

/* =========================
   Init & interactions
   ========================= */

export function initGame() {
    const hand = document.getElementById("yourHand");
    if (hand && !hand.dataset.selAttached) {
        // Click toggle (suppressed if we already handled on mousedown)
        let suppressClick = false;

        hand.addEventListener("click", (e) => {
            if (suppressClick) { e.preventDefault(); return; }
            const btn = e.target.closest(".card");
            if (!btn) return;
            btn.classList.toggle("selected");
            updatePlayEnabled();
        });

        // Drag select/unselect
        let dragging = false;
        let dragMode = "add"; // or "remove"

        function applyDrag(card) {
            if (!card) return;
            if (dragMode === "add")   card.classList.add("selected");
            else                      card.classList.remove("selected");
            updatePlayEnabled();
        }

        hand.addEventListener("mousedown", (e) => {
            if (e.button !== 0) return;      // left mouse only
            e.preventDefault();              // block text selection inside #yourHand
            dragging = true;
            hand.classList.add("dragging");
            suppressClick = true;            // swallow click that follows mouseup

            const card = e.target.closest(".card");
            if (card) {
                dragMode = card.classList.contains("selected") ? "remove" : "add";
                applyDrag(card);               // include first card if starting on one
            } else {
                dragMode = "add";              // started between cards
            }
        });

        hand.addEventListener("mouseover", (e) => {
            if (!dragging) return;
            applyDrag(e.target.closest(".card"));
        });

        window.addEventListener("mouseup", () => {
            if (!dragging) { suppressClick = false; return; }
            dragging = false;
            hand.classList.remove("dragging");
            setTimeout(() => { suppressClick = false; }, 0);
        });

        // Block native dragstart on cards
        hand.addEventListener("dragstart", (e) => e.preventDefault());

        // Accessibility niceties
        hand.setAttribute("aria-label", "Your hand");

        hand.dataset.selAttached = "1";
    }

    // Wire Play / Pass / Quartet once
    const btnPlay    = document.getElementById("btnPlay");
    const btnPass    = document.getElementById("btnPass");
    const btnQuartet = document.getElementById("btnQuartet");

    if (btnPlay && !btnPlay.dataset.actionsAttached) {
        btnPlay.addEventListener("click", () => {
            const ids = selectedHandIds();
            if (!ids.length) return;
            send("play", { cardsOrdered: ids });
            clearSelection();
        });

        btnPass?.addEventListener("click", () => {
            send("pass", {});
            clearSelection();
        });

        btnQuartet?.addEventListener("click", () => {
            // Always available; if wrong, shake; 5 wrong -> auto pass
            const snapshot = getState().game || {};
            const attemptIds = autoPickQuartet(snapshot) || [];
            if (attemptIds.length) {
                badQuartetClicks = 0;
                send("attemptQuartet", { cardsOrdered: attemptIds });
            } else {
                badQuartetClicks++;
                btnQuartet.classList.add("shake");
                setTimeout(() => btnQuartet.classList.remove("shake"), 320);
                if (badQuartetClicks >= 5) {
                    badQuartetClicks = 0;
                    send("pass", {});
                }
            }
        });

        btnPlay.dataset.actionsAttached = "1";
    }
}

/* =========================
   Small helpers
   ========================= */

function selectedHandIds() {
    return [...document.querySelectorAll("#yourHand .card.selected")]
        .map(el => el.dataset.id);
}

function clearSelection() {
    document.querySelectorAll("#yourHand .card.selected")
        .forEach(el => el.classList.remove("selected"));
    updatePlayEnabled();
}

function updatePlayEnabled() {
    const s = getState();
    const youTurn = s.game?.turn?.youCanAct;
    const hasSel = selectedHandIds().length > 0;
    const btnPlay = document.getElementById("btnPlay");
    const btnPass = document.getElementById("btnPass");
    if (btnPlay) btnPlay.disabled = !(youTurn && hasSel);
    if (btnPass) btnPass.disabled = !youTurn;
}

/** Quartet auto-pick: exact rank match (so "1" !== "10"). */
function autoPickQuartet(snap) {
    const req = snap?.quartetHint; // { value: "8", need: 2, allowTwos:false }
    const hand = snap?.you?.hand || [];
    if (!req) return null;
    const has = hand.filter(id => parseId(id).rank === req.value).slice(0, req.need);
    return has.length === req.need ? has : null;
}

/* =========================
   Rendering
   ========================= */

export function renderGameFromSnapshot(snap) {
    // keep in state for quick checks
    setState({ game: snap });

    // Header
    const s = getState();
    const roomCode = document.getElementById("gameRoomCode");
    const roleBadge = document.getElementById("roleBadge");
    const turnInd   = document.getElementById("turnIndicator");
    if (roomCode) roomCode.textContent = `Room ${s.roomId || snap.room?.roomId || ""}`;
    if (roleBadge) roleBadge.textContent = (snap.you?.role || "burger");
    if (turnInd)   turnInd.textContent = snap.turn?.youCanAct ? "Your turn" : "Waiting…";

    // Pile (keep order as played)
    const pile = document.getElementById("pileCards");
    if (pile) {
        pile.innerHTML = "";
        for (const id of (snap.pile?.ordered || [])) {
            pile.appendChild(cardEl(id));
        }
    }

    // Your hand (sorted) + highlight if it's your turn
    const hand = document.getElementById("yourHand");
    if (hand) {
        hand.innerHTML = "";
        const handIds = sortCardIds(snap.you?.hand || []);
        for (const id of handIds) {
            hand.appendChild(cardEl(id));
        }
        if (snap.turn?.youCanAct) hand.classList.add("your-turn");
        else hand.classList.remove("your-turn");
    }

    // Player list (order = players after ME, wrapping; [you] always last)
    const ul = document.getElementById("othersList");
    if (ul) {
        ul.innerHTML = "";

        const me        = snap.you?.id || getState().clientId;
        const currentId = snap.turn?.current;
        const order     = (snap.turn?.order || []).slice();

        // Build lookup for names/sizes (others + you)
        const nameById = new Map();
        const sizeById = new Map();
        for (const p of (snap.others || [])) {
            nameById.set(p.id, p.name ?? p.id);
            sizeById.set(p.id, p.handSize ?? 0);
        }
        nameById.set(me, snap.you?.name ?? "You");
        sizeById.set(me, (snap.you?.hand || []).length);

        // Derive list of opponents starting from the player AFTER me, wrapping
        const orderedOthers = [];
        if (order.length && order.includes(me)) {
            const meIdx = order.indexOf(me);
            for (let i = 1; i < order.length; i++) {
                orderedOthers.push(order[(meIdx + i) % order.length]);
            }
        } else {
            // Fallback if no order provided yet
            for (const p of (snap.others || [])) orderedOthers.push(p.id);
        }

        // Render opponents in that order
        for (const pid of orderedOthers) {
            const li = document.createElement("li");
            li.setAttribute("role", "listitem");

            const name  = document.createElement("span"); name.className = "name";
            const count = document.createElement("span"); count.className = "count";
            name.textContent  = nameById.get(pid) ?? pid;
            count.textContent = sizeById.get(pid) ?? 0;

            li.appendChild(name);
            li.appendChild(count);

            // Highlight whoever's turn it is
            if (pid === currentId) {
                li.classList.add("their-turn");
                li.setAttribute("aria-live", "polite");
            }

            ul.appendChild(li);
        }

        // Append [you] as fixed last row; highlight if it's your turn
        const meLi   = document.createElement("li");
        meLi.setAttribute("role", "listitem");
        meLi.setAttribute("aria-current", "true");

        const meName = document.createElement("span"); meName.className = "name";
        const meCnt  = document.createElement("span"); meCnt.className  = "count";
        meName.textContent = `${nameById.get(me) ?? "You"} [you]`;
        meCnt.textContent  = sizeById.get(me) ?? 0;

        meLi.appendChild(meName);
        meLi.appendChild(meCnt);

        if (currentId === me) {
            meLi.classList.add("their-turn");
            meLi.setAttribute("aria-live", "polite");
        }

        ul.appendChild(meLi);
    }

    // Make sure interactions are wired and buttons reflect state
    initGame();
    updatePlayEnabled();
}

/* =========================
   Card element builder
   ========================= */

function cardEl(cardId) {
    const btn = document.createElement("button");
    btn.className = "card";
    btn.dataset.id = cardId;
    const { rank, suit } = parseId(cardId);
    const face = rank === "JK" ? "JOKER" : (rank === "1" ? "A" : rank);
    btn.textContent = suit ? `${face} ${suitSymbol(suit)}` : face;
    return btn;
}
