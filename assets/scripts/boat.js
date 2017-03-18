var boatTexture = getTexture("boat.png", false);
var boatTextureH = boatTexture.getSize().y;
var boatSpriteSizeY = boatTextureH / 10;
var boatSlices = [];
for (var i = 0; i < 10; ++i)
{
    boatSlices.push(new Vector4(0, i * boatSpriteSizeY / boatTextureH, 1, (i + 1) * boatSpriteSizeY / boatTextureH));
}

var sailSound = getSound("sail.wav").createInstance();
sailSound.setVolume(0);
sailSound.setLoop(true);
sailSound.play();

var hasManTexture = getTexture("hasMan.png", false);

function createBoat(position)
{
    var boat = {
        texture: boatTexture,
        position: new Vector2(position),
        angle: 0,
        slices: boatSlices,
        render: renderBoat,
        update: updateBoat,
        vel: 0,
        index: 0,
        zone: new Rect(0, 0, 0, 0),
        availableMen: 0
    }
    addEntity(boat);
    return boat;
}

var ToRad = Math.PI / 180;
var ToDeg = 180 / Math.PI;

var BOAT_MAX_SPEED = 48;
var BOAT_ACCELL = 32;
var BOAT_DECELL = 16;

function renderBoat(boat)
{
    renderSlices(boat);
    if (boat.hasMan)
    {
        SpriteBatch.drawSprite(hasManTexture, new Vector2(boat.position.x, boat.position.y - 16));
    }
    if (boat.hasSoldier)
    {
        SpriteBatch.drawSprite(soldierIcon, new Vector2(boat.position.x, boat.position.y - 16));
    }
}

function updateBoat(boat, dt)
{
    var desiredDir = new Vector2(0, 0);
    var dir = new Vector2(Math.cos(boat.angle * ToRad), Math.sin(boat.angle * ToRad));
    
    if (boat.index == 0)
    {
        if (Input.isDown(Key.D)) desiredDir.x += 1;
        if (Input.isDown(Key.A)) desiredDir.x -= 1;
        if (Input.isDown(Key.S)) desiredDir.y += 1;
        if (Input.isDown(Key.W)) desiredDir.y -= 1;
    }

    if (desiredDir.lengthSquared() > 0)
    {
        desiredDir = desiredDir.normalize();
        var desiredAngle = Math.atan2(desiredDir.y, desiredDir.x) * ToDeg;
        while (desiredAngle < 0) desiredAngle += 360;
        var angle = boat.angle;
        if (desiredAngle > angle)
        {
            if (desiredAngle - angle < 180)
            {
                angle += dt * 90;
                if (angle > desiredAngle) angle = desiredAngle;
            }
            else
            {
                angle += 360;
                angle -= dt * 90;
                if (angle < desiredAngle) angle = desiredAngle;
                angle -= 360;
            }
        }
        else
        {
            if (angle - desiredAngle < 180)
            {
                angle -= dt * 90;
                if (angle < desiredAngle) angle = desiredAngle;
            }
            else
            {
                angle -= 360;
                angle += dt * 90;
                if (angle > desiredAngle) angle = desiredAngle;
                angle += 360;
            }
        }
        while (angle < 0) angle += 360;
        while (angle >= 360) angle -= 360;
        boat.angle = angle;

        var dot = desiredDir.dot(dir);
        if (dot > 0)
        {
            boat.vel += dt * BOAT_ACCELL * dot;
            if (boat.vel < 0) boat.vel = 0;
            if (boat.vel > BOAT_MAX_SPEED) boat.vel = BOAT_MAX_SPEED;
        }
        else
        {
            if (boat.vel > 0)
            {
                boat.vel -= dt * BOAT_DECELL;
                if (boat.vel < 0) boat.vel = 0;
            }
        }
    }
    else
    {
        if (boat.vel > 0)
        {
            boat.vel -= dt * BOAT_DECELL;
            if (boat.vel < 0) boat.vel = 0;
        }
    }

    if (boat.index == 0 || playerCount == 2) sailSound.setVolume(boat.vel / BOAT_MAX_SPEED * .5);

    var newPos = boat.position.add(dir.mul(dt * boat.vel));
    boat.position = tiledMap.collision(boat.position, newPos, Vector2.ONE);

    // If boat arrives in zone and has man drop him, and allow to purchase army
    if (boat.zone.contains(boat.position))
    {
        if (boat.hasMan && boat.availableMen < 5)
        {
            boat.hasMan = false;
            boat.availableMen++;
            if (boat.index == 0 || playerCount == 2) playSound("free.wav");
        }

        if (Input.isJustDown(Key._1) && boat.availableMen >= 1 && !boat.hasSoldier && !boat.hasTank)
        {
            boat.hasSoldier = true;
            --boat.availableMen;
            playSound("buysoldier.wav");
        }
    }

    // Drop/pickup troops
    if (Input.isJustDown(Key.SPACE_BAR))
    {
        if (boat.hasSoldier)
        {
            var dropCenter = boat.position.div(8);
            dropCenter.x = Math.floor(dropCenter.x);
            dropCenter.y = Math.floor(dropCenter.y);
            for (y = dropCenter.y - 1; y <= dropCenter.y + 1; ++y)
            {
                for (x = dropCenter.x - 1; x <= dropCenter.x + 1; ++x)
                {
                    var zoneId = tiledMap.getTileAt("Zones", x, y) - 80;
                    if (zoneId >= 1)
                    {
                        var accept = true;
                        for (var i = 0; i < droppedUnits.length; ++i)
                        {
                            var droppedUnit = droppedUnits[i];
                            if (droppedUnit.tileX == x && droppedUnit.tileY == y)
                            {
                                accept = false;
                                break;
                            }
                        }
                        if (accept)
                        {
                            boat.hasSoldier = false;
                            var soldier = createSoldier(new Vector2(x * 8 + 4, y * 8 + 4));
                            soldier.tileX = x;
                            soldier.tileY = y;
                            playSound("dropSoldier.wav");
                            return;
                        }
                    }
                }
            }
        }
    }
}
