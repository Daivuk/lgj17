var tiledMapTexture = getTexture("tileset.png", false);
var tiledMap = getTiledMap("islands.tmx");
var minimap = getTexture("minimap.png", false);
var boaticon = getTexture("boaticon.png", false);
var zonesLayer = tiledMap.getLayerIndex("Zones");

function initMap()
{
    var entityLayer = tiledMap.getLayerIndex("Entities");
    var entityCount = tiledMap.getObjectCount(entityLayer);
    for (var i = 0; i < entityCount; ++i)
    {
        var mapObj = tiledMap.getObject(entityLayer, i);
        switch (mapObj.type)
        {
            case "player1":
                player1 = createBoat(mapObj.position.add(mapObj.size.mul(.5)));
                player1.angle = 270;
                player1.index = 0;
                break;
            case "player2":
                player2 = createBoat(mapObj.position.add(mapObj.size.mul(.5)));
                player2.angle = 90;
                player2.index = 1;
                break;
            case "nix":
                createDrowner(mapObj.position.add(mapObj.size.mul(.5)));
                break;
        }
    }
}
