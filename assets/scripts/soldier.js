var soldierIcon = getTexture("soldiericon.png", false);
var soldierTextures = [
    getTexture("soldier1.png", false),
    getTexture("soldier2.png", false),
]

var droppedUnits = [];

function createSoldier(position, index)
{
    var soldier = {
        position: new Vector2(position),
        sprite: playSpriteAnim("soldier" + (index + 1) + ".spriteanim", "idle_" + (Random.getNext(2) ? "e" : "w")),
        update: updateSoldier,
        render: renderSprite,
        tileX: 0,
        tileY: 0,
        index: index
    }
    addEntity(soldier);
    droppedUnits.push(soldier);
    return soldier;
}

function updateSoldier(soldier)
{

}
