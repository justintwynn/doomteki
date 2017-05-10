import $ from 'jquery';

export function loadCards() {
    return {
        types: ['REQUEST_CARDS', 'RECEIVE_CARDS', 'CARDS_FAILURE'],
        shouldCallAPI: (state) => {
            return !state.cards.cards;  
        },
        callAPI: () => $.ajax('/api/cards')
    };
}

export function loadPacks() {
    return {
        types: ['REQUEST_PACKS', 'RECEIVE_PACKS', 'PACKS_FAILURE'],
        shouldCallAPI: (state) => {
            return !state.cards.packs;  
        },
        callAPI: () => $.ajax('/api/packs')
    };    
}

export function loadFactions() {
    return {
        types: ['REQUEST_FACTIONS', 'RECEIVE_FACTIONS', 'FACTIONS_FAILURE'],
        shouldCallAPI: (state) => {
            return !state.cards.factions;  
        },
        callAPI: () => $.ajax('/api/factions')
    };
}
