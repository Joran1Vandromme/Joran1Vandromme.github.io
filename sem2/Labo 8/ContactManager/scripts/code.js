let personen = [];

let persoon = {
    naam : document.getElementById("txtVoornaam").value,
    familienaam : document.getElementById("txtFamilienaam").value,
    geboorteDatum : document.getElementById("txtGeboorteDatum").value,
    email : document.getElementById("txtEmail").value,
    kinderen: document.getElementById("txtKinderen").value,



}

// Event listener (btnBewaar click)
// Bewaar de wijzigingen die in de user interface werden aangebracht
const bewaarBewerktePersoon = () => {
    let lstPersonen = document.getElementById("lstPersonen");
    valideer();
    let elements = document.getElementsByClassName("invalid");

    if (elements.length === 0) {                                  // alles in orde, we mogen bewaren
        let persoon = {};
        if (lstPersonen.selectedIndex === -1) {                     // dit wel zeggen dat als er geen optie is geselecteerd, dan moet er daadwerkelijk een nieuwe optie gemaakt moet worden
            vulPersoonOpBasisVanUserInterface(persoon);
            personen.push(persoon);                               // toevoegen aan interne lijst
            voegPersoonToeAanLijstInUserInterface(persoon);
        } else {                                                  // bestaande persoon wijzigen
            persoon = personen[lstPersonen.selectedIndex];
            vulPersoonOpBasisVanUserInterface(persoon);
            updatePersoonInLijstInUserInterface(persoon);
        }
    }


};

// Event listener (btnNieuw click)
const bewerkNieuwePersoon = () => {
    console.log("Klik op de knop nieuw");

    let inputElem = document.querySelectorAll("input[type=text]");
    inputElem.forEach(elem => {
        elem.value ="";
    })

};

const vulPersoonOpBasisVanUserInterface = (persoon) => {

}

const updatePersoonInLijstInUserInterface = (persoon) => {}


const voegPersoonToeAanLijstInUserInterface = (persoon) => {
    let lstPersonen = document.getElementById("lstPersonen");
    let option = document.createElement("option");
    option.text = persoon.voornaam + " " + persoon.familienaam;
    option.value = persoon.email
    lstPersonen.appendChild(option);
    lstPersonen.selectedIndex = personen.length - 1;
};


// onze setup functie die de event listeners registreert
const setup = () => {
    let btnBewaar = document.getElementById("btnBewaar");
    btnBewaar.addEventListener("click", bewaarBewerktePersoon);

    let btnNieuw = document.getElementById("btnNieuw");
    btnNieuw.addEventListener("click", bewerkNieuwePersoon);

    let lstPersonen = document.getElementById("lstPersonen");
    lstPersonen.addEventListener("click", )

};

window.addEventListener("load", setup);