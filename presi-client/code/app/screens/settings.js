// code/app/screens/settings.js
// Host-only settings UI: init, validation, state sync (local, client-side).
// Later, include these in "startGame" to send to the server.

import { getState, setState } from "../state.js";
import { send } from "../socket.js";


/** Single source of truth for default settings */
export const DEFAULT_SETTINGS = {
    includeJokers: true,     // toggle
    jokerCount: 3,           // 1..8 (only when includeJokers)
    perValueCount: 4,        // 3..8
    timePerTurn: 20,         // allowed: 15,20,30,45,60,120
    quartetCount: 4,         // 3..8; must be <= perValueCount; default mirrors perValueCount
    allowTwosPower: false,   // “Allow 2's with joker and quartet”
    goLowerOnSeven: true,    // “Go lower on 7”
    cardSkin: "default",     // string
    statusSkin: "default",   // string
};

const ALLOWED_TIMES = [15, 20, 30, 45, 60, 120];

/** Handy accessor that guarantees we always have a full settings object */
function currentSettings() {
    const s = getState();
    return { ...DEFAULT_SETTINGS, ...(s.settings || {}) };
}

/** Write a partial patch to state.settings without losing other fields */
function patchSettings(patch) {
    const prev = currentSettings();
    const next = { ...prev, ...patch };

    // Constraint: quartetCount <= perValueCount
    if (next.quartetCount > next.perValueCount) {
        next.quartetCount = next.perValueCount;
    }

    // Constraint: timePerTurn must be in allowed set
    if (!ALLOWED_TIMES.includes(Number(next.timePerTurn))) {
        next.timePerTurn = DEFAULT_SETTINGS.timePerTurn;
    }

    // Clamp jokers for safety (even though it's a select)
    if (Number(next.jokerCount) < 1 || Number(next.jokerCount) > 8) {
        next.jokerCount = DEFAULT_SETTINGS.jokerCount;
    }

    setState({ settings: next });
    return next;
}

/** Enable/disable all inputs depending on isHost */
export function applySettingsHostMode(isHost) {
    const panel = document.getElementById("settingsPanel");
    if (!panel) return;
    const inputs = panel.querySelectorAll("input, select, button");
    inputs.forEach(el => {
        if (el.id === "btnSettings") return;
        el.disabled = !isHost && el.type !== "button";
    });
}

/** Build the options for selects that are min..max */
function fillRangeSelect(selectEl, min, max, defaultValue) {
    if (!selectEl) return;
    selectEl.innerHTML = "";
    for (let v = min; v <= max; v++) {
        const opt = document.createElement("option");
        opt.value = String(v);
        opt.textContent = String(v);
        selectEl.appendChild(opt);
    }
    selectEl.value = String(defaultValue);
}

/** Disable quartet options that exceed perValueCount */
function limitQuartetOptions(selectQuartet, perValue) {
    if (!selectQuartet) return;
    [...selectQuartet.options].forEach(opt => {
        const val = Number(opt.value);
        opt.disabled = val > perValue;
    });
}

/** Reflect settings -> UI controls */
function syncUIFromSettings() {
    const s = currentSettings();
    const isHost = getState().isHost;

    const chkJokers   = document.getElementById("optIncludeJokers");
    const selJokers   = document.getElementById("optJokerCount");
    const selPerVal   = document.getElementById("optPerValueCount");
    const selQuartet  = document.getElementById("optQuartetCount");
    const selTimer    = document.getElementById("optTimePerTurn");
    const chkTwos     = document.getElementById("optAllowTwosPower");
    const chkSeven    = document.getElementById("optGoLowerOnSeven");
    const selSkin     = document.getElementById("optCardSkin");
    const selStatus   = document.getElementById("optStatusSkin");

    if (chkJokers) chkJokers.checked = !!s.includeJokers;
    if (selJokers) {
        selJokers.value = String(s.jokerCount);
        selJokers.disabled = !s.includeJokers || !isHost;
    }
    if (selPerVal) selPerVal.value = String(s.perValueCount);

    if (selQuartet) {
        limitQuartetOptions(selQuartet, s.perValueCount);
        selQuartet.value = String(Math.min(s.quartetCount, s.perValueCount));
    }

    if (selTimer) selTimer.value = String(s.timePerTurn);

    if (chkTwos) chkTwos.checked = !!s.allowTwosPower;
    if (chkSeven) chkSeven.checked = !!s.goLowerOnSeven;

    if (selSkin) selSkin.value = s.cardSkin || "default";
    if (selStatus) selStatus.value = s.statusSkin || "default";
}

/** Wire listeners and set defaults once */
export function initSettingsPanel() {
    const s = getState();
    // Ensure we have a settings object in state (with constraints applied)
    if (!s.settings) {
        setState({ settings: { ...DEFAULT_SETTINGS } });
    }

    // Controls
    const chkJokers   = document.getElementById("optIncludeJokers");
    const selJokers   = document.getElementById("optJokerCount");   // NOW a select
    const selPerVal   = document.getElementById("optPerValueCount");
    const selQuartet  = document.getElementById("optQuartetCount");
    const selTimer    = document.getElementById("optTimePerTurn");
    const chkTwos     = document.getElementById("optAllowTwosPower");
    const chkSeven    = document.getElementById("optGoLowerOnSeven");
    const selSkin     = document.getElementById("optCardSkin");
    const selStatus   = document.getElementById("optStatusSkin");

    // build select options
    fillRangeSelect(selJokers, 1, 8, DEFAULT_SETTINGS.jokerCount);               // 1..8 for jokers
    fillRangeSelect(selPerVal, 4, 8, DEFAULT_SETTINGS.perValueCount);            // 4..8 per value
    fillRangeSelect(selQuartet, 4, 8, DEFAULT_SETTINGS.perValueCount);           // 4..8 quartet

    // listeners
    chkJokers?.addEventListener("change", () => {
        const next = patchSettings({ includeJokers: chkJokers.checked });
        if (getState().isHost) send("updateSettings", { settings: { includeJokers: next.includeJokers }});
        if (selJokers) selJokers.disabled = !next.includeJokers;
    });

    selJokers?.addEventListener("change", () => {
        const n = Number(selJokers.value);
        const next = patchSettings({ jokerCount: n });
        if (getState().isHost) send("updateSettings", { settings: { jokerCount: next.jokerCount }});
        selJokers.value = String(next.jokerCount);
    });

    selPerVal?.addEventListener("change", () => {
        const perVal = Number(selPerVal.value);
        const next = patchSettings({ perValueCount: perVal });
        if (getState().isHost) send("updateSettings", { settings: { perValueCount: next.perValueCount, quartetCount: next.quartetCount }});

        // keep quartet in range
        limitQuartetOptions(selQuartet, next.perValueCount);
        if (Number(selQuartet?.value) > next.perValueCount) {
            if (selQuartet) selQuartet.value = String(next.perValueCount);
            patchSettings({ quartetCount: next.perValueCount });
        }
    });

    selQuartet?.addEventListener("change", () => {
        let q = Number(selQuartet.value);
        const perVal = Number(selPerVal?.value || DEFAULT_SETTINGS.perValueCount);
        q = Math.max(4, Math.min(perVal, q));
        const next = patchSettings({ quartetCount: q });
        if (getState().isHost) send("updateSettings", { settings: { quartetCount: next.quartetCount }});
        selQuartet.value = String(next.quartetCount);
    });

    // Time per turn is a select with fixed choices
    selTimer?.addEventListener("change", () => {
        const t = Number(selTimer.value);
        const next = patchSettings({ timePerTurn: t });
        if (getState().isHost) send("updateSettings", { settings: { timePerTurn: next.timePerTurn }});
        selTimer.value = String(next.timePerTurn);
    });

    chkTwos?.addEventListener("change", () => {
        patchSettings({ allowTwosPower: chkTwos.checked });
        if (getState().isHost) send("updateSettings", { settings: { allowTwosPower: chkTwos.checked }});

    });

    chkSeven?.addEventListener("change", () => {
        patchSettings({ goLowerOnSeven: chkSeven.checked });
        if (getState().isHost) send("updateSettings", { settings: { goLowerOnSeven: chkSeven.checked }});

    });

    selSkin?.addEventListener("change", () => {
        patchSettings({ cardSkin: selSkin.value });
        if (getState().isHost) send("updateSettings", { settings: { cardSkin: selSkin.value }});

    });

    selStatus?.addEventListener("change", () => {
        patchSettings({ statusSkin: selStatus.value });
        if (getState().isHost) send("updateSettings", { settings: { statusSkin: selStatus.value }});

    });

    // reflect current settings to UI
    syncUIFromSettings();

    // initial host enablement
    applySettingsHostMode(getState().isHost);
}
export function refreshSettingsUI() {
    // leest state.settings en zet alle controls overeenkomstig
    applySettingsHostMode(getState().isHost);
    // interne sync:
    (function syncUIFromSettings_public(){ syncUIFromSettings(); })();
}
