var flagPoleTexture = getTexture("flagPole.png", false);
var flagTexture = getTexture("flag.png", false);
var flagIcon = getTexture("flagIcon.png", false);

var FLAG_CAPTURE_SPEED = .10;

function createFlagPole(position)
{
    var flagPole = {
        position: new Vector2(position),
        texture: flagPoleTexture,
        render: drawFlagPole
    };
    addEntity(flagPole);
    return flagPole;
}

function drawFlagPole(flagPole)
{
    SpriteBatch.drawSprite(flagPole.texture, flagPole.position.sub(new Vector2(0, 9)));
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

