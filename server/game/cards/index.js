const _ = require('underscore');
const path = require('path');
const fs = require('fs');

const actions = require('./actions');
const deeds = require('./deeds');
const dudes = require('./dudes');
const goods = require('./goods');
const legends = require('./legends');
const outfits = require('./outfits');
const spells = require('./spells');

var cards = {};

_.each(fs.readdirSync(path.join(__dirname, 'outfits')), file => {
    var card = require('./outfits/' + file);

    cards[card.code] = card;
});

cards = _.extend(cards, actions, deeds, dudes, goods, legends, outfits, spells);

module.exports = cards;
