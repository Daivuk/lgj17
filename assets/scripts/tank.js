var tankIcon = getTexture("tankicon.png", false);
var tankTexture = getTexture("tank.png", false);

function createTank(position)
{
    var tank = {
        position: position,
        sprite: playSpriteAnim("tank.spriteanim", "idle_" + (Random.getNext(2) ? "e" : "w")),
        update: updateTank,
        render: renderSprite,
        tileX: 0,
        tileY: 0
    }
    addEntity(tank);
    droppedUnits.push(tank);
    return tank;
}

function updateTank(tank)
{

}
