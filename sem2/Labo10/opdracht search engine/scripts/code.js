const setup = () => {
   document.getElementById("btnSearch").addEventListener("click", readInputfield);
}

const readInputfield = () => {
    let CurrentSearchInput = document.getElementById('txtSearch').value;
    let platform = null;
    let commandOsSuffix = null;
    if (CurrentSearchInput.substring(0, 2) ==="/y") {
        platform = "Youtube"
        commandOsSuffix = "/y"

    }else if(CurrentSearchInput.substring(0, 2) === "/i"){
        platform = "Instagram"
        commandOsSuffix = "/i"

    }else if(CurrentSearchInput.substring(0, 2) === "/x"){
        platform = "twitter"
        commandOsSuffix = "/x"

    }else if(CurrentSearchInput.substring(0, 2) === "/g"){
        platform = "google"
        commandOsSuffix = "/g"

    }else{
        alert("invalid input, please provide /y, /g, /i or /x followed by a space and then what u would like to search on the corresponding platforms")
    }

    let searched = (CurrentSearchInput.substring(3,CurrentSearchInput.length))
    let link = createLink(platform,searched);

    let card = {
        title: platform,
        commandOsSuffix : commandOsSuffix,
        searched: searched,
        link : link

    }
    console.log(platform +" "+ searched +" "+ link)

    createCardAndAppend(card.title, card.commandOsSuffix, card.link)



}

const createCardAndAppend = (title, commandOsSuffix, url) => {
    let col4 = createElementWithClassName("div", "col-4");
    let card = createElementWithClassName("div", "card");

    card.classList.add(title.toLowerCase() + "-card");

    let cardBody = createElementWithClassName("div", "card-body");
    let cardTitle = createElementWithClassNameAndText("h5", "card-title", title);
    let cardText = createElementWithClassNameAndText("p", "card-text", commandOsSuffix);
    let linkGo = createLinkButton(url);

   // linkGo.classList.add(title.toLowerCase() + "-button");
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardText);
    card.appendChild(cardBody);
   col4.append(card);
   document.querySelector("#lstCards .row").appendChild(col4);

}



const createElementWithClassName = (element, className) => {
    let e = document.createElement(element);
    e.setAttribute("class", className);
    return e;
};

const createElementWithClassNameAndText = (element, className, text) => {
    let e = createElementWithClassName(element, className);
    e.appendChild(document.createTextNode(text));
    return e;
}

const createLink = (platform, searched) => {
    const encodedQuery = encodeURIComponent(searched);

    switch (platform.toLowerCase()) {
        case "youtube":
            return `https://www.youtube.com/results?search_query=${encodedQuery}`;
        case "google":
            return `https://www.google.com/search?q=${encodedQuery}`;
        case "twitter":
            return `https://twitter.com/search?q=${encodedQuery}`;
        case "instagram":
            return `https://www.instagram.com/search?q=${encodedQuery}`;

    }
}

const createLinkButton = () => {


}



window.addEventListener("load", setup);