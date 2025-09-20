const word = "onoorbaar";

function generateTrigrams(word) {
    let trigrams = [];
    for (let i = 0; i <= word.length - 3; i++) {
        trigrams.push(word.substring(i, i + 3));
    }
    return trigrams;
}


const trigrams = generateTrigrams(word);

console.log("Trigrams van het woord \"" + word + "\":", trigrams);