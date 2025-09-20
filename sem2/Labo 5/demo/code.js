const setup = () => {
    let imgPhoto = document.getElementById("imgPhoto");

    imgPhoto.addEventListener("mouseover", change);
    imgPhoto.addEventListener("mouseout", reset);
};

const change = () => {
    let imgPhoto = document.getElementById("imgPhoto");
    let txtTekst = document.getElementById("txtText");

    imgPhoto.src = "images/untexturedGun.png";
    imgPhoto.alt = "untextured gun";
    imgPhoto.className = "sizePhoto";
    txtTekst.textContent = "waauw nieuwe picca";
};

const reset = () => {
    let imgPhoto = document.getElementById("imgPhoto");
    let txtTekst = document.getElementById("txtText");

    imgPhoto.src = "images/colouredGun.png";
    txtTekst.textContent = "Hogeschool VIVES";
};



window.addEventListener("load", setup);