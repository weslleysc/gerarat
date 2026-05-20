// ============================================
// VARIÁVEIS GLOBAIS
// ============================================
const form = document.getElementById('ratForm');
const btnGerar = document.getElementById('btnGerar');
const btnGerar2 = document.getElementById('btnGerar2');
const btnLimpar = document.getElementById('btnLimpar');
const btnLimpar2 = document.getElementById('btnLimpar2');
const btnSalvar = document.getElementById('btnSalvar');

let isDrawing = false;
let assinaturaTecnicoData = null;
let assinaturaClienteData = null;

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página carregada');
    inicializarCanvases();
    carregarDados();
    adicionarEventListeners();
});

// ============================================
// EVENT LISTENERS
// ============================================
function adicionarEventListeners() {
    console.log('Adicionando event listeners');
    
    if (btnGerar) btnGerar.addEventListener('click', function(e) {
        e.preventDefault();
        gerarPDF();
    });
    
    if (btnGerar2) btnGerar2.addEventListener('click', function(e) {
        e.preventDefault();
        gerarPDF();
    });
    
    if (btnLimpar) btnLimpar.addEventListener('click', function(e) {
        e.preventDefault();
        limparFormulario();
    });
    
    if (btnLimpar2) btnLimpar2.addEventListener('click', function(e) {
        e.preventDefault();
        limparFormulario();
    });
    
    if (btnSalvar) btnSalvar.addEventListener('click', function(e) {
        e.preventDefault();
        salvarDados();
    });

    // Salvar dados automaticamente a cada mudança
    if (form) {
        form.addEventListener('change', salvarDados);
        form.addEventListener('input', salvarDados);
    }
}

// ============================================
// CANVASES - ASSINATURAS
// ============================================
function inicializarCanvases() {
    console.log('Inicializando canvases');
    inicializarCanvas('canvasTecnico');
    inicializarCanvas('canvasCliente');
}

function inicializarCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error('Canvas não encontrado:', canvasId);
        return;
    }
    
    const ctx = canvas.getContext('2d');

    // Ajustar tamanho do canvas
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Fundo branco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Mouse events
    canvas.addEventListener('mousedown', function(e) { iniciarDesenho(e, canvasId); });
    canvas.addEventListener('mousemove', function(e) { desenhar(e, canvasId); });
    canvas.addEventListener('mouseup', function() { pararDesenho(); });
    canvas.addEventListener('mouseout', function() { pararDesenho(); });

    // Touch events
    canvas.addEventListener('touchstart', function(e) { iniciarDesenho(e, canvasId); });
    canvas.addEventListener('touchmove', function(e) { desenhar(e, canvasId); });
    canvas.addEventListener('touchend', function() { pararDesenho(); });
}

function iniciarDesenho(e, canvasId) {
    isDrawing = true;
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    let x, y;
    if (e.touches) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
}

function desenhar(e, canvasId) {
    if (!isDrawing) return;

    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    let x, y;
    if (e.touches) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000';
    ctx.lineTo(x, y);
    ctx.stroke();
}

function pararDesenho() {
    isDrawing = false;
}

function limparAssinatura(canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function salvarAssinatura(canvasId, dataVar) {
    const canvas = document.getElementById(canvasId);
    const imageData = canvas.toDataURL('image/png');

    if (canvasId === 'canvasTecnico') {
        assinaturaTecnicoData = imageData;
        const preview = document.getElementById('assinaturaTecnicoPreview');
        if (preview) {
            preview.innerHTML = '<img src="' + imageData + '" alt="Assinatura Técnico" style="max-width: 100%; max-height: 100%;">';
        }
    } else {
        assinaturaClienteData = imageData;
        const preview = document.getElementById('assinaturaClientePreview');
        if (preview) {
            preview.innerHTML = '<img src="' + imageData + '" alt="Assinatura Cliente" style="max-width: 100%; max-height: 100%;">';
        }
    }

    mostrarNotificacao('Assinatura salva com sucesso!');
}

// ============================================
// SALVAR E CARREGAR DADOS
// ============================================
function salvarDados() {
    if (!form) return;
    
    const dados = new FormData(form);
    const obj = Object.fromEntries(dados);

    // Adicionar assinaturas
    obj.assinaturaTecnicoData = assinaturaTecnicoData;
    obj.assinaturaClienteData = assinaturaClienteData;

    // Salvar checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(function(checkbox) {
        obj[checkbox.name] = checkbox.checked;
    });

    localStorage.setItem('ratFormData', JSON.stringify(obj));
    console.log('Dados salvos');
}

function carregarDados() {
    const dados = localStorage.getItem('ratFormData');
    if (!dados) return;

    try {
        const obj = JSON.parse(dados);

        // Carregar campos de texto
        Object.keys(obj).forEach(function(key) {
            const input = form.elements[key];
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = obj[key] === true || obj[key] === 'true';
                } else {
                    input.value = obj[key] || '';
                }
            }
        });

        // Carregar assinaturas
        if (obj.assinaturaTecnicoData) {
            assinaturaTecnicoData = obj.assinaturaTecnicoData;
            const preview = document.getElementById('assinaturaTecnicoPreview');
            if (preview) {
                preview.innerHTML = '<img src="' + assinaturaTecnicoData + '" alt="Assinatura Técnico" style="max-width: 100%; max-height: 100%;">';
            }
        }

        if (obj.assinaturaClienteData) {
            assinaturaClienteData = obj.assinaturaClienteData;
            const preview = document.getElementById('assinaturaClientePreview');
            if (preview) {
                preview.innerHTML = '<img src="' + assinaturaClienteData + '" alt="Assinatura Cliente" style="max-width: 100%; max-height: 100%;">';
            }
        }
        
        console.log('Dados carregados');
    } catch (err) {
        console.error('Erro ao carregar dados:', err);
    }
}

// ============================================
// GERAR PDF
// ============================================
function gerarPDF() {
    console.log('Iniciando geração de PDF');
    
    try {
        const dados = obterDadosFormulario();
        const html = criarHTMLPDF(dados);
        
        const element = document.createElement('div');
        element.innerHTML = html;
        element.style.position = 'absolute';
        element.style.left = '-9999px';
        element.style.top = '-9999px';
        element.style.width = '210mm';
        document.body.appendChild(element);

        // Aguardar um pouco para o DOM renderizar
        setTimeout(function() {
            const opt = {
                margin: [10, 10, 10, 10],
                filename: 'RAT_' + (dados.noChamadoCliente || 'sem-numero') + '_' + new Date().toISOString().split('T')[0] + '.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, allowTaint: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            html2pdf().set(opt).from(element).save().then(function() {
                console.log('PDF gerado com sucesso');
                document.body.removeChild(element);
                mostrarNotificacao('PDF gerado com sucesso!');
            }).catch(function(err) {
                console.error('Erro ao gerar PDF:', err);
                mostrarNotificacao('Erro ao gerar PDF', true);
                if (document.body.contains(element)) {
                    document.body.removeChild(element);
                }
            });
        }, 500);
    } catch (err) {
        console.error('Erro na função gerarPDF:', err);
        mostrarNotificacao('Erro ao processar PDF', true);
    }
}

function obterDadosFormulario() {
    const dados = {};
    const formData = new FormData(form);

    // Campos de texto
    for (let [key, value] of formData.entries()) {
        dados[key] = value;
    }

    // Checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(function(checkbox) {
        dados[checkbox.name] = checkbox.checked;
    });

    // Assinaturas
    dados.assinaturaTecnicoData = assinaturaTecnicoData;
    dados.assinaturaClienteData = assinaturaClienteData;

    return dados;
}

function criarHTMLPDF(dados) {
    const getCheckbox = function(checked) { return checked ? '☑' : '☐'; };

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; font-size: 11px; line-height: 1.3; color: #000; }
                .page { width: 210mm; padding: 15mm; background: white; }
                .header { text-align: center; margin-bottom: 10px; border-bottom: 2px solid #000; padding-bottom: 8px; }
                .header-title { font-weight: bold; font-size: 14px; }
                .header-subtitle { font-weight: bold; font-size: 12px; }
                .header-info { font-size: 9px; line-height: 1.2; margin-top: 3px; }
                .section-title { font-weight: bold; background: #f0f0f0; padding: 5px; margin: 8px 0 5px 0; border: 1px solid #000; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
                td { border: 1px solid #000; padding: 4px; }
                .col-label { font-weight: bold; font-size: 10px; }
                .signature-box { height: 40px; border: 1px solid #000; margin-top: 3px; }
                .signature-img { max-width: 100%; max-height: 100%; }
            </style>
        </head>
        <body>
            <div class="page">
                <!-- HEADER -->
                <div class="header">
                    <div class="header-title">EUNERD</div>
                    <div class="header-subtitle">RAT (RELATÓRIO ATENDIMENTO TÉCNICO)</div>
                    <div class="header-info">
                        Empresa Uen Nerd | Cubo Itaú | Alameda Vincente Pinzon 54 | 6º Andar<br>
                        Vila Olímpia, São Paulo - SP - CEP 04547-130<br>
                        Informações acesse: https://encontreunerd.com.br
                    </div>
                </div>

                <!-- DADOS DO CLIENTE -->
                <div class="section-title">DADOS DO CLIENTE</div>
                <table>
                    <tr>
                        <td style="width: 50%;"><span class="col-label">Nome do cliente:</span><br>${dados.nomeCliente || ''}</td>
                        <td style="width: 50%;"><span class="col-label">Nº chamado cliente:</span><br>${dados.noChamadoCliente || ''}</td>
                    </tr>
                    <tr>
                        <td colspan="2"><span class="col-label">Endereço:</span><br>${dados.endereco || ''}</td>
                    </tr>
                    <tr>
                        <td style="width: 50%;"><span class="col-label">Bairro:</span><br>${dados.bairro || ''}</td>
                        <td style="width: 50%;"><span class="col-label">CEP:</span><br>${dados.cep || ''}</td>
                    </tr>
                    <tr>
                        <td style="width: 50%;"><span class="col-label">Cidade:</span><br>${dados.cidade || ''}</td>
                        <td style="width: 50%;"><span class="col-label">UF:</span><br>${dados.uf || ''}</td>
                    </tr>
                    <tr>
                        <td style="width: 50%;"><span class="col-label">Contato/Responsável:</span><br>${dados.contatoResponsavel || ''}</td>
                        <td style="width: 50%;"><span class="col-label">Departamento:</span><br>${dados.departamento || ''}</td>
                    </tr>
                    <tr>
                        <td colspan="2"><span class="col-label">Telefone:</span><br>${dados.telefone || ''}</td>
                    </tr>
                </table>

                <!-- DADOS DO CHAMADO -->
                <div class="section-title">DADOS DO CHAMADO</div>
                <table>
                    <tr>
                        <td style="width: 50%;"><span class="col-label">Data Início:</span><br>${dados.dataInicio || ''}</td>
                        <td style="width: 50%;"><span class="col-label">Hora Início:</span><br>${dados.horaInicio || ''}</td>
                    </tr>
                    <tr>
                        <td style="width: 50%;"><span class="col-label">Data Término:</span><br>${dados.dataTermino || ''}</td>
                        <td style="width: 50%;"><span class="col-label">Hora Término:</span><br>${dados.horaTermino || ''}</td>
                    </tr>
                    <tr>
                        <td colspan="2"><span class="col-label">Sintomas:</span><br>${dados.sintomas || ''}</td>
                    </tr>
                </table>

                <!-- DADOS DO TÉCNICO EUNERD -->
                <div class="section-title">DADOS DO TÉCNICO EUNERD</div>
                <table>
                    <tr>
                        <td colspan="2"><span class="col-label">Nome:</span><br>${dados.nomeTecnico || ''}</td>
                    </tr>
                    <tr>
                        <td colspan="2"><span class="col-label">Endereço:</span><br>${dados.enderecoDadosTecnico || ''}</td>
                    </tr>
                    <tr>
                        <td style="width: 50%;"><span class="col-label">Bairro:</span><br>${dados.bairroTecnico || ''}</td>
                        <td style="width: 50%;"><span class="col-label">Cidade:</span><br>${dados.cidadeTecnico || ''}</td>
                    </tr>
                    <tr>
                        <td style="width: 50%;"><span class="col-label">UF:</span><br>${dados.ufTecnico || ''}</td>
                        <td style="width: 50%;"><span class="col-label">Telefone:</span><br>${dados.telefoneTecnico || ''}</td>
                    </tr>
                    <tr>
                        <td colspan="2"><span class="col-label">E-Mail:</span><br>${dados.emailTecnico || ''}</td>
                    </tr>
                </table>

                <!-- DADOS DO EQUIPAMENTO -->
                <div class="section-title">DADOS DO EQUIPAMENTO</div>
                <table>
                    <tr>
                        <td style="width: 50%;"><span class="col-label">Equipamento Antigo</span></td>
                        <td style="width: 50%;"><span class="col-label">Equipamento Novo</span></td>
                    </tr>
                    <tr>
                        <td><span class="col-label">Modelo:</span><br>${dados.equipAntigoModelo || ''}</td>
                        <td><span class="col-label">Modelo:</span><br>${dados.equipNovoModelo || ''}</td>
                    </tr>
                    <tr>
                        <td><span class="col-label">Host:Up:</span><br>${dados.equipAntigoHostUp || ''}</td>
                        <td><span class="col-label">Host:Up:</span><br>${dados.equipNovoHostUp || ''}</td>
                    </tr>
                    <tr>
                        <td><span class="col-label">Nº Série/Patrimônio:</span><br>${dados.equipAntigoSerie || ''}</td>
                        <td><span class="col-label">Nº Série/Patrimônio:</span><br>${dados.equipNovoSerie || ''}</td>
                    </tr>
                    <tr>
                        <td>
                            ${getCheckbox(dados.equipAntigoDesktop)} Desktop
                            ${getCheckbox(dados.equipAntigoNotebook)} Notebook
                            ${getCheckbox(dados.equipAntigoImpressoras)} Impressoras
                            ${getCheckbox(dados.equipAntigoAtivoRede)} Ativo de rede
                        </td>
                        <td>
                            ${getCheckbox(dados.equipNovoDesktop)} Desktop
                            ${getCheckbox(dados.equipNovoNotebook)} Notebook
                            ${getCheckbox(dados.equipNovoImpressoras)} Impressoras
                            ${getCheckbox(dados.equipNovoAtivoRede)} Ativo de rede
                        </td>
                    </tr>
                </table>

                <!-- DESCRIÇÃO DAS ATIVIDADES -->
                <div class="section-title">DESCRIÇÃO DAS ATIVIDADES</div>
                <table>
                    <tr>
                        <td style="min-height: 50px; vertical-align: top;">${dados.descricaoAtividades || ''}</td>
                    </tr>
                </table>

                <!-- DADOS ADICIONAIS -->
                <div class="section-title">DADOS ADICIONAIS</div>
                <table>
                    <tr>
                        <td><span class="col-label">Status do equipamento:</span><br>${dados.statusEquipamento || ''}</td>
                    </tr>
                    <tr>
                        <td style="min-height: 40px; vertical-align: top;"><span class="col-label">Observação:</span><br>${dados.observacao || ''}</td>
                    </tr>
                </table>

                <!-- ASSINATURAS -->
                <div class="section-title">ASSINATURAS</div>
                <table>
                    <tr>
                        <td style="width: 50%; vertical-align: top;">
                            <span class="col-label">Nome Técnico Eunerd:</span><br>${dados.nomeTecnicoAssinatura || ''}<br>
                            <span class="col-label">Nº documento:</span><br>${dados.nDocumentoTecnico || ''}<br>
                            <span class="col-label">Assinatura:</span>
                            <div class="signature-box">
                                ${dados.assinaturaTecnicoData ? '<img src="' + dados.assinaturaTecnicoData + '" class="signature-img" alt="Assinatura">' : ''}
                            </div>
                        </td>
                        <td style="width: 50%; vertical-align: top;">
                            <span class="col-label">Nome Cliente:</span><br>${dados.nomeClienteAssinatura || ''}<br>
                            <span class="col-label">Nº documento do matriculado:</span><br>${dados.nDocumentoCliente || ''}<br>
                            <span class="col-label">Nº contato:</span><br>${dados.nContatoCliente || ''}<br>
                            <span class="col-label">Assinatura:</span>
                            <div class="signature-box">
                                ${dados.assinaturaClienteData ? '<img src="' + dados.assinaturaClienteData + '" class="signature-img" alt="Assinatura">' : ''}
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        </body>
        </html>
    `;
}

// ============================================
// LIMPAR FORMULÁRIO
// ============================================
function limparFormulario() {
    console.log('Limpando formulário');
    
    if (!confirm('Tem certeza que deseja limpar todos os dados?')) return;

    if (form) form.reset();
    assinaturaTecnicoData = null;
    assinaturaClienteData = null;

    const preview1 = document.getElementById('assinaturaTecnicoPreview');
    if (preview1) preview1.innerHTML = '';
    
    const preview2 = document.getElementById('assinaturaClientePreview');
    if (preview2) preview2.innerHTML = '';

    inicializarCanvases();
    localStorage.removeItem('ratFormData');

    mostrarNotificacao('Formulário limpo com sucesso!');
}

// ============================================
// NOTIFICAÇÕES
// ============================================
function mostrarNotificacao(mensagem, erro) {
    if (erro === undefined) erro = false;
    
    const notification = document.createElement('div');
    notification.className = 'notification' + (erro ? ' error' : '');
    notification.textContent = mensagem;

    document.body.appendChild(notification);

    setTimeout(function() {
        notification.remove();
    }, 3000);
}
