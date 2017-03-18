var entities = [];
var renderables = [];
var updatables = [];

var player1;
var player2;
var cameraPos = new Vector2(0, 0);
var playerCount = 1;

function addEntity(entity)
{
    if (entity.update) updatables.push(entity);
    if (entity.render) renderables.push(entity);
    entities.push(entity);
}

function removeEntity(entity)
{
    if (entity.sprite) renderables.splice(renderables.indexOf(entity), 1);
    if (entity.update) updatables.splice(updatables.indexOf(entity), 1);
    entities.splice(entities.indexOf(entity), 1);
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
        entity.update(entity, dt);
    }
}

var clearColor = new Color(30 / 255, 80 / 255, 127 / 255);

function render()
{
    Renderer.clear(clearColor);

    cameraPos = new Vector2(player1.position);
    var resolution = Renderer.getResolution();
    var cameraMatrix = Matrix.createTranslation(new Vector3(-cameraPos.x, -cameraPos.y, 0));
    //cameraMatrix = cameraMatrix.mul(Matrix.createScale(4));
    cameraMatrix = cameraMatrix.mul(Matrix.createTranslation(new Vector3(resolution.x / 2, resolution.y / 2, 0)));
    SpriteBatch.begin(cameraMatrix);
    SpriteBatch.setFilter(FilterMode.NEAREST);

    //--- Map ground
    Renderer.setBlendMode(BlendMode.OPAQUE);
    tiledMap.renderLayer("Ground");
    Renderer.setBlendMode(BlendMode.PREMULTIPLIED);
    tiledMap.renderLayer("Overlay");

    //--- Entities
    renderables.sort(function(a, b){return a.position.y < b.position.y ? -1 : 1});
    for (var i = 0; i < renderables.length; ++i)
    {
        var entity = renderables[i];
        entity.render(entity);
    }

    SpriteBatch.end();

    //--- UI
    SpriteBatch.begin();

    //--- Minimap
    if (playerCount == 1)
    {
        SpriteBatch.drawRect(minimap, new Rect(0, 0, 32, 32));
        SpriteBatch.drawSprite(boaticon, player1.position.div(tiledMap.getSize().mul(8).div(minimap.getSize())));
    }
    else
    {

    }

    SpriteBatch.end();
}
