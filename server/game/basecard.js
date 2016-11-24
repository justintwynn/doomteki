const uuid = require('node-uuid');
const _ = require('underscore');

const ValidKeywords = [
    'insight',
    'intimidate',
    'pillage',
    'renown',
    'stealth',
    'terminal'
];

class BaseCard {
    constructor(owner, cardData) {
        this.owner = owner;
        this.game = this.owner.game;
        this.cardData = cardData;

        this.uuid = uuid.v1();
        this.code = cardData.code;
        this.name = cardData.name;
        this.facedown = false;
        this.inPlay = false;
        this.blankCount = 0;

        this.tokens = {};

        this.menu = _([]);
        this.parseCard(cardData.text || '');
    }

    parseCard(text) {
        var firstLine = text.split('\n')[0];
        var potentialKeywords = _.map(firstLine.split('.'), k => k.toLowerCase().trim());
        this.keywords = [];
        this.allowedAttachmentTrait = 'any';
        _.each(potentialKeywords, keyword => {
            if(_.contains(ValidKeywords, keyword)) {
                this.keywords.push(keyword);
            } else if(keyword.indexOf('no attachment') === 0) {
                var match = keyword.match(/no attachments except <b>(.*)<\/b>/);
                if(match) {
                    this.allowedAttachmentTrait = match[1];
                } else {
                    this.allowedAttachmentTrait = 'none';
                }
            }
        });
    }

    registerEvents(events) {
        this.events = [];

        _.each(events, event => {
            this[event] = this[event].bind(this);

            this.game.on(event, this[event]);

            this.events.push(event);
        });
    }

    hasKeyword(keyword) {
        if(this.isBlank()) {
            return false;
        }

        return _.contains(this.keywords, keyword.toLowerCase());
    }

    hasTrait(trait) {
        return this.cardData.traits && this.cardData.traits.toLowerCase().indexOf(trait.toLowerCase() + '.') !== -1;
    }

    leavesPlay() {
        _.each(this.events, event => {
            this.game.removeListener(event, this[event]);
        });

        this.inPlay = false;
    }

    modifyDominance(player, strength) {
        return strength;
    }

    canPlay() {
        return true;
    }

    canReduce() {
        return false;
    }

    getInitiative() {
        return 0;
    }

    getIncome() {
        return 0;
    }

    getReserve() {
        return 0;
    }

    getFaction() {
        return this.cardData.faction_code;
    }

    getMenu() {
        return this.menu.isEmpty() ? undefined : this.menu.value();
    }

    isUnique() {
        return this.cardData.is_unique;
    }

    isBlank() {
        return this.blankCount > 0;
    }

    getType() {
        return this.cardData.type_code;
    }

    reduce(card, cost) {
        return cost;
    }

    modifyClaim(player, type, claim) {
        return claim;
    }

    setBlank() {
        this.blankCount++;
    }

    clearBlank() {
        this.blankCount--;
    }

    addToken(type, number) {
        if(_.isUndefined(this.tokens[type])) {
            this.tokens[type] = 0;
        }

        this.tokens[type] += number;
    }

    removeToken(type, number) {
        this.tokens[type] -= number;

        if(this.tokens[type] < 0) {
            this.tokens[type] = 0;
        }
    }

    getSummary(isActivePlayer, hideWhenFaceup) {
        return isActivePlayer || (!this.facedown && !hideWhenFaceup) ? {
            code: this.cardData.code,
            facedown: this.facedown,
            menu: this.getMenu(),
            name: this.cardData.name,
            new: this.new,
            tokens: this.tokens,
            type: this.cardData.type_code,
            uuid: this.uuid
        } : { facedown: true };
    }
}

module.exports = BaseCard;