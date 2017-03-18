getTexture("drowner.png", false);

function createDrowner(position)
{
    var drowner = {
        position: new Vector2(position),
        sprite: playSpriteAnim("drowner.spriteanim", "idle", Random.getNext(14)),
        update: updateDrowner,
        render: renderSprite,
        helpDelay: Random.getNext(3) + 2
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

function doPickup(drowner, player)
{
    if (!player.hasMan && !player.hasSoldier && !player.hasTank)
    {
        var distance = Vector2.distanceSquared(player.position, drowner.position);
        if (distance <= PICKUP_DIST)
        {
            playSound("save.wav");
            removeEntity(drowner);
            player.hasMan = true;
            return true;
        }
    }
    return false; 
}

function updateDrowner(drowner, dt)
{
    // Test for boat pickup, randomly chose player 1 or 2 first so we don't advantage one
    if (Random.getNext(2) == 0)
    {
        if (doPickup(drowner, player1)) return true;
        if (doPickup(drowner, player2)) return true;
    }
    else
    {
        if (doPickup(drowner, player2)) return true;
        if (doPickup(drowner, player1)) return true;
    }

    // Scream for help
 /*   drowner.helpDelay -= dt;
    if (drowner.helpDelay <= 0)
    {
        drowner.helpDelay = Random.getNext(3) + 2;

        // Are we close enough to player?
        var vol = getAtt(player1, drowner.position);
        if (playerCount == 2) vol += getAtt(player2, drowner.position);
        if (vol > 1) vol = 1;
        if (vol > 0)
        {
            playSound("help" + (Random.getNext(2) + 1) + ".wav", vol * .15);
        }
    }*/
}
