import _ from 'underscore';
import {validateDeck} from '../deck-validator.js';

function selectDeck(state, deck) {
    if(state.decks && state.decks.length !== 0) {
        state.selectedDeck = deck;
    } else {
        delete state.selectedDeck;
    }
    return state;
}

function validateDecks(decks) {
    _.each(decks, deck => {
        deck.validation = validateDeck(deck);
    });
}

export default function(state = {}, action) {
    let newState;

    switch(action.type) {
        case 'RECEIVE_DECKS':
            newState = Object.assign({}, state, {
                decks: action.response.decks
            });

            newState = selectDeck(newState, newState.decks[0]);

            if(newState.decks) {
                validateDecks(newState.decks);
            }

            return newState;
        case 'RECEIVE_DECK':
            newState = Object.assign({}, state, {
            });

            newState.decks = _.map(state.deck.decks, deck => {
                if(action.response.deck._id === deck.id) {
                    return action.response.deck;
                }

                return deck;
            });

            if(!_.any(newState.decks, deck => {
                return deck._id === action.response.deck._id;
            })) {
                newState.push(action.response.deck);
            }

            newState = selectDeck(newState, action.response.deck);

            if(newState.decks) {
                validateDecks(newState.decks);
            }

            return newState;
        case 'SELECT_DECK':
            return Object.assign({}, state, {
                selectedDeck: action.deck
            });
    }

    return state;
}
