var zin = "Gisteren zat de jongen op de stoep en at de helft van de appel";

const vervangDeHet = (zin) => {
    let locaties = [];
    for (let i = 0; i < zin.length; i++) {
        if (zin[i].toLowerCase() === "d" && zin[i + 1].toLowerCase() === "e") {
            locaties.push(i);
        }
    }

    return locaties;
}

const replace = (locaties) =>{
    for (let i = 0; i < locaties.length; i++) {
        zin = zin.slice(0, locaties[i] + i) + "het" + zin.slice(locaties[i] + 2 + i);
    }
    console.log(zin);
}

let locaties = vervangDeHet(zin);
console.log(locaties);

let nieuweZin = replace(locaties);

console.log(nieuweZin);

window.addEventListener("load", vervangDeHet);