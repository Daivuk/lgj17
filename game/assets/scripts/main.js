var entities = [];
var renderables = [];
var updatables = [];

var player1;
var player2;
var cameraPos = new Vector2(0, 0);
var playerCount = 2;
var flagFlash = 0;
var redColor = new Color(1, 0, 0);
var blueColor = new Color(.25, .25, 1);

var score = [0, 0];

var whiteUVs = new Vector4(15 / 16, 1 / 32, 15 / 16, 1 / 32);

var GAME_STATE_INPUT_SELECT = 0;
var GAME_STATE_MAIN_MENU = 1;
var GAME_STATE_NEW_GAME = 2;
var GAME_STATE_GAME = 3;
var GAME_STATE_END_GAME = 4;
var GAME_STATE_VIDEO = 5;
var GAME_STATE_KEYS = 6;
var gameState = GAME_STATE_INPUT_SELECT;
var endInputDelay = 0;

function addEntity(entity)
{
    if (entity.update) updatables.push(entity);
    if (entity.render) renderables.push(entity);
    entities.push(entity);
}

var toRemoveEntities = [];

function removeEntity(entity)
{
    toRemoveEntities.push(entity);
}

function renderSlices(entity)
{
    var count = entity.slices.length;
    var pos = new Vector2(entity.position);
    pos.x = Math.round(pos.x);
    pos.y = Math.round(pos.y);
    var angle = Math.round(entity.angle / 8) * 8;
    var texture = entity.texture;
    var slices = entity.slices;
    for (var i = 0; i < count; ++i)
    {
        SpriteBatch.drawSpriteWithUVs(texture, pos, slices[i], Color.WHITE, angle);
        pos.y--;
        SpriteBatch.drawSpriteWithUVs(texture, pos, slices[i], Color.WHITE, angle);
    }
}

function renderSprite(entity)
{
    SpriteBatch.drawSpriteAnim(entity.sprite, entity.position);
}

initMenus();
showMenu("key");

function update(dt)
{
    switch (gameState)
    {
        case GAME_STATE_GAME:
            if (Input.isJustDown(menuNavigationKeys.Back1) ||
                Input.isJustDown(menuNavigationKeys.Back2))
            {
                gameState = GAME_STATE_NEW_GAME;
                showMenu("player");
                return;
            }

            //--- Entities
            for (var i = 0; i < updatables.length; ++i)
            {
                var entity = updatables[i];
                entity.update(entity, dt);
            }

            for (var i = 0; i < toRemoveEntities.length; ++i)
            {
                var entity = toRemoveEntities[i];
                if (entity.sprite) renderables.splice(renderables.indexOf(entity), 1);
                if (entity.update) updatables.splice(updatables.indexOf(entity), 1);
                entities.splice(entities.indexOf(entity), 1);
            }
            toRemoveEntities = [];

            if (score[0] >= 1) // So if it's a tie, player 1 win. shrug
            {
                gameState = GAME_STATE_END_GAME;
                showMenu("end");
                endInputDelay = 2;
                playSound("victory.wav");
            }
            else if (score[1] >= 1)
            {
                gameState = GAME_STATE_END_GAME;
                menu.setTileAt("DimedText", 51, 23, 83);
                showMenu("end");
                endInputDelay = 2;
                if (playerCount == 1) playSound("defeat.wav");
                else playSound("victory.wav");
            }
            break;
        default:
            var index = updateMenu(dt);
            if (index != -1)
            {
                switch (gameState)
                {
                    case GAME_STATE_INPUT_SELECT:
                        switch (index)
                        {
                            case 0:
                                useXArcadeInput = false;
                                gameState = GAME_STATE_MAIN_MENU;
                                showMenu("menu");
                                playSound("pageFlip.wav");
                                break;
                            case 1:
                                useXArcadeInput = true;
                                gameState = GAME_STATE_MAIN_MENU;
                                showMenu("menu");
                                playSound("pageFlip.wav");
                                break;
                        }
                        break;
                    case GAME_STATE_MAIN_MENU:
                        switch (index)
                        {
                            case 0:
                                gameState = GAME_STATE_NEW_GAME;
                                showMenu("player");
                                playSound("pageFlip.wav");
                                break;
                            case 1:
                                break;
                            case 2:
                                break;
                            case 3:
                                quit();
                                break;
                            case -2:
                                gameState = GAME_STATE_INPUT_SELECT;
                                showMenu("key");
                                playSound("pageFlip.wav");
                                break; 
                        }
                        break;
                    case GAME_STATE_NEW_GAME:
                        switch (index)
                        {
                            case 0:
                                playerCount = 1;
                                gameState = GAME_STATE_GAME;
                                initMap();
                                break;
                            case 1:
                                playerCount = 2;
                                gameState = GAME_STATE_GAME;
                                initMap();
                                break;
                            case -2:
                                gameState = GAME_STATE_MAIN_MENU;
                                showMenu("menu");
                                playSound("pageFlip.wav");
                                break;
                        }
                        break;
                    case GAME_STATE_END_GAME:
                        switch (index)
                        {
                            case 0:
                                gameState = GAME_STATE_MAIN_MENU;
                                showMenu("menu");
                                playSound("pageFlip.wav");
                                break;
                            case -2:
                                gameState = GAME_STATE_MAIN_MENU;
                                showMenu("menu");
                                playSound("pageFlip.wav");
                                break;
                        }
                        break;
/*
var GAME_STATE_VIDEO = 5;
var GAME_STATE_KEYS = 6;*/
                }
            }
            break;
    }

    flagFlash += dt;
    while (flagFlash > .6) flagFlash -= .6;
}

function renderWorld(player, viewport)
{
    Renderer.pushViewport(viewport);

    cameraPos = new Vector2(player.position);
    var mapSizeInPixels = tiledMap.getSize().mul(8);
    if (cameraPos.x < viewport.w / 2) cameraPos.x = viewport.w / 2;
    if (cameraPos.x > mapSizeInPixels.x - viewport.w / 2) cameraPos.x = mapSizeInPixels.x - viewport.w / 2
    if (cameraPos.y < viewport.h / 2) cameraPos.y = viewport.h / 2;
    if (cameraPos.y > mapSizeInPixels.y - viewport.h / 2) cameraPos.y = mapSizeInPixels.y - viewport.h / 2
    var cameraMatrix = Matrix.createTranslation(new Vector3(-cameraPos.x, -cameraPos.y, 0));
    //cameraMatrix = cameraMatrix.mul(Matrix.createScale(4));
    cameraMatrix = cameraMatrix.mul(Matrix.createTranslation(new Vector3(viewport.w / 2, viewport.h / 2, 0)));
    SpriteBatch.begin(cameraMatrix);
    SpriteBatch.setFilter(FilterMode.NEAREST);

    var viewRect = new Rect(cameraPos.x - viewport.w / 2 - 16, cameraPos.y - viewport.h / 2 - 16, viewport.w + 32, viewport.h + 32);

    //--- Map ground
    Renderer.setBlendMode(BlendMode.OPAQUE);
    tiledMap.renderLayer("Ground");
    Renderer.setBlendMode(BlendMode.PREMULTIPLIED);
    tiledMap.renderLayer("Overlay");
    if (player.hasSoldier || player.hasTank)
    {
        tiledMap.renderLayer("ZonesOverlay");
    }

    //--- Entities
    for (var i = 0; i < renderables.length; ++i)
    {
        var entity = renderables[i];
        if (viewRect.contains(entity.position)) entity.render(entity);
    }

    // Draw men
    if (viewRect.contains(player1.menPos))
    {
        for (var i = 0; i < player1.availableMen; ++i)
        {
            SpriteBatch.drawSpriteWithUVs(manIcon, player1.menPos.add(new Vector2(i * 8, 0)), manIconUVs);
        }
    }
    if (viewRect.contains(player2.menPos))
    {
        for (var i = 0; i < player2.availableMen; ++i)
        {
            SpriteBatch.drawSpriteWithUVs(manIcon, player2.menPos.add(new Vector2(i * 8, 0)), manIconUVs);
        }
    }

    SpriteBatch.end();

    Renderer.popViewport();
}

function dragMinimapFlag(flag, offset)
{
    var show = false;
    var color = Color.WHITE;
    switch (flag.owner)
    {
        case -1:
            if (flag.zone.count[0] != flag.zone.count[1])
            {
                if (flagFlash < .3) show = true;
            }
            else if (flag.zone.count[0] > 0) show = true;
            break;
        case 0:
            if (flag.zone.count[0] > flag.zone.count[1])
            {
                color = blueColor;
                if (flag.percent < 1)
                {
                    if (flagFlash < .3)
                    {
                        show = true;
                    }
                }
                else
                {
                    show = true;
                }
            }
            else
            {
                show = true;
                if (flagFlash < .3)
                {
                    color = blueColor;
                }
            }
            break;
        case 1:
            if (flag.zone.count[1] > flag.zone.count[0])
            {
                color = redColor;
                if (flag.percent < 1)
                {
                    if (flagFlash < .3)
                    {
                        show = true;
                    }
                }
                else
                {
                    show = true;
                }
            }
            else
            {
                show = true;
                if (flagFlash < .3)
                {
                    color = redColor;
                }
            }
            break;
    }

    if (show) SpriteBatch.drawSpriteWithUVs(flagIcon, flag.minimapPos.add(offset), flagIconUVs, color);
}

var resolution = Renderer.getResolution();
var fullViewport = new Rect(0, 0, resolution.x, resolution.y);
var leftViewport = new Rect(0, 0, resolution.x / 2, resolution.y);
var rightViewport = new Rect(resolution.x / 2, 0, resolution.x / 2, resolution.y);
var midLineRect = new Rect(resolution.x / 2 - 1, 0, 2, resolution.y);

function render()
{
    switch (gameState)
    {
        case GAME_STATE_GAME:
            // Sort renderable top first
            renderables.sort(function(a, b){return a.position.y < b.position.y ? -1 : 1});
      /*      if (playerCount == 1)
            {
                renderWorld(player1, fullViewport);
            }
            else*/
            {
                renderWorld(player1, leftViewport);
                renderWorld(player2, rightViewport);
                SpriteBatch.begin();
                SpriteBatch.drawRectWithUVs(minimap, midLineRect, whiteUVs, Color.BLACK);
                SpriteBatch.end();
            }

            //--- UI
            SpriteBatch.begin();

            var offset = new Vector2(0, 0);
            if (playerCount == 2)
            {
                offset.x = resolution.x / 2 - 16;
            }

            //--- Minimap
            SpriteBatch.drawRectWithUVs(minimap, new Rect(offset.x, offset.y, 32, 32), minimapUVs);

       /*     if (playerCount == 1)
            {
                SpriteBatch.drawSpriteWithUVs(boaticon, player1.position.div(tiledMap.getSize().mul(8).div(32)), boatIconUVs);
            }
            else*/
            {
                SpriteBatch.drawSpriteWithUVs(boaticon, player1.position.div(tiledMap.getSize().mul(8).div(32)).add(offset), boatIconUVs, blueColor);
                SpriteBatch.drawSpriteWithUVs(boaticon, player2.position.div(tiledMap.getSize().mul(8).div(32)).add(offset), boatIconUVs, redColor);
            }

            for (var i = 0; i < zonesArr.length; ++i)
            {
                dragMinimapFlag(zonesArr[i].flag, offset);
            }

            //--- Score board
            SpriteBatch.drawRectWithUVs(minimap, new Rect(resolution.x / 2 - 32, resolution.y - 8, 64, 8), whiteUVs, Color.BLACK);
            SpriteBatch.drawRectWithUVs(minimap, new Rect(resolution.x / 2 - score[0] * 30 - 1, resolution.y - 7, score[0] * 30, 6), whiteUVs, blueColor);
            SpriteBatch.drawRectWithUVs(minimap, new Rect(resolution.x / 2 + 1, resolution.y - 7, score[1] * 30, 6), whiteUVs, redColor);

            SpriteBatch.end();
            break;
        default:
            drawMenu();
            break;
    }
}
