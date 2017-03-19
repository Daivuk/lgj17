var flagPoleTexture = getTexture("tileset.png", false);
var flagTexture = getTexture("tileset.png", false);
var flagIcon = getTexture("tileset.png", false);
var flagIconUVs = new Vector4(1 / 16, 12 / 32, 2 / 16, 13 / 32);

var FLAG_CAPTURE_SPEED = .10;
var FLAG_POINT_SPEED = .2;

function createFlagPole(position)
{
    var flagPole = {
        position: new Vector2(position),
        drawPos: position.sub(new Vector2(0, 9)),
        texture: flagPoleTexture,
        uvs: new Vector4(3 / 16, 8 / 32, .25, 11 / 32),
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
        render: drawFlag,
        shotDelay: 0,
        puff: createSpriteAnimInstance("puff.spriteanim"),
        puffPosition: new Vector2(0, 0)
    };
    addEntity(flag);
    return flag;
}

function drawFlag(flag)
{
    SpriteBatch.drawSpriteAnim(flag.sprite, flag.position.add(new Vector2(0, -flag.percent * 10)), flag.color);
    if (flag.puff.isPlaying()) SpriteBatch.drawSpriteAnim(flag.puff, flag.puffPosition);
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

    // Shots and cannon fires when contested
    if (flag.zone.count[0] > 0 && flag.zone.count[1] > 0)
    {
        flag.shotDelay -= dt;
        if (flag.shotDelay <= 0)
        {
            flag.shotDelay = Random.getNext(2) + 1;

            // Are we close enough to player?
            var vol = getAtt(player1, flag.position);
            if (playerCount == 2) vol += getAtt(player2, flag.position);
            if (vol > 1) vol = 1;
            if (vol > 0)
            {
                playSound("shot.wav", vol * .15, 0, Random.getNext(10) / 15 + 1);
                flag.puff.play("puff");
                flag.puffPosition = new Vector2(flag.position.x + Random.getNext(32) - 16, flag.position.y + Random.getNext(32) - 16);
            }
        }
    }
}
