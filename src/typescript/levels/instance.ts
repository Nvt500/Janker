class Instance implements Drawable
{
    private drawables: Array<Drawable>;
    private exits: Array<Exit> = [];

    constructor(private x: number, 
        private y: number, 
        private width: number, 
        private height: number, 
        private ctx: DrawingContext2D,
        private camera: Camera, 
        ...drawables: Array<Drawable>)
    {
        this.drawables = drawables;
    }

    public get getExits(): Exit[] { return this.exits; }

    public addDrawables(...drawables: Array<Drawable>): void
    {
        this.drawables = this.drawables.concat(drawables);
    }

    public addExits(...exits: Array<Exit>): void
    {
        this.exits = this.exits.concat(exits);
    }

    public draw(): void
    {
        this.ctx.clearRect(this.x, this.y, this.width, this.height);
        this.camera.centerView(this.x, this.y, this.width, this.height);
        this.ctx.xOffset = this.camera.xOffset;
        this.ctx.yOffset = this.camera.yOffset;
        for (const obj of this.drawables)
        {
            obj.draw(this.ctx);
        }
        for (const exit of this.exits)
        {
            exit.draw(this.ctx);
        }
    }

    public playerInExit(player: Player): Exit | null
    {
        for (const exit of this.exits)
        {
            if (player.collidesWith(exit))
            {
                return exit;
            }
        }
        return null;
    }

    // Oop
    public getNextInstance(): Instance
    {
        for (const exit of this.exits)
        {
            return exit.instance;
        }
    }

    get collidables(): Collidable[]
    {
        return this.drawables.filter((obj) => "collidesWith" in obj);
    }
}