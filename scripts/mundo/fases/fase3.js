// Script da Fase 3
$(document).ready(function () {

    let player;
    let lastDirectionX = 1;
    let ammunition = 0;
    let onGround = false;
    let lives = parseInt(localStorage.getItem('lifes'));
    let initialLives = 3;
    let initialPoints = parseInt(localStorage.getItem('points1'));
    let points = initialPoints;
    let bonusScore = 0;
    let initialAmmunition = 0;
    let ammunitionIcon;
    let ammunitionText;
    let scoreText;
    let lifeText;
    let icon;
    let lifeIcon;
    let items = [];
    let platforms;
    let kStructs;
    let ground;
    let flag;
    let invincible = false;
    let bonusLifeCount = 0;
    let fakeWalls;
    let fakeWallLife = 3;
    let bees  = [];

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
        this.load.image('superCoin', '/kanyes-adventure/img/sprites/superCoin.png');
        this.load.image('icon', '/kanyes-adventure/img/icons/kanye_points.png');
        this.load.image('lifeIcon', '/kanyes-adventure/img/sprites/kanye_lifes.png');
        this.load.image('bandeira', '/kanyes-adventure/img/sprites/bandeira.png');
        this.load.image('pingpong', '/kanyes-adventure/img/sprites/ping_pong.png');
        this.load.image('microfone', '/kanyes-adventure/img/sprites/microfone.png');
        this.load.image('abelha', '/kanyes-adventure/img/sprites/bee.png');
    }

        let self = this;

        function isInvincible() {
            return invincible;
        }

        class Inimigo {
            constructor(x, y, raio, velocidade, escala) {
                this.x = x;
                this.y = y;
                this.raio = raio;
                this.velocidade = velocidade;
                this.escala = escala;
            }
        
            seguir(jogador) {  }
        }

        // Classe Abelha que herda da interface Inimigo
        class Abelha extends Inimigo {

            constructor(scene, x, y, raio, velocidade, escala, gameScene = this) {

                super(x, y, raio, velocidade, escala);
                this.scene = scene;
                this.sprite = scene.physics.add.sprite(x, y, 'abelha');
                this.sprite.setScale(escala);

                this.sprite.body.allowGravity = false;

                this.gameScene = gameScene;

                this.morrer = this.morrer.bind(this);

                scene.physics.add.collider(this.sprite, ground);
                scene.physics.add.collider(this.sprite, fakeWalls);
                scene.physics.add.collider(this.sprite, platforms);

                scene.physics.world.setBoundsCollision(true, true, true, true);


                // Habilita colisão entre a abelha e as plataformas, fakeWalls e bordas do mapa
                scene.physics.add.collider(this.sprite, ground);
                scene.physics.add.collider(this.sprite, fakeWalls);
                scene.physics.add.collider(this.sprite, platforms);
        
                scene.physics.world.setBoundsCollision(true, true, true, true);
        
                // Define a colisão entre a abelha e o jogador
                scene.physics.add.overlap(this.sprite, player, () => {
                    this.morrer();
                });

            }

            morrer() {
                if (!isInvincible()) {
                    if (lives == 1) {
                        player.setTint(0xff0000);
                        window.location.href = '../../../pages/fases/fase1.html';
                    } else {
                        localStorage.setItem('lifes', initialLives);
                        player.setTint(0xff0000);
                        window.location.reload();
                    }
                } else {
                    console.log('hoje não!');
                }
            }

            seguir(jogador) {
                const distanciaX = (jogador.x - this.sprite.x);
                const distanciaY = (jogador.y - this.sprite.y);
                const distancia = Math.sqrt((distanciaX * distanciaX) + (distanciaY * distanciaY));
        
                if (distancia < this.raio) {
                    const angle = Math.atan2(distanciaY, distanciaX);
                    const velocidadeX = (Math.cos(angle) * this.velocidade);
                    const velocidadeY = (Math.sin(angle) * this.velocidade);
        
                    this.sprite.setVelocity(velocidadeX, velocidadeY);
                }
            }
        }

        class Projetil {
            constructor(scene, x, y, texture, velocidade, tempoLancamento, origem, deslocamentoX, dano) {
                this.sprite = scene.physics.add.image(x, y, texture);
                this.sprite.setCollideWorldBounds(true);
                this.sprite.setDepth(1);
                this.sprite.setScale(0.3);
                this.scene = scene;
        
                // Configurações específicas do projétil
                this.velocidade = velocidade;
                this.tempoLancamento = tempoLancamento;
                this.origem = origem;
                this.deslocamentoX = deslocamentoX;
                this.dano = dano;
            }
        
            disparar() { }
        }

        class MicrofoneProjetil extends Projetil {
            constructor(scene, x, y, texture = 'microfone', deslocamentoX = 500) {
                super(scene, x, y, texture, 300, 1000, { x: x, y: y }, deslocamentoX, 3);
                this.sprite.body.allowGravity = false;
            }
        
            disparar() {
                if (ammunition > 0) {
                    this.sprite.setVelocityX(this.velocidade);
                    this.sprite.setVelocityY(0);
        
                    const initialX = this.sprite.x;
                    const finalX = initialX + this.deslocamentoX + this.sprite.width * 0.3; // Adiciona a largura do sprite ao deslocamentoX
        
                    this.scene.physics.add.collider(this.sprite, platforms, () => {
                        this.sprite.destroy();
                    });
        
                    const moveDuration = Math.abs(this.deslocamentoX / this.velocidade * 1000); // Duração do movimento do projétil
        
                    // Mover o projétil gradualmente até atingir a distância final
                    const moveTween = this.scene.tweens.add({
                        targets: this.sprite,
                        x: finalX,
                        duration: moveDuration,
                        ease: 'Linear',
                        onComplete: () => {
                            // Adiciona um temporizador somente quando o projétil atingir a posição final no eixo X
                            if (this.sprite.x === finalX) {
                                this.scene.time.addEvent({
                                    delay: 500, // meio segundo
                                    callback: () => {
                                        this.sprite.destroy();
                                    }
                                });
                            }
                        }
                    });
        
                    ammunition--;
                    ammunitionText.setText(`x ${ammunition}`);

                    this.scene.physics.add.collider(this.sprite, fakeWalls, (projetil, fakeWall) => {
                        // Reduz a vida da FakeWall em 3 unidades
                        fakeWallLife = Math.max(fakeWallLife - 3, 0);
            
                        // Verifica se a vida da FakeWall é menor que 3
                        if (fakeWallLife < 3) {
                            // Remove a FakeWall se a vida for menor que 3
                            this.sprite.destroy();
                            fakeWall.destroy();
                        }
                    });

                    bees.forEach(bee => {
                        this.scene.physics.add.collider(this.sprite, bee.sprite, (projetil, beeSprite) => {
                            console.log('Colisão entre projétil e abelha detectada!');
                            projetil.destroy();
                            beeSprite.destroy();
                            bees.splice(bees.indexOf(bee), 1);
                        });
                    });

                } else {
                    console.log('Sem munição!');
                }
            }
        }    

        // Classe base para os itens
        class Item {
            constructor(scene, x, y, depth = 0, texture) {
                this.sprite = scene.physics.add.image(x, y, texture);
                this.sprite.setCollideWorldBounds(true);
                this.sprite.setDepth(depth);
            }
    
            coletar() {
                this.sprite.destroy();
            }
        }
    
        // Classe para o item moeda
        class Moeda extends Item {
            constructor(scene, x, y, scale = 0.3, depth = 0, texture = 'coin') {
                super(scene, x, y, depth, texture);
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
                bonusScore++;
                points++;
                localStorage.setItem('points2', points);
                scoreText.setText(`x ${points}`);
            }
        }

        // Classe para a Super Moeda (que soma 5 na pontuação)
        class SuperMoeda extends Item {
            constructor(scene, x, y, scale = 0.3, depth = 0, texture = 'superCoin') {
                super(scene, x, y, depth, texture);
                this.sprite.setScale(scale);
                this.sprite.setName('superMoeda'); // Nome diferente para identificação
                
                this.sprite.body.allowGravity = false;
                this.sprite.setImmovable(true);

                scene.physics.add.collider(this.sprite, platforms);
                scene.physics.add.collider(this.sprite, ground);

                // Verificação da coleta da super moeda
                scene.physics.add.overlap(player, this.sprite, () => {
                    const playerBounds = player.getBounds();
                    const superMoedaBounds = this.sprite.getBounds();

                    if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, superMoedaBounds)) {
                        if (scene.input.keyboard.checkDown(scene.input.keyboard.addKey('F'), 250)) {
                            this.coletar();
                        }
                    }
                }, null, scene);
            }

            coletar() {
                super.coletar();
                bonusScore+=5;
                points += 5; // Soma 5 na pontuação ao coletar a super moeda
                localStorage.setItem('points2', points);
                scoreText.setText(`x ${points}`);
            }
        }

        class pingPong extends Item {
            constructor(scene, x, y, scale = 0.4, depth, texture = 'pingpong') {
                super(scene, x, y, depth, texture);
                this.sprite.setScale(scale).setName("pingpong");

                this.sprite.body.allowGravity = false;
                this.sprite.setImmovable(true);

                scene.physics.add.collider(this.sprite, platforms);
                scene.physics.add.collider(this.sprite, ground);

                scene.physics.add.overlap(player, this.sprite, () => {
                    const playerBounds = player.getBounds();
                    const pingPongBounds = this.sprite.getBounds();

                    if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, pingPongBounds)) {
                        if (scene.input.keyboard.checkDown(scene.input.keyboard.addKey('F'), 250)) {
                            this.coletar();
                        }
                    }
                }, null, scene);

            }

            coletar() {
                super.coletar();
                bonusLifeCount++;
                lives += 1; // Soma 1 na quantidade de vidas do personagem
                localStorage.setItem('lifes', lives);
                lifeText.setText(`x ${lives}`);
            }

        }

        // Classe para representar o item "microfone" a ser coletado
        class MicrofoneItem extends Item {
            constructor(scene, x, y, scale = 0.4, depth, texture = 'microfone') {
                super(scene, x, y, depth, texture);
                this.sprite.setScale(scale).setName("microfoneItem");

                this.sprite.body.allowGravity = false;
                this.sprite.setImmovable(true);

                scene.physics.add.collider(this.sprite, platforms);
                scene.physics.add.collider(this.sprite, ground);

                scene.physics.add.overlap(player, this.sprite, () => {
                    const playerBounds = player.getBounds();
                    const pingPongBounds = this.sprite.getBounds();

                    if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, pingPongBounds)) {
                        if (scene.input.keyboard.checkDown(scene.input.keyboard.addKey('F'), 250)) {
                            this.coletar();
                        }
                    }
                }, null, scene);

            }

            coletar() {
                super.coletar();
                ammunition++;
                ammunitionText.setText(`x ${ammunition}`);
            }

        }

    function create() {

        points = initialPoints;

        // Cheats
        window.giveLifes = function(n) {
            lives += n;
            localStorage.setItem('lifes', lives);
            window.location.reload();
        };

        window.givePoints = function(n) {
            points += n;
            localStorage.setItem('points2', points);
            scoreText.setText(`x ${points}`);
        };

        window.goToNextLevel = function() {
            window.location.href = '../../../pages/fases/fase3.html';
        };

        window.Invincible = function () {
            invincible = true;
            console.log('Kanye está invencível por 5 minutos!');
            setTimeout(() => {
                invincible = false;
                console.log('Invencibilidade acabou!');
            }, 5 * 60 * 1000);
        }

        window.tp = function (x, y) {
            player.setX(x);
            player.setY(y);
        };

        window.giveAmmo = function(n) {
            ammunition += n;
            ammunitionText.setText(`x ${ammunition}`)
        };

        // -------------

        function morrer(scene) {

            if (!isInvincible()) {
                if (lives < 2) {
                    player.setTint(0xff0000);
                    window.location.href = '../../../pages/fases/fase1.html';
                } else {
                    ammunition = initialAmmunition;
                    points = initialPoints;
                    lives -= 1;
                    localStorage.setItem('lifes', lives);
                    player.setTint(0xff0000);
                    scene.restart();
                }
            } else {
                console.log('hoje não!');
            }
            
        }

        platforms = this.physics.add.staticGroup();
        kStructs = this.physics.add.staticGroup();
        fakeWalls = this.physics.add.staticGroup();

        this.physics.world.setBounds(1, 0, 2998, 600);

        player = this.physics.add.sprite(100, 500, 'kanye'); // 100
        player.setCollideWorldBounds(true);
        player.setDepth(1);
        player.setScale(0.25);

        ground = this.add.rectangle(1400, 600, 3200, 80, 0x8B4513);
        this.physics.add.existing(ground, true);

        this.physics.add.collider(player, kStructs, function(player, wall) {
            morrer(this.scene);
        }, null, this);

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
        lifeText.setX(lifeIcon.x + (lifeIcon.displayWidth - 10));

        ammunitionIcon = this.add.image(20, 180, 'microfone');
        ammunitionIcon.setScale(0.4);
        ammunitionIcon.setOrigin(0);
        ammunitionIcon.setScrollFactor(0);

        ammunitionText = this.add.text(80, 40, `x ${ammunition}`, { fontSize: '24px', fill: '#fff' })
        ammunitionText.setOrigin(0);
        ammunitionText.setScrollFactor(0);
        ammunitionText.setY(ammunitionIcon.y + 30);
        ammunitionText.setX(ammunitionIcon.x + (ammunitionIcon.displayWidth + 10));

        bees.push(new Abelha(this, 500, 300, 200, 150, 0.2, this));

        const  Imic1 = new MicrofoneItem(this, 300, 527, 0.4, 0);

        const plat1 = this.add.rectangle(1000, 460, 20, 200, 0x008000);
        platforms.add(plat1);
        plat1.setName('plat1');

        const kWall1 = this.add.rectangle(1030, 370, 40, 20, 0xbf4945);
        kStructs.add(kWall1);
        kWall1.setName('kWall1'); 

        const plat2 = this.add.rectangle(1190, 370, 100, 20, 0x008000);
        platforms.add(plat2);
        plat2.setName('plat2');

        const plat3 = this.add.rectangle(1150, 280, 20, 200, 0x008000);
        platforms.add(plat3);
        plat3.setName('plat3');

        const Mic2 = new MicrofoneItem(this, 1200, 328, 0.4, 0);

        const kWall2 = this.add.rectangle(1380, 470, 40, 180, 0xbf4945);
        kStructs.add(kWall2);
        kWall2.setName('kWall2');

        const plat4 = this.add.rectangle(1380, 370, 40, 20, 0x008000);
        platforms.add(plat4);
        plat4.setName('plat4'); 

        bees.push(new Abelha(this, 1560, 220, 200, 150, 0.2, this));

        const fakeWall1 = this.add.rectangle(1700, 410, 100, 300, 0xde2035);
        fakeWalls.add(fakeWall1);
        fakeWall1.setName('fakeWall1');

        const Mic3 = new MicrofoneItem(this, 1560, 530, 0.4, 0);

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

        // Criação da bandeira
        flag = this.physics.add.sprite(2000, 400, 'bandeira'); // Ajuste a posição e a imagem da bandeira conforme necessário
        flag.setCollideWorldBounds(true);
        flag.setScale(0.4); // Ajuste a escala conforme necessário

        // Habilita a interação com a bandeira
        flag.setInteractive();

        // Define o detector de colisão entre o jogador e a bandeira
        this.physics.add.collider(player, flag, function() {
            // Redireciona para a próxima fase
            window.location.href = '/kanyes-adventure/pages/final.html'; // Substitua pela URL desejada
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
                    lastDirectionX = -1;
                    break;
                case 'KeyS':
                    player.setVelocityY(200);
                    break;
                case 'KeyD':
                    player.setVelocityX(200);
                    lastDirectionX = 1;
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
            ammunition = initialAmmunition;
            points = initialPoints;
            lives = initialLives;
        
            // Destruir todas as abelhas no array bees
            bees.forEach(function (bee) {
                bee.sprite.destroy(); // Certifique-se de usar bee.sprite ou a propriedade correta que representa o sprite da abelha
            });
            
            // Limpar o array bees
            bees = [];
        
            this.scene.restart();
        }, this);

        this.cameras.main.setBounds(0, 0, 3000, 600);
        this.cameras.main.startFollow(player, true, 0.1, 0);
    }

    function update() {
        if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('E')) && ammunition > 0) {
            // Criar um novo projétil e disparar se tiver munição
            const novoProjetil = new MicrofoneProjetil(this, player.x, player.y);
    
            // Define a direção X do projétil com base na última direção do personagem
            if (lastDirectionX !== 0) {
                novoProjetil.deslocamentoX = novoProjetil.deslocamentoX * lastDirectionX; // Usa a direção X para determinar o deslocamento
            }
    
            novoProjetil.disparar();
        }

        bees.forEach(function (abelha) {
            abelha.seguir(player);
        });

    }
    
});
