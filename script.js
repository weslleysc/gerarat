// Lista global de fotos (Base64)
let listaFotos = [];

// Configuração dos Painéis de Assinatura Digital
function inicializarAssinatura(idCanvas) {
    const canvas = document.getElementById(idCanvas);
    const ctx = canvas.getContext("2d");
    let desenhando = false;

    function ajustarCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        ctx.strokeStyle = "#001e62";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
    }

    ajustarCanvas();
    window.addEventListener("resize", ajustarCanvas);

    function pegarCoordenadas(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    function iniciarDesenho(e) {
        desenhando = true;
        const coords = pegarCoordenadas(e);
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
        if (e.cancelable) e.preventDefault();
    }

    function desenhar(e) {
        if (!desenhando) return;
        const coords = pegarCoordenadas(e);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
        if (e.cancelable) e.preventDefault();
    }

    function pararDesenho() {
        desenhando = false;
    }

    canvas.addEventListener("mousedown", iniciarDesenho);
    canvas.addEventListener("mousemove", desenhar);
    canvas.addEventListener("mouseup", pararDesenho);
    canvas.addEventListener("mouseleave", pararDesenho);

    canvas.addEventListener("touchstart", iniciarDesenho, { passive: false });
    canvas.addEventListener("touchmove", desenhar, { passive: false });
    canvas.addEventListener("touchend", pararDesenho);
}

function limparAssinatura(idCanvas) {
    const canvas = document.getElementById(idCanvas);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Lógica de Fotos
function lidarComFotos(event) {
    const arquivos = event.target.files;
    if (!arquivos.length) return;

    Array.from(arquivos).forEach(arquivo => {
        const reader = new FileReader();
        reader.onload = (e) => {
            listaFotos.push(e.target.result);
            atualizarInterfaceFotos();
        };
        reader.readAsDataURL(arquivo);
    });
    
    // Limpa o input para permitir selecionar a mesma foto novamente se necessário
    event.target.value = "";
}

function removerFoto(index) {
    listaFotos.splice(index, 1);
    atualizarInterfaceFotos();
}

function atualizarInterfaceFotos() {
    const container = document.getElementById('preview-fotos');
    const grid = document.getElementById('grid-preview');
    const contador = document.getElementById('contador-fotos');
    const paginasFotosPdf = document.getElementById('paginas-fotos-pdf');

    // Atualiza contador e visibilidade do container
    contador.innerText = listaFotos.length;
    container.style.display = listaFotos.length > 0 ? 'block' : 'none';

    // Limpa previews e páginas do PDF
    grid.innerHTML = "";
    paginasFotosPdf.innerHTML = "";

    listaFotos.forEach((foto, index) => {
        // Adiciona ao Grid de Preview (Web)
        const item = document.createElement('div');
        item.className = 'foto-item';
        item.innerHTML = `
            <img src="${foto}">
            <button class="btn-remover-foto" onclick="removerFoto(${index})"><i class="fas fa-times"></i></button>
        `;
        grid.appendChild(item);

        // Adiciona como Página para o PDF
        const pagina = document.createElement('div');
        pagina.className = 'foto-page';
        pagina.innerHTML = `
            <div class="foto-page-legenda">Evidência Fotográfica ${index + 1}</div>
            <img src="${foto}">
        `;
        paginasFotosPdf.appendChild(pagina);
    });
}

// Funções do Modal
function abrirModalConfirmacao() {
    document.getElementById('modal-confirmacao').style.display = 'flex';
}

function fecharModalConfirmacao() {
    document.getElementById('modal-confirmacao').style.display = 'none';
}

function executarLimparTudo() {
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        if (input.type === 'checkbox') input.checked = false;
        else if (input.type === 'date') {
            const hoje = new Date().toISOString().split('T')[0];
            input.value = hoje;
        }
        else if (input.type !== 'file') input.value = '';
    });
    
    // Limpa assinaturas
    limparAssinatura('canvas-tecnico');
    limparAssinatura('canvas-cliente');
    
    // Limpa fotos
    listaFotos = [];
    atualizarInterfaceFotos();
    
    fecharModalConfirmacao();
}

// Função para ajustar o tamanho da fonte do textarea
function ajustarTamanhoFonte(textarea) {
    let fontSize = parseFloat(window.getComputedStyle(textarea).fontSize);
    textarea.style.fontSize = fontSize + 'px'; // Reset para o tamanho original ou padrão

    while (textarea.scrollHeight > textarea.clientHeight && fontSize > 8) { // Limite mínimo de 8px
        fontSize -= 0.5;
        textarea.style.fontSize = fontSize + 'px';
    }
    // Se o texto for removido e houver espaço, tenta aumentar a fonte de volta até o padrão (10px)
    if (textarea.scrollHeight <= textarea.clientHeight && fontSize < 10) {
        fontSize += 0.5;
        textarea.style.fontSize = fontSize + 'px';
        // Garante que não exceda o tamanho padrão original
        if (parseFloat(window.getComputedStyle(textarea).fontSize) > 10) {
            textarea.style.fontSize = '10px';
        }
    }
}

// Geração de PDF
function gerarPDF() {
    const elemento = document.getElementById('conteudo-pdf');
    const btn = document.getElementById('btn-salvar');
    const originalText = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando PDF...';

    // Nome do arquivo baseado no cliente se houver
    const nomeCli = document.getElementById('cli-nome').value.trim();
    const filename = nomeCli ? `RAT_Eunerd_${nomeCli.replace(/\s+/g, '_')}.pdf` : 'RAT_Eunerd.pdf';

    const opt = {
        margin: 0,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            letterRendering: true,
            logging: false
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // Gera o PDF
    html2pdf().set(opt).from(elemento).save().then(() => {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }).catch(err => {
        console.error("Erro ao gerar PDF:", err);
        alert("Ocorreu um erro ao gerar o PDF. Verifique o console.");
        btn.disabled = false;
        btn.innerHTML = originalText;
    });
}

// Inicialização
window.onload = () => {
    inicializarAssinatura('canvas-tecnico');
    inicializarAssinatura('canvas-cliente');
    
    // Ajustar tamanho da fonte do textarea de descrição de atividades
    const descAtividades = document.getElementById("desc-atividades");
    if (descAtividades) {
        descAtividades.addEventListener("input", () => ajustarTamanhoFonte(descAtividades));
        // Para IE, se necessário
        descAtividades.addEventListener("propertychange", (event) => {
            if (event.propertyName === "value") {
                ajustarTamanhoFonte(descAtividades);
            }
        });
        ajustarTamanhoFonte(descAtividades); // Ajuste inicial
    }

    // Setar data de hoje nos campos de data
    const hoje = new Date().toISOString().split('T')[0];
    if(document.getElementById('atend-data-inicio')) document.getElementById('atend-data-inicio').value = hoje;
    if(document.getElementById('atend-data-fim')) document.getElementById('atend-data-fim').value = hoje;
};
