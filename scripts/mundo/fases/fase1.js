// Script da Fase 1
$(document).ready(function () {

    let player;
    let onGround = false;
    let points = 0;
    let lives = 3;
    let scoreText;
    let lifeText;
    let icon;
    let lifeIcon;
    let items = [];
    let platforms;
    let ground;
    let bandeira;

    localStorage.setItem('points1', points);

    const gameConfig = {
        type: Phaser.AUTO,
        scale: {
            mode: Phaser.Scale.RESIZE,
            parent: 'game-container',
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 3000,
            height: 600
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 400 },
                debug: false
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    const game = new Phaser.Game(gameConfig);

    function preload() {
        this.load.image('kanye', '/kanyes-adventure/img/sprites/kanye_west.png');
        this.load.image('coin', '/kanyes-adventure/img/sprites/coin.png');
        this.load.image('icon', '/kanyes-adventure/img/icons/kanye_points.png');
        this.load.image('lifeIcon', '/kanyes-adventure/img/sprites/kanye_lifes.png');
        this.load.image('bandeira', '/kanyes-adventure/img/sprites/bandeira.png');
    }

        // Classe base para os itens
        class Item {
            constructor(scene, x, y, texture) {
                this.sprite = scene.physics.add.image(x, y, texture);
                this.sprite.setCollideWorldBounds(true);
            }
    
            coletar() {
                this.sprite.destroy();
            }
        }
    
        // Classe para o item moeda
        class Moeda extends Item {
            constructor(scene, x, y, scale = 0.3, texture = 'coin') {
                super(scene, x, y, texture);
                this.sprite.setScale(scale);
                this.sprite.setName('moeda');

                this.sprite.body.allowGravity = false;
                this.sprite.setImmovable(true);

                scene.physics.add.collider(this.sprite, platforms);
                scene.physics.add.collider(this.sprite, ground);

                // Verificação da coleta da moeda
                scene.physics.add.overlap(player, this.sprite, () => {
                    const playerBounds = player.getBounds();
                    const moedaBounds = this.sprite.getBounds();

                    if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, moedaBounds)) {
                        if (scene.input.keyboard.checkDown(scene.input.keyboard.addKey('F'), 250)) {
                            this.coletar();
                        }
                    }
                }, null, scene);
            }

            coletar() {
                super.coletar();
                points++;
                localStorage.setItem('points1', points);
                scoreText.setText(`x ${points}`);
            }
        }

    function create() {
        this.physics.world.setBounds(1, 0, 2998, 600);

        localStorage.setItem('lifes', lives)

        player = this.physics.add.sprite(100, 500, 'kanye'); // 100
        player.setCollideWorldBounds(true);
        player.setScale(0.25);

        const ground = this.add.rectangle(1500, 600, 3000, 80, 0x8B4513);
        this.physics.add.existing(ground, true);

        const platforms = this.physics.add.staticGroup();

        const plat1 = this.add.rectangle(400, 510, 200, 20, 0x008000);
        platforms.add(plat1);
        plat1.setName('plat1');

        const plat2 = this.add.rectangle(640, 450, 200, 20, 0x008000);
        platforms.add(plat2);
        plat2.setName('plat2');

        const plat3 = this.add.rectangle(940, 500, 200, 20, 0x008000);
        platforms.add(plat3);
        plat3.setName('plat3');

        const plat4 = this.add.rectangle(1240, 430, 200, 20, 0x008000);
        platforms.add(plat4);
        plat4.setName('plat4');

        icon = this.add.image(20, 20, 'icon');
        icon.setScale(0.5);
        icon.setOrigin(0);
        icon.setScrollFactor(0);

        scoreText = this.add.text(80, 40, `x ${points}`, { fontSize: '24px', fill: '#fff' });
        scoreText.setOrigin(0);
        scoreText.setX(icon.x + icon.displayWidth + 10);
        scoreText.setScrollFactor(0);

        lifeIcon = this.add.image(5, 100, 'lifeIcon');
        lifeIcon.setScale(0.5);
        lifeIcon.setOrigin(0);
        lifeIcon.setScrollFactor(0);

        lifeText = this.add.text(80, 40, `x ${lives}`, { fontSize: '24px', fill: '#fff' });
        lifeText.setOrigin(0);
        lifeText.setScrollFactor(0);
        lifeText.setY(lifeIcon.y + 40);
        lifeText.setX(lifeIcon.x + lifeIcon.displayWidth - 10);

        const moeda1 = new Moeda(this, 640, 395, 0.4); // cena, x, y, escala | > módulo (y) < altura

        const moeda2 = new Moeda(this, 1250, 376, 0.4); // cena, x, y, escala | > módulo (y) < altura

        this.physics.add.collider(player, platforms, function (player, platform) {
            const playerBounds = player.getBounds();
            const platformBounds = platform.getBounds();
        
            const playerBottomY = playerBounds.bottom;
            const platformTopY = platformBounds.top;
        
            if (playerBottomY <= platformTopY) {
                onGround = true;
            }
            else {
                onGround = true; // true: com escalada | false: sem escalada
            }
        });

        const wall1 = this.add.rectangle(1650, 440, 20, 240, 0x008000);
        platforms.add(wall1);
        wall1.setName('wall1');

        const plat5 = this.add.rectangle(1800, 330, 280, 20, 0x008000);
        platforms.add(plat5);
        plat5.setName('plat5');

        const moeda3 = new Moeda(this, 1790, 515, 0.4); // cena, x, y, escala | > módulo (y) < altura

        const wall2 = this.add.rectangle(2200, 420, 20, 280, 0x008000);
        platforms.add(wall2);
        wall2.setName('wall2');

        const plat6 = this.add.rectangle(2310, 290, 200, 20, 0x008000);
        platforms.add(plat6);
        plat6.setName('plat6');

        const wall3 = this.add.rectangle(2400, 225, 20, 150, 0x008000);
        platforms.add(wall3);
        wall3.setName('wall3');

        const plat7 = this.add.rectangle(2470, 160, 160, 20, 0x008000);
        platforms.add(plat7);
        plat7.setName('plat7');


        // Criação da bandeira
        bandeira = this.physics.add.image(3000, 400, 'bandeira'); // Ajuste a posição e a imagem da bandeira conforme necessário
        bandeira.setCollideWorldBounds(true);
        bandeira.setScale(0.4); // Ajuste a escala conforme necessário

        // Habilita a interação com a bandeira
        bandeira.setInteractive();

        // Define o detector de colisão entre o jogador e a bandeira
        this.physics.add.collider(player, bandeira, function() {
            // Redireciona para a próxima fase
            window.location.href = '/kanyes-adventure/pages/fases/fase2.html'; // Substitua pela URL desejada
        }, null, this);


        this.physics.add.collider(player, ground, function () {
            onGround = true;
        });

        this.input.keyboard.on('keydown', function (event) {
            switch (event.code) {
                case 'KeyW':
                    if (onGround) {
                        player.setVelocityY(-250);
                        onGround = false;
                    }
                    break;
                case 'KeyA':
                    player.setVelocityX(-200);
                    break;
                case 'KeyS':
                    player.setVelocityY(200);
                    break;
                case 'KeyD':
                    player.setVelocityX(200);
                    break;
            }
        });

        this.input.keyboard.on('keyup', function (event) {
            switch (event.code) {
                case 'KeyW':
                case 'KeyS':
                    player.setVelocityY(0);
                    break;
                case 'KeyA':
                case 'KeyD':
                    player.setVelocityX(0);
                    break;
            }
        });

        this.input.keyboard.on('keydown-R', function () {
            window.location.reload();
        }, this);

        this.cameras.main.setBounds(0, 0, 3000, 600);
        this.cameras.main.startFollow(player, true, 0.1, 0);
    }

    function update() {
        // Função update vazia para evitar erros
    }
});
