var flagPoleTexture = getTexture("tileset.png", false);
var flagTexture = getTexture("tileset.png", false);
var flagIcon = getTexture("tileset.png", false);
var flagIconUVs = new Vector4(1 / 16, 12 / 16, 2 / 16, 13 / 16);

var FLAG_CAPTURE_SPEED = .10;
var FLAG_POINT_SPEED = .002;

function createFlagPole(position)
{
    var flagPole = {
        position: new Vector2(position),
        drawPos: position.sub(new Vector2(0, 9)),
        texture: flagPoleTexture,
        uvs: new Vector4(3 / 16, .5, .25, 11 / 16),
        render: drawFlagPole
    };
    addEntity(flagPole);
    return flagPole;
}

function drawFlagPole(flagPole)
{
    SpriteBatch.drawSpriteWithUVs(flagPole.texture, flagPole.drawPos, flagPole.uvs);
}

function createFlag(position, zone)
{
    var flag = {
        position: new Vector2(position),
        sprite: playSpriteAnim("flag.spriteanim", "idle"),
        percent: 1,
        owner: -1,
        color: Color.WHITE,
        zone: zone,
        update: updateFlag,
        render: drawFlag
    };
    addEntity(flag);
    return flag;
}

function drawFlag(flag)
{
    SpriteBatch.drawSpriteAnim(flag.sprite, flag.position.add(new Vector2(0, -flag.percent * 10)), flag.color);
}

function updateFlag(flag, dt)
{
    switch (flag.owner)
    {
        case -1:
            if (flag.zone.count[0] != flag.zone.count[1])
            {
                flag.percent -= dt * FLAG_CAPTURE_SPEED;
                if (flag.percent < 0)
                {
                    flag.percent = 0;
                    if (flag.zone.count[0] > flag.zone.count[1])
                    {
                        flag.owner = 0;
                        flag.color = new Color(.25, .25, 1);
                    }
                    else
                    {
                        flag.owner = 1;
                        flag.color = new Color(1, 0, 0);
                    }
                }
            }
            break;
        case 0:
            if (flag.zone.count[0] > flag.zone.count[1])
            {
                if (flag.percent < 1)
                {
                    flag.percent += dt * FLAG_CAPTURE_SPEED;
                    if (flag.percent > 1)
                    {
                        flag.percent = 1;
                        playSound("capture.wav");
                    }
                }
                else
                {
                    score[0] += dt * FLAG_POINT_SPEED;
                }
            }
            else
            {
                flag.percent -= dt * FLAG_CAPTURE_SPEED;
                if (flag.percent < 0)
                {
                    flag.percent = 0;
                    flag.owner = -1;
                    flag.color = Color.WHITE;
                    // Du dum
                }
            }
            break;
        case 1:
            if (flag.zone.count[1] > flag.zone.count[0])
            {
                if (flag.percent < 1)
                {
                    flag.percent += dt * FLAG_CAPTURE_SPEED;
                    if (flag.percent > 1)
                    {
                        flag.percent = 1;
                        playSound("capture.wav");
                    }
                }
                else
                {
                    score[1] += dt * FLAG_POINT_SPEED;
                }
            }
            else
            {
                flag.percent -= dt * FLAG_CAPTURE_SPEED;
                if (flag.percent < 0)
                {
                    flag.percent = 0;
                    flag.owner = -1;
                    flag.color = Color.WHITE;
                    // Du dum
                }
            }
            break;
    }
}

