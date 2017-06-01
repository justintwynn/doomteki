import React from 'react';
import $ from 'jquery';
import { connect } from 'react-redux';

import DeckSummary from './DeckSummary.jsx';
import DeckEditor from './DeckEditor.jsx';
import AlertPanel from './SiteComponents/AlertPanel.jsx';

import * as actions from './actions';

export class InnerAddDeck extends React.Component {
    constructor() {
        super();

        this.state = {
            error: '',
            faction: {}
        };

        this.onAddDeck = this.onAddDeck.bind(this);
        this.onDeckChange = this.onDeckChange.bind(this);
    }

    componentWillMount() {
        this.props.selectDeck({ name: 'New Deck' });
    }

    onAddDeck(deck) {
        var str = JSON.stringify({
            deckName: deck.name,
            faction: deck.selectedFaction,
            agenda: deck.selectedAgenda,
            plotCards: deck.plotCards,
            drawCards: deck.drawCards
        });

        $.ajax({
            url: '/api/decks/',
            type: 'POST',
            data: { data: str },
            cache: false
        }).done((data) => {
            if(!data.success) {
                this.setState({ error: data.message });
                return;
            }

            this.props.navigate('/decks');
        }).fail(() => {
            this.setState({ error: 'Could not communicate with the server.  Please try again later.' });
        });
    }

    onDeckChange(deck) {
        this.setState({
            deckName: deck.name,
            faction: deck.selectedFaction,
            agenda: deck.selectedAgenda,
            plotCards: deck.plotCards,
            drawCards: deck.drawCards
        });
    }

    render() {
        let content;

        if(this.props.loading) {
            content = <div>Loading decks from the server...</div>;
        } else if(this.props.apiError) {
            content = <AlertPanel type='error' message={ this.props.apiError } />;
        } else {
            content = (<div>
                <DeckEditor mode='Add' onDeckSave={ this.onAddDeck } />
                <DeckSummary className='col-sm-6 right-pane' cards={ this.props.cards } deck={ this.props.deck } />
            </div>);
        }

        return content;
    }
}

InnerAddDeck.displayName = 'InnerAddDeck';
InnerAddDeck.propTypes = {
    agendas: React.PropTypes.object,
    apiError: React.PropTypes.string,
    cards: React.PropTypes.object,
    deck: React.PropTypes.object,
    factions: React.PropTypes.object,
    loading: React.PropTypes.bool,
    navigate: React.PropTypes.func,
    selectDeck: React.PropTypes.func
};

function mapStateToProps(state) {
    return {
        agendas: state.cards.agendas,
        apiError: state.api.message,
        cards: state.cards.cards,
        deck: state.cards.selectedDeck,
        factions: state.cards.factions,
        loading: state.api.loading,
        socket: state.socket.socket
    };
}

const AddDeck = connect(mapStateToProps, actions)(InnerAddDeck);

export default AddDeck;
