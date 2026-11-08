const totalNiveis = 24;

const anterior = document.getElementById("anterior");
const proximo = document.getElementById("proximo");
const botaoNivel = document.getElementById("nivel-atual");
const botaoNext = document.querySelector(".next");

const entradas = document.querySelectorAll(".entrada");

const propriedadesAnteriores = new WeakMap();

const arquivoAtual = location.pathname.split("/").pop();

let nivelAtual = Number(
    arquivoAtual.match(/^level_(\d+)\.html$/)?.[1]
) || 1;

let nivelConcluido = false;


// Remover o onclick antigo do HTML
if (botaoNext) {
    botaoNext.removeAttribute("onclick");
}


// CSS adicional
const estilosExtras = document.createElement("style");

estilosExtras.textContent = `
    .next:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .next:disabled:hover {
        background-color: #df7b70;
    }

    .seletor-niveis {
        position: relative;
        overflow: visible !important;
        z-index: 10;
    }

    .lista-niveis {
        position: absolute;
        top: calc(100% + 6px);
        left: 0;
        width: 215px;
        max-height: 220px;
        overflow-y: auto;
        display: none;
        grid-template-columns: repeat(4, 1fr);
        gap: 5px;
        padding: 10px;
        background: #ffffff;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        z-index: 1000;
    }

    .lista-niveis.aberto {
        display: grid;
    }

    .lista-niveis button {
        height: 35px;
        border: none;
        border-radius: 4px;
        background: #e8f5e9;
        color: #2c3e50;
        cursor: pointer;
        font-size: 14px;
    }

    .lista-niveis button:hover {
        background: #43a047;
        color: white;
    }

    .lista-niveis button.ativo {
        background: #43a047;
        color: white;
        font-weight: bold;
    }

    #proximo:disabled,
    #anterior:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
`;

document.head.appendChild(estilosExtras);


// Identificar todos os sapos
function obterPersonagens() {
    return [...document.querySelectorAll(".area img")].filter(imagem =>
        [...imagem.classList].some(classe =>
            /^personagem\d*$/.test(classe)
        )
    );
}


// Identificar todas as vitórias-régias
function obterVitorias() {
    return [...document.querySelectorAll(".jogo img")].filter(imagem =>
        [...imagem.classList].some(classe =>
            /^vitoria\d*$/.test(classe)
        )
    );
}


// Verificar se todos os sapos chegaram aos destinos
function verificarVitoria() {

    const sapos = obterPersonagens();
    const vitorias = obterVitorias();

    if (
        sapos.length === 0 ||
        vitorias.length === 0 ||
        sapos.length !== vitorias.length
    ) {
        return false;
    }

    const vitoriasUsadas = new Set();

    for (const sapo of sapos) {

        const sapoRect = sapo.getBoundingClientRect();

        const centroX = sapoRect.left + sapoRect.width / 2;
        const centroY = sapoRect.top + sapoRect.height / 2;

        const indiceVitoria = vitorias.findIndex((vitoria, indice) => {

            if (vitoriasUsadas.has(indice)) {
                return false;
            }

            const vitoriaRect = vitoria.getBoundingClientRect();

            return (
                centroX >= vitoriaRect.left &&
                centroX <= vitoriaRect.right &&
                centroY >= vitoriaRect.top &&
                centroY <= vitoriaRect.bottom
            );
        });

        if (indiceVitoria === -1) {
            return false;
        }

        vitoriasUsadas.add(indiceVitoria);
    }

    return true;
}


// Atualizar estado do botão Next
function atualizarEstadoDoNivel() {

    nivelConcluido = verificarVitoria();

    if (botaoNext) {
        botaoNext.disabled = !nivelConcluido;
    }
}


// Aplicar propriedades CSS pelo editor
entradas.forEach(entrada => {

    entrada.addEventListener("input", () => {

        const seletor = entrada.dataset.target || ".area";

        let elementosAlvo;

        try {
            elementosAlvo = document.querySelectorAll(seletor);
        } catch (erro) {
            atualizarEstadoDoNivel();
            return;
        }

        // Remover propriedade anterior
        const propriedadeAnterior = propriedadesAnteriores.get(entrada);

        if (propriedadeAnterior) {
            elementosAlvo.forEach(elemento => {
                elemento.style.removeProperty(propriedadeAnterior);
            });
        }

        const regra = entrada.value.trim();

        if (!regra.includes(":")) {
            propriedadesAnteriores.delete(entrada);
            atualizarEstadoDoNivel();
            return;
        }

        const separador = regra.indexOf(":");

        const propriedade = regra
            .slice(0, separador)
            .trim();

        const valor = regra
            .slice(separador + 1)
            .replace(/;$/, "")
            .trim();

        if (!propriedade || !valor) {
            propriedadesAnteriores.delete(entrada);
            atualizarEstadoDoNivel();
            return;
        }

        // Validar declaração CSS
        const teste = document.createElement("div");

        teste.style.setProperty(propriedade, valor);

        if (!teste.style.getPropertyValue(propriedade)) {
            propriedadesAnteriores.delete(entrada);
            atualizarEstadoDoNivel();
            return;
        }

        // Aplicar propriedade
        elementosAlvo.forEach(elemento => {
            elemento.style.setProperty(propriedade, valor);
        });

        propriedadesAnteriores.set(entrada, propriedade);

        atualizarEstadoDoNivel();
    });

});


// Arquivo correspondente ao nível
function obterArquivoNivel(nivel) {

    if (nivel === 1) {
        return "index.html";
    }

    return `level_${nivel}.html`;
}


// Criar menu dos 24 níveis
const seletorNiveis = document.querySelector(".seletor-niveis");

const listaNiveis = document.createElement("div");

listaNiveis.className = "lista-niveis";

listaNiveis.setAttribute("aria-label", "Escolher nível");

if (seletorNiveis) {
    seletorNiveis.appendChild(listaNiveis);
}


// Atualizar lista de níveis
function atualizarListaNiveis() {

    listaNiveis.innerHTML = "";

    for (let i = 1; i <= totalNiveis; i++) {

        const botao = document.createElement("button");

        botao.textContent = i;

        botao.type = "button";

        if (i === nivelAtual) {
            botao.classList.add("ativo");
        }

        botao.addEventListener("click", () => {
            location.href = obterArquivoNivel(i);
        });

        listaNiveis.appendChild(botao);
    }
}


// Abrir e fechar lista de níveis
if (botaoNivel) {

    botaoNivel.type = "button";

    botaoNivel.addEventListener("click", (evento) => {

        evento.stopPropagation();

        listaNiveis.classList.toggle("aberto");

        botaoNivel.setAttribute(
            "aria-expanded",
            listaNiveis.classList.contains("aberto")
        );

    });

}


// Fechar menu ao clicar fora
document.addEventListener("click", (evento) => {

    if (
        seletorNiveis &&
        !seletorNiveis.contains(evento.target)
    ) {
        listaNiveis.classList.remove("aberto");

        if (botaoNivel) {
            botaoNivel.setAttribute("aria-expanded", "false");
        }
    }

});


// Atualizar seletor superior
function atualizarSeletor() {

    if (botaoNivel) {

        botaoNivel.innerHTML =
            `Level ${nivelAtual} of ${totalNiveis} <span>▾</span>`;

    }

    if (anterior) {

        anterior.disabled = nivelAtual === 1;

        anterior.style.opacity =
            anterior.disabled ? "0.4" : "1";

    }

    if (proximo) {

        proximo.disabled = nivelAtual === totalNiveis;

        proximo.style.opacity =
            proximo.disabled ? "0.4" : "1";

    }

    atualizarListaNiveis();
}


// Ir para nível anterior
if (anterior) {

    anterior.addEventListener("click", () => {

        if (nivelAtual > 1) {
            location.href = obterArquivoNivel(nivelAtual - 1);
        }

    });

}


// Ir para próximo nível pela seta
if (proximo) {

    proximo.addEventListener("click", () => {

        if (nivelAtual < totalNiveis) {
            location.href = obterArquivoNivel(nivelAtual + 1);
        }

    });

}


// Botão Next do desafio
if (botaoNext) {

    botaoNext.addEventListener("click", () => {

        if (!verificarVitoria()) {
            atualizarEstadoDoNivel();
            return;
        }

        if (nivelAtual < totalNiveis) {

            location.href = obterArquivoNivel(nivelAtual + 1);

        } else {

            location.href = "conclusao.html";

        }

    });

}


// Inicializar
atualizarListaNiveis();
atualizarSeletor();
atualizarEstadoDoNivel();