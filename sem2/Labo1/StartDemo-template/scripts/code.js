const setup = () => {

    let lblCursus = document.getElementById('lblCursus');
    lblCursus.addEventListener("mouseover", change);

    let btnSend = document.getElementById('btnSend');
    btnSend.addEventListener("click", show);
}

const change = () =>{
    let lblCursus = document.getElementById('lblCursus');
    lblCursus.className = 'cursus';
}

const show = () =>{
    let txtName = document.getElementById('txtName');

    if(txtName.value !== ""){ //!== wil zeggen: twee waarden veregelijken zindere rekening te houden met hun types
        alert("jouw naam is " + txtName.value);
    }
    else {
        alert("geef naam in ouleh");
    }

    console.log("jouw naam is " + txtName.value);
    console.log(`jouw naam is ${txtName.value}`); // text samenvoegen met interpolatie
}

window.addEventListener("load", setup); //start de setup functie vanaf de html pagina volledig geladen is