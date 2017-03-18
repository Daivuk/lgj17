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
                if (!player1) player1 = createBoat(mapObj.position.add(mapObj.size.mul(.5)));
                player1.angle = 270;
                player1.index = 0;
                player1.zone = new Rect(mapObj.position, mapObj.size);
                break;
            case "player2":
                if (!player2) player2 = createBoat(mapObj.position.add(mapObj.size.mul(.5)));
                player2.angle = 90;
                player2.index = 1;
                player2.zone = new Rect(mapObj.position, mapObj.size);
                break;
            case "player1_men":
                if (!player1) player1 = createBoat(mapObj.position.add(mapObj.size.mul(.5)));
                player1.menPos = mapObj.position.add(new Vector2(4, 4));
                break;
            case "player2_men":
                if (!player2) player2 = createBoat(mapObj.position.add(mapObj.size.mul(.5)));
                player2.menPos = mapObj.position.add(new Vector2(4, 4));
                break;
            case "nix":
                createDrowner(mapObj.position.add(mapObj.size.mul(.5)));
                break;
        }
    }
}
