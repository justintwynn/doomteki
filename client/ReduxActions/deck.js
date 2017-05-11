import $ from 'jquery';
import _ from 'underscore';

export function loadDecks() {
    return {
        types: ['REQUEST_DECKS', 'RECEIVE_DECKS'],
        shouldCallAPI: (state) => {
            return !state.deck.decks;
        },
        callAPI: () => $.ajax('/api/decks')
    };
}

export function loadDeck(deckId) {
    return {
        types: ['REQUEST_DECK', 'RECEIVE_DECK'],
        shouldCallAPI: (state) => {
            return !_.any(state.deck.decks, deck => {
                deck._id === deckId;
            });
        },
        callAPI: () => $.ajax('/api/decks/' + deckId)
    };
}

export function selectDeck(deck) {
    return {
        type: 'SELECT_DECK',
        deck: deck
    };
}
