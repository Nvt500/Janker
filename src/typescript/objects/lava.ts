class Lava extends CollidableRect implements Drawable
{
    public draw(ctx: DrawingContext2D): void
    {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}