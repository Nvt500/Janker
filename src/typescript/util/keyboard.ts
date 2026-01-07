class KeyboardClass
{
    private keys: Map<string, { down: boolean, upperCase: boolean }>;
    private key_up_functions: ((key: string) => void)[] = [];
    private shiftDown: boolean = false;

    constructor()
    {
        this.keys = new Map();

        window.addEventListener("keydown", (event) => {
            if (event.key == "Shift")
            {
                this.shiftDown = true;
                this.keys.set(event.key, { down: true, upperCase: false });
                return;
            }
            this.keys.set(event.key.toLowerCase(), { down: true, upperCase: this.shiftDown });
        });

        window.addEventListener("keyup", (event) => {
            if (event.key == "Shift")
            {
                this.shiftDown = false;
                this.keys.set(event.key, { down: false, upperCase: false });
                return;
            }
            const k = this.keys.get(event.key.toLowerCase()).upperCase && event.key.length == 1 ? event.key.toUpperCase() : event.key.toLowerCase();
            for (const func of this.key_up_functions)
                func(k);
            this.keys.set(event.key.toLowerCase(), { down: false, upperCase: this.shiftDown });
        });
    }

    public addKeyUpFunc(func: (key: string) => void)
    {
        this.key_up_functions.push(func);
    }

    public match_keys_down(func: (key: string) => void)
    {
        Array.from(this.keys.entries())
            .filter((pair: [string, { down: boolean, upperCase: boolean }]) => {
                return pair[1].down;
            })
            .forEach((pair: [string, { down: boolean, upperCase: boolean }]) => {
                func(pair[1].upperCase && pair[0].length == 1 ? pair[0].toUpperCase() : pair[0]);
            });
    }

    public match_keys_up(func: (key: string) => void)
    {
        Array.from(this.keys.entries())
            .filter((pair: [string, { down: boolean, upperCase: boolean }]) => {
                return !pair[1].down;
            })
            .forEach((pair: [string, { down: boolean, upperCase: boolean }]) => {
                this.keys.delete(pair[0]);
                func(pair[1].upperCase && pair[0].length == 1 ? pair[0].toUpperCase() : pair[0]);
            });
    }
}
const Keyboard = new KeyboardClass();