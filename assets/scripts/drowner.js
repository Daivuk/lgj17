getTexture("drowner.png", false);

function createDrowner(position)
{
    var drowner = {
        position: position,
        sprite: playSpriteAnim("drowner.spriteanim", "idle", Random.getNext(14)),
        update: updateDrowner,
        render: renderSprite,
        helpDelay: Random.getNext(3) + 2,
        pitch: Random.getNext(10) / 20 + 1.0
    }
    addEntity(drowner);
    return drowner;
}

var ATT_DIST = 80 * 80;
var PICKUP_DIST = 10 * 10;

function getAtt(entity, position)
{
    var distance = Vector2.distanceSquared(entity.position, position);
    if (distance > ATT_DIST) return 0;
    return 1 - (distance / ATT_DIST);
}

function updateDrowner(drowner, dt)
{
    // Test for boat pickup
    if (!player1.hasMan && !player1.hasSoldier && !player1.hasTank)
    {
        var distance = Vector2.distanceSquared(player1.position, drowner.position);
        if (distance <= PICKUP_DIST)
        {
            playSound("save.wav");
            removeEntity(drowner);
            player1.hasMan = true;
            return true;
        }
    }

    // Scream for help
    drowner.helpDelay -= dt;
    if (drowner.helpDelay <= 0)
    {
        drowner.helpDelay = Random.getNext(3) + 2;

        // Are we close enough to player?
        var vol = getAtt(player1, drowner.position);
        if (playerCount == 2) vol += getAtt(player2, drowner.position);
        if (vol > 1) vol = 1;
        if (vol > 0)
        {
            playSound("help" + (Random.getNext(2) + 1) + ".wav", vol * .35, 0, drowner.pitch);
        }
    }
}
