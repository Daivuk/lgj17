var tankIcon = getTexture("tankicon.png", false);
var tankTextures = [
    getTexture("tank1.png", false),
    getTexture("tank2.png", false)
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
