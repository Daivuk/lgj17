var tankIcon = getTexture("tileset.png", false);
var tankIconUVs = new Vector4(2 / 16, 9 / 16, 3 / 16, 10 / 16);
var tankTextures = [
    getTexture("tileset.png", false),
    getTexture("tileset.png", false)
]

function createTank(position, index)
{
    var tank = {
        position: new Vector2(position),
        sprite: playSpriteAnim("tank" + (index + 1) + ".spriteanim", "idle_" + (Random.getNext(2) ? "e" : "w")),
        render: renderSprite,
        tileX: 0,
        tileY: 0,
        index: index
    }
    addEntity(tank);
    droppedUnits.push(tank);
    return tank;
}
