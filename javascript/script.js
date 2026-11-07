
const totalNiveis = 24;

const anterior = document.getElementById("anterior");
const proximo = document.getElementById("proximo");
const botaoNivel = document.getElementById("nivel-atual");

const entradas = document.querySelectorAll(".entrada");

// Guardar as propriedades aplicadas por cada input
const propriedadesAnteriores = new WeakMap();

// Aplicar propriedades CSS pelo editor
entradas.forEach(entrada => {

    entrada.addEventListener("input", () => {

        const seletor = entrada.dataset.target;

        if (!seletor) return;

        const elementosAlvo = document.querySelectorAll(seletor);

        if (!elementosAlvo.length) return;

        // Remover a propriedade anteriormente digitada
        const propriedadeAnterior = propriedadesAnteriores.get(entrada);

        if (propriedadeAnterior) {

            elementosAlvo.forEach(elemento => {
                elemento.style.removeProperty(propriedadeAnterior);
            });

        }

        const regra = entrada.value.trim();

        // Verificar se existe uma declaração CSS
        if (!regra.includes(":")) {
            propriedadesAnteriores.delete(entrada);
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

        if (!propriedade || !valor) return;

        // Validar a propriedade CSS
        const teste = document.createElement("div");

        teste.style.setProperty(propriedade, valor);

        if (!teste.style.getPropertyValue(propriedade)) return;

        // Aplicar a propriedade aos elementos selecionados
        elementosAlvo.forEach(elemento => {

            elemento.style.setProperty(propriedade, valor);

        });

        // Guardar a última propriedade aplicada
        propriedadesAnteriores.set(entrada, propriedade);

    });

});


// Identificar o nível atual
const arquivoAtual = location.pathname.split("/").pop();

let nivelAtual = Number(
    arquivoAtual.match(/level_(\d+)\.html/)?.[1]
) || 1;


// Atualizar seletor de níveis
function atualizarSeletor() {

    botaoNivel.innerHTML =
        `Level ${nivelAtual} of ${totalNiveis} <span>▾</span>`;

    anterior.disabled = nivelAtual === 1;
    proximo.disabled = nivelAtual === totalNiveis;

    anterior.style.opacity = anterior.disabled ? "0.4" : "1";
    proximo.style.opacity = proximo.disabled ? "0.4" : "1";

}


// Nível anterior
anterior.addEventListener("click", () => {

    if (nivelAtual > 1) {

        location.href = `level_${nivelAtual - 1}.html`;

    }

});


// Próximo nível
proximo.addEventListener("click", () => {

    if (nivelAtual < totalNiveis) {

        location.href = `level_${nivelAtual + 1}.html`;

    }

});


// Inicializar
atualizarSeletor();