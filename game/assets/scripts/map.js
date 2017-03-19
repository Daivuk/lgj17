var tiledMapTexture = getTexture("tileset.png", false);
var tiledMap;
var minimap = getTexture("tileset.png", false);
var minimapUVs = new Vector4(.25, .5/2, .5, .75/2);
var boaticon = getTexture("tileset.png", false);
var boatIconUVs = new Vector4(3 / 16, 12 / 32, 4 / 16, 13 / 32);
var zonesLayer;

var zones = {};
var zonesArr = [];

var player1KeyboardKeys = {
    Up: Key.W,
    Down: Key.S,
    Left: Key.A,
    Right: Key.D,
    BuySoldier: Key.Q,
    BuyTank: Key.E,
    Drop: Key.SPACE_BAR
};

var player2KeyboardKeys = {
    Up: Key.NUM_PAD_8,
    Down: Key.NUM_PAD_2,
    Left: Key.NUM_PAD_4,
    Right: Key.NUM_PAD_6,
    BuySoldier: Key.NUM_PAD_7,
    BuyTank: Key.NUM_PAD_9,
    Drop: Key.NUM_PAD_5
};

var player1XArcadeKeys = {
    Up: Key.XARCADE_LJOY_UP,
    Down: Key.XARCADE_LJOY_DOWN,
    Left: Key.XARCADE_LJOY_LEFT,
    Right: Key.XARCADE_LJOY_RIGHT,
    BuySoldier: Key.XARCADE_LBUTTON_7,
    BuyTank: Key.XARCADE_LBUTTON_8,
    Drop: Key.XARCADE_LBUTTON_1
};

var player2XArcadeKeys = {
    Up: Key.XARCADE_RJOY_UP,
    Down: Key.XARCADE_RJOY_DOWN,
    Left: Key.XARCADE_RJOY_LEFT,
    Right: Key.XARCADE_RJOY_RIGHT,
    BuySoldier: Key.XARCADE_RBUTTON_7,
    BuyTank: Key.XARCADE_RBUTTON_8,
    Drop: Key.XARCADE_RBUTTON_1
};

function initMap()
{
    tiledMap = getFreshTiledMap("islands.tmx");
    entities = [];
    renderables = [];
    updatables = [];
    droppedUnits = [];
    score = [0, 0];
    zones = {};
    zonesArr = [];
    zonesLayer = tiledMap.getLayerIndex("Zones");
    player1 = null;
    player2 = null;

    var entityLayer = tiledMap.getLayerIndex("Entities");
    var entityCount = tiledMap.getObjectCount(entityLayer);
    for (var i = 0; i < entityCount; ++i)
    {
        var mapObj = tiledMap.getObject(entityLayer, i);
        var midPos = mapObj.position.add(mapObj.size.mul(.5));
        switch (mapObj.type)
        {
            case "player1":
                if (!player1) player1 = createBoat(midPos, 0);
                player1.position = new Vector2(midPos);
                player1.angle = 270;
                player1.index = 0;
                if (System.getPlatform() == Platform.RASPBERRY_PI)
                    player1.keys = player1XArcadeKeys;
                else
                    player1.keys = player1KeyboardKeys;
                player1.zone = new Rect(mapObj.position, mapObj.size);
                break;
            case "player2":
                if (!player2) player2 = createBoat(midPos, 1);
                player2.position = new Vector2(midPos);
                player2.angle = 90;
                player2.index = 1;
                if (System.getPlatform() == Platform.RASPBERRY_PI)
                    player2.keys = player2XArcadeKeys;
                else
                    player2.keys = player2KeyboardKeys;
                player2.zone = new Rect(mapObj.position, mapObj.size);
                break;
            case "player1_men":
                if (!player1) player1 = createBoat(midPos, 0);
                player1.menPos = mapObj.position.add(new Vector2(4, 4));
                break;
            case "player2_men":
                if (!player2) player2 = createBoat(midPos, 1);
                player2.menPos = mapObj.position.add(new Vector2(4, 4));
                break;
            case "nix":
                createDrowner(midPos);
                break;
        }
        if (mapObj.type.substr(0, 5) == "flag_")
        {
            var index = mapObj.type.substr(5);
            zone = {
                position: midPos,
                player: -1,
                nextPlayer: -1,
                progress: 0,
                count: [0, 0],
                id: index
            };
            createFlagPole(zone.position);
            zone.flag = createFlag(zone.position, zone);
            zone.flag.minimapPos = midPos.div(tiledMap.getSize().mul(8).div(32));
            zones[index] = zone;
            zonesArr.push(zone);
        }
    }
}
