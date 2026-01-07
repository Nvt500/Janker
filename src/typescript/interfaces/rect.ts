abstract class Rect extends Entity
{
    constructor(
        protected _x: number, 
        protected _y: number, 
        protected _width: number, 
        protected _height: number) 
    {
        super(_x + _width / 2, _y + _height / 2);
    }

    get x(): number { return this._x; }
    get y(): number { return this._y; }
    get width(): number { return this._width; }
    get height(): number { return this._height; }

    set x(x: number)
    {
        this._x = x;
        this._centerX = this._x + this._width / 2;
    }

    set y(y: number)
    {
        this._y = y;
        this._centerY = this._y + this._height / 2;
    }

    set width(w: number)
    {
        this._width = w;
        this._centerX = this._x + this._width / 2;
    }

    set height(h: number)
    {
        this._height = h;
        this._centerY = this._y + this._height / 2;
    }
}