var boatTextures = [
    getTexture("tileset.png", false),
    getTexture("tileset.png", false)
];
var boatSlices = [[],[]];
for (var i = 0; i < 10; ++i)
{
    boatSlices[0].push(new Vector4(.5, .375 + i * .0625, .625, .375 + (i + 1) * .0625));
}
for (var i = 0; i < 10; ++i)
{
    boatSlices[1].push(new Vector4(.625, .375 + i * .0625, .75, .375 + (i + 1) * .0625));
}

var sailSound = [
    getSound("sail.wav").createInstance(),
    getSound("sail.wav").createInstance()
];
sailSound[0].setVolume(0);
sailSound[0].setLoop(true);
sailSound[0].play();
sailSound[1].setVolume(0);
sailSound[1].setLoop(true);
sailSound[1].play();

function createBoat(position, in_index)
{
    var boat = {
        texture: boatTextures[in_index],
        position: new Vector2(position),
        angle: 0,
        slices: boatSlices[in_index],
        render: renderBoat,
        update: updateBoat,
        vel: 0,
        index: in_index,
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

var PICKUP_DIST = 12 * 12;

function renderBoat(boat)
{
    renderSlices(boat);
    if (boat.hasMan)
    {
        SpriteBatch.drawSpriteWithUVs(hasManTexture, new Vector2(boat.position.x, boat.position.y - 16), hasManIconUVs);
    }
    if (boat.hasSoldier)
    {
        SpriteBatch.drawSpriteWithUVs(soldierIcon, new Vector2(boat.position.x, boat.position.y - 16), soldierIconUVs);
    }
    if (boat.hasTank)
    {
        SpriteBatch.drawSpriteWithUVs(tankIcon, new Vector2(boat.position.x, boat.position.y - 16), tankIconUVs);
    }
}

function updateBoat(boat, dt)
{
    var desiredDir = new Vector2(0, 0);
    var dir = new Vector2(Math.cos(boat.angle * ToRad), Math.sin(boat.angle * ToRad));

    if (Input.isDown(boat.keys.Right)) desiredDir.x += 1;
    if (Input.isDown(boat.keys.Left)) desiredDir.x -= 1;
    if (Input.isDown(boat.keys.Down)) desiredDir.y += 1;
    if (Input.isDown(boat.keys.Up)) desiredDir.y -= 1;

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

    if (boat.index == 0 || playerCount == 2) sailSound[boat.index].setVolume(boat.vel / BOAT_MAX_SPEED * .5);

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

        if (Input.isJustDown(boat.keys.BuySoldier) && boat.availableMen >= 1 && !boat.hasSoldier && !boat.hasTank)
        {
            boat.hasSoldier = true;
            --boat.availableMen;
            playSound("buysoldier.wav");
        }
        if (Input.isJustDown(boat.keys.BuyTank) && boat.availableMen >= 3 && !boat.hasSoldier && !boat.hasTank)
        {
            boat.hasTank = true;
            boat.availableMen -= 3;
            playSound("buytank.wav");
        }
    }

    // Drop/pickup troops
    if (Input.isJustDown(boat.keys.Drop))
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
                    var zoneId = tiledMap.getTileAt("Zones", x, y) - 81;
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
                            var soldier = createSoldier(new Vector2(x * 8 + 4, y * 8 + 4), boat.index);
                            soldier.tileX = x;
                            soldier.tileY = y;
                            playSound("dropSoldier.wav");
                            soldier.worth = 1;
                            soldier.zoneId = zoneId;
                            soldier.isSoldier = true;
                            zones[zoneId].count[boat.index] += 1;
                            return;
                        }
                    }
                }
            }
        }
        else if (boat.hasTank)
        {
            var dropCenter = boat.position.div(8);
            dropCenter.x = Math.floor(dropCenter.x);
            dropCenter.y = Math.floor(dropCenter.y);
            for (y = dropCenter.y - 1; y <= dropCenter.y + 1; ++y)
            {
                for (x = dropCenter.x - 1; x <= dropCenter.x + 1; ++x)
                {
                    var zoneId = tiledMap.getTileAt("Zones", x, y) - 81;
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
                            boat.hasTank = false;
                            var tank = createTank(new Vector2(x * 8 + 4, y * 8 + 4), boat.index);
                            tank.tileX = x;
                            tank.tileY = y;
                            playSound("dropTank.wav");
                            tank.zoneId = zoneId;
                            tank.worth = 3;
                            tank.isTank = true;
                            zones[zoneId].count[boat.index] += 3;
                            return;
                        }
                    }
                }
            }
        }
        else if (!boat.hasMan)
        {
            var closest = PICKUP_DIST;
            var picked = null;
            for (var i = 0; i < droppedUnits.length; ++i)
            {
                var unit = droppedUnits[i];
                if (unit.index != boat.index) continue;
                var dist = Vector2.distanceSquared(unit.position, boat.position);
                if (dist < closest)
                {
                    picked = unit;
                    closest = dist;
                }
            }
            if (picked)
            {
                zones[picked.zoneId].count[boat.index] -= picked.worth;
                droppedUnits.splice(droppedUnits.indexOf(picked), 1);
                removeEntity(picked);
                boat.hasSoldier = picked.isSoldier;
                boat.hasTank = picked.isTank;
                if (boat.hasSoldier) playSound("buysoldier.wav");
                if (boat.hasTank) playSound("buytank.wav");
            }
        }
    }
}
