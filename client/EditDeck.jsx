import React from 'react';
import $ from 'jquery';
import { connect } from 'react-redux';

import DeckSummary from './DeckSummary.jsx';
import DeckEditor from './DeckEditor.jsx';
import AlertPanel from './SiteComponents/AlertPanel.jsx';

import * as actions from './actions';

class InnerEditDeck extends React.Component {
    constructor() {
        super();

        this.onEditDeck = this.onEditDeck.bind(this);
    }

    componentWillMount() {
        if(this.props.deckId) {
            return this.props.loadDeck(this.props.deckId);
        } else if(this.props.deck) {
            this.props.setUrl('/decks/edit/' + this.props.deck._id);

            return this.props.loadDeck(this.props.deck._id);
        }
    }

    onEditDeck(deck) {
        var str = JSON.stringify({
            deckName: deck.name,
            faction: deck.selectedFaction,
            agenda: deck.selectedAgenda,
            plotCards: deck.plotCards,
            drawCards: deck.drawCards,
            bannerCards: deck.bannerCards
        });

        $.ajax({
            url: '/api/decks/' + this.props.deckId,
            type: 'PUT',
            data: { data: str }
        }).done(data => {
            if(!data.success) {
                this.setState({ error: data.message });
                return;
            }

            this.props.navigate('/decks');
        }).fail(() => {
            this.setState({ error: 'Could not communicate with the server.  Please try again later.' });
        });
    }

    render() {
        let content;

        if(this.props.loading) {
            content = <div>Loading decks from the server...</div>;
        } else if(this.props.apiError) {
            content = <AlertPanel type='error' message={this.props.apiError} />;
        } else if(!this.props.deck) {
            content = <AlertPanel message='The specified deck was not found' type='error' />;
        } else {
            content = (<div>
                        {<DeckEditor agendas={ this.props.agendas } banners={ this.props.banners } cards={ this.props.cards } packs={ this.props.packs }
                            deck={ this.props.deck } mode='Save' onDeckChange={ this.onDeckChange } onDeckSave={ this.onEditDeck } />}
                        <DeckSummary className='col-sm-6 right-pane' cards={ this.props.cards } deck={ this.props.deck } />
                    </div>);
        }

        return content;
    }
}

InnerEditDeck.displayName = 'InnerEditDeck';
InnerEditDeck.propTypes = {
    agendas: React.PropTypes.array,
    apiError: React.PropTypes.string,
    banners: React.PropTypes.array,
    cards: React.PropTypes.array,
    deck: React.PropTypes.object,
    deckId: React.PropTypes.string,
    factions: React.PropTypes.array,
    loadDeck: React.PropTypes.func,
    loading: React.PropTypes.bool,
    navigate: React.PropTypes.func,
    packs: React.PropTypes.array,
    setUrl: React.PropTypes.func
};

function mapStateToProps(state) {
    return {
        apiError: state.api.message,
        agendas: state.cards.agendas,
        banners: state.cards.banners,
        cards: state.cards.cards,
        deck: state.cards.selectedDeck,
        factions: state.cards.factions,
        loading: state.api.loading,
        socket: state.socket.socket
    };
}

const EditDeck = connect(mapStateToProps, actions)(InnerEditDeck);

export default EditDeck;
