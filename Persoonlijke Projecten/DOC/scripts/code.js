const track = document.querySelector(".carousel-track");
const slides = Array.from(track.children);
const nextBtn = document.querySelector(".carousel-btn.next");
const prevBtn = document.querySelector(".carousel-btn.prev");

let index = 0;

function updateCarousel(){
    const slideWidth = slides[0].getBoundingClientRect().width;
    track.style.transform = `translateX(-${index * slideWidth}px)`;
}

nextBtn.addEventListener("click", () => {
    index = (index + 1) % slides.length;
    updateCarousel();
});

prevBtn.addEventListener("click", () => {
    index = (index - 1 + slides.length) % slides.length;
    updateCarousel();
});

setInterval(() => {
    index = (index + 1) % slides.length;
    updateCarousel();
}, 5000);



(async function () {
    const grid = document.getElementById("eventsGrid");
    if (!grid) return;

    const modal = document.getElementById("eventModal");
    const modalImg = document.getElementById("modalImg");
    const modalTitle = document.getElementById("modalTitle");
    const modalDateTime = document.getElementById("modalDateTime");
    const modalLocation = document.getElementById("modalLocation");
    const modalDesc = document.getElementById("modalDesc");
    const modalFb = document.getElementById("modalFb");

    const TZ = "Europe/Brussels";

    function pad2(n) { return String(n).padStart(2, "0"); }

    function parseDate(iso) {
        const d = new Date(iso);
        return isNaN(d.getTime()) ? null : d;
    }

    function monthShort(d) {
        return new Intl.DateTimeFormat("en", { month: "short", timeZone: TZ }).format(d);
    }

    function formatDateTime(d) {
        const date = new Intl.DateTimeFormat("en-GB", {
            day: "2-digit", month: "long", year: "numeric",
            timeZone: TZ
        }).format(d);

        const time = new Intl.DateTimeFormat("en-GB", {
            hour: "2-digit", minute: "2-digit",
            timeZone: TZ
        }).format(d);

        return `${date} ${time}`;
    }

    function escapeHtml(str) {
        return String(str ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function openModal(ev) {
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";

        modalImg.src = ev.imageUrl || "";
        modalImg.alt = ev.title || "Event image";
        modalTitle.textContent = ev.title || "";

        const d = parseDate(ev.startDateTime);
        modalDateTime.textContent = d ? formatDateTime(d) : "";

        if (ev.locationUrl) {
            modalLocation.textContent = ev.location || ev.locationUrl;
            modalLocation.href = ev.locationUrl;
            modalLocation.style.pointerEvents = "auto";
        } else {
            modalLocation.textContent = ev.location || "";
            modalLocation.removeAttribute("href");
            modalLocation.style.pointerEvents = "none";
        }

        modalDesc.textContent = ev.description || "";

        modalFb.href = ev.facebookUrl || "#";
    }

    function closeModal() {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    modal.addEventListener("click", (e) => {
        if (e.target && e.target.dataset && e.target.dataset.close === "true") {
            closeModal();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
    });

    function renderCard(ev) {
        const d = parseDate(ev.startDateTime);
        const day = d ? pad2(d.getDate()) : "--";
        const mon = d ? monthShort(d) : "---";

        return `
      <article class="event-card">
        <img class="event-card__img" src="${escapeHtml(ev.imageUrl)}" alt="${escapeHtml(ev.title)}">
        <div class="event-card__body">
          <div class="event-card__top">
            <div class="event-date">
              <div class="event-date__month">${escapeHtml(mon)}</div>
              <div class="event-date__day">${escapeHtml(day)}</div>
            </div>
            <h3 class="event-card__title">${escapeHtml(ev.title)}</h3>
          </div>

          <p class="event-card__location">${escapeHtml(ev.location || "")}</p>

          <button class="event-card__btn" type="button">Read More</button>
        </div>
      </article>
    `;
    }

    async function loadEvents() {
        const res = await fetch("/Json-Files/events.json", { cache: "no-store" });
        if (!res.ok) throw new Error("Could not load events.json");
        const events = await res.json();

        // Filter past events + sort ascending
        const now = new Date();
        const upcoming = (events || [])
            .map(e => ({ ...e, _d: parseDate(e.startDateTime) }))
            .filter(e => e._d && e._d >= now)
            .sort((a, b) => a._d - b._d);

        grid.innerHTML = upcoming.map(renderCard).join("");

        // attach click handlers
        const buttons = grid.querySelectorAll(".event-card__btn");
        buttons.forEach((btn, idx) => {
            btn.addEventListener("click", () => openModal(upcoming[idx]));
        });
    }

    try {
        await loadEvents();
    } catch (err) {
        console.error(err);
        grid.innerHTML = `<p style="opacity:.85;">Could not load events.</p>`;
    }
})();

window.addEventListener("resize", updateCarousel);