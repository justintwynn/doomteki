const mongoskin = require('mongoskin');
const db = mongoskin.db('mongodb://127.0.0.1:27017/throneteki');
const _ = require('underscore');

const logger = require('./../log.js');

module.exports.init = function(server) {
    server.get('/api/cards', function(req, res, next) {
        db.collection('cards').find({}).toArray(function(err, data) {
            if(err) {
                logger.info(err);
                return next(err);
            }

            let cards = _.map(data, card => {
                return _.pick(card, 'code', 'name', 'label', 'type_code', 'type_name', 'is_loyal', 'faction_code', 'deck_limit', 'pack_code');
            });

            res.send({ success: true, cards: cards });
        });
    });

    server.get('/api/packs', function(req, res, next) {
        db.collection('packs').find({}).toArray(function(err, data) {
            if(err) {
                logger.info(err);
                return next(err);
            }

            res.send({ success: true, packs: data });
        });
    });

    server.get('/api/factions', function(req, res) {
        let factions = [
                { name: 'House Baratheon', value: 'baratheon' },
                { name: 'House Greyjoy', value: 'greyjoy' },
                { name: 'House Lannister', value: 'lannister' },
                { name: 'House Martell', value: 'martell' },
                { name: 'The Night\'s Watch', value: 'thenightswatch' },
                { name: 'House Stark', value: 'stark' },
                { name: 'House Targaryen', value: 'targaryen' },
                { name: 'House Tyrell', value: 'tyrell' }
        ];
        res.send({ success: true, factions: factions });
    });
};
