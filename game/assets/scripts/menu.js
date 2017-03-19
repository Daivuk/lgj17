var menuTexture = getTexture("tileset.png", false);
var menu = getTiledMap("menu.tmx");
var menuCursorMarkers = {};
var menuCursorTexture = getTexture("tileset.png", false);
var menuCursorUVs = new Vector4(1 / 16, 13 / 16, 2 / 16, 14 / 16);
var menuCursorAnim = new NumberAnim(-1);

var menuNavigationKeys = {
    Up1: Key.W,
    Up2: Key.XARCADE_LJOY_UP,
    Down1: Key.S,
    Down2: Key.XARCADE_LJOY_DOWN,
    Enter1: Key.ENTER,
    Enter2: Key.XARCADE_LBUTTON_1,
    Back1: Key.ESCAPE,
    Back2: Key.XARCADE_LEFT_PADDLE
};

var currentMenu = "key";
var cursorPos = {};
var menuOffset = new Vector2(0, 0);
var useXArcadeInput = false;

function initMenus()
{
    menuCursorAnim.queue(1, .5, Tween.EASE_BOTH);
    menuCursorAnim.play(Loop.PING_PONG_LOOP);
    var cursorsLayer = menu.getLayerIndex("Cursors");
    var cursorCount = menu.getObjectCount(cursorsLayer);
    for (var i = 0; i < cursorCount; ++i)
    {
        var obj = menu.getObject(cursorsLayer, i);
        if (menuCursorMarkers[obj.type] === undefined) menuCursorMarkers[obj.type] = [];
        menuCursorMarkers[obj.type].push(obj.position.add(obj.size.mul(.5)));
    }
}

function showMenu(name)
{
    currentMenu = name;
    if (cursorPos[currentMenu] === undefined) cursorPos[currentMenu] = 0;
    switch (currentMenu)
    {
        case "key":
            menuOffset = new Vector2(0, 0);
            break;
        case "menu":
            menuOffset = new Vector2(32 * 8, 0);
            break;
        case "player":
            menuOffset = new Vector2(0, 20 * 8);
            break;
    }
}

function updateMenu()
{
    var cursorIndex = cursorPos[currentMenu];
    var markers = menuCursorMarkers[currentMenu];
    var markerCount = markers.length;
    if (Input.isJustDown(menuNavigationKeys.Down1) ||
        Input.isJustDown(menuNavigationKeys.Down2))
    {
        cursorPos[currentMenu] = (cursorIndex + 1) % markerCount;
    }
    if (Input.isJustDown(menuNavigationKeys.Up1) ||
        Input.isJustDown(menuNavigationKeys.Up2))
    {
        cursorPos[currentMenu] = (cursorIndex + markerCount - 1) % markerCount;
    }
    if (Input.isJustDown(menuNavigationKeys.Enter1) ||
        Input.isJustDown(menuNavigationKeys.Enter2))
    {
        return cursorPos[currentMenu];
    }
    if (Input.isJustDown(menuNavigationKeys.Back1) ||
        Input.isJustDown(menuNavigationKeys.Back2))
    {
        return -2;
    }
    if (currentMenu == "player" && Input.isJustDown(Key.XARCADE_1_PLAYER)) return 0;
    if (currentMenu == "player" && Input.isJustDown(Key.XARCADE_2_PLAYER)) return 1;

    return -1;
}

function drawMenu()
{
    SpriteBatch.begin(Matrix.createTranslation(new Vector3(-menuOffset.x, -menuOffset.y, 0)));
    Renderer.setBlendMode(BlendMode.PREMULTIPLIED);
    menu.render();
    var cursorIndex = cursorPos[currentMenu];
    var markers = menuCursorMarkers[currentMenu];
    var cursorOffset = new Vector2(markers[cursorIndex]);
    cursorOffset.x += menuCursorAnim.get();
    SpriteBatch.drawSpriteWithUVs(menuCursorTexture, cursorOffset, menuCursorUVs);
    SpriteBatch.end();
}
