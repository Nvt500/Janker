class Level
{
    private _currentInstance: Instance;
    private _startX: number;
    private _startY: number;
    
    constructor(
        private _instances: Instance[],
        private _player: Player,
    ) 
    {
        this._currentInstance = _instances[0];
        this._startX = _player.x;
        this._startY = _player.y;
    }

    get currentInstance(): Instance { return this._currentInstance; }
    get player(): Player { return this._player; }
    get startX(): number { return this._startX; }
    get startY(): number { return this._startY; }

    public draw(): void
    {
        this.currentInstance.draw();
    }

    public playerInExit(ignore: boolean = false): boolean
    {
        let exit = this.currentInstance.playerInExit(this.player);
        if (exit !== null || ignore)
        {
            if (ignore)
            {
                if (this.currentInstance.getExits.length == 0)
                    return false;
                exit = this.currentInstance.getExits[0];
            }
            if (exit.instance === undefined)
                return true;
            this._currentInstance = exit.instance;
            this._player.tp(exit.newX, exit.newY);
            this._startX = this.player.x;
            this._startY = this.player.y;
        }
        return false;
    } 

    private static checkParams(obj: { objType: string, params: any[] }, numParams: number): boolean
    {
        for (let i = 0; i < numParams; i++)
        {
            if (typeof obj.params[i] == "number")
            {
                if (obj.params[i].toString() == "NaN" && obj.params[i] === undefined)
                    return true;
            }
            else
            {
                if (obj.params[i] == "" && obj.params[i] == undefined)
                    return true;
            }
        }
        return false;
    }

    public static fromLevelString(
        levelString: string, 
        x: number, y: number,
        width: number, height: number,
        context: DrawingContext2D,
        ): Level | string
    {
        let player = undefined;
        let camera = undefined;
        let instances = [];
        let instanceExits = [];
        let playerLocals = [];

        if (levelString.trim().length == 0 || levelString.trim() == "")
            return "There is no input.";

        // Get each instance string
        const levelStrings: string[] = levelString.trim().split("\n\n\n");
        // Create each instance
        for (let i = 0; i < levelStrings.length; i++)
        {
            // Get 0000 part and attr part
            const parts = levelStrings[i].trim().split("\n\n");
            const levelStr = parts[0];

            // Get params
            const attrStr = parts[1] === undefined ? "" : parts[1];
            const matches = attrStr.matchAll(/(?<objType>[A-Z])\((?<params>[0-9, -"'A-Za-z.]+)\)/g);
            const info = [];
            for (const match of matches)
            {
                const params = match.groups.params;
                const newParams =  params.split(",").map((val) => val.startsWith("\"") ? val.slice(1, val.length-1) : parseInt(val.trim(), 10));
                info.push({ objType: match.groups.objType, params: newParams });
            }

            let drawables = [];
            let exits = [];

            // Get objects
            let X = 0, Y = 0;
            for (const char of levelStr)
            {
                switch (char)
                {
                    case "P":
                        if (player === undefined)
                        {
                            const indexP = info.findIndex((val) => val.objType == "P");
                            if (indexP == -1)
                                return "No player attributes (ex. 'P(30, 50)').";
                            const objP = info.splice(indexP, 1)[0];
                            if (Level.checkParams(objP, 2))
                                return "Two attributes are required for player.";
                            player = new Player(X, Y, objP.params[0], objP.params[1]);
                        }
                        else
                        {
                            playerLocals.push({ x: X, y: Y, sublevel: i }); 
                        }
                        break;
                    case "T":
                        drawables.push(new Terrain(X, Y, 100, 100));
                        break;
                    case "B":
                        drawables.push(new Biller(X, Y, 100, 100));
                        break;
                    case "L":
                        drawables.push(new Lava(X, Y, 100, 100));
                        break;
                    case "E":
                        const indexE = info.findIndex((val) => val.objType == "E");
                        if (indexE == -1)
                                return "No exit attributes (ex. 'E(100, 100, 1)').";
                        const objE = info.splice(indexE, 1)[0]; 
                        if (Level.checkParams(objE, 3))
                                return "Three attributes are required for exit.";
                        exits.push({ x: X, y: Y, w: objE.params[0], h: objE.params[1], i: objE.params[2], sublevel: i + 1 });
                        break;
                    case "S":
                        const indexS = info.findIndex((val) => val.objType == "S");
                        if (indexS == -1)
                                return "No text attributes (ex. 'S(\"Hello World\", 50, 0)').";
                        const objS = info.splice(indexS, 1)[0]; 
                        if (Level.checkParams(objS, 3))
                                return "Three attributes are required for text.";
                        drawables.push(new GameText(objS.params[0], X+objS.params[1], Y+objS.params[2]));
                        break;
                    case "\n":
                        Y += 100;
                        X = -100;
                        break;
                    default:
                        break;
                }
                X += 100;
            }

            if (camera === undefined)
            {
                if (player === undefined)
                    return "No player.";
                camera = Camera.fromRect(player);
            }
            drawables.push(player);

            const instance = new Instance(x, y, width, height, context, camera, ...drawables);
            instanceExits.push(exits);
            instances.push(instance);
        }

        function getPlayerLocal(sublevel)
        {
            for (const o of playerLocals)
                if (sublevel == o.sublevel)
                    return o;
            return { x: 0, y: 0 };
        }

        for (let i = 0; i < instances.length; i++)
        {
            instances[i].addExits(...instanceExits[i].map((obj) => new Exit(obj.x, obj.y, obj.w, obj.h, instances[obj.i], getPlayerLocal(obj.sublevel).x, getPlayerLocal(obj.sublevel).y)));
        }

        return new Level(instances, player);
    }
}