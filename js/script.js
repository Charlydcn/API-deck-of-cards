// -------------------------------------------------------------------------------------------------------------
// -------------- déclarations ---------------------------------------------------------------------------------

// container des erreurs dans lequel on injecte des éléments <p> au besoin
const errorsContainer = document.querySelector('#errors-container')

// éléments HTML utiles pour les évènements et pour la manipulation du DOM
const cardsContainer = document.querySelector('#cards-container')

// éléments HTML tuiles pour les évènements et la manipulation du DOM
const actionResetButton = document.querySelector('#action-reset')
const actionDrawButton = document.querySelector('#action-draw')

actionResetButton.addEventListener('click', actionReset)
// actionDrawButton.addEventListener('click', actionDraw(10))
actionDrawButton.addEventListener('click', (e) => {
    if(e.target === actionDrawButton) {
        const userNbDraw = actionDrawButton.querySelector('input')
        if(userNbDraw >= 52) {
            actionDraw(52)
        } else {
            actionDraw(userNbDraw.value)
        }
    }
})

// constante de l'endpoint de l'api pour créer un nouveau deck
const API_ENDPOINT_NEW_DECK = "https://deckofcardsapi.com/api/deck/new/"

// fonctions (syntaxe de fonction fléchée) qui renvoient des URI dynamiques de demande de mélange du deck et de pioche
const getApiEndpointShuffleDeck = () => `https://deckofcardsapi.com/api/deck/${idDeck}/shuffle/`
const getApiEndpointDrawCard = (nb) => `https://deckofcardsapi.com/api/deck/${idDeck}/draw/?count=${nb}`

// fonction qui supprime du DOM toutes les cartes déjà présentes
const cleanDomCardsFromPreviousDeck = () => 
    // récupération des cartes (classes CSS "card")
    document.querySelectorAll('.card')
    // et pour chacune de ces cartes
    .forEach((child) =>
        // suppression du DOM
        child.remove()
    )

// variable globale : l'id du deck utilisé, dans lequel on pioche
let idDeck = null
let nbDraw = null

// -------------------------------------------------------------------------------------------------------------
// -------------- fonctions ------------------------------------------------------------------------------------

// fonction générale pour effectuer des requêtes à l'API
async function callAPI(uri) {
    console.log('-- callAPI - start --')

    console.log(`uri = ${uri}`)
    console.log('uri = ', uri)

    // fetch(), appel à l'API et réception de la réponse
    // le tout dans un bloc try...catch pour gérer les potentielles erreurs
    try {
        const response = await fetch(uri);
        console.log(`response = ${response}`)
        console.log('response = ', response)

        // récupération des données JSON reçues de l'API
        const data = await response.json();
        console.log(`data = ${data}`)
        console.log('data = ', data)

        console.log('-- callAPI - end --')

        if(!data['success']) {
            return showErrorMsg(`Erreur : ${data['error']}`)
        }

        // renvoi des données
        return data;

    } catch (error) {
        showErrorMsg(`Erreur de requête : ${error}`)

        console.error('!! Erreur : ', error)
    }
}

// fonction pour faire apparaitre pendant 5 secondes un message d'erreur et le fait disparaitre en animation
function showErrorMsg(msg) {
    const errorMsg = document.createElement('p')
    errorMsg.innerHTML = msg
    errorMsg.classList.add('error-msg')
    errorsContainer.appendChild(errorMsg)

    setTimeout(function() {
        errorMsg.style.transform = "translateY(-5rem)";
        setTimeout(function() {
            errorMsg.remove();
        }, 1000);
    }, 5000);
    
}

// fonction de demande de nouveau paquet
async function getNewDeck() {
    console.log('>> getNewDeck')

    return await callAPI(API_ENDPOINT_NEW_DECK)
}

// fonction de demande de mélange du deck
async function shuffleDeck() {
    console.log('>> shuffleDeck')

    return await callAPI(getApiEndpointShuffleDeck())
}

// fonction pour piocher une carte
async function drawCard(nb) {
    console.log('>> drawCard')

    return await callAPI(getApiEndpointDrawCard(nb))
}

// ajoute une carte dans le DOM (dans la zone des cartes piochées)
function addCardToDom(card) {
    
    // création d'une figure html qui sera la carte (figure pour ajouter au besoin dans le futur une figcaption ou du texte)
    const cardHtmlElement = document.createElement('figure')
    cardHtmlElement.classList.add('card')

    // ajout de l'image dans la card
    const imgCardHtmlElement = document.createElement('img')
    imgCardHtmlElement.src = card['image']
    cardHtmlElement.append(imgCardHtmlElement)

    // ajout de la card complète au container
    cardsContainer.append(cardHtmlElement)
}

// fonction de réinitialisation (demande de nouveau deck + demande de mélange de ce nouveau deck)
async function actionReset() {
    // vider dans le DOM les cartes de l'ancien deck
    cleanDomCardsFromPreviousDeck()

    // récupération d'un nouveau deck
    const newDeckResponse = await getNewDeck()

    // récupération de l'id de ce nouveau deck dans les données reçues et mise à jour de la variable globale
    idDeck = newDeckResponse.deck_id

    // mélange du deck
    await shuffleDeck()
}

// fonction qui demande à piocher une ou des cartes, puis qui fait l'appel pour les intégrer dans le DOM
async function actionDraw(nb) {
    // appel à l'API pour demander au croupier de piocher une carte et de nous la renvoyer
    const drawCardResponse = await drawCard(nb)

    console.log("drawCardResponse = ", drawCardResponse)

    if(drawCardResponse) {
        const cards = drawCardResponse['cards']
    
        cards.forEach((card) => {
            addCardToDom(card)
        })
    }
}

// -------------------------------------------------------------------------------------------------------------
// ---------------- appel --------------------------------------------------------------------------------------

// appel d'initialisation au lancement de l'application
actionReset()