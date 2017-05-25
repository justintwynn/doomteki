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

function validateDecks(decks, packs) {
    _.each(decks, deck => {
        deck.validation = validateDeck(deck, packs);
    });
}

export default function(state = {}, action) {
    let newState;

    switch(action.type) {
        case 'RECEIVE_CARDS':
            var agendas = _.filter(action.response.cards, card => {
                return card.type_code === 'agenda' && card.pack_code !== 'VDS';
            });

            var banners = _.filter(agendas, card => {
                return card.label.startsWith('Banner of the');
            });

            return Object.assign({}, state, {
                cards: action.response.cards,
                agendas: agendas,
                banners: banners
            });
        case 'RECEIVE_PACKS':
            return Object.assign({}, state, {
                packs: action.response.packs
            });
        case 'RECEIVE_FACTIONS':
            return Object.assign({}, state, {
                factions: action.response.factions
            });
        case 'ZOOM_CARD':
            return Object.assign({}, state, {
                zoomCard: action.card
            });
        case 'CLEAR_ZOOM':
            return Object.assign({}, state, {
                zoomCard: undefined
            });
        case 'RECEIVE_DECKS':
            newState = Object.assign({}, state, {
                singleDeck: false,
                decks: action.response.decks
            });

            if(newState.decks) {
                validateDecks(newState.decks, newState.packs);
            }

            newState = selectDeck(newState, newState.decks[0]);

            return newState;
        case 'RECEIVE_DECK':
            newState = Object.assign({}, state, {
                singleDeck: true
            });

            newState.decks = _.map(state.decks, deck => {
                if(action.response.deck._id === deck.id) {
                    return action.response.deck;
                }

                return deck;
            });

            if(!_.any(newState.decks, deck => {
                return deck._id === action.response.deck._id;
            })) {
                newState.decks.push(action.response.deck);
            }

            if(newState.decks) {
                validateDecks(newState.decks, newState.packs);
            }

            var selected = _.find(newState.decks, deck => {
                return deck._id === action.response.deck._id;
            });

            newState = selectDeck(newState, selected);

            return newState;
        case 'SELECT_DECK':
            newState = Object.assign({}, state, {
                selectedDeck: action.deck
            });

            if(newState.selectedDeck) {
                validateDecks([newState.selectedDeck], newState.packs);
            }

            return newState;
        case 'UPDATE_DECK':
            newState = Object.assign({}, state, {
                selectedDeck: action.deck
            });

            if(newState.selectedDeck) {
                validateDecks([newState.selectedDeck], newState.packs);
            }

            return newState;
        default:
            return state;
    }
}
