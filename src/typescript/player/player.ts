enum Direction {
    Up,
    Down,
    Left,
    Right,
    None,
}
type Vector = {
    x: number,
    y: number,
}
const JUMP_INCREMENT_FIRST_HALF = 4;
const JUMP_INCREMENT_SECOND_HALF = 2;
const JUMP_MAX = 16;
const UP_GRAVITY = 1;
const DOWN_GRAVITY = 2;
const GROUND_FRICTION = 5;
const AIR_FRICTION = 1.9; // Erm

class Player extends CollidableRect implements Drawable
{
    private velocity: Vector = { x: 0, y: 0 };
    private xDirection: Direction = Direction.Right;
    private yDirection: Direction = Direction.None;

    private hasJump: boolean = false;
    private onCeiling: boolean = false;
    private jumpHeld: boolean = false;
    private canHold: boolean = true;
    
    private ball: Ball = new Ball(0, 0, 20, 20); 

    get velocityX(): number { return this.velocity.x; }
    get velocityY(): number { return this.velocity.y; }

    private getDirection(): Direction
    {
        return this.yDirection == Direction.None ? this.xDirection : this.yDirection;
    }

    public draw(ctx: DrawingContext2D): void
    {
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "white";
        if (this.getDirection() == Direction.Left || this.getDirection() == Direction.Right)
        {
            ctx.fillRect(
                this.getDirection() == Direction.Right ? this.x + this.width*3/4 : this.x + this.width/8, 
                this.y + this.height/4,
                this.width/8,
                this.height/8);
        }
        else
        {
            ctx.fillRect(
                this.x + this.width/8, 
                this.getDirection() == Direction.Up ? this.y + this.height/8 : this.y + this.height*3/4,
                this.width/8,
                this.height/8);
            ctx.fillRect(
                this.x + this.width*3/4, 
                this.getDirection() == Direction.Up ? this.y + this.height/8 : this.y + this.height*3/4,
                this.width/8,
                this.height/8);
        }
        
        this.ball.draw(ctx);
        
        if (!this.ball.alive)
        {
            ctx.fillCircle(this.x + this.width / 2, this.y + this.height / 2, 5);
        }
    }

    public act(direction: Vector, terrain: Array<Collidable>, fromBall?: boolean | undefined): boolean
    {
        if (fromBall)
        {
            if (direction.x != 0)
                this.velocity.x = direction.x;
            if (direction.y != 0)
                this.velocity.y = direction.y;
            this.hasJump = true;
            return;
        }

        this.ball.act(terrain);

        terrain = terrain.filter((obj) => !(obj instanceof Player));
        
        this.velocity.x += direction.x * 5;

        // Vertical
        this.yDirection = Direction.None;
        if (direction.y > 0)
            this.yDirection = Direction.Up;
        else if (direction.y < 0)
            this.yDirection = Direction.Down;
        
        // Horizontal
        if (direction.x > 0)
            this.xDirection = Direction.Right;
        else if (direction.x < 0)
            this.xDirection = Direction.Left;

        // X
        for (const obj of terrain)
        {
            while (this.velocity.x != 0)
            {
                this.x += this.velocity.x * DELTA_TIME;
                if (this.collidesWith(obj))
                {
                    this.x -= this.velocity.x * DELTA_TIME;
                    if (this.velocity.x > 0)
                        this.velocity.x--;
                    else
                        this.velocity.x++;
                }
                else
                {
                    this.x -= this.velocity.x * DELTA_TIME;
                    break;
                }
            }
        }

        this.x += this.velocity.x * DELTA_TIME;

        if (this.velocity.x > 0)
            this.velocity.x -= GROUND_FRICTION;
        else if (this.velocity.x < 0)
            this.velocity.x += GROUND_FRICTION;
        if (this.velocity.x <= 2 && this.velocity.x >= -2)
            this.velocity.x = 0;

        let isOnGround = false;
        this.onCeiling = false;
        
        // Gravity
        if (this.velocity.y < 0)
            this.velocity.y += UP_GRAVITY;
        else if (this.velocity.y < 15)
            this.velocity.y += DOWN_GRAVITY;

        // Y
        for (const obj of terrain)
        {
            while (this.velocity.y != 0)
            {
                this.y += this.velocity.y * DELTA_TIME;
                if (this.collidesWith(obj))
                {
                    if (obj instanceof Lava)
                        return true;
                    
                    this.y -= this.velocity.y * DELTA_TIME;
                    if (this.velocity.y > 0)
                        this.velocity.y--;
                    else
                    {
                        this.velocity.y++;
                        this.onCeiling = true;
                    }
                    
                    if (this.velocity.y == 0)
                        isOnGround = true;
                }
                else
                {
                    this.y -= this.velocity.y * DELTA_TIME;
                    break;
                }
            }
        }
        this.y += this.velocity.y * DELTA_TIME;

        if (isOnGround)
            this.hasJump = true;

        return false;
    }

    private jump(): void
    {
        if (this.velocity.y > 0)
            this.velocity.y = 0;
        this.velocity.y -= this.velocity.y >= -JUMP_INCREMENT_FIRST_HALF ? JUMP_INCREMENT_FIRST_HALF : JUMP_INCREMENT_SECOND_HALF;
        if (this.velocity.y <= -JUMP_MAX && !this.onCeiling)
        {
            this.hasJump = false;
            this.canHold = false;
            this.jumpHeld = false;
        }
    }

    public jumpPressed(): void
    {
        if (this.canHold)
            this.jumpHeld = true;
        if (this.hasJump && this.jumpHeld)
            this.jump();
        if (this.onCeiling)
            this.canHold = true;
    }

    public jumpReleased(): void
    {
        this.jumpHeld = false;
        this.hasJump = this.onCeiling;
        this.canHold = true;
    }

    public tp(x: number, y: number): void
    {
        this.x = x;
        this.y = y;
        this.velocity = { x: 0, y: 0};
        this.ball.kill();
    }

    public shoot(): void
    {
        const ballVel = { 
            x: this.yDirection != Direction.None ? 0 : 
                (this.xDirection == Direction.Right ? 1 : -1), 
            y: this.yDirection == Direction.Up ? -1 : 
                (this.yDirection == Direction.Down ? 1 : 0)
        };
        this.ball.spawn(
            ballVel.x < 0 ? this.x - this.ball.width : 
                (ballVel.x > 0 ? this.x + this.width + this.ball.width :
                    this.x + this.width / 2 - this.ball.width / 2
                ),
            ballVel.y < 0 ? this.y - this.ball.height : 
                (ballVel.y > 0 ? this.y + this.height + this.ball.height :
                    this.y + this.height / 2 - this.ball.height / 2
                ),
            ballVel);
    }
}