import _ from 'underscore';

function cards(state = {
}, action) {
    switch(action.type) {
        case 'RECEIVE_CARDS':
            var agendas = _.filter(action.response.cards, function(card) {
                return card.type_code === 'agenda' && card.pack_code !== 'VDS';
            });
            return Object.assign({}, state, {
                cards: action.response.cards,
                agendas: agendas
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
        default:
            return state;
    }
}

export default cards;
