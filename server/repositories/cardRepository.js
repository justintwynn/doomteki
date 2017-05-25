const _ = require('underscore');

const logger = require('../log.js');
const BaseRepository = require('./baseRepository.js');

class DeckRepository extends BaseRepository {
    getCards(callback) {
        this.db.collection('cards').find({}).toArray((err, data) => {
            if(err) {
                logger.info(err);

                this.callCallbackIfPresent(callback, err);
            }

            let cards = _.map(data, card => {
                return _.pick(card, 'code', 'name', 'label', 'type_code', 'type_name', 'is_loyal', 'faction_code', 'deck_limit', 'pack_code');
            });

            this.callCallbackIfPresent(callback, err, cards);
        });
    }

    getPacks(callback) {
        this.db.collection('packs').find({}).toArray((err, data) => {
            if(err) {
                logger.info(err);

                this.callCallbackIfPresent(callback, err);
            }

            this.callCallbackIfPresent(callback, err, data);
        });
    }
}

module.exports = DeckRepository;

