document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname.split('/').pop();

    // ========== INDEX ==========
    if (path === 'index.html' || path === '') {
        const btnIniciar = document.getElementById('iniciar-partida');
        const btnRegras = document.getElementById('regras');
        const modal = document.getElementById('modal-regras');
        const btnFechar = document.getElementById('btn-fechar');
        const fecharModal = document.getElementById('fechar-modal');

        btnIniciar?.addEventListener('click', () => {
            window.location.href = 'pagina2.html';
        });

        const abrirModal = () => modal?.classList.add('active');
        const fecharModalFn = () => modal?.classList.remove('active');

        btnRegras?.addEventListener('click', abrirModal);
        btnFechar?.addEventListener('click', fecharModalFn);
        fecharModal?.addEventListener('click', fecharModalFn);

        const starsContainer = document.getElementById('stars');
        if (starsContainer) {
            for (let i = 0; i < 80; i++) {
                const star = document.createElement('div');
                const size = Math.random() * 2 + 1;
                star.style.position = 'absolute';
                star.style.width = size + 'px';
                star.style.height = size + 'px';
                star.style.background = '#fff';
                star.style.borderRadius = '50%';
                star.style.left = Math.random() * 100 + '%';
                star.style.top = Math.random() * 100 + '%';
                star.style.opacity = Math.random() * 0.7 + 0.3;
                star.style.boxShadow = `0 0 ${size * 2}px rgba(255,255,255,0.5)`;
                starsContainer.appendChild(star);
            }
        }
    }

    // ========== PÁGINA 2: JOGO ==========
    if (path === 'pagina2.html') {
        const TIPOS = ['pedra', 'papel', 'tesoura', 'lagarto', 'spock'];
        const REGRAS = {
            pedra: ['tesoura', 'lagarto'],
            papel: ['pedra', 'spock'],
            tesoura: ['papel', 'lagarto'],
            lagarto: ['spock', 'papel'],
            spock: ['tesoura', 'pedra']
        };

        let deck = [];
        let playerHand = [];
        let aiHand = [];
        let discardPile = [];
        let currentCard = null;
        let cartaIATurno = null;
        let playerTurn = false;
        let gameEnded = false;
        let distribuindo = true;

        let playerScore = 0;
        let aiScore = 0;

        const playerHandEl = document.getElementById('player-hand');
        const aiHandEl = document.getElementById('opponent-hand');
        const drawPileEl = document.getElementById('draw-pile');
        const discardImgEl = document.getElementById('discard-img');
        const discardCountEl = document.getElementById('discard-count');
        const drawTextEl = document.getElementById('draw-text');
        const playerScoreEl = document.getElementById('player-score');
        const aiScoreEl = document.getElementById('ai-score');

        // DEBUG DISCRETO NO CANTO
        const debugEl = document.createElement('div');
        debugEl.style.cssText = `
            position: fixed;
            bottom: 1rem;
            right: 1rem;
            background: rgba(0,0,0,0.6);
            color: rgba(255,255,255,0.5);
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.7rem;
            z-index: 9999;
            text-align: right;
            pointer-events: none;
            max-width: 200px;
        `;
        document.body.appendChild(debugEl);

        function atualizarPlacar() {
            playerScoreEl.textContent = playerScore;
            aiScoreEl.textContent = aiScore;
        }

        function atualizarDebug(player, ia, resultado) {
            let texto = `IA:${ia} | VC:${player} | `;
            if (resultado === 'player') texto += `+1VC ${playerScore}-${aiScore}`;
            else if (resultado === 'ia') texto += `+1IA ${playerScore}-${aiScore}`;
            else texto += `= ${playerScore}-${aiScore}`;
            debugEl.textContent = texto;
        }

        function criarDeck() {
            deck = [];
            TIPOS.forEach(tipo => {
                for (let i = 0; i < 4; i++) {
                    deck.push(tipo);
                }
            });
            embaralhar(deck);
        }

        function embaralhar(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        function criarCartaImg(tipo, virada = true) {
            const img = document.createElement('img');
            img.src = virada? 'assets/verso.png' : `assets/${tipo}.png`;
            img.alt = tipo;
            img.dataset.tipo = tipo;
            return img;
        }

        function animarCarta(deEl, paraEl, callback, virarDepois = false, tipo = null) {
            const carta = document.createElement('div');
            carta.style.position = 'fixed';
            carta.style.zIndex = '1000';
            carta.style.width = '110px';
            carta.style.height = '160px';
            carta.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            carta.style.pointerEvents = 'none';

            const img = criarCartaImg('verso', true);
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.borderRadius = '0.75rem';
            img.style.border = '2px solid rgba(230, 87, 187, 0.3)';
            img.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.4)';
            carta.appendChild(img);

            const deRect = deEl.getBoundingClientRect();
            const paraRect = paraEl.getBoundingClientRect();

            carta.style.left = deRect.left + deRect.width / 2 - 55 + 'px';
            carta.style.top = deRect.top + deRect.height / 2 - 80 + 'px';

            document.body.appendChild(carta);

            requestAnimationFrame(() => {
                carta.style.left = paraRect.left + paraRect.width / 2 - 55 + 'px';
                carta.style.top = paraRect.top + paraRect.height / 2 - 80 + 'px';
            });

            if (virarDepois && tipo) {
                setTimeout(() => {
                    carta.style.transition = 'transform 0.3s';
                    carta.style.transform = 'rotateY(90deg)';
                    setTimeout(() => {
                        img.src = `assets/${tipo}.png`;
                        img.alt = tipo;
                        img.dataset.tipo = tipo;
                        carta.style.transform = 'rotateY(0deg)';
                        setTimeout(() => {
                            carta.remove();
                            if (callback) callback();
                        }, 300);
                    }, 150);
                }, 300);
            } else {
                setTimeout(() => {
                    carta.remove();
                    if (callback) callback();
                }, 600);
            }
        }

        function verificarVencedor(cartaPlayer, cartaIA) {
            if (cartaPlayer === cartaIA) return 'empate';
            if (REGRAS[cartaPlayer].includes(cartaIA)) return 'player';
            return 'ia';
        }

        function atualizarMaoPlayer() {
            playerHandEl.innerHTML = '';
            playerHand.forEach((tipo, i) => {
                const btn = document.createElement('button');
                btn.className = 'fan-card';
                btn.dataset.card = tipo;

                const img = criarCartaImg(tipo, false);
                btn.appendChild(img);

                if (playerTurn &&!distribuindo &&!gameEnded) {
                    btn.addEventListener('click', () => jogarCarta(i));
                } else {
                    btn.classList.add('disabled');
                }

                playerHandEl.appendChild(btn);
            });
        }

        function atualizarMaoIA() {
            aiHandEl.innerHTML = '';
            aiHand.forEach(() => {
                const div = document.createElement('div');
                div.className = 'card-back';
                const img = criarCartaImg('verso', true);
                div.appendChild(img);
                aiHandEl.appendChild(div);
            });
        }

        function atualizarMesa() {
            if (currentCard) {
                discardImgEl.src = `assets/${currentCard}.png`;
                discardImgEl.alt = currentCard;
            }
            discardCountEl.textContent = discardPile.length;
            drawTextEl.textContent = `DRAW (${deck.length})`;
        }

        function distribuirCartas() {
            criarDeck();
            playerHand = [];
            aiHand = [];
            distribuindo = true;
            playerScore = 0;
            aiScore = 0;
            cartaIATurno = null;
            atualizarPlacar();
            debugEl.textContent = 'Iniciando...';

            let delay = 0;
            const cartasPorJogador = 7;

            for (let i = 0; i < cartasPorJogador; i++) {
                setTimeout(() => {
                    const carta = deck.pop();
                    playerHand.push(carta);
                    animarCarta(drawPileEl, playerHandEl, () => {
                        atualizarMaoPlayer();
                    });
                }, delay);
                delay += 250;

                setTimeout(() => {
                    const carta = deck.pop();
                    aiHand.push(carta);
                    animarCarta(drawPileEl, aiHandEl, () => {
                        atualizarMaoIA();
                    });
                }, delay);
                delay += 250;
            }

            setTimeout(() => {
                let primeira;
                do {
                    primeira = deck.pop();
                } while (!primeira);

                currentCard = primeira;
                discardPile.push(primeira);

                animarCarta(drawPileEl, document.getElementById('discard-card'), () => {
                    atualizarMesa();
                    distribuindo = false;
                    setTimeout(turnoIA, 1000);
                }, true, primeira);
            }, delay + 300);
        }

        function turnoIA() {
            if (gameEnded || distribuindo || aiHand.length === 0) return;

            const indexIA = Math.floor(Math.random() * aiHand.length);
            cartaIATurno = aiHand.splice(indexIA, 1)[0];

            debugEl.textContent = `IA: ${cartaIATurno} | Sua vez`;

            animarCarta(aiHandEl, document.getElementById('discard-card'), () => {
                atualizarMaoIA();
                currentCard = cartaIATurno;
                atualizarMesa();
                playerTurn = true;
                atualizarMaoPlayer();
            }, true, cartaIATurno);
        }

        function jogarCarta(index) {
            if (!playerTurn || gameEnded || distribuindo ||!cartaIATurno) return;
            const tipoPlayer = playerHand[index];

            playerTurn = false;
            playerHand.splice(index, 1);
            atualizarMaoPlayer();

            animarCarta(playerHandEl, document.getElementById('discard-card'), () => {
                const resultado = verificarVencedor(tipoPlayer, cartaIATurno);

                if (resultado === 'player') {
                    playerScore++;
                } else if (resultado === 'ia') {
                    aiScore++;
                }

                atualizarPlacar();
                atualizarDebug(tipoPlayer, cartaIATurno, resultado);

                discardPile.push(tipoPlayer);
                discardPile.push(cartaIATurno);
                currentCard = tipoPlayer;
                atualizarMesa();
                cartaIATurno = null;

                setTimeout(() => {
                    if (playerHand.length === 0 || aiHand.length === 0) {
                        fimDeJogo();
                    } else {
                        setTimeout(turnoIA, 800);
                    }
                }, 1500);
            }, true, tipoPlayer);
        }

        drawPileEl.addEventListener('click', () => {
            if (!playerTurn || gameEnded || deck.length === 0 || distribuindo ||!cartaIATurno) return;
            const nova = deck.pop();
            playerHand.push(nova);
            animarCarta(drawPileEl, playerHandEl, () => {
                atualizarMaoPlayer();
                atualizarMesa();
            });
        });

        function fimDeJogo() {
            gameEnded = true;
            let vencedor;
            if (playerScore > aiScore) vencedor = 'Você';
            else if (aiScore > playerScore) vencedor = 'Adversário';
            else vencedor = 'Empate';

            localStorage.setItem('vencedor', vencedor);
            localStorage.setItem('scoreHouse', playerScore);
            localStorage.setItem('scorePlayer', aiScore);

            setTimeout(() => {
                window.location.href = 'pagina3.html';
            }, 800);
        }

        setTimeout(distribuirCartas, 500);
    }

    // ========== PÁGINA 3: RESULTADO ==========
    if (path === 'pagina3.html') {
        const vencedor = localStorage.getItem('vencedor') || 'Empate';
        const scoreHouse = localStorage.getItem('scoreHouse') || '0';
        const scorePlayer = localStorage.getItem('scorePlayer') || '0';

        const titulo = document.getElementById('titulo-resultado');
        const icon = document.getElementById('icon-resultado');

        if (vencedor === 'Você') {
            titulo.textContent = 'VITÓRIA!';
            icon.src = 'assets/trofeu.png';
        } else if (vencedor === 'Adversário') {
            titulo.textContent = 'DERROTA!';
            icon.src = 'assets/derrota.png';
        } else {
            titulo.textContent = 'EMPATE!';
            icon.src = 'assets/empate.png';
        }

        document.getElementById('score-house').textContent = scoreHouse;
        document.getElementById('score-player').textContent = scorePlayer;

        document.getElementById('play-again').addEventListener('click', () => {
            window.location.href = 'pagina2.html';
        });

        document.getElementById('home').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
});