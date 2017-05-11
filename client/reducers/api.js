export default function(state = {}, action) {
    switch(action.type) {
        case 'API_FAILURE':
            return Object.assign({}, state, {
                status: action.status,
                message: action.message,
                loading: false
            });
        case 'API_LOADED':
            return Object.assign({}, state, {
                loading: false,
                message: undefined
            });
        case 'API_LOADING':
            return Object.assign({}, state, {
                status: undefined,
                message: undefined,
                loading: true
            });        
    }

    return state;
}
