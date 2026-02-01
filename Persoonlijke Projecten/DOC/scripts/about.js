document.addEventListener("DOMContentLoaded", () => {
    const members = {
        liesbet: {
            name: "Liesbet Vanneste",
            role: "President",
            img: "../images/about/Members/LIESBET-1-300x200.jpg",
            email: "liesbet@docfiandre.be",
            phone: "+32 xxx xx xx xx",
            about: "Ik ben Liesbet, mede-oprichter en voorzitter van DOC Fiandre."
        },
        marc: {
            name: "Marc Gyselinck",
            role: "Vice-President",
            img: "../images/about/Members/MARC-1-300x200.jpg",
            email: "marc@docfiandre.be",
            phone: "+32 xxx xx xx xx",
            about: "Als vice-voorzitter ondersteun ik de clubwerking."
        },
        igor: {
            name: "Igor Vandromme",
            role: "Treasurer / Webmaster",
            img: "../images/about/Members/IGOR-1-300x200.jpg",
            email: "igor@docfiandre.be",
            phone: "+32 xxx xx xx xx",
            about: "Ik zorg voor de financiën én de website van DOC Fiandre."
        },
        dominique: {
            name: "Dominique Maene",
            role: "Events / Operations",
            img: "../images/about/Members/DOMINIQUE-e1667646375115-300x200.jpg",
            email: "dominique@docfiandre.be",
            phone: "+32 xxx xx xx xx",
            about: "Verantwoordelijk voor events en praktische organisatie."
        },
        sander: {
            name: "Sander Van Der Perre",
            role: "Events / Circuit",
            img: "../images/about/Members/SANDER-1-300x169.jpg",
            email: "sander@docfiandre.be",
            phone: "+32 xxx xx xx xx",
            about: "Circuitevents en sportieve uitdagingen zijn mijn ding."
        }
    };

    const modal = document.getElementById("memberModal");
    if (!modal) return;

    document.querySelectorAll(".member-card").forEach(card => {
        card.addEventListener("click", () => {
            const data = members[card.dataset.member];
            if (!data) return;

            document.getElementById("memberModalImg").src = data.img;
            document.getElementById("memberModalName").textContent = data.name;
            document.getElementById("memberModalRole").textContent = data.role;
            document.getElementById("memberModalEmail").textContent = data.email;
            document.getElementById("memberModalEmail").href = `mailto:${data.email}`;
            document.getElementById("memberModalPhone").textContent = data.phone;
            document.getElementById("memberModalPhone").href = `tel:${data.phone}`;
            document.getElementById("memberModalAbout").textContent = data.about;

            modal.classList.add("is-open");
            modal.setAttribute("aria-hidden", "false");
            document.body.style.overflow = "hidden";
        });
    });

    modal.addEventListener("click", e => {
        if (e.target.dataset.close) {
            modal.classList.remove("is-open");
            modal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }
    });

    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && modal.classList.contains("is-open")) {
            modal.classList.remove("is-open");
            document.body.style.overflow = "";
        }
    });
});

// =========================
// MOBILE NAV (ABOUT PAGE)
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




