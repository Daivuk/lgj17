var soldierIcon = getTexture("soldiericon.png", false);
var soldierTexture = getTexture("soldier.png", false);

var droppedUnits = [];

function createSoldier(position)
{
    var soldier = {
        position: position,
        sprite: playSpriteAnim("soldier.spriteanim", "idle_" + (Random.getNext(2) ? "e" : "w")),
        update: updateSoldier,
        render: renderSprite,
        tileX: 0,
        tileY: 0
    }
    addEntity(soldier);
    droppedUnits.push(soldier);
    return soldier;
}

function updateSoldier(soldier)
{

}
