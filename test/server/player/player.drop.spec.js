/*global describe, it, beforeEach, expect*/
/* eslint camelcase: 0 */

const Player = require('../../../server/game/player.js');

describe('the Player', () => {
    var player = new Player('1', 'Player 1', true);
    var attachment = { card: { uuid: '1111', code: '1', label: 'Attachment', type_code: 'attachment' } };
    var cardWithNoAttachments = { attachments: [], dupes: [], card: { uuid: '2222', code: '2', label: 'Character', type_code: 'character', is_unique: true } };
    var cardWithAttachment = { attachments: [attachment.card], card: { uuid: '3333', code: '3', label: 'Character', type_code: 'character' } };
    var characterInHand = { uuid: '4444', code: '4', label: 'Hand', type_code: 'character' };
    var locationInHand = { uuid: '5555', code: '5', label: 'Hand Location', type_code: 'location' };
    var attachmentInHand = { uuid: '7777', code: '7', label: 'Hand Attachment', type_code: 'attachment' };
    var eventInHand = { uuid: '8888', code: '8', label: 'Hand Event', type_code: 'event' };
    var cardNotInHand = { uuid: '6666', code: '6', label: 'NotInHand', type_code: 'character' };
    var dupe = { uuid: '2222dupe', code: '2', label: 'Hand', type_code: 'character', is_unique: true };

    beforeEach(() => {
        player.initialise();

        // player.cardsInPlay.push(cardWithAttachment);
    });

    describe('the drop() function', function() {
        describe('when dragging a card from hand to play area', function() {
            var dropSucceeded = false;

            describe('if the card is not in the hand', function() {
                beforeEach(function() {
                    dropSucceeded = player.drop(cardNotInHand, 'hand', 'play area');
                });

                it('should return false', function() {
                    expect(dropSucceeded).toBe(false);
                });

                it('should not add any cards to the play area', function() {
                    expect(player.cardsInPlay.length).toBe(0);
                });

                it('should not remove any cards from hand', function() {
                    expect(player.hand.length).toBe(0);
                });
            });

            describe('if the card is in hand and a character', function() {
                beforeEach(function() {
                    player.hand.push(characterInHand);
                    dropSucceeded = player.drop(characterInHand, 'hand', 'play area');
                });

                it('should return true', function() {
                    expect(dropSucceeded).toBe(true);
                });

                it('should add the card to the player area', function() {
                    expect(player.cardsInPlay.length).toBe(1);
                });

                it('should remove the card from hand', function() {
                    expect(player.hand.length).toBe(0);
                });
            });

            describe('if the card is a character and a dupe is in play', function() {
                beforeEach(function() {
                    player.hand.push(dupe);
                    player.cardsInPlay.push(cardWithNoAttachments);

                    cardWithNoAttachments.dupes = [];

                    dropSucceeded = player.drop(dupe, 'hand', 'play area');
                });

                it('should return true', function() {
                    expect(dropSucceeded).toBe(true);
                });

                it('should remove the card from hand', function() {
                    expect(player.hand.length).toBe(0);
                });

                it('should not add a new card to the play area', function() {
                    expect(player.cardsInPlay.length).toBe(1);
                });

                it('should add a dupe to the character in play', function() {
                    expect(cardWithNoAttachments.dupes.length).toBe(1);
                });
            });

            describe('if the card is in hand and a location', function() {
                beforeEach(function() {
                    player.hand.push(locationInHand);
                    dropSucceeded = player.drop(locationInHand, 'hand', 'play area');
                });

                it('should return true', function() {
                    expect(dropSucceeded).toBe(true);
                });

                it('should not add the card to the play area', function() {
                    expect(player.cardsInPlay.length).toBe(1);
                });

                it('should remove the card from hand', function() {
                    expect(player.hand.length).toBe(0);
                });
            });

            describe('if the card is in hand and an event', function() {
                beforeEach(function() {
                    player.hand.push(eventInHand);
                    dropSucceeded = player.drop(eventInHand, 'hand', 'play area');
                });

                it('should return false', function() {
                    expect(dropSucceeded).toBe(false);
                });

                it('should not add the card to the player area', function() {
                    expect(player.cardsInPlay.length).toBe(0);
                });

                it('should not remove the card from hand', function() {
                    expect(player.hand.length).toBe(1);
                });
            });

            describe('if the card is in hand and an attachment', function() {
                beforeEach(function() {
                    player.hand.push(attachmentInHand);
                    dropSucceeded = player.drop(attachmentInHand, 'hand', 'play area');
                });

                it('should return true', function() {
                    expect(dropSucceeded).toBe(true);
                });

                it('should setup waiting for attachment target', function() {
                    expect(player.menuTitle).toBe('Select target for attachment');
                    expect(player.selectCard).toBe(true);
                    expect(player.selectedAttachment).toBe(attachmentInHand);
                });

                it('should not put any cards in play', function() {
                    expect(player.cardsInPlay.length).toBe(0);
                });

                it('should not remove the attachment from hand', function() {
                    expect(player.hand.length).toBe(1);
                });
            });
        });
    });
});