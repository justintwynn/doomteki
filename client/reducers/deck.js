import _ from 'underscore';

export default function(state = {}, action) {
    let newState;

    switch(action.type) {
        case 'RECEIVE_DECKS':
            newState = Object.assign({}, state, {
                decks: action.response.decks
            });

            if(newState.decks && newState.decks.length !== 0) {
                newState.selectedDeck = newState.decks[0];
            } else {
                delete newState.selectedDeck;
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

            if(newState.decks && newState.decks.length !== 0) {
                newState.selectedDeck = action.response.deck;
            } else {
                delete newState.selectedDeck;
            }

            return newState;
        case 'SELECT_DECK':
            return Object.assign({}, state, {
                selectedDeck: action.deck
            });
    }

    return state;
}
