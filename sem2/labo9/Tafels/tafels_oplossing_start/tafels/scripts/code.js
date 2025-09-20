let tafels = [];

const setup = () => {
}

const addTafel = () => {}

// createTafel maakt een div aan met alle gegevens van 1 tabel
const createTafel = (tafel) => {}

//maak de header van de tafel div aan
const createHeader = (tafel) => {
    let headerDiv = document.createElement('div');

    headerDiv.setAttribute('class', 'header');

    let headerNode = document.createTextNode("Tafel van " + tafel.start + " aangemaakt op: " + tafel.datum.toTimeString().substring(0,0))

    headerDiv.appendChild(headerNode);
    return headerDiv;
}

const verwijderAlleChildren = (element) => {}

const verrwijderAlleTafels = (element) => {}



window.addEventListener("load", setup);