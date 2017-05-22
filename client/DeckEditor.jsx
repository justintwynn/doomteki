import React from 'react';
import _ from 'underscore';
import $ from 'jquery';
import {connect} from 'react-redux';

import Input from './FormComponents/Input.jsx';
import Select from './FormComponents/Select.jsx';
import Typeahead from './FormComponents/Typeahead.jsx';
import TextArea from './FormComponents/TextArea.jsx';

import * as actions from './actions';

class InnerDeckEditor extends React.Component {
    constructor(props) {
        super(props);

        this.onFactionChange = this.onFactionChange.bind(this);
        this.onAgendaChange = this.onAgendaChange.bind(this);
        this.onBannerChange = this.onBannerChange.bind(this);
        this.onAddCard = this.onAddCard.bind(this);
        this.onAddBanner = this.onAddBanner.bind(this);
        this.addCardChange = this.addCardChange.bind(this);
        this.onCardListChange = this.onCardListChange.bind(this);
        this.onBannerListChange = this.onBannerListChange.bind(this);
        this.onSaveClick = this.onSaveClick.bind(this);

        this.state = {
            cardList: '',
            deck: this.copyDeck(props.deck),
            numberToAdd: 1,
            showBanners: false,
            selectedBanner: {},
            validation: {
                deckname: '',
                cardToAdd: ''
            }
        };
    }

    componentWillMount() {
        var cardList = '';
        var bannerList = '';

        if(this.props.deck && this.props.deck.bannerCards) {
            _.each(this.props.deck.bannerCards, card => {
                bannerList += ' ' + card.label + '\n';
            });

            this.setState({ bannerList: bannerList });
        }

        if(this.props.deck && (this.props.deck.drawCards || this.props.deck.plotCards)) {
            _.each(this.props.deck.drawCards, card => {
                cardList += card.count + ' ' + card.card.label + '\n';
            });

            _.each(this.props.deck.plotCards, card => {
                cardList += card.count + ' ' + card.card.label + '\n';
            });

            this.setState({ cardList: cardList });
        }
    }

    buildDeck() {
        return {
            name: this.state.deckName,
            selectedFaction: this.state.selectedFaction,
            selectedAgenda: this.state.selectedAgenda,
            plotCards: this.state.plotCards,
            drawCards: this.state.drawCards,
            bannerCards: this.state.bannerCards
        };
    }

    // XXX One could argue this is a bit hacky, because we're updating the innards of the deck object, react doesn't update components that use it unless we change the reference itself
    copyDeck(deck) {
        if(!deck) {
            return { name: 'New Deck '};
        }

        return {
            name: deck.name,
            plotCards: deck.plotCards,
            drawCards: deck.drawCards,
            bannerCards: deck.bannerCards,
            faction: deck.faction,
            agenda: deck.agenda
        };
    }

    onChange(field, event) {
        let deck = this.copyDeck(this.state.deck);

        deck[field] = event.target.value;

        this.setState({ deck: deck });
        this.props.updateDeck(deck);
    }

    onFactionChange(selectedFaction) {
        let deck = this.copyDeck(this.state.deck);

        deck.faction = selectedFaction;

        this.setState({ deck: deck });
        this.props.updateDeck(deck);
    }

    onAgendaChange(selectedAgenda) {
        let deck = this.copyDeck(this.state.deck);

        deck.agenda = selectedAgenda;

        this.setState({ deck: deck, showBanners: deck.agenda.code === '06018' });
        this.props.updateDeck(deck);
    }

    onBannerChange(event) {
        if(!event.target.value || event.target.value === '') {
            this.setState({ selectedBanner: { code: '' } }, () => this.raiseDeckChanged());
            return;
        }

        var banner = _.find(this.props.agendas, function(agenda) {
            return agenda.name === event.target.value;
        });
        this.setState({ selectedBanner: banner }, () => this.raiseDeckChanged());
    }

    addBanner(card) {
        var list = this.state.bannerCards;
        list.push(card);
        this.setState({bannerCards: list});
    }

    onAddBanner(event) {
        event.preventDefault();
        this.addBanner(this.state.selectedBanner);
        var bannerList = this.state.bannerList;
        bannerList += this.state.selectedBanner.label + '\n';
        this.setState({ bannerList: bannerList }, () => this.raiseDeckChanged());
    }

    addCardChange(selectedCards) {
        this.setState({ cardToAdd: selectedCards[0] });
    }

    onAddCard(event) {
        event.preventDefault();

        if(!this.state.cardToAdd || !this.state.cardToAdd.label) {
            return;
        }

        var cardList = this.state.cardList;
        cardList += this.state.numberToAdd + ' ' + this.state.cardToAdd.label + '\n';

        this.addCard(this.state.cardToAdd, parseInt(this.state.numberToAdd));
        this.setState({ cardList: cardList }, () => this.raiseDeckChanged());
    }

    onBannerListChange(event) {

        var split = event.target.value.split('\n');
        this.setState({bannerCards: []}, () => {
            _.each(split, line => {
                line = line.trim();
                var card = _.find(this.props.cards, function(card) {
                    return card.label.toLowerCase() === line.toLowerCase();
                });
                if(card) {
                    this.addBanner(card);
                }
            });
        });
        this.setState({ bannerList: event.target.value }, () => this.raiseDeckChanged());
    }

    onCardListChange(event) {
        var split = event.target.value.split('\n');

        var headerMark = _.findIndex(split, line => line.match(/^Packs:/));
        if(headerMark >= 0) { // ThronesDB-style deck header found
                              // extract deck title, faction, agenda, and banners
            var header = _.filter(_.first(split, headerMark), line => line !== '');
            split = _.rest(split, headerMark);

            if(header.length >= 2) {
                this.setState({ deckName: header[0] });

                var faction = _.find(this.props.factions, faction => faction.name === header[1]);
                if(faction) {
                    this.setState({ selectedFaction: faction }, () => this.raiseDeckChanged());
                }

                header = _.rest(header, 2);
                if(header.length >= 1) {
                    var rawAgenda = undefined;
                    if(_.contains(header, 'Alliance')) {
                        rawAgenda = 'Alliance';
                        var rawBanners = _.filter(header, line => line !== 'Alliance');
                    } else {
                        rawAgenda = header[0];
                    }

                    var agenda = _.find(this.props.agendas, agenda => agenda.name === rawAgenda);
                    if(agenda) {
                        this.setState({ bannersVisible: agenda.name === 'Alliance'});
                        this.setState({ selectedAgenda: agenda }, () => this.raiseDeckChanged());
                    }
                    if(rawBanners) {
                        this.setState({ bannerList: rawBanners.join('\n') }, () => this.raiseDeckChanged());
                    }
                }
            }
        }

        this.setState({ drawCards: [], plotCards: [] }, () => {
            _.each(split, line => {
                line = line.trim();
                var index = 2;

                if(!$.isNumeric(line[0])) {
                    return;
                }

                var num = parseInt(line[0]);
                if(line[1] === 'x') {
                    index++;
                }

                var packOffset = line.indexOf('(');
                var cardName = line.substr(index, packOffset === -1 ? line.length : packOffset - index - 1);
                var packName = line.substr(packOffset + 1, line.length - packOffset - 2);

                var pack = _.find(this.props.packs, function(pack) {
                    return pack.code === packName || pack.name === packName;
                });

                var card = _.find(this.props.cards, function(card) {
                    if(pack) {
                        return card.label.toLowerCase() === cardName.toLowerCase() || card.label.toLowerCase() === (cardName + ' (' + pack.code + ')').toLowerCase();
                    }

                    return card.label.toLowerCase() === cardName.toLowerCase();
                });

                if(card) {
                    this.addCard(card, num);
                }
            }, () => this.raiseDeckChanged());
        });

        this.setState({ cardList: event.target.value }, () => this.raiseDeckChanged());
    }

    addCard(card, number) {
        var plots = this.state.plotCards;
        var draw = this.state.drawCards;

        var list;

        if(card.type_code === 'plot') {
            list = plots;
        } else {
            list = draw;
        }

        if(list[card.code]) {
            list[card.code].count += number;
        } else {
            list.push({ count: number, card: card });
        }

        this.setState({ plotCards: plots, drawCards: draw }, () => this.raiseDeckChanged());
    }

    onSaveClick(event) {
        event.preventDefault();
    }

    render() {
        if(!this.props.deck) {
            return <div>Waiting for deck...</div>;
        }

        return (
            <div className='col-sm-6'>
                <h2>Deck Editor</h2>
                <h4>Either type the cards manually into the box below, add the cards one by one using the card box and autocomplete or for best results, copy and paste a decklist from <a href='http://thronesdb.com' target='_blank'>Thrones DB</a> into the box below.</h4>
                <form className='form form-horizontal'>
                    <Input name='deckName' label='Deck Name' labelClass='col-sm-3' fieldClass='col-sm-9' placeholder='Deck Name'
                        type='text' onChange={this.onChange.bind(this, 'name')} value={ this.state.deck.name } />
                    <Select name='faction' label='Faction' labelClass='col-sm-3' fieldClass='col-sm-9' options={ this.props.factions }
                        onChange={ this.onFactionChange } value={ this.state.deck.faction ? this.state.deck.faction.value : undefined } />
                    <Select name='agenda' label='Agenda' labelClass='col-sm-3' fieldClass='col-sm-9' options={ this.props.agendas }
                        onChange={ this.onAgendaChange } value={ this.state.deck.agenda ? this.state.deck.agenda.code : undefined }
                        valueKey='code' nameKey='label' blankOption={ { label: '- Select -', code: '' } } />

                    { this.state.showBanners &&
                    <div>
                        <Select name='banners' label ='Banners' labelClass='col-sm-3' fieldClass='col-sm-9' options={ this.props.banners }
                            onChange={ this.onBannerChange } value={ this.state.selectedBanner.name }
                            blankOption={ { name: '- Select -', code: '' } } button={ { text:'Add', onClick: this.onAddBanner} } />
                        <TextArea label='Banners' labelClass='col-sm-3' fieldClass='col-sm-9' disabled='disabled' rows='2' value={ this.state.bannerList }
                            onChange={ this.onBannerListChange } />
                    </div>
                    }
                    <Typeahead label='Card' labelClass={'col-sm-3'} fieldClass='col-sm-4' labelKey={'label'} options={this.props.cards}
                        onChange={this.addCardChange}>
                        <Input name='numcards' type='text' label='Num' labelClass='col-sm-1' fieldClass='col-sm-2'
                            value={this.state.numberToAdd.toString()} onChange={this.onChange.bind(this, 'numberToAdd')}>
                            <div className='col-sm-1'>
                                <button className='btn btn-default' onClick={this.onAddCard}>Add</button>
                            </div>
                        </Input>
                    </Typeahead>
                    <TextArea label='Cards' labelClass='col-sm-3' fieldClass='col-sm-9' rows='25' value={this.state.cardList}
                        onChange={this.onCardListChange} />
                    <div className='form-group'>
                        <div className='col-sm-offset-3 col-sm-8'>
                            <button ref='submit' type='submit' className='btn btn-primary' onClick={this.onSaveClick}>{this.props.mode}</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

InnerDeckEditor.displayName = 'DeckEditor';
InnerDeckEditor.propTypes = {
    agendas: React.PropTypes.array,
    banners: React.PropTypes.array,
    cards: React.PropTypes.array,
    deck: React.PropTypes.object,
    factions: React.PropTypes.array,
    mode: React.PropTypes.string,
    packs: React.PropTypes.array,
    updateDeck: React.PropTypes.func
};

function mapStateToProps(state) {
    return {
        apiError: state.api.message,
        banners: state.cards.banners,
        cards: state.cards.cards,
        deck: state.cards.selectedDeck,
        decks: state.cards.decks,
        factions: state.cards.factions,
        loading: state.api.loading
    };
}

const DeckEditor = connect(mapStateToProps, actions)(InnerDeckEditor);

export default DeckEditor;
