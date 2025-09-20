const setup = () => {
    let btnKopieer = document.getElementById("btnKopieer");
    btnKopieer.addEventListener("click", kopieer);
}

const kopieer = () => {
    let txtInput = document.getElementById("txtInput");
    let tekst = txtInput.value;
    let output = document.getElementById("txtOutput");
    console.log(tekst);
    output.innerHTML = tekst;


}
window.addEventListener("load", setup);