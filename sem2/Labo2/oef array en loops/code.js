let setup = () => {
    let familie = ["fml1", "fml2", "fml3", "fml4", "fml5"];

    console.log(familie.length);

    for (let i = 0; i < familie.length; i += 2) {
        console.log(familie[i]);
    }

    voegNaamToe(familie);

    for (let i = 0; i < familie.length; i ++) {
        console.log(familie[i]);
    }



    const voegNaamToe = (leden) => {
        let naam = window.prompt("geef lid ouleh")
        if(naam != null) {
            leden.push(naam);
            console.log(familie);
        }
    }



}


window.addEventListener("load", setup);