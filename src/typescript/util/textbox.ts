const CURSOR_ADD_X = 12;
const CURSOR_ADD_Y = 20;
const CURSOR_START_X = 10;
const CURSOR_START_Y = 10;

class TextBox extends Button
{
    private canType: boolean = false;
    private charCount: number = 0;
    private charCounted: string = "";
    private arrowCount: number = 0;
    private arrowCounted: string = "";
    private cursorIndex: Vector = { x: 0, y: 0 };
    private lines: string[] = [""];
    private showCursor: boolean = true;

    constructor(x: number,
        y: number,
        width: number,
        height: number) 
    {
        super("", x, y, width, height);
        Keyboard.addKeyUpFunc((key: string) => {
            if (key == this.charCounted)
            {
                this.charCount = 0;
                this.charCounted = "";
            } else if (key == this.arrowCounted)
            {
                this.arrowCount = 0;
                this.arrowCounted = "";
            }
        });
        
        super.onClickHook((pos: Vector) => {
            this.canType = true;

            const _x = Math.floor((pos.x - this.x - CURSOR_START_X) / CURSOR_ADD_X);
            const _y = Math.floor((pos.y - this.y - CURSOR_START_Y) / CURSOR_ADD_Y);
            this.cursorIndex.y = Math.min(_y, this.lines.length-1);
            if (_y > this.lines.length-1)
                this.cursorIndex.x = this.lines[this.cursorIndex.y].length;
            else
                this.cursorIndex.x = Math.min(_x, this.lines[this.cursorIndex.y].length);
        });
        super.onClickOffHook(() => {
            this.canType = false;
        });

        const cursorShowerThing = () => {
            this.showCursor = !this.showCursor;
            if (this.showCursor)
                setTimeout(cursorShowerThing, 400);
            else
                setTimeout(cursorShowerThing, 500);
        }
        cursorShowerThing();
    }

    private handleArrowKeyDelay(key: string): boolean
    {
        if (key == this.arrowCounted)
        {
            this.arrowCount++;
            if (this.arrowCount < 30)
                return true;
        }
        else
        {
            this.arrowCounted = key;
            this.arrowCount = 0;
        }
        return false;
    }

    public draw(ctx: DrawingContext2D): void
    {
        if (this.canType)
        {
            let exit = false;
            Keyboard.match_keys_down((key: string) => {
                switch (key)
                {
                    case "arrowright":
                        if (this.handleArrowKeyDelay(key))
                            break;

                        if (this.cursorIndex.x == this.lines[this.cursorIndex.y].length)
                        {
                            if (this.cursorIndex.y < this.lines.length-1)
                            {
                                this.cursorIndex.x = 0;
                                this.cursorIndex.y++;
                            }
                        }
                        else
                            this.cursorIndex.x++;
                        break;
                    case "arrowleft":
                        if (this.handleArrowKeyDelay(key))
                            break;

                        if (this.cursorIndex.x == 0)
                        {
                            if (this.cursorIndex.y > 0)
                            {
                                this.cursorIndex.y--;
                                this.cursorIndex.x = this.lines[this.cursorIndex.y].length;
                            }
                        }
                        else
                            this.cursorIndex.x--;
                        break;
                    case "arrowdown":
                        if (this.handleArrowKeyDelay(key))
                            break;

                        if (this.cursorIndex.y == this.lines.length - 1)
                        {
                            this.cursorIndex.x = this.lines[this.cursorIndex.y].length;
                        }
                        else
                        {
                            this.cursorIndex.y++;
                            this.cursorIndex.x = Math.min(this.lines[this.cursorIndex.y].length, this.cursorIndex.x);
                        }
                        break;
                    case "arrowup":
                        if (this.handleArrowKeyDelay(key))
                            break;

                        if (this.cursorIndex.y == 0)
                        {
                            this.cursorIndex.x = 0;
                        }
                        else
                        {
                            this.cursorIndex.y--;
                            this.cursorIndex.x = Math.min(this.lines[this.cursorIndex.y].length, this.cursorIndex.x);
                        }
                        break;
                    default:
                        if (!exit)
                            exit = this.updateText(key);
                        break;
                }
            });
        }

        ctx.fillStyle = "blue";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "black";
        ctx.textAlign = "start";
        ctx.textFont = "Courier New, monospace";
        ctx.fontSize = 20;
        
        for (let i = 0; i < this.lines.length; i++)
            ctx.fillText(this.lines[i], this.x + 10, this.y + 20*(i+1));
        
        ctx.textAlign = "center";
        ctx.textFont = "Arial";
        ctx.fontSize = 30;
        
        if (this.showCursor && this.canType)
            ctx.fillRect(
                this.x + this.cursorIndex.x * CURSOR_ADD_X + CURSOR_START_X, 
                this.y + this.cursorIndex.y * CURSOR_ADD_Y + CURSOR_START_Y,
                2, 20);
    }

    private updateText(t: string): boolean
    {
        if (t != "backspace" && t != "enter" && t.length != 1)
            return false;

        if (t == this.charCounted)
        {
            this.charCount++;
            if (this.charCount < 30)
                return true;
        }
        else
        {
            this.charCounted = t;
            this.charCount = 0;
        } 
        if (t == "backspace" && (this.lines.length > 1 || this.lines[0].length > 0))
        {
            if (this.cursorIndex.x == 0)
            {
                if (this.cursorIndex.y > 0)
                {
                    const line = this.lines[this.cursorIndex.y];
                    this.lines.splice(this.cursorIndex.y, 1);
                    this.cursorIndex.y--;
                    this.cursorIndex.x = this.lines[this.cursorIndex.y].length;
                    this.lines[this.cursorIndex.y] += line;
                }
                else
                {
                    if (this.lines[0].length == 0)
                        this.lines.shift();
                    else
                        this.lines[0] = this.lines[0].slice(1, this.lines[0].length);
                }
            }
            else
            {
                this.lines[this.cursorIndex.y] = 
                    this.lines[this.cursorIndex.y].slice(0, this.cursorIndex.x-1) + this.lines[this.cursorIndex.y].slice(this.cursorIndex.x, this.lines[this.cursorIndex.y].length);
                this.cursorIndex.x--;
            }
        }
        else if (t == "enter")
        {
            const end = this.lines[this.cursorIndex.y].slice(this.cursorIndex.x, this.lines[this.cursorIndex.y].length);
            this.lines[this.cursorIndex.y] = this.lines[this.cursorIndex.y].slice(0, this.cursorIndex.x);
            this.cursorIndex.y++;
            this.cursorIndex.x = 0;
            this.lines.splice(this.cursorIndex.y, 0, end);
        }
        else if (t.length == 1)
        {
            this.lines[this.cursorIndex.y] = 
                this.lines[this.cursorIndex.y].slice(0, this.cursorIndex.x) + t + 
                this.lines[this.cursorIndex.y].slice(this.cursorIndex.x, this.lines[this.cursorIndex.y].length);
            this.cursorIndex.x++;
        }
        else
            return false;
        return true;
    }

    public setText(text: string): void
    {
        this.lines = text.split("\n");
        this.cursorIndex.x = this.lines[this.lines.length - 1].length;
        this.cursorIndex.y = this.lines.length;
    }

    public getText(): string
    {
        return this.lines.join("\n");
    }
}