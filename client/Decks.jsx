import React from 'react';
import $ from 'jquery';
import _ from 'underscore';
import {connect} from 'react-redux';

import AlertPanel from './SiteComponents/AlertPanel.jsx';
import DeckSummary from './DeckSummary.jsx';
import Link from './Link.jsx';
import DeckRow from './DeckRow.jsx';

import * as actions from './actions';

class InnerDecks extends React.Component {
    constructor() {
        super();

        this.onDeleteClick = this.onDeleteClick.bind(this);
        this.onConfirmDeleteClick = this.onConfirmDeleteClick.bind(this);

        this.state = {
            decks: [],
            showDelete: false
        };
    }

    componentWillMount() {
        this.props.loadDecks();
    }

    onDeleteClick(event) {
        event.preventDefault();

        this.setState({ showDelete: !this.state.showDelete });
    }

    onEditClick(event) {
        event.preventDefault();

        this.props.navigate('/decks/edit');
    }

    onConfirmDeleteClick(event) {
        event.preventDefault();

        var selectedDeck = undefined;

        if(this.state.selectedDeck !== undefined) {
            selectedDeck = this.state.decks[this.state.selectedDeck];
        }

        $.ajax({
            url: '/api/decks/' + selectedDeck._id,
            type: 'DELETE'
        }).done(data => {
            if(!data.success) {
                this.setState({ error: data.message });
                return;
            }

            this.setState({
                decks: _.reject(this.state.decks, deck => {
                    return deck._id === selectedDeck._id;
                })
            });
        }).fail(() => {
            this.setState({ error: 'Could not communicate with the server.  Please try again later.' });
        });

        this.setState({ showDelete: false });
    }

    render() {
        var index = 0;

        var decks = _.map(this.props.decks, deck => {
            var row = (<DeckRow key={ deck.name + index.toString() } deck={ deck }
                                onClick={ () => this.props.selectDeck(deck) }
                                active={ this.props.selectedDeck && deck._id === this.props.selectedDeck._id } />);

            index++;

            return row;
        });

        var deckList = (
            <div>
                { decks }
            </div>
        );

        var deckInfo = null;

        if(this.props.selectedDeck) {
            deckInfo = (<div className='col-sm-6'>
                <div className='btn-group'>
                    <button className='btn btn-primary' onClick={ this.onEditClick.bind(this) }>Edit</button>
                    <button className='btn btn-primary' onClick={this.onDeleteClick}>Delete</button>
                    {this.state.showDelete ?
                        <button className='btn btn-danger' onClick={this.onConfirmDeleteClick}>Delete</button> :
                        null}
                </div>
                <DeckSummary deck={ this.props.selectedDeck } cards={ this.props.cards } />
            </div>);
        }

        let content = null;

        if(this.props.loading) {
            content = <div>Loading decks from the server...</div>;
        } else if(this.props.apiError) {
            content = <AlertPanel type='error' message={ this.props.apiError } />;
        } else {
            content = (
                <div>
                    <div className='col-sm-6'>
                        <Link className='btn btn-primary' href='/decks/add'>Add new deck</Link>
                        <div className='deck-list'>{ !this.props.decks || this.props.decks.length === 0 ? 'You have no decks, try adding one.' : deckList }</div>
                    </div>
                    { deckInfo }
                </div>);
        }

        return content;
    }
}

InnerDecks.displayName = 'Decks';
InnerDecks.propTypes = {
    apiError: React.PropTypes.string,
    cards: React.PropTypes.object,
    decks: React.PropTypes.array,
    loadDecks: React.PropTypes.func,
    loading: React.PropTypes.bool,
    navigate: React.PropTypes.func,
    selectDeck: React.PropTypes.func,
    selectedDeck: React.PropTypes.object
};

function mapStateToProps(state) {
    return {
        apiError: state.api.message,
        cards: state.cards.cards,
        decks: state.cards.decks,
        loading: state.api.loading,
        selectedDeck: state.cards.selectedDeck
    };
}

const Decks = connect(mapStateToProps, actions)(InnerDecks);

export default Decks;
