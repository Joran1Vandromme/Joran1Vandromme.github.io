const setup = () => {
    let txtInput = document.getElementById("txtInput");
    let txtOutput = document.getElementById("txtOutput");
    let subBegin = document.getElementById("subBegin");
    let subEnd = document.getElementById("subEnd");

    let tekst = txtInput.value;
    let idxBegin = parseInt(txtBegin.value,10);
    let idxEnd = parseInt(txtBegin.value,10);

    let resultaatSubstring = tekst.substring(idxBegin, idxEnd);
    txtOutput.innerHTML = resultaatSubstring;
}
window.addEventListener("load", setup);