

const storeSliderValues = () => {
    let redValueLocalStorage = document.getElementById("sldRed").value;
    let blueValueLocalStorage = document.getElementById("sldBlue").value;
    let greenValueLocalStorage = document.getElementById("sldGreen").value;

    //localStorage.setItem("Red Value: ", redValueLocalStorage);
    //localStorage.setItem("Blue Value: ", blueValueLocalStorage);
    //localStorage.setItem("Green Value: ", greenValueLocalStorage);

    let rgb = {
        red: redValueLocalStorage,
        green: greenValueLocalStorage,
        blue: blueValueLocalStorage,
    }

    let jsonText = JSON.stringify(rgb);
    localStorage.setItem("VIVES.be.colorpicker.slidders", jsonText);

};

const restoreSliderValues = () => {

    let rgbValue = JSON.parse(localStorage.getItem("VIVES.be.colorpicker.slidders"));


    document.getElementById("sldRed").value = rgbValue.red;
    document.getElementById("sldBlue").value = rgbValue.blue;
    document.getElementById("sldGreen").value = rgbValue.green;

    update();
};

const storeSwatches = () => {
    // bouw een array met kleurinfo objecten
    let rgbColors = [];
    let swatches = document.querySelectorAll("#swatchComponents .swatch");


    for (let i = 0; i < swatches.length; i++) {
        let swatch = {
            red : swatches[i].getAttribute("data-red"),
            green : swatches[i].getAttribute("data-green"),
            blue : swatches[i].getAttribute("data-blue")
        }

        rgbColors.push(swatch);

    }

    localStorage.setItem("VIVES.be.colorpicker.swatches", JSON.stringify(rgbColors));

};

const restoreSwatches = () => {
    jsonText = localStorage.getItem("VIVES.be.colorpicker.swatches");
    if (jsonText !== null) {
        let rgbColors = JSON.parse(jsonText);
        for (let i = 0; i < rgbColors.length; i++) {
            let rgb = rgbColors[i];
            addSwatchComponent(rgb.red, rgb.green, rgb.blue);
        }
    }



};
