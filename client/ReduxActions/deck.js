import $ from 'jquery';

export function loadDecks() {
    return {
        types: ['REQUEST_DECKS', 'RECEIVE_DECKS'],
        shouldCallAPI: (state) => {
            return !state.deck.decks;
        },
        callAPI: () => $.ajax('/api/decks')
    };
}

export function selectDeck(deck) {
    return {
        type: 'SELECT_DECK',
        deck: deck
    };
}
