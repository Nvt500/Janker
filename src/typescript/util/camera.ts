class Camera extends Entity
{
    private center: Entity;

    public static fromRect(entity: Entity): Camera
    {
        const cam = new Camera(entity.centerX, entity.centerY);
        cam.centerOn(entity);
        return cam;
    }

    public centerOn(center: Entity): void
    {
        this.center = center;
    }

    public centerView(screenX: number, screenY: number, screenWidth: number, screenHeight: number): void
    {
        this._centerX = this.center.centerX - (screenWidth / 2 + screenX);
        this._centerY = this.center.centerY - (screenHeight / 2 + screenY);
    }

    get xOffset(): number
    {
        return -this.centerX;
    }

    get yOffset(): number
    {
        return -this.centerY;
    }
}