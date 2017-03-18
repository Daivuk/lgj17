var entities = [];
var renderables = [];
var updatables = [];

var player1;
var player2;
var cameraPos = new Vector2(0, 0);
var playerCount = 2;
var flagFlash = 0;

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
    for (var i = 0; i < count; ++i)
    {
        SpriteBatch.drawSpriteWithUVs(entity.texture, pos, entity.slices[i], Color.WHITE, angle);
        pos.y--;
        SpriteBatch.drawSpriteWithUVs(entity.texture, pos, entity.slices[i], Color.WHITE, angle);
    }
}

function renderSprite(entity)
{
    SpriteBatch.drawSpriteAnim(entity.sprite, entity.position);
}

initMap();

function update(dt)
{
    if (Input.isJustDown(Key.ESCAPE))
    {
        quit();
        return;
    }

    //--- Entities
    for (var i = 0; i < updatables.length; ++i)
    {
        var entity = updatables[i];
        if (entity.update(entity, dt)) --i;
    }

    for (var i = 0; i < toRemoveEntities.length; ++i)
    {
        var entity = toRemoveEntities[i];
        if (entity.sprite) renderables.splice(renderables.indexOf(entity), 1);
        if (entity.update) updatables.splice(updatables.indexOf(entity), 1);
        entities.splice(entities.indexOf(entity), 1);
    }
    toRemoveEntities = [];

    flagFlash += dt;
    while (flagFlash > .6) flagFlash -= .6;
}

var clearColor = new Color(30 / 255, 80 / 255, 127 / 255);

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
    renderables.sort(function(a, b){return a.position.y < b.position.y ? -1 : 1});
    for (var i = 0; i < renderables.length; ++i)
    {
        var entity = renderables[i];
        entity.render(entity);
    }

    // Draw men
    for (var i = 0; i < player1.availableMen; ++i)
    {
        SpriteBatch.drawSprite(manIcon, player1.menPos.add(new Vector2(i * 8, 0)));
    }
    for (var i = 0; i < player2.availableMen; ++i)
    {
        SpriteBatch.drawSprite(manIcon, player2.menPos.add(new Vector2(i * 8, 0)));
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
                color = new Color(.25, .25, 1);
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
                    color = new Color(.25, .25, 1);
                }
            }
            break;
        case 1:
            if (flag.zone.count[1] > flag.zone.count[0])
            {
                color = new Color(1, 0, 0);
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
                    color = new Color(1, 0, 0);
                }
            }
            break;
    }

    if (show) SpriteBatch.drawSprite(flagIcon, flag.position.div(tiledMap.getSize().mul(8).div(minimap.getSize())).add(offset), color);
}

function render()
{
    var resolution = Renderer.getResolution();

    Renderer.clear(clearColor);

    if (playerCount == 1)
    {
        renderWorld(player1, new Rect(0, 0, resolution.x, resolution.y));
    }
    else
    {
        renderWorld(player1, new Rect(0, 0, resolution.x / 2, resolution.y));
        renderWorld(player2, new Rect(resolution.x / 2, 0, resolution.x / 2, resolution.y));
        SpriteBatch.begin();
        SpriteBatch.drawRect(null, new Rect(resolution.x / 2 - 1, 0, 2, resolution.y), Color.BLACK);
        SpriteBatch.end();
    }

    //--- UI
    SpriteBatch.begin();

    var offset = new Vector2(0, 0);
    if (playerCount == 2)
    {
        offset = new Vector2(resolution.x / 2 - 16, 0);
    }

    //--- Minimap
    SpriteBatch.drawRect(minimap, new Rect(offset.x, offset.y, 32, 32));

    if (playerCount == 1)
    {
        SpriteBatch.drawSprite(boaticon, player1.position.div(tiledMap.getSize().mul(8).div(minimap.getSize())));
    }
    else
    {
        SpriteBatch.drawSprite(boaticon, player1.position.div(tiledMap.getSize().mul(8).div(minimap.getSize())).add(offset), new Color(.5, .5, 1));
        SpriteBatch.drawSprite(boaticon, player2.position.div(tiledMap.getSize().mul(8).div(minimap.getSize())).add(offset), new Color(1, .25, .25));
    }

    for (var i = 0; i < zonesArr.length; ++i)
    {
        dragMinimapFlag(zonesArr[i].flag, offset);
    }

    SpriteBatch.end();
}
