var soldierIcon = getTexture("tileset.png", false);
var soldierIconUVs = new Vector4(2 / 16, 8 / 16, 3 / 16, 9 / 16);
var soldierTextures = [
    getTexture("tileset.png", false),
    getTexture("tileset.png", false),
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
