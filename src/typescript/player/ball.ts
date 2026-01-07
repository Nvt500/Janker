class Ball extends CollidableRect implements Drawable
{
    private velocity: Vector = { x: 0, y: 0 };
    private color: string = "red";
    private dead: boolean = true;
    public static lifetime: number = 0;
    private startLifetime: number = 0;

    get velocityX(): number { return this.velocity.x; }
    get velocityY(): number { return this.velocity.y; }
    get alive(): boolean { return !this.dead; }

    public draw(ctx: DrawingContext2D): void
    {
        if (this.dead)
            return;
        ctx.fillStyle = this.color;
        ctx.fillCircle(this.centerX, this.centerY, this.width / 2);
    }

    public spawn(x: number, y: number, velocity: Vector): void
    {
        if (this.dead)
        {
            this.x = x;
            this.y = y;
            this.velocity = { x: velocity.x * 10, y: velocity.y * 16 };
            this.dead = false;
            this.startLifetime = Ball.lifetime;
        }
    }

    public kill(): void
    {
        this.dead = true;
    }

    public slow(): void
    {
        if (this.velocity.x > 0)
            this.velocity.x -= 2;
        else if (this.velocity.x < 0)
            this.velocity.x += 2;
        
        if (this.velocity.y > 0)
            this.velocity.y -= 2;
        else if (this.velocity.y < 0)
            this.velocity.y += 2;
        
        if (this.velocity.x == 0 && this.velocity.y == 0)
            this.kill();
    }

    public act(terrain: Array<Collidable>): void
    {
        if (Ball.lifetime - this.startLifetime > 2)
            this.kill();
        if (this.dead)
            return;
        for (const obj of terrain)
        {
            if (this.collidesWith(obj) && !(obj instanceof Player))
            {
                this.kill();
                return;
            }
        }

        // X
        for (const obj of terrain)
        {
            this.x += this.velocity.x * DELTA_TIME;
            if (this.collidesWith(obj))
            {
                this.x -= this.velocity.x * DELTA_TIME;
                
                this.slow();
                if (obj instanceof Player)
                    obj.act({ x: this.velocity.x, y: 0 }, terrain, true);
                else if (obj instanceof Biller)
                {
                    this.kill();
                    return;
                }
                this.velocity.x *= -1;
                break;
            }
            else
            {
                this.x -= this.velocity.x * DELTA_TIME;
            }
        }
        this.x += this.velocity.x * DELTA_TIME;

        // Y
        for (const obj of terrain)
        {
            this.y += this.velocity.y * DELTA_TIME;
            if (this.collidesWith(obj))
            {
                this.y -= this.velocity.y * DELTA_TIME;
                
                this.slow();
                if (obj instanceof Player)
                {
                    if (this.velocity.y * obj.velocityY > 0)
                    {
                        obj.act({ x: 0, y: this.velocity.y * -1 }, terrain, true);
                    }
                    else
                    {
                        obj.act({ x: 0, y: this.velocity.y }, terrain, true);
                        this.velocity.y *= -1;
                    }
                }
                else if (obj instanceof Biller)
                {
                    this.kill();
                    return;
                }
                else
                    this.velocity.y *= -1;
                break;
            }
            else
            {
                this.y -= this.velocity.y * DELTA_TIME;
            }
        }
        this.y += this.velocity.y * DELTA_TIME;
    }
}
setInterval(() => Ball.lifetime++, 1000);