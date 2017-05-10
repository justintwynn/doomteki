import $ from 'jquery';

export function requestCards() {
    return {
        type: 'REQUEST_CARDS'
    };
}

export function receiveCards(cards) {
    return {
        type: 'RECEIVE_CARDS',
        cards: cards
    };
}

export function fetchCards() {
    return dispatch => {
        dispatch(requestCards());

        return $.ajax('/api/cards')
            .done(function(data) {
                dispatch(receiveCards(data.cards));
            });
    };
}

export function requestPacks() {
    return {
        type: 'REQUEST_PACKS'
    };
}

export function receivePacks(packs) {
    return {
        type: 'RECEIVE_PACKS',
        packs: packs
    };
}

export function fetchPacks() {
    return dispatch => {
        dispatch(requestPacks());

        return $.ajax('/api/packs')
            .done(function(data) {
                dispatch(receivePacks(data.packs));
            });
    };
}

export function requestFactions() {
    return {
        type: 'REQUEST_FACTIONS'
    };
}

export function receiveFactions(factions) {
    return {
        type: 'RECEIVE_FACTIONS',
        factions: factions
    };
}

export function fetchFactions() {
    return dispatch => {
        dispatch(requestFactions());

        return $.ajax('/api/factions')
            .done(function(data) {
                dispatch(receiveFactions(data.factions));
            });
    };
}
