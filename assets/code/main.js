(async () => {
    // Standard game height
    const gameWidth = 1920;
    const gameHeight = 1080;
    
    /**
     * @type {HTMLCanvasElement} Main playable area
    **/
    const canvas = document.getElementById('game');

    // Scale factors to adjust the size of different game elements
    function getScaleFactors() {
        let x = canvas.width / gameWidth;
        let y = canvas.height / gameHeight;
        return {
            x,
            y
        };
    }

    // Canvas context
    const ctx = canvas.getContext('2d');

    // Game assets
    const assets = {
        images: [],
        audio: []
    };
    const assetNames = {
        images: ['Tier3Games.png', 'HEAD_GUMBALL.png', 'HEAD_DARWIN.png', 'HEAD_ANAIS.png', 'HEAD_NICOLE.png', 'HEAD_RICHARD.png'],
        audio: ['gameplay.mp3', 'points.mp3', 'tick.mp3', 'title_screen.mp3']
    };

    // Load assets
    async function loadAssets() {
        let loadSize = assetNames.images.length + assetNames.audio.length;
        for (var i of assetNames.images) {
            try {
                let image = await loadImage(`assets/images/${i}`);
                assets.images[i.split('.').reverse().slice(1).reverse().join('.')] = image;
                game.states.assetsLoadProgress += (1 / loadSize) * 100;
            } catch (e) {
                console.error(e);
            }
        }
        for (var i of assetNames.audio) {
            try {
                let audio = await loadAudio(`assets/audio/${i}`);
                assets.audio[i.split('.').reverse().slice(1).reverse().join('.')] = audio;
                game.states.assetsLoadProgress += (1 / loadSize) * 100;
            } catch (e) {
                console.error(e);
            }
        }
    }

    // Automatically resize the canvas & maintain aspect ratio
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

    /**
     * @param {string} src The source URL of the image asset.
     * @returns {Promise.<HTMLImageElement>}
    **/
    function loadImage(src) {
        return new Promise((resolve, reject) => {
            let image = new Image();
            image.onload = () => {
                resolve(image);
            };
            image.src = src;
        });
    }

    /**
     * @param {string} src The source URL of the image asset.
     * @returns {Promise.<HTMLAudioElement>}
     * */
    function loadAudio(src) {
        return new Promise((resolve, reject) => {
            let audio = new Audio();
            audio.onloadeddata = () => {
                resolve(audio);
            }
            audio.src = src;
        });
    }

    // Preset canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Wanted posters
    class WantedPoster {
        constructor(image, x, y, collapsible) {
            this.image = image;
            this.x = x;
            this.y = y;
            this.collapsible = collapsible;
            this.collapsed = false;
        }
        draw(time) {
            if (!this.collapsed) {
                ctx.beginPath();
                ctx.fillStyle = '#e1c699';
                ctx.fillRect(this.x, this.y, 250 * factors.x, 320 * factors.y);
                ctx.beginPath();
                ctx.fillStyle = 'black';
                ctx.font = `bold ${30 * factors.x}px wanted`;
                ctx.textAlign = 'center';
                ctx.fillText('WANTED', this.x + 125 * factors.x, this.y + 30 * factors.y);
                ctx.beginPath();
                ctx.moveTo(this.x + 50 * factors.x, this.y + 25 * factors.y);
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2 * factors.x;
                ctx.lineTo(this.x + 25 * factors.x, this.y + 25 * factors.y);
                ctx.lineTo(this.x + 25 * factors.x, this.y + 280 * factors.y);
                ctx.lineTo(this.x + 225 * factors.x, this.y + 280 * factors.y);
                ctx.lineTo(this.x + 225 * factors.x, this.y + 25 * factors.y);
                ctx.lineTo(this.x + 200 * factors.x, this.y + 25 * factors.y);
                ctx.stroke();
                ctx.beginPath();
                ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height, (this.x + 125 * factors.x) - ((this.image.width / 4 * factors.x) / 2), (this.y + 160 * factors.y) - ((this.image.height / 4 * factors.y) / 2), this.image.width * factors.x / 4, this.image.height * factors.y / 4);
            } else {
                ctx.beginPath();
                ctx.fillStyle = '#e1c699';
                ctx.fillRect(this.x, this.y, 250 * factors.x, 40 * factors.y);
            }
            if (typeof time != 'undefined' && !this.collapsed) {
                time = Math.ceil(time);
                ctx.beginPath();
                ctx.font = `bold ${30 * factors.x}px wanted`;
                ctx.fillStyle = time <= 3 || game.penalty > 0 ? 'red' : 'black';
                ctx.fillText(String(time), this.x + 125 * factors.x, this.y + 260 * factors.y);
            }
            if (this.collapsible) {
                if (!this.collapsed) {
                    ctx.beginPath();
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = 'gray';
                    ctx.moveTo(this.x + 100 * factors.x, this.y + 310 * factors.x);
                    ctx.lineTo(this.x + 125 * factors.x, this.y + 290 * factors.y);
                    ctx.lineTo(this.x + 150 * factors.x, this.y + 310 * factors.y);
                    ctx.stroke();

                    // Detect mouse (expanded)
                    if (game.mouse.x >= this.x + 100 * factors.x && game.mouse.x <= this.x + 150 * factors.x && game.mouse.y >= this.y + 290 * factors.x && game.mouse.y <= this.y + 320 * factors.y) {
                        canvas.style.cursor = 'pointer';
                        game.mouseHit = this;
                        game.handlers.mouseAction = () => {
                            this.collapsed = true;
                        };
                    } else {
                        if (game.mouseHit === this) {
                            canvas.style.cursor = 'default';
                            game.handlers.mouseAction = () => { };
                        }
                    }
                } else {
                    ctx.beginPath();
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = 'gray';
                    ctx.moveTo(this.x + 100 * factors.x, this.y + 10 * factors.y);
                    ctx.lineTo(this.x + 125 * factors.x, this.y + 30 * factors.y);
                    ctx.lineTo(this.x + 150 * factors.x, this.y + 10 * factors.y);
                    ctx.stroke();
                    if (game.mouse.x >= this.x + 100 * factors.x && game.mouse.x <= this.x + 150 * factors.x && game.mouse.y >= this.y + 10 * factors.y && game.mouse.y <= this.y + 30 * factors.y) {
                        canvas.style.cursor = 'pointer';
                        game.mouseHit = this;
                        game.handlers.mouseAction = () => {
                            this.collapsed = false;
                        };
                    } else {
                        if (game.mouseHit === this) {
                            canvas.style.cursor = 'default';
                            game.handlers.mouseAction = () => { };
                        }
                    }
                }
            }
        }
    }

    // Text buttons
    class TextButton {
        constructor(text, font, textColor, backgroundColor, borderSize, borderColor, x, y, width, height, maxWidth, onclick) {
            this.text = text;
            this.font = font;
            this.textColor = textColor;
            this.backgroundColor = backgroundColor;
            this.borderSize = borderSize;
            this.borderColor = borderColor;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.maxWidth = maxWidth;
            this.onclick = onclick;
        }
        draw() {
            ctx.beginPath();
            ctx.fillStyle = this.backgroundColor;
            ctx.strokeStyle = this.borderColor;
            ctx.lineWidth = this.borderSize;
            ctx.fillRect(this.x, this.y, this.width * factors.x, this.height * factors.y);
            ctx.strokeRect(this.x, this.y, this.width * factors.x, this.height * factors.y);
            ctx.beginPath();
            ctx.fillStyle = this.textColor
            ctx.font = this.font;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.text, this.x + (this.width / 2) * factors.x, this.y + (this.height / 2) * factors.y, this.maxWidth);

            // Mouse detection
            if (game.mouse.x >= this.x && game.mouse.x <= this.x + this.width * factors.x && game.mouse.y >= this.y && game.mouse.y <= this.y + this.height * factors.y) {
                canvas.style.cursor = 'pointer';
                game.handlers.mouseAction = () => {
                    this.onclick();
                };
            } else {
                canvas.style.cursor = 'default';
                game.handlers.mouseAction = () => { };
            }
        }
    }

    // Characters
    class Character {

        /**
         * @param {number} charId The ID for the character
         * @param {boolean} wanted Whether or not the character is wanted
         * @param {number} x The X position for the character
         * @param {number} y The Y position for the character
         * @param {number} run The number of pixels the character moves vertically per frame.
         * @param {number} rise The number of pixels the character moves horizontally per frame.
         * @param {number} oscillateSpeedX The number of pixels the character will oscillate horizontally per frame.
         * @param {number} oscillateDistanceX The maximum number of pixels the character will oscillate horizontally.
         * @param {number} oscillateSpeedY The number of pixels the character will oscillate vertically per frame.
         * @param {number} oscillateDistanceY The maximum number of pixels the character will oscillate vertically.
         * */
        constructor(charId, wanted, x, y, run, rise, oscillateSpeedX, oscillateDistanceX, oscillateSpeedY, oscillateDistanceY) {
            this.image = game.assets.images[['HEAD_GUMBALL', 'HEAD_DARWIN', 'HEAD_ANAIS', 'HEAD_NICOLE', 'HEAD_RICHARD'][charId - 1]];
            this.wanted = wanted;
            this.x = x;
            this.y = y;
            this.run = run;
            this.rise = rise;
            this.oscillateSpeedX = oscillateSpeedX;
            this.oscillateDistanceX = oscillateDistanceX;
            this.oscillateSpeedY = oscillateSpeedY;
            this.oscillateDistanceY = oscillateDistanceY
            this.oscillationState = {
                x: {
                    current: 0,
                    multiplier: 1
                },
                y: {
                    current: 0,
                    multiplier: 1
                }
            }
            this.respawnPoint = {
                x: 0,
                y: 0
            };
            this.respawnTimeout = 0;
        }
        calculateRespawnPoint() {
            if (this.rise === 0 || this.run === 0) {
                if (Math.abs(this.run) > 0) {
                    while (this.respawnPoint.x <= canvas.width && this.respawnPoint.x >= -this.image.width / 4) {
                        this.respawnPoint.x = this.respawnPoint.x - this.run;
                    }
                } else {
                    this.respawnPoint.x = this.x;
                }
                if (Math.abs(this.rise) > 0) {
                    while (this.respawnPoint.y <= canvas.height && this.respawnPoint.y >= -this.image.height / 4) {
                        this.respawnPoint.y = this.respawnPoint.y - this.rise;
                    }
                } else {
                    this.respawnPoint.y = this.y;
                }
            } else {
                this.respawnPoint.x = this.x;
                this.respawnPoint.y = this.y;
                while (this.respawnPoint.x > -this.image.width / 4 && this.respawnPoint.x < canvas.width + this.image.width / 4 && this.respawnPoint.y > -this.image.height / 4 && this.respawnPoint.y < canvas.height + this.image.height / 4) {
                    this.respawnPoint.x -= this.run;
                    this.respawnPoint.y -= this.rise;
                }
            }
        }
        draw(deltaTime) {
            let speedMultiplier = 60 / Math.floor(1 / deltaTime);
            ctx.beginPath();
            ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height, this.x, this.y, (this.image.width * factors.x) / 4, (this.image.height * factors.y) / 4);
            if (!game.states.currentLevel.solved) {
                this.x += (this.run * factors.x) * speedMultiplier;
                this.y += (this.rise * factors.y) * speedMultiplier;
                if (Math.abs(this.oscillationState.x.current) >= this.oscillateDistanceX) {
                    this.oscillationState.x.multiplier = -this.oscillationState.x.multiplier
                }
                this.oscillationState.x.current += this.oscillateSpeedX * this.oscillationState.x.multiplier;
                if (Math.abs(this.oscillationState.y.current) >= this.oscillateDistanceY) {
                    this.oscillationState.y.multiplier = -this.oscillationState.y.multiplier
                }
                this.oscillationState.y.current += this.oscillateSpeedY * this.oscillationState.y.multiplier;
                this.x += this.run + this.oscillationState.x.current * speedMultiplier;
                this.y += this.rise + this.oscillationState.y.current * speedMultiplier;
                if ((this.x >= canvas.width || this.x <= -this.image.width / 4) || (this.y >= canvas.height || this.y <= -this.image.height / 4)) {
                    if (this.run < 0 && this.x > 0) {
                        return;
                    }
                    if (this.rise < 0 && this.y > 0) {
                        return;
                    }
                    console.log('Out of bounds!');
                    this.x = this.respawnPoint.x;
                    this.y = this.respawnPoint.y;
                    this.respawnTimeout = 10;
                    //this.calculateRespawnPoint();
                }
            }

            // Check mouse
            if (game.mouse.x >= this.x && game.mouse.x <= this.x + (this.image.width * factors.x) / 4 && game.mouse.y >= this.y && game.mouse.y <= this.y + (this.image.height * factors.y) / 4) {
                canvas.style.cursor = 'pointer';
                game.mouseHit = this;
                game.handlers.mouseAction = () => {
                    if (!this.wanted) {
                        game.penalty = 120;
                        game.solveTimer -= game.solveTimer >= 10 ? 10 : game.solveTimer;
                    } else {
                        game.states.currentLevel.solved = true;
                    }
                }
            } else {
                if (game.mouseHit == this) {
                    canvas.style.cursor = 'default';
                    game.handlers.mouseAction = () => { };
                }
            }
        }
    }

    // Levels
    class Level {
        /** 
         * @param {"GRID_*" | "SCATTERED" | "SCATTERED_MOVING"} style
        */
        constructor(style, offsetX, offsetY, moveData) {
            this.style = style;
            this.wanted = null;
            this.characters = [];
            this.x = 0;
            this.y = 0;
            this.wantedPoster = null;
            this.offsetX = offsetX;
            this.offsetY = offsetY;
            this.moveData = moveData || {};
            this.moveData.movePatterns = this.moveData.movePatterns || [];
            this.imageArea = {
                width: 100,
                height: 100
            };
        }
        build() {
            let wantedCharacterId = Math.floor(Math.random() * 5) + 1;
            let characterIds = [1, 2, 3, 4, 5];
            characterIds = characterIds.filter((i) => i !== wantedCharacterId);
            let characterArray = [];
            if (this.style.indexOf('GRID') > -1) {
                // Calculate space needed
                this.dimensions = this.style.split('_')[1].split('x');
                this.gridDimensions = {
                    x: this.dimensions[0] * (this.imageArea.width / (2 * 1)) * factors.x,
                    y: this.dimensions[1] * ((this.imageArea.height) / (2 * 1)) * factors.y
                };
                this.x = (canvas.width / 2 - this.gridDimensions.x + this.offsetX);
                this.y = (canvas.height / 2 - this.gridDimensions.y + this.offsetY);
                let maxItems = Number(this.dimensions[0]);
                for (var i = 0; i < this.dimensions[1]; i++) {
                    characterArray.push([]);
                }
                let wantedCharacterPosition = Math.floor(Math.random() * maxItems * this.dimensions[1]);
                let currentIndex = 0;
                for (var i = 0; i < maxItems * this.dimensions[1]; i++) {
                    if (characterArray[currentIndex].length === maxItems) {
                        currentIndex++;
                    }
                    let movePatterns = this.moveData.movePatterns[currentIndex] || { rise: 0, run: 0 };
                    if (i === wantedCharacterPosition) {
                        let character = new Character(wantedCharacterId, true, 0, 0, movePatterns.run, movePatterns.rise, 0, 0, 0, 0);
                        characterArray[currentIndex].push(character);
                        this.wanted = character;
                    } else {
                        let charId = characterIds[Math.floor(Math.random() * characterIds.length)];
                        let character = new Character(charId, false, 0, 0, movePatterns.run, movePatterns.rise, 0, 0, 0, 0);
                        characterArray[currentIndex].push(character);
                    }
                }
            }

            if (this.style.indexOf('SCATTERED') > -1) {
                let charCount = Number(this.style.split('_')[1]);

                // Calculate space of character
                let space = {
                    x: 160 * factors.x,
                    y: 135 * factors.y
                };
                let playArea = {
                    x: (180) * factors.x,
                    y: (155) * factors.y
                };

                // Select the boundaries of the play area
                let bounds = {
                    x: {
                        min: playArea.x / 2,
                        max: (canvas.width - playArea.x / 2) - space.x
                    },
                    y: {
                        min: playArea.y / 2,
                        max: (canvas.height - playArea.y / 2) - space.y
                    }
                };

                // Random spawn selection
                let chosenPoints = [];
                for (var i = 0; i < charCount; i++) {

                    // Select a random spot within the bounds of the play area
                    let pointX = 0;
                    let pointY = 0;
                    let found = false;
                    let charId = i === 0 ? wantedCharacterId :  characterIds[Math.floor(Math.random() * characterIds.length)];
                    for (var i2 = 0; i2 < 5000; i2++) {

                        // Randomly select points
                        pointX = Math.floor(bounds.x.min + (Math.random() * (bounds.x.max - bounds.x.min)));
                        pointY = Math.floor(bounds.y.min + (Math.random() * (bounds.y.max - bounds.y.min)));
                        if (chosenPoints.length === 0) {
                            found = true;
                            break;
                        }
                        let tl = {
                            x: pointX,
                            y: pointY
                        };
                        let tr = {
                            x: pointX + space.x,
                            y: pointY
                        };
                        let bl = {
                            x: pointX,
                            y: pointY + space.y
                        };
                        let br = {
                            x: pointX + space.x,
                            y: pointY + space.y
                        };
                        let conflict = false;
                        for (var j of chosenPoints) {
                            let minX = j.x;
                            let minY = j.y;
                            let maxX = j.x + space.x;
                            let maxY = j.y + space.y;
                            if (
                                tl.x >= minX && tl.x <= maxX && tl.y >= minY && tl.y <= maxY
                            ) {
                                conflict = true;
                                break;
                            } else if (
                                tr.x >= minX && tr.x <= maxX && tr.y >= minY && tr.y <= maxY
                            ) {
                                conflict = true;
                                break;
                            } else if (
                                br.x >= minX && br.x <= maxX && br.y >= minY && br.y <= maxY
                            ) {
                                conflict = true;
                                break;
                            } else if (
                                bl.x >= minX && bl.x <= maxX && bl.y >= minY && bl.y <= maxY
                            ) {
                                conflict = true;
                                break;
                            }
                        }
                        if (!conflict) {
                            found = true;
                            break;
                        } else {
                            continue;
                        }
                    }
                    if (!found) {
                        break;
                    }

                    // Subtract from maximum if chosen point conflicts with other spaces
                    chosenPoints.push({
                        x: pointX,
                        y: pointY
                    });
                    let character = new Character(charId, i === 0, pointX, pointY, 0, 0, 0, 0, 0, 0);
                    if (i === 0) {
                        this.wanted = character;
                    }
                    characterArray.push(character);
                }
            }
            this.characters = characterArray;

            // Organize
            if (this.style.indexOf('GRID') > -1) {
                this.x = (canvas.width / 2 - this.gridDimensions.x + this.offsetX);
                this.y = (canvas.height / 2 - this.gridDimensions.y + this.offsetY);
                let col = 0;
                let row = -1;
                for (var i of this.characters) {
                    row++;
                    col = 0;
                    for (var j of i) {
                        j.x = this.x - ((j.image.width / 4 * factors.x) + 40 * factors.x) + (200 * factors.x * col);
                        j.y = this.y - ((j.image.height / 4 * factors.y) + 40 * factors.y) + (200 * factors.y * row);
                        j.calculateRespawnPoint();
                        col++;
                    }
                }
            }
            this.wantedPoster = new WantedPoster(this.wanted.image, 0, 0, true);
            return this;
        }
        draw(deltaTime) {
            if (game.states.currentLevel.solved) {
                this.wantedPoster.draw(game.solveTimer);
                this.wanted.draw();
                return;
            }
            if (this.style.indexOf('GRID') > -1) {
                this.gridDimensions = {
                    x: this.dimensions[0] * (this.imageArea.width / (2 * 1)) * factors.x,
                    y: this.dimensions[1] * ((this.imageArea.height) / (2 * 1)) * factors.y
                };
                this.x = (canvas.width / 2 - this.gridDimensions.x + this.offsetX);
                this.y = (canvas.height / 2 - this.gridDimensions.y + this.offsetY);
                let col = 0;
                let row = -1;
                for (var i of this.characters) {
                    row++;
                    col = 0;
                    for (var j of i) {
                        j.draw(deltaTime);
                    }
                }
            } else {
                for (var i of this.characters) {
                    i.draw(deltaTime);
                }
            }

            // Wanted poster
            this.wantedPoster.draw(game.solveTimer);
        }
    }

    // Get initial scaling factors
    let factors = getScaleFactors();

    // Main game object
    const game = {
        states: {
            focused: true,
            assetsLoadProgress: 0,
            loadBarFadeout: .75,
            loadScreenFinished: false,
            loadScreenPlayButtonClicked: false,
            titleScreen: false,
            tutorial: false,
            playing: false,
            currentLevel: {
                id: 1,
                characters: [],
                solved: false,
                ready: false,
                level: null
            }
        },
        assets: null,
        UI: {
            loadScreenArea: {
                width: 300 * factors.x,
                height: 300 * factors.y,
                x: Math.floor(canvas.getBoundingClientRect().width / 2 - ((300 / 2) * factors.x)),
                y: Math.floor(canvas.getBoundingClientRect().height / 2 - (350 * factors.y))
            },
            loadScreenPlayButton: {
                width: 100 * factors.x,
                height: 100 * factors.y,
                x: Math.floor(canvas.getBoundingClientRect().width / 2) - 50 * factors.x,
                y: Math.floor(canvas.getBoundingClientRect().height / 2) - 50 * factors.y,
                draw() {
                    this.width = 100 * factors.x;
                    this.height = 100 * factors.y;
                    this.x = Math.floor(canvas.getBoundingClientRect().width / 2) - 50 * factors.x;
                    this.y = Math.floor(canvas.getBoundingClientRect().height / 2) - 50 * factors.y;
                    ctx.beginPath();
                    ctx.fillStyle = 'black';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y)
                    ctx.strokeStyle = 'white';
                    ctx.fillStyle = 'white';
                    ctx.lineWidth = 4;
                    ctx.lineTo(this.x, this.y + this.height);
                    ctx.lineTo(this.x + this.width, this.y + (this.height / 2));
                    ctx.lineTo(this.x, this.y + 1);
                    ctx.fill();
                    ctx.stroke();

                    // Detect mouse
                    if (game.mouse.x >= this.x && game.mouse.x <= this.x + this.width && game.mouse.y >= this.y && game.mouse.y <= this.y + this.height) {
                        canvas.style.cursor = 'pointer';
                        game.handlers.mouseAction = () => {
                            game.handlers.mouseAction = () => { };
                            canvas.style.cursor = 'default';
                            game.states.loadScreenPlayButtonClicked = true;
                            game.assets.audio.title_screen.loop = true;
                            game.assets.audio.title_screen.play();
                            game.states.titleScreen = true;
                        };
                    } else {
                        canvas.style.cursor = 'default';
                        game.handlers.mouseAction = () => { };
                    }
                }
            },
            titleScreen: {
                x: 0,
                y: 0,
                width: canvas.width,
                height: canvas.height,
                draw() {
                    ctx.beginPath();
                    ctx.fillStyle = 'black';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    let poster = new WantedPoster(game.assets.images.HEAD_GUMBALL, (canvas.width / 2) - 125 * factors.x, 200 * factors.y);
                    poster.draw();
                    let playButton = new TextButton('PLAY', `bold ${40 * factors.x}px ariel`, 'white', 'green', 2, 'white', (canvas.width / 2) - 125 * factors.x, 550 * factors.y, 250, 70, 250 * factors.x, () => {
                        game.states.titleScreen = false;
                        if (!true) {
                            game.states.tutorial = true;
                        } else {
                            game.states.playing = true;
                            game.assets.audio.title_screen.pause();
                            game.assets.audio.gameplay.loop = true;
                            game.assets.audio.gameplay.play();
                        }
                    });
                    playButton.draw();
                    ctx.beginPath();
                    ctx.drawImage(game.assets.images.Tier3Games, 0, 0, game.assets.images.Tier3Games.width, game.assets.images.Tier3Games.height, canvas.width - (150 * factors.x), canvas.height - (150 * factors.y), 100 * factors.x, 100 * factors.y);
                }
            },
            playingScreen: {

            },
            drawLoadBar() {
                game.UI.loadScreenArea = {
                    width: 300 * factors.x,
                    height: 300 * factors.y,
                    x: Math.floor(canvas.getBoundingClientRect().width / 2 - ((300 / 2) * factors.x)),
                    y: Math.floor(canvas.getBoundingClientRect().height / 2 - (350 * factors.y))
                };

                // Black screen
                ctx.beginPath();
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Calculate load bar size
                let loadBarWidth = this.loadScreenArea.width + 340 * factors.x;
                let progress = (loadBarWidth / 100) * game.states.assetsLoadProgress;
                ctx.beginPath();
                ctx.fillStyle = `rgba(0,255,0,${(game.states.loadBarFadeout / .75)})`;
                ctx.fillRect(this.loadScreenArea.x - 170 * factors.x, this.loadScreenArea.y + 350 * factors.y, progress, 50 * factors.y);

                // Load bar background
                ctx.beginPath();
                ctx.lineWidth = 2 * factors.x;
                ctx.strokeStyle = `rgba(255,255,255,${(game.states.loadBarFadeout / .75)})`;
                ctx.moveTo(this.loadScreenArea.x - 170 * factors.x, this.loadScreenArea.y + 350 * factors.y);
                ctx.lineTo(this.loadScreenArea.x - 170 * factors.x, this.loadScreenArea.y + 400 * factors.y);
                ctx.lineTo(this.loadScreenArea.x + this.loadScreenArea.width + 170 * factors.x, this.loadScreenArea.y + 400 * factors.y);
                ctx.lineTo(this.loadScreenArea.x + this.loadScreenArea.width + 170 * factors.x, this.loadScreenArea.y + 350 * factors.y);
                ctx.lineTo(this.loadScreenArea.x - 170 * factors.x, this.loadScreenArea.y + 350 * factors.y);
                ctx.stroke();

                // "Loading..." text
                ctx.beginPath();
                ctx.font = `bold ${30 * factors.x}px arcade`;
                ctx.fillStyle = `rgba(255,255,255, ${(game.states.loadBarFadeout / .75) })`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('Loading...', this.loadScreenArea.x + (this.loadScreenArea.width / 2), this.loadScreenArea.y + 375 * factors.y, 120 * factors.x);
            }
        },
        mouse: {
            x: 0,
            y: 0
        },
        mouseHit: null,
        handlers: {
            mouseAction() {

            }
        },
        deltaTimeStamp: Date.now(),
        solveTimer: 30,
        penalty: 0
    };

    // Canvas events
    canvas.addEventListener('mousemove', (event) => {
        game.mouse.x = event.x - canvas.getBoundingClientRect().x;
        game.mouse.y = event.y - canvas.getBoundingClientRect().y;
    });
    canvas.addEventListener('click', (event) => {
        game.mouse.x = event.x - canvas.getBoundingClientRect().x;
        game.mouse.y = event.y - canvas.getBoundingClientRect().y;
        game.handlers.mouseAction();
        game.handlers.mouseAction = () => { };
        canvas.style.cursor = 'default';
    });

    // Window focus events
    window.addEventListener('focus', () => {
        game.deltaTimeStamp = Date.now();
        if (!game.assets) {
            game.states.focused = true;
            return;
        };
        for (var i in game.assets.audio) {
            game.assets.audio[i].volume = 1;
        }
        game.states.focused = true;

    });
    window.addEventListener('blur', () => {
        game.states.focused = false;
        if (!game.assets) {
            return;
        }
        for (var i in game.assets.audio) {
            game.assets.audio[i].volume = 0;
        }
    });

    // Animate load screen
    function animateLoadScreen(deltaTime) {
        game.UI.loadScreenArea = {
            width: 300 * factors.x,
            height: 300 * factors.y,
            x: Math.floor(canvas.getBoundingClientRect().width / 2 - ((300 / 2) * factors.x)),
            y: Math.floor(canvas.getBoundingClientRect().height / 2 - (350 * factors.y))
        };
        const { Tier3Games: developerImage } = game.assets.images;
        game.loadScreen = true;

        // Background
        ctx.beginPath();
        ctx.fillStyle = `rgba(0, 0, 0, ${1})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Create area for load screen
        let { loadScreenArea } = game.UI;

        // Animate text
        let textTransparency = .1;
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 0, 0, 0)`;
        ctx.fillRect(loadScreenArea.x, loadScreenArea.y, loadScreenArea.width, loadScreenArea.height);
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${loadScreenTextOpacity - loadScreenFadeout})`;
        ctx.font = `bold ${75 * factors.x}px arcade`;
        ctx.fillText('Created by', loadScreenArea.x, loadScreenArea.y + 75 * factors.y, 300 * factors.x);
        ctx.drawImage(developerImage, 0, 0, developerImage.width, developerImage.height, loadScreenArea.x + (loadScreenArea.width / 2) - 100 * factors.x, loadScreenArea.y + (loadScreenArea.height / 2) - 20 * factors.y, 200 * factors.x, 200 * factors.y);
        ctx.beginPath();
        ctx.fillStyle = `rgba(0, 0, 0, ${(1 - loadScreenImageOpacity) + loadScreenFadeout})`;
        ctx.fillRect(loadScreenArea.x + (loadScreenArea.width / 2) - 102 * factors.x, loadScreenArea.y + (loadScreenArea.height / 2) - 22 * factors.y, 205 * factors.x, 205 * factors.y);
        if (loadScreenTextOpacity <= 1) {
            loadScreenTextOpacity += (deltaTime / .67) / 1;
        } else if (loadScreenPauseDuration <= 1) {
            loadScreenPauseDuration += (deltaTime / 1) / 1;
        } else if (loadScreenImageOpacity <= 1) {
            loadScreenImageOpacity += (deltaTime / 1) / 1;
        } else if (loadScreenStandingDuration <= 1) {
            loadScreenStandingDuration += (deltaTime / 2) / 1;
        } else if (loadScreenFadeout <= 1) {
            loadScreenFadeout += (deltaTime / 1) / 1;
        } else {
            game.states.loadScreenFinished = true
        }
    }

    // Award time for solving
    function animateAwardTime(deltaTime) {
        let maxPoints = 5;
        let interval = 100;
        let nextIndex = awardTimeIndex + 1;
        if (awardTimeTimer <= maxPoints * interval) {
            awardTimeTimer += deltaTime * 1000;
            if (awardTimeTimer >= nextIndex * 100) {
                awardTimeIndex++;
                if (game.assets.audio.points.paused) {
                    game.assets.audio.points.play();
                }
                game.solveTimer += 1;
                game.solveTimer = Math.ceil(game.solveTimer);
                game.assets.audio.points.currentTime = 0;
            }
            return false;
        } else {
            game.assets.audio.points.loop = false;
            awardTimeTimer = 0;
            awardTimeIndex = 0;
            return true;
        }
    }

    // Load screen animation variables
    let loadScreenTextOpacity = 0;
    let loadScreenPauseDuration = 0;
    let loadScreenImageOpacity = 0;
    let loadScreenStandingDuration = 0;
    let loadScreenFadeout = 0;
    let solveTimeout = 1;
    let awardTimeTimer = 0;
    let awardTimeIndex = 0;

    // Level generator
    function generateLevel(index) {
        if (index >= 1 && index <= 5) {
            switch (index) {
                case 1: return (() => {
                    return new Level('GRID_2x2', 0, 0, {
                        movePatterns: [
                            {
                                run: 0,
                                rise: 0
                            },
                            {
                                run: 0,
                                rise: 0
                            },
                            {
                                run: 0,
                                rise: 0
                            }
                        ]
                    });
                })();
                break;
                case 2: return (() => {
                    return new Level('GRID_3x2', 0, 0, {
                        movePatterns: [
                            {
                                run: 0,
                                rise: 0
                            },
                            {
                                run: 0,
                                rise: 0
                            },
                            {
                                run: 0,
                                rise: 0
                            }
                        ]
                    });
                })();
                break;
                case 3: return (() => {
                    return new Level('GRID_3x3', 0, 0, {
                        movePatterns: [
                            {
                                run: 0,
                                rise: 0
                            },
                            {
                                run: 0,
                                rise: 0
                            },
                            {
                                run: 0,
                                rise: 0
                            }
                        ]
                    });
                })();
                break;
                case 4: return (() => {
                    return new Level('GRID_3x3', 0, 0, {
                        movePatterns: [
                            {
                                run: 2,
                                rise: 0
                            },
                            {
                                run: -2,
                                rise: 0
                            },
                            {
                                run: 2,
                                rise: 0
                            }
                        ]
                    });
                })();
                break;
                case 5: return (() => {
                    return new Level('GRID_3x3', 0, 0, {
                        movePatterns: [
                            {
                                run: -3,
                                rise: 0
                            },
                            {
                                run: 3,
                                rise: -0
                            },
                            {
                                run: -3,
                                rise: 0
                            }
                        ]
                    });
                })();
                break;
            }
        } else {
            return (() => {
                let lType = ['GRID', 'SCATTERED'][Math.floor(Math.random() * 2)];
                if (lType === 'GRID') {
                    let dX = 2 + Math.floor(Math.random() * 5);
                    let dY = 2 + Math.floor(Math.random() * 5);
                    let patterns = [];
                    let move = true; // Math.random() > .5;
                    if (move) {
                        for (var i = 0; i < dY; i++) {
                            patterns[i] = {
                                run: [-3, -2, -1, 1, 2, 3][Math.floor(Math.random() * 6)],
                                rise: [-3, -2, -1, 1, 2, 3][Math.floor(Math.random() * 6)],
                            }
                        }
                    }
                    return new Level(`${lType}_${dX}x${dY}`, 0, 0, {
                        movePatterns: patterns
                    });
                }
                if (lType === 'SCATTERED') {
                    return new Level(`${lType}_${3 + Math.floor(Math.random() * 38)}`);
                }
            })();
        }
    }

    // Main game loop. Runs on every frame.
    function mainLoop() {
        let deltaTime = (Date.now() - game.deltaTimeStamp) / 1000;
        game.deltaTimeStamp = Date.now();
        if (!game.states.focused) {
            requestAnimationFrame(mainLoop);
            return;
        }
        factors = getScaleFactors();

        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Resize the canvas
        resizeCanvas();

        // ---- [ALL DRAWN ELEMENTS MUST GO BELOW THIS LINE AS THE CANVAS HAS NOW BEEN CLEARED, SCALED, AND THE SCALE FACTORS ARE DEFINED] ----
        if (game.states.assetsLoadProgress < 100) {
            game.UI.drawLoadBar();
            requestAnimationFrame(mainLoop);
            return;
        } else if (!game.assets) {
            game.assets = assets;
            
        }

        if (game.states.loadBarFadeout > 0) {
            game.states.loadBarFadeout -= deltaTime;
            game.UI.drawLoadBar();
            requestAnimationFrame(mainLoop);
            return;
        }
        //context.scale(scaleX, scaleY); 
        if (!game.states.loadScreenFinished) {
            animateLoadScreen(deltaTime);
            requestAnimationFrame(mainLoop);
            return;
        }
        if (!game.states.loadScreenPlayButtonClicked) {
            game.UI.loadScreenPlayButton.draw();
            requestAnimationFrame(mainLoop);
            return;
        }
        if (game.states.titleScreen) {
            game.UI.titleScreen.draw();
            requestAnimationFrame(mainLoop);
            return;
        }
        if (game.states.tutorial) {

        }
        if (game.states.playing) {
            if (!game.states.currentLevel.ready) {

                // Build the level
                let level = generateLevel(game.states.currentLevel.id);
                level.build().draw(deltaTime);
                game.states.currentLevel.ready = true;
                game.states.currentLevel.level = level;
            } else {
                if (!game.states.currentLevel.solved) {
                    ctx.fillStyle = 'black';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    game.states.currentLevel.level.draw(deltaTime);
                    game.penalty = game.penalty > 0 ? game.penalty - 1 : 0;
                    if (game.solveTimer >= 0) {
                        let oldTime = Math.ceil(game.solveTimer);
                        game.solveTimer -= deltaTime;
                        if (oldTime > Math.ceil(game.solveTimer)) {
                            game.assets.audio.tick.play();
                        }
                    } else {
                        console.log('Time\'s up.');
                    }
                } else {
                    ctx.fillStyle = 'yellow';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    game.penalty = false;
                    game.states.currentLevel.level.draw(deltaTime);
                    game.states.currentLevel.level.wantedPoster.collapsible = false;
                    game.states.currentLevel.level.wantedPoster.collapsed = false;
                    if (solveTimeout <= 0) {
                        if (!animateAwardTime(deltaTime)) {
                            game.assets.audio.points.loop = true;
                        } else {
                            solveTimeout = 1;
                            game.states.currentLevel.id++;
                            let level = generateLevel(game.states.currentLevel.id);
                            level.build().draw();
                            game.states.currentLevel.solved = false;
                            game.states.currentLevel.level = level;
                            requestAnimationFrame(mainLoop);
                            return;
                        }
                    } else {
                        solveTimeout -= deltaTime;
                    }
                }
            }
        }
        requestAnimationFrame(mainLoop);
    }
    requestAnimationFrame(mainLoop);

    // Load assets
    await loadAssets();
})();