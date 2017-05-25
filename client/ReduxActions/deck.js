import $ from 'jquery';
import _ from 'underscore';

export function loadDecks() {
    return {
        types: ['REQUEST_DECKS', 'RECEIVE_DECKS'],
        shouldCallAPI: (state) => {
            return state.cards.singleDeck || !state.cards.decks;
        },
        callAPI: () => $.ajax('/api/decks')
    };
}

export function loadDeck(deckId) {
    return {
        types: ['REQUEST_DECK', 'RECEIVE_DECK'],
        shouldCallAPI: (state) => {
            let ret = !_.any(state.cards.decks, deck => {
                return deck._id === deckId;
            });

            return ret;
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

export function updateDeck(deck) {
    return {
        type: 'UPDATE_DECK',
        deck: deck
    };
}
