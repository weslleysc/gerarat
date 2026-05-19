// Configuração para permitir desenhar no Canvas (Assinatura)
function configurarCanvas(idCanvas) {
    const canvas = document.getElementById(idCanvas);
    const ctx = canvas.getContext("2d");
    let desenhando = false;

    function obterPosicao(e) {
        const rect = canvas.getBoundingClientRect();
        // Suporta tanto mouse quanto telas touch (celular)
        const clienteX = e.touches ? e.touches[0].clientX : e.clientX;
        const clienteY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clienteX - rect.left, y: clienteY - rect.top };
    }

    function iniciar(e) {
        desenhando = true;
        const pos = obterPosicao(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    }

    function desenhar(e) {
        if (!desenhando) return;
        e.preventDefault();
        const pos = obterPosicao(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    }

    canvas.addEventListener("mousedown", iniciar);
    canvas.addEventListener("mousemove", desenhar);
    window.addEventListener("mouseup", () => desenhando = false);

    canvas.addEventListener("touchstart", iniciar);
    canvas.addEventListener("touchmove", desenhar);
    window.addEventListener("touchend", () => desenhando = false);
}

function limparCanvas(idCanvas) {
    const canvas = document.getElementById(idCanvas);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Ativa a assinatura no campo do técnico
configurarCanvas("canvas-tecnico");

// FUNÇÃO QUE GERA O PDF IGUAL AO DELE
document.getElementById("btn-gerar").addEventListener("click", () => {
    // Alvo é a div que contém o formulário completo
    const alvo = document.getElementById("formulario-rat");

    // Configurações do arquivo final
    const opcoes = {
        margin: [10, 10, 10, 10], // Margens [topo, esquerda, rodapé, direita]
        filename: 'RAT_Atendimento.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true }, // Escala 2 deixa os textos nítidos
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Executa a biblioteca html2pdf
    html2pdf().set(opcoes).from(alvo).save();
});
