// =========================
// MOBILE NAV (shared pattern)
// =========================
(function () {
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.getElementById("mobileMenu");
    if (!toggle || !menu) return;

    function openMenu() {
        menu.classList.add("is-open");
        menu.setAttribute("aria-hidden", "false");
        toggle.setAttribute("aria-expanded", "true");
        document.body.style.overflow = "hidden";
    }

    function closeMenu() {
        menu.classList.remove("is-open");
        menu.setAttribute("aria-hidden", "true");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
    }

    toggle.addEventListener("click", openMenu);

    menu.addEventListener("click", (e) => {
        if (e.target && e.target.dataset && e.target.dataset.close === "true") {
            closeMenu();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && menu.classList.contains("is-open")) {
            closeMenu();
        }
    });
})();


// =========================
// JOIN MODAL (placeholder)
// =================️ we’ll replace contents with a real form later
// =========================
(function () {
    const modal = document.getElementById("joinModal");
    if (!modal) return;

    const title = document.getElementById("joinModalTitle");
    const plan = document.getElementById("joinModalPlan");

    function open(planKey) {
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";

        title.textContent = "Word lid";
        plan.textContent = planKey === "met"
            ? "Gekozen formule: Met club T-shirt (€40 / jaar)"
            : "Gekozen formule: Zonder club T-shirt (€30 / jaar)";
    }

    function close() {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    document.querySelectorAll('[data-open="join"]').forEach(btn => {
        btn.addEventListener("click", () => open(btn.dataset.plan));
    });

    modal.addEventListener("click", (e) => {
        if (e.target && e.target.dataset && e.target.dataset.close === "true") close();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("is-open")) close();
    });
})();

// =========================
// JOIN FORM (dynamic + mailto submit)
// =========================
(function () {
    const modal = document.getElementById("joinModal");
    if (!modal) return;

    const form = document.getElementById("joinForm");
    const sendBtn = document.getElementById("sendBtn");
    const hint = document.getElementById("formHint");

    const tshirtRow = document.getElementById("tshirtRow");
    const tshirtSize = document.getElementById("tshirtSize");

    const ducatiList = document.getElementById("ducatiList");
    const ducatiTemplate = document.getElementById("ducatiTemplate");
    const addDucatiBtn = document.getElementById("addDucatiBtn");

    let currentPlan = "zonder"; // "zonder" | "met"

    function normalize(s) {
        return String(s || "").trim().toLowerCase();
    }

    function setPlan(planKey) {
        currentPlan = planKey === "met" ? "met" : "zonder";

        // Show/hide T-shirt size and enforce required only when plan=met
        if (currentPlan === "met") {
            tshirtRow.hidden = false;
            tshirtSize.setAttribute("required", "required");
        } else {
            tshirtRow.hidden = true;
            tshirtSize.removeAttribute("required");
            tshirtSize.value = "";
        }
    }

    function open(planKey) {
        setPlan(planKey);

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        validate(); // update button
    }

    function close() {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    document.querySelectorAll('[data-open="join"]').forEach(btn => {
        btn.addEventListener("click", () => open(btn.dataset.plan));
    });

    modal.addEventListener("click", (e) => {
        if (e.target && e.target.dataset && e.target.dataset.close === "true") close();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("is-open")) close();
    });

    // --- Ducati add/remove ---
    function addDucati() {
        const node = ducatiTemplate.content.firstElementChild.cloneNode(true);
        const removeBtn = node.querySelector(".ducati-remove");
        removeBtn.addEventListener("click", () => node.remove());
        ducatiList.appendChild(node);
    }

    addDucatiBtn.addEventListener("click", addDucati);

    // --- Validation ---
    function quizOk() {
        // Ducati factory is in Bologna
        const answer = normalize(form.elements.quizCity.value);
        return answer === "bologna";
    }

    function validate() {
        // HTML5 validation check
        const baseValid = form.checkValidity();

        // Quiz required
        const quizValid = quizOk();

        if (!baseValid) {
            sendBtn.disabled = true;
            hint.textContent = "Vul alle verplichte velden (*) in om te kunnen verzenden.";
            return false;
        }

        if (!quizValid) {
            sendBtn.disabled = true;
            hint.textContent = "Controle-vraag: de Ducati fabriek is gevestigd in Bologna.";
            return false;
        }

        sendBtn.disabled = false;
        hint.textContent = "";
        return true;
    }

    form.addEventListener("input", validate);
    form.addEventListener("change", validate);

    // --- Build email body ---
    function buildEmail() {
        const f = form.elements;

        // Collect Ducati entries (optional)
        const ducatis = Array.from(ducatiList.querySelectorAll(".ducati-item")).map((item, idx) => {
            const type = item.querySelector('input[name="ducatiType"]').value.trim();
            const plate = item.querySelector('input[name="ducatiPlate"]').value.trim();
            const year = item.querySelector('input[name="ducatiYear"]').value.trim();
            if (!type && !plate && !year) return null;
            return `Ducati ${idx + 1}: Type=${type || "-"}, Nummerplaat=${plate || "-"}, Bouwjaar=${year || "-"}`;
        }).filter(Boolean);

        const lines = [
            "Nieuwe lidmaatschapsaanvraag – DOC Fiandre",
            "-----------------------------------------",
            `Formule: ${currentPlan === "met" ? "Met club T-shirt (€40/jaar)" : "Zonder club T-shirt (€30/jaar)"}`,
            "",
            `Naam: ${f.fullName.value}`,
            `Geboortedatum: ${f.birthDate.value}`,
            `Adres: ${f.street.value}, ${f.postalCode.value} ${f.city.value}, ${f.country.value}`,
            `GSM: ${f.phone.value}`,
            `E-mail: ${f.email.value}`,
            `WhatsApp: ${f.whatsapp.value}`,
            `Facebook naam: ${f.facebookName.value || "-"}`,
            "",
            ...(ducatis.length ? ["Ducati(s):", ...ducatis, ""] : ["Ducati(s): (geen opgegeven)", ""]),
            `Verzekering contact: ${f.insuranceContact.value}`,
            `ICE naam: ${f.iceName.value}`,
            `ICE gsm: ${f.icePhone.value}`,
            `Geslacht: ${f.gender.value}`,
            currentPlan === "met" ? `T-shirt maat: ${f.tshirtSize.value || "-"}` : "T-shirt maat: (n.v.t.)",
            "",
            `Extra info: ${f.extraInfo.value || "-"}`,
        ];

        return lines.join("\n");
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!validate()) return;

        // Build payload
        const payload = new FormData();
        payload.append("subject", "Lidmaatschapsaanvraag DOC Fiandre");
        payload.append("message", buildEmail()); // this is your big formatted text
        payload.append("plan", currentPlan);

        // Optional: also send individual fields (nice for emails)
        const f = form.elements;
        payload.append("Naam", f.fullName.value);
        payload.append("Geboortedatum", f.birthDate.value);
        payload.append("Adres", `${f.street.value}, ${f.postalCode.value} ${f.city.value}, ${f.country.value}`);
        payload.append("GSM", f.phone.value);
        payload.append("Email", f.email.value);
        payload.append("WhatsApp", f.whatsapp.value);
        payload.append("Facebook", f.facebookName.value || "-");
        payload.append("Verzekering", f.insuranceContact.value);
        payload.append("ICE Naam", f.iceName.value);
        payload.append("ICE GSM", f.icePhone.value);
        payload.append("Geslacht", f.gender.value);
        payload.append("Tshirt", currentPlan === "met" ? (f.tshirtSize.value || "-") : "n.v.t.");
        payload.append("Extra info", f.extraInfo.value || "-");

        // Disable button while sending
        sendBtn.disabled = true;
        sendBtn.textContent = "Verzenden…";

        try {
            const res = await fetch("https://formspree.io/f/xaqbozkd", {  // <-- replace with your endpoint
                method: "POST",
                body: payload,
                headers: { "Accept": "application/json" }
            });

            if (!res.ok) throw new Error("Form submit failed");

            // Success UI
            sendBtn.textContent = "Verzonden ✅";
            hint.textContent = "Bedankt! Je aanvraag is verzonden.";
            form.reset();
            ducatiList.innerHTML = "";
        } catch (err) {
            console.error(err);

            // Fallback: still offer mailto if the service is blocked
            sendBtn.disabled = false;
            sendBtn.textContent = "Verzenden";
            hint.textContent = "Verzenden mislukt (netwerk/blocked). Probeer opnieuw of gebruik e-mail.";

            // Optional fallback button/link:
            // window.location.href = `mailto:joran.vandromme@gmail.com?subject=...&body=...`;
        }
    });


})();

