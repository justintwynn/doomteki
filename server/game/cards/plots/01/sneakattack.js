const PlotCard = require('../../../plotcard.js');

class SneakAttack extends PlotCard {
    flipFaceup() {
        super.flipFaceup();

        this.owner.setMaxChallenge(1);
    }
}

SneakAttack.code = '01021';

module.exports = SneakAttack;