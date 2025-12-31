(async () => {
    const gameWidth = 1920;
    const gameHeight = 1080;
    /**
     * @type {HTMLCanvasElement} Main playable area
    **/
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const storedCanvasSized = {
        width: canvas.width,
        height: canvas.height
    };
    let activeKeys = [];
    let deltaTimeStamp = 0;
    function resizeCanvas() {
        const aspectRatio = gameWidth / gameHeight;
        let width = window.innerWidth;
        let height = window.innerHeight;
        if (width / height > aspectRatio) {
            width = height * aspectRatio;
        } else {
            height = width / aspectRatio;
        }

        canvas.width = `${width}`;
        canvas.height = `${height}`;

        canvas.width = width;
        canvas.height = height;
    }
    function getScaleFactors() {
        let x = canvas.width / gameWidth;
        let y = canvas.height / gameHeight;
        return {
            x,
            y
        };
    }
    let factors = getScaleFactors();
    console.log("Initial factors", factors);
    resizeCanvas();
    let target = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        run: -0,
        rise: 20,
        width: 500,
        height: 500,
        origin: {
            width: canvas.width,
            height: canvas.height
        },
        /**
         *
         * @param {{x: number, y: number}} param0
         */
        move({x, y}) {
            this.x = !isNaN(x) ? this.x + x * factors.x: this.x;
            this.y = !isNaN(y) ? this.y + y * factors.y: this.y;
        },
        respawn() {
        },
        draw() {
            this.move({
                x: this.run,
                y: this.rise
            });
            let originFactors = {
                width: canvas.width / this.origin.width,
                height: canvas.height / this.origin.height
            };
            this.x = (this.x * originFactors.width);
            this.y = (this.y * originFactors.height);
            ctx.beginPath();
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x - (this.width * factors.x / 2), this.y - (this.height * factors.y / 2), this.width * factors.x, this.height * factors.y);
            // off screen detection
            if (this.x - (this.width * factors.x / 2) > canvas.width || this.x + (this.width * factors.x / 2) < 0 || this.y - (this.height * factors.y / 2) > canvas.height || this.y + (this.height * factors.y / 2) < 0) {
                console.log("Out of bounds at ", this.x, this.y);
                let respawned = false;
                let didPass = false;
                while (!respawned) {
                    if (respawned) {
                        break;
                    }
                    this.move({
                        x: -this.run,
                        y: -this.rise
                    });
                    // See if it passed in bounds
                    if (this.x - (this.width * factors.x / 2) < canvas.width && this.x + (this.width * factors.x / 2) > 0 || this.y - (this.height * factors.y / 2) < canvas.height || this.y + (this.height * factors.y / 2) > 0) {
                        didPass = true;
                    }
                    if (didPass) { // Detect if out of bounds
                        if (this.x - (this.width * factors.x / 2) > canvas.width || this.x + (this.width * factors.x / 2) < 0 || this.y - (this.height * factors.y / 2) > canvas.height || this.y + (this.height * factors.y / 2) < 0) {
                            respawned = true;
                        }
                    }
                }
                console.log("Respawned at", this.x, this.y);
            }
            if (canvas.width !== this.origin.width && canvas.height !== this.origin.height) {
                this.origin = {
                    width: canvas.width,
                    height: canvas.height
                };
            }
        }
    };
    // Keybinds

    window.addEventListener("keydown", (e) => {
        if (activeKeys.indexOf(e.key) > -1) {
            return false;
        }
        activeKeys.push(e.key);
    });
    window.addEventListener("keyup", (e) => {
        activeKeys = activeKeys.filter((i) => i !== e.key);
    });
    // Main game loop. All repeating logic goes here
    async function mainLoop() {
        let deltaTime = (Date.now() - deltaTimeStamp) / 1000;
        deltaTimeStamp = Date.now();
        
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Resize the canvas
        resizeCanvas();
        // Define factors
        factors = getScaleFactors();

        // GAME LOGIC BELOW THIS LINE
        for (var i of activeKeys) {
            if (i === "ArrowUp") {
                target.y -= 1 * factors.y;
            }
            else if (i === "ArrowDown") {
                target.y += 1 * factors.y;
            }
            else if (i === "ArrowLeft") {
                target.x -= 1 * factors.x;
            }
            else if (i === "ArrowRight") {
                target.move({
                    x: 1
                });
            }
            
        }
        
        target.draw();
        
        // END OF LOOP
        requestAnimationFrame(mainLoop);
        // DO NOT WRITE GAME LOGIC BELOW THIS LINE
    }
    requestAnimationFrame(mainLoop);
})();