/*
var aiTempDir = new Vector2(0, 0);
var aiTempDirDelay = 0;
var aiStuckPosition = new Vector2(0, 0);
var aiStuckDelay = 0;
var zoneTarget = -1;
var doTankNext = false;
*/

var aiDT;

function findClosestDrowner(boat)
{
    var closest = 1000000;
    var pick = null;
    for (var i = 0; i < drowners.length; ++i)
    {
        var drowner = drowners[i];
        var dis = Vector2.distanceSquared(boat.position, drowner.position);
        if (dis < closest)
        {
            pick = drowner;
            closest = dis;
        }
    }
    return pick;
}

function moveToward(target, boat, inputs)
{
    var dir = target.sub(boat.position);
    dir = dir.normalize();

    var v3 = new Vector3(dir.x, dir.y, 0);
    var dirL = v3.transform(Matrix.createRotationZ(60));
    var dirR = v3.transform(Matrix.createRotationZ(-60));

    if (boat.aiStuckPosition.x == boat.position.x &&
        boat.aiStuckPosition.y == boat.position.y)
    {
        boat.aiStuckDelay += aiDT;
    }
    boat.aiStuckPosition = new Vector2(boat.position);

    var boatDir = new Vector2(Math.cos(boat.angle * ToRad), Math.sin(boat.angle * ToRad));

    if (boat.aiStuckDelay > 2)
    {
        boat.aiStuckDelay = 0;
        boat.aiTempDirDelay = 2;
        boat.aiTempDir.x = -boatDir.x + (Random.getNext(3) - 1);
        boat.aiTempDir.y = -boatDir.y + (Random.getNext(3) - 1);
        boat.aiTempDir = boat.aiTempDir.normalize();
    }

    if (boat.aiTempDirDelay > 0)
    {
        boat.aiTempDirDelay -= aiDT;
        dir = boat.aiTempDir;
    }
    else
    {
        // Look ahead for collision, and change course
        var collisionAhead = false;
        var collisionAheadL = false;
        var collisionAheadR = false;
        
        var colLookPos = boat.position.add(dir.mul(boat.vel * .5));
        colLookPos.x = Math.floor(colLookPos.x / 8);
        colLookPos.y = Math.floor(colLookPos.y / 8);
        if (boat.zoneTarget == -1 || boat.zoneTarget != tiledMap.getTileAt(zonesLayer, colLookPos.x, colLookPos.y) - 81)
            collisionAhead = !tiledMap.getCollision(colLookPos.x, colLookPos.y);

        var colLookPos = boat.position.add(dirL.mul(boat.vel * .5));
        colLookPos.x = Math.floor(colLookPos.x / 8);
        colLookPos.y = Math.floor(colLookPos.y / 8);
        if (boat.zoneTarget == -1 || boat.zoneTarget != tiledMap.getTileAt(zonesLayer, colLookPos.x, colLookPos.y) - 81)
            collisionAheadL = !tiledMap.getCollision(colLookPos.x, colLookPos.y);

        var colLookPos = boat.position.add(dirR.mul(boat.vel * .5));
        colLookPos.x = Math.floor(colLookPos.x / 8);
        colLookPos.y = Math.floor(colLookPos.y / 8);
        if (boat.zoneTarget == -1 || boat.zoneTarget != tiledMap.getTileAt(zonesLayer, colLookPos.x, colLookPos.y) - 81)
            collisionAheadR = !tiledMap.getCollision(colLookPos.x, colLookPos.y);
       
        if (collisionAhead)
        {
            var right = new Vector2(-boatDir.y, boatDir.x);
            var dot = right.dot(dir);
            var v3 = new Vector3(dir.x, dir.y, 0);
            if (!collisionAheadL) v3 = v3.transform(Matrix.createRotationZ(90));
            else if (!collisionAheadR) v3 = v3.transform(Matrix.createRotationZ(-90));
            else v3 = v3.transform(Matrix.createRotationZ(dot < 0 ? 90 : -90));
            dir.x = v3.x;
            dir.y = v3.y;
            dir = dir.normalize();
        }
    }

    if (dir.x > 0.38)
    {
        inputs.right = true;
        if (dir.x < 0.9238)
        {
            if (dir.y > 0)
                inputs.down = true;
            else
                inputs.up = true;
        }
    }
    else if (dir.x < -0.38)
    {
        inputs.left = true;
        if (dir.x > -0.9238)
        {
            if (dir.y > 0)
                inputs.down = true;
            else
                inputs.up = true;
        }
    }
    else
    {
        if (dir.y > 0)
            inputs.down = true;
        else
            inputs.up = true;
    }
}

function updateAIDropMan(boat, inputs)
{
    moveToward(boat.storePos, boat, inputs);
}

function updateAIDropSoldier(boat, inputs, diffOffset)
{
    // Find the closest zone that is 1 soldier away from winning the point
    var pick = null;
    var closest = 1000000;
    var bestPickDiff = 1000;
    for (var i = 0; i < zonesArr.length; ++i)
    {
        var zone = zonesArr[i];
        var dis = Vector2.distanceSquared(boat.position, zone.position);
        var highestInZone = 0;
        for (var j = 0; j < zone.count.length; ++j)
        {
            if (j == boat.index) continue;
            highestInZone = Math.max(highestInZone, zone.count[j]);
        }
        var diff = highestInZone - zone.count[boat.index];
        if (diff <= bestPickDiff && diff >= diffOffset && dis < closest)
        {
            pick = zone;
            closest = dis;
            bestPickDiff = diff;
        }
    }
    if (pick)
    {
        boat.zoneTarget = pick.id;
        moveToward(pick.position, boat, inputs);
        boat.zoneTarget = -1;

        var dropCenter = boat.position.div(8);
        dropCenter.x = Math.floor(dropCenter.x);
        dropCenter.y = Math.floor(dropCenter.y);
        for (y = dropCenter.y - 1; y <= dropCenter.y + 1; ++y)
        {
            for (x = dropCenter.x - 1; x <= dropCenter.x + 1; ++x)
            {
                var zoneId = tiledMap.getTileAt("Zones", x, y) - 81;
                if (zoneId == pick.id)
                {
                    inputs.pickup = true;
                    return;
                }
            }
        }
    }
    else if (diffOffset > 0)
    {
        updateAIDropSoldier(boat, inputs, diffOffset - 1);
    }
}

function updateAIEmpty(boat, inputs)
{
    if (boat.zone.contains(boat.position))
    {
        if (boat.doTankNext)
        {
            if (boat.availableMen >= 3 && !boat.hasSoldier)
            {
                // Buy soldier first
                inputs.pickup = true;
                return;
            }
            else if (boat.availableMen >= 2 && boat.hasSoldier)
            {
                // Upgrade to tank
                inputs.pickup = true;
                boat.doTankNext = false;
                return;
            }
        }
        else if (boat.availableMen > 0)
        {
            // Buy soldier
            inputs.pickup = true;
            boat.doTankNext = Random.getNext(100) > 10; // 20% chances to order a tank
            return;
        }
    }

    var closestDrowner = findClosestDrowner(boat);
    if (closestDrowner)
    {
        moveToward(closestDrowner.position, boat, inputs);
        return;
    }
}

function updateAI(boat, dt)
{
    aiDT = dt;
    var inputs = {};

    if (boat.hasMan)
        updateAIDropMan(boat, inputs);
    else if (boat.hasSoldier)
        updateAIDropSoldier(boat, inputs, 0);
    else if (boat.hasTank)
        updateAIDropSoldier(boat, inputs, 2);
    else 
        updateAIEmpty(boat, inputs);

    return inputs;
}
