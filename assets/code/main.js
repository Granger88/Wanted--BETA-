(async () => {
    // Standard game height
    const gameWidth = 1920;
    const gameHeight = 1080;

    /**
     * @type {HTMLCanvasElement} canvas Main playable area
    **/
    const canvas = document.getElementById('game');

    // Scale factors to adjust the size of different game elements
    function getScaleFactors() {
        let x = canvas.width / gameWidth;
        let y = canvas.height / gameHeight;
        return {
            x,
            y
        }
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
                game.states.assetsLoadProgress += (1 / loadSize ) * 100;
            } catch (e) {
                console.error(e);
            }
        }

        for (var i of assetNames.audio) {
            try {
                let audio = await loadAudio(`assets/audio/${i}`);
                assets.audio[i.split('.').reverse().slice(1).reverse().join('.')] = audio;
                game.states.assetsLoadProgress += (1 / loadSize ) * 100;
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
                        console.log(game.mouse);
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
                        console.log(game.mouse);
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
        }
        calculateRespawnPoint() {
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
        }
        draw() {
            ctx.beginPath();
            ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height, this.x, this.y, (this.image.width * factors.x) / 4, (this.image.height * factors.y) / 4);
            if (!game.states.currentLevel.solved) {
                this.x += this.run * factors.x;
                this.y += this.rise * factors.y;
                if (Math.abs(this.oscillationState.x.current) >= this.oscillateDistanceX) {
                    this.oscillationState.x.multiplier = -this.oscillationState.x.multiplier
                }
                this.oscillationState.x.current += this.oscillateSpeedX * this.oscillationState.x.multiplier;
                if (Math.abs(this.oscillationState.y.current) >= this.oscillateDistanceY) {
                    this.oscillationState.y.multiplier = -this.oscillationState.y.multiplier
                }
                this.oscillationState.y.current += this.oscillateSpeedY * this.oscillationState.y.multiplier;
                this.x += this.run + this.oscillationState.x.current;
                this.y += this.rise + this.oscillationState.y.current;
                if ((this.x >= canvas.width || this.x <= -this.image.width / 4) || (this.y >= canvas.height || this.y <= -this.image.height / 4)) {
                    this.x = this.respawnPoint.x;
                    this.y = this.respawnPoint.y;
                }
            } else {
                console.log('Solved level, stopping movement.');
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
         * @param {"GRID_*" | "ORGANIZED" | "ORGANIZED_MOVING" | "SCATTERED" | "SCATTERED_MOVING"} style
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
            if (this.style.indexOf('GRID') > -1) {
                // Calculate space needed
                this.dimensions = this.style.split('_')[1].split('x');
                this.gridDimensions = {
                    x: this.dimensions[0] * (this.imageArea.width / (2 * 1)) * factors.x,
                    y: this.dimensions[1] * ((this.imageArea.height) / (2 * 1)) * factors.y
                };
                this.x = (canvas.width / 2 - this.gridDimensions.x + this.offsetX);
                this.y = (canvas.height / 2 - this.gridDimensions.y + this.offsetY);
            }
            let wantedCharacterId = Math.floor(Math.random() * 5) + 1;
            let characterArray = [];
            let maxItems = Number(this.dimensions[0]);
            for (var i = 0; i < this.dimensions[1]; i++) {
                characterArray.push([]);
            }
            let wantedCharacterPosition = Math.floor(Math.random() * maxItems * this.dimensions[1]);
            let characterIds = [1, 2, 3, 4, 5];
            characterIds = characterIds.filter((i) => i !== wantedCharacterId);
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
            //this.wanted = wantedCharacterId;
            this.characters = characterArray;
            // Organize
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
            this.wantedPoster = new WantedPoster(this.wanted.image, 0, 0, true);
            return this;
        }
        draw() {
            if (game.states.currentLevel.solved) {
                this.wantedPoster.draw(game.solveTimer);
                this.wanted.draw();
                return;
            }
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
                    j.draw();
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
                            game.states.titleScreen = true
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
                ctx.fillStyle = 'green';
                ctx.fillRect(this.loadScreenArea.x - 170 * factors.x, this.loadScreenArea.y + 350 * factors.y, progress, 50 * factors.y);

                // Load bar background
                ctx.beginPath();
                ctx.lineWidth = 2 * factors.x;
                ctx.strokeStyle = 'white';
                ctx.moveTo(this.loadScreenArea.x - 170 * factors.x, this.loadScreenArea.y + 350 * factors.y);
                ctx.lineTo(this.loadScreenArea.x - 170 * factors.x, this.loadScreenArea.y + 400 * factors.y);
                ctx.lineTo(this.loadScreenArea.x + this.loadScreenArea.width + 170 * factors.x, this.loadScreenArea.y + 400 * factors.y);
                ctx.lineTo(this.loadScreenArea.x + this.loadScreenArea.width + 170 * factors.x, this.loadScreenArea.y + 350 * factors.y);
                ctx.lineTo(this.loadScreenArea.x - 170 * factors.x, this.loadScreenArea.y + 350 * factors.y);
                ctx.stroke();

                // "Loading..." text
                ctx.beginPath();
                ctx.font = `bold ${30 * factors.x}px arcade`;
                ctx.fillStyle = 'white';
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
    canvas.addEventListener('click', () => {
        game.handlers.mouseAction();
        game.handlers.mouseAction = () => { };
        canvas.style.cursor = 'default';
    });

    // Window focus events
    window.addEventListener('focus', () => {
        game.deltaTimeStamp = Date.now();
        for (var i in game.assets.audio) {
            game.assets.audio[i].volume = 1;
        }
        game.states.focused = true;

    });
    window.addEventListener('blur', () => {
        game.states.focused = false;
        for (var i in game.assets.audio) {
            game.assets.audio[i].volume = 0;
        }
    });

    // Animate load screen
    function animateLoadScreen() {
        game.UI.loadScreenArea = {
            width: 300 * factors.x,
            height: 300 * factors.y,
            x: Math.floor(canvas.getBoundingClientRect().width / 2 - ((300 / 2) * factors.x)),
            y: Math.floor(canvas.getBoundingClientRect().height / 2 - (350 * factors.y))
        };
        const { Tier3Games:developerImage } = game.assets.images;
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
        ctx.fillRect(loadScreenArea.x + (loadScreenArea.width / 2) - 100 * factors.x, loadScreenArea.y + (loadScreenArea.height / 2) - 20 * factors.y, 200 * factors.x, 200 * factors.y);
        if (loadScreenTextOpacity <= 1) {
            loadScreenTextOpacity += 1 / 40;
        } else if (loadScreenPauseDuration <= 1) {
            loadScreenPauseDuration += 1 / 60;
        } else if (loadScreenImageOpacity <= 1) {
            loadScreenImageOpacity += 1 / 60
        } else if (loadScreenStandingDuration <= 1) {
            loadScreenStandingDuration += 1 / 120
        } else if (loadScreenFadeout <= 1) {
            loadScreenFadeout += 1 / 60;
        } else {
            game.states.loadScreenFinished = true
        }
    }

    // Award time for solving
    function animateAwardTime() {
        let frameInterval = 6;
        let maxPoints = 5;
        if (awardTimeTimer < frameInterval * maxPoints) {
            if (awardTimeTimer % frameInterval === 0) {
                if (game.assets.audio.points.paused) {
                    game.assets.audio.points.play();
                }
                game.solveTimer += 1;
                game.solveTimer = Math.ceil(game.solveTimer);
                game.assets.audio.points.currentTime = 0;
            }
            awardTimeTimer += 1;
            return false;
        } else {
            game.assets.audio.points.loop = false;
            awardTimeTimer = 0;
            return true;
        }
    }

    // Load screen animation variables
    let loadScreenTextOpacity = 0;
    let loadScreenPauseDuration = 0;
    let loadScreenImageOpacity = 0;
    let loadScreenStandingDuration = 0;
    let loadScreenFadeout = 0;
    let solveTimeout = 60;
    let awardTimeTimer = 0;

    // Main game loop. Runs on every frame.
    function mainLoop() {
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
        //context.scale(scaleX, scaleY); 
        let deltaTime = Date.now() - game.deltaTimeStamp;
        game.deltaTimeStamp = Date.now();

        if (!game.states.loadScreenFinished) {
            animateLoadScreen();
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
                let level = new Level('GRID_2x2', 0, 0, {
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
                level.build().draw();
                game.states.currentLevel.ready = true;
                game.states.currentLevel.level = level;
            } else {
                if (!game.states.currentLevel.solved) {
                    ctx.fillStyle = 'black';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    game.states.currentLevel.level.draw();
                    game.penalty = game.penalty > 0 ? game.penalty - 1 : 0;
                    if (game.solveTimer >= 0) {
                        let oldTime = Math.ceil(game.solveTimer);
                        game.solveTimer -= deltaTime / 1000;
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
                    game.states.currentLevel.level.draw();
                    game.states.currentLevel.level.wantedPoster.collapsible = false;
                    game.states.currentLevel.level.wantedPoster.collapsed = false;
                    if (solveTimeout <= 0) {
                        if (!animateAwardTime()) {
                            console.log('Apply stats.');
                            game.assets.audio.points.loop = true;
                        } else {
                            solveTimeout = 60;
                            let level = new Level("GRID_3x3", 0, 0, {
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
                            level.build().draw();
                            game.states.currentLevel.solved = false;
                            game.states.currentLevel.level = level;
                            requestAnimationFrame(mainLoop);
                            return;
                        }
                    } else {
                        solveTimeout -= 1;
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