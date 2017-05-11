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
        case 'SELECT_DECK':
            return Object.assign({}, state, {
                selectedDeck: action.deck
            });
    }

    return state;
}
