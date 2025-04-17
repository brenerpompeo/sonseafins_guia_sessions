// --- Constantes Compartilhadas ---
const LS_KEY_THEME = 'themePreference';
const LS_KEY_SESSION_INDEX = 'session_index';
const LS_KEY_TASKS_PREFIX = 'session_tasks_';
const LS_KEY_DELETED_TASKS_PREFIX = 'session_deleted_tasks_';
const LS_KEY_NOTES_PREFIX = 'session_notes_';
const DEFAULT_SESSION_ID = 'default_session'; // Usado como fallback ou para lógica específica

// --- Template Padrão de Tarefas ---
// Cada tarefa terá um ID único gerado com crypto.randomUUID() na criação da session
const defaultTasksTemplate = [
    // Fase 1: Definição e Iniciação
    { phase: 'definicao-iniciacao', title: '1.1 Objetivos Específicos', description: 'Definir metas claras para esta session.', details: '<ul><li>Ex: Gravar Temporada #[X] (6 episódios 30 min).</li><li>Ex: Capturar entrevistas (Artistas + [Y] Convidados).</li><li>Ex: Link Metas: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Adicionar Link]</a></li></ul>' },
    { phase: 'definicao-iniciacao', title: '1.2 Confirmação Chave', description: 'Bloquear data, local e talentos principais.', details: '<ul><li>Data Confirmada: [DD/MM/AAAA HH:MM]</li><li>Local Confirmado: [Nome] - <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Contrato]</a></li><li>Talentos Confirmados: [Nomes]</li></ul>' },
    { phase: 'definicao-iniciacao', title: '1.3 Orçamento Preliminar', description: 'Estimativa inicial de custos e validação de verba.', details: '<ul><li>Estimativa: R$ [Valor] / Verba: R$ [Valor]</li><li>Planilha Preliminar: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Adicionar Link]</a></li><li>Aprovação: [Nome/Data]</li></ul>' },
    { phase: 'definicao-iniciacao', title: '1.4 Definição Equipe Core', description: 'Atribuir responsabilidades chave da produção.', details: '<ul><li>Prod. Executiva: [Nome]</li><li>Direção/Artístico: [Nome]</li><li>Técnico A/V: [Nome/Empresa]</li><li>Comunicação: [Nome]</li><li>Financeiro: [Nome]</li></ul>' },
    // Fase 2: Planejamento e Preparação
    { phase: 'planejamento-preparacao', title: '2.1 Cronograma Detalhado', description: 'Definir todas as datas e prazos chave.', details: '<ul><li>Datas VTs: [DD/MM]</li><li>Run-of-Show: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Cronograma Completo: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Planilha]</a></li><li>Prazos Pós: [Datas]</li></ul>' },
    { phase: 'planejamento-preparacao', title: '2.2 Orçamento Detalhado e Fluxo', description: 'Finalizar planilha de custos e cronograma de pagamentos.', details: '<ul><li>Planilha Final: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link]</a></li><li>Fluxo Pagamentos: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Aprovação Final: [Nome/Data]</li></ul>' },
    { phase: 'planejamento-preparacao', title: '2.3 Roteiro e Conteúdo', description: 'Definir estrutura dos episódios, pautas, perguntas.', details: '<ul><li>Estrutura Geral: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Roteiros/Pautas: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Pasta]</a></li><li>Aprovação Final: [Nome/Data]</li></ul>' },
    { phase: 'planejamento-preparacao', title: '2.4 Plano Técnico (A/V)', description: 'Definir equipamentos, rider, mapa de palco/luz.', details: '<ul><li>Lista Equipamentos: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link]</a></li><li>Mapa Palco/Luz: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Imagem]</a></li><li>Plano Áudio: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Fornecedor: [Nome/Contato]</li></ul>' },
    { phase: 'planejamento-preparacao', title: '2.5 Plano de Comunicação (Pré)', description: 'Estratégia divulgação pré-gravação, convites, redes sociais.', details: '<ul><li>Estratégia: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Lista Convidados: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link]</a></li><li>Cronograma Posts: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link]</a></li></ul>' },
    { phase: 'planejamento-preparacao', title: '2.6 Design e Identidade Visual', description: 'Finalizar cenografia, artes gráficas (GCs, vinhetas).', details: '<ul><li>Projeto Cenográfico: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Desenho]</a></li><li>Pacote Gráfico: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Pasta]</a></li><li>Aprovação Final: [Nome/Data]</li></ul>' },
    { phase: 'planejamento-preparacao', title: '2.7 Contratos e Acordos', description: 'Formalizar todos os acordos legais e financeiros.', details: '<ul><li>Contratos Talentos: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Pasta]</a></li><li>Contrato Local: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Ref]</a></li><li>Seguro: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Apólice Ref]</a></li></ul>' },
    { phase: 'planejamento-preparacao', title: '2.8 Logística Detalhada', description: 'Planejar transporte, alimentação, hospedagem, credenciamento.', details: '<ul><li>Plano Transporte: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Hospedagem: [Confirmações]</li><li>Catering: [Cardápio/Ref]</li><li>Credenciais: OK</li></ul>' },
    { phase: 'planejamento-preparacao', title: '2.9 Plano de Contingência', description: 'Identificar riscos e planejar soluções alternativas (Plano B, C).', details: '<ul><li>Mapeamento Riscos: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Planos B (Téc, Pessoal, Log): Definidos</li><li>Contatos Emergência: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li></ul>' },
    { phase: 'planejamento-preparacao', title: '2.10 Definição Métricas Sucesso', description: 'Estabelecer KPIs para avaliar o resultado da session.', details: '<ul><li>KPIs Produção: [...]</li><li>KPIs Conteúdo: [...]</li><li>KPIs Audiência: [...]</li><li>KPIs Negócio: [...]</li><li>Doc Métricas: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link]</a></li></ul>' },
    { phase: 'planejamento-preparacao', title: '2.11 Reunião Geral Alinhamento Final', description: 'Kick-off final com toda a equipe chave antes da execução.', details: '<ul><li>Data: [DD/MM/AAAA]</li><li>Pauta: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Ata/Registro: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link]</a></li></ul>' },
    // Fase 3: Execução
    { phase: 'execucao', title: '3.1 Montagem e Testes Finais', description: 'Preparar set, equipamentos e verificar tudo no local.', details: '<ul><li>Montagem A/V: OK [HH:MM]</li><li>Passagem Som/Luz/Rec: OK [HH:MM]</li><li>Cenário/Arte: OK [HH:MM]</li><li>Comunicação Interna: OK</li></ul>' },
    { phase: 'execucao', title: '3.2 Recepção e Briefing Final', description: 'Receber artistas, convidados e alinhar últimos detalhes.', details: '<ul><li>Talentos Chegaram: [HH:MM] / Briefing OK: [HH:MM]</li><li>Convidados Chegaram: [HH:MM] / Recepção OK</li><li>Briefing Equipe Final: [HH:MM]</li></ul>' },
    { phase: 'execucao', title: '3.3 Gravação Blocos/Episódios', description: 'Executar a gravação conforme o run-of-show.', details: '<ul><li>Início REC: [HH:MM] / Fim REC: [HH:MM]</li><li>Run-of-Show Seguido: [Sim/Não - Obs]</li><li>Check A/V Periódico: OK</li></ul>' },
    { phase: 'execucao', title: '3.4 Captura Conteúdo Adicional', description: 'Gravar material extra (bastidores, entrevistas, docs).', details: '<ul><li>Entrevistas Gravadas: [HH:MM - HH:MM]</li><li>Imagens Making-of: Capturadas</li><li>Termos Imagem Coletados: OK</li></ul>' },
    { phase: 'execucao', title: '3.5 Gestão de Imprevistos', description: 'Lidar com problemas que surgirem durante a gravação.', details: '<ul><li>Problemas Ocorridos: [Descrever ou N/A]</li><li>Solução Aplicada: [Descrever]</li><li>Plano Contingência Usado: [Sim/Não - Qual?]</li></ul>' },
    { phase: 'execucao', title: '3.6 Coleta Feedback Imediato', description: 'Conversa rápida com equipe e artistas sobre a experiência.', details: '<ul><li>Feedback Equipe: [Registrado]</li><li>Feedback Talentos: [Registrado]</li><li>Notas Rápidas: [Ver Anotações]</li></ul>' },
    { phase: 'execucao', title: '3.7 Desmontagem e Segurança Material', description: 'Desmontar set e garantir a segurança do material gravado.', details: '<ul><li>Desmontagem A/V: OK [HH:MM]</li><li>Checklist Equip.: OK</li><li>Material Gravado Seguro: OK [Resp: Nome]</li><li>Local Limpo: OK</li></ul>' },
    // Fase 4: Pós-Produção e Encerramento
    { phase: 'pos-producao-encerramento', title: '4.1 Backup e Organização Bruto', description: 'Salvar TODO material gravado (mín. 2 cópias) e catalogar.', details: '<ul><li>Backup 1: [Local/HD] / Backup 2: [Nuvem]</li><li>Verificação Integridade: OK</li><li>Organização Pastas: OK</li><li>Planilha Logs: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link]</a></li><li>Concluído: [DD/MM/AAAA] por [Nome]</li></ul>' },
    { phase: 'pos-producao-encerramento', title: '4.2 Edição Vídeo e Áudio', description: 'Montagem, cor, mixagem, trilha.', details: '<ul><li>Resp. Edição Vídeo/Áudio: [Nome/Empresa]</li><li>1º Corte: [DD/MM] / Final: [DD/MM]</li><li>Trilha/Direitos: OK <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Ref]</a></li><li>Finalização (Cor/Master): [DD/MM]</li></ul>' },
    { phase: 'pos-producao-encerramento', title: '4.3 Aprovações Finais', description: 'Obter aprovação final dos cortes pelos stakeholders chave.', details: '<ul><li>Aprovação Interna: [Nome/Data]</li><li>Aprovação Talentos: [Nome/Data]</li><li>Aprovação Patrocinadores: [Nome/Data]</li><li>Versão Master Aprovada: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Final]</a></li></ul>' },
    { phase: 'pos-producao-encerramento', title: '4.4 Criação Materiais Divulgação Pós', description: 'Produzir teasers, trailers, clipes, posts para lançamento.', details: '<ul><li>Peças Definidas: [Lista]</li><li>Materiais Criados: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Pasta]</a></li><li>Textos/Copy: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Aprovação Materiais: [Nome/Data]</li></ul>' },
    { phase: 'pos-producao-encerramento', title: '4.5 Distribuição e Lançamento', description: 'Publicar o conteúdo final nas plataformas definidas.', details: '<ul><li>Cronograma Lançamento: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Calendário]</a></li><li>Uploads (YT, Spotify): OK [Datas]</li><li>Posts Redes Sociais: OK</li><li>Envio Imprensa: OK [Data]</li></ul>' },
    { phase: 'pos-producao-encerramento', title: '4.6 Análise de Métricas Pós-Lançamento', description: 'Coletar e analisar os resultados com base nos KPIs definidos.', details: '<ul><li>Relatório Analytics (YT, Spotify, Social): <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link]</a></li><li>Análise vs KPIs: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Relatório Final: [DD/MM]</li></ul>' },
    { phase: 'pos-producao-encerramento', title: '4.7 Pagamentos Finais e Fechamento Financeiro', description: 'Realizar últimos pagamentos e conciliar o orçamento final.', details: '<ul><li>Pagamentos Finais: OK [Datas]</li><li>Conciliação Orçamento: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Planilha Final]</a></li><li>Relatório Financeiro Final: [DD/MM]</li></ul>' },
    { phase: 'pos-producao-encerramento', title: '4.8 Reunião Pós-Mortem (Lições Aprendidas)', description: 'Analisar o que funcionou, o que não funcionou, e documentar.', details: '<ul><li>Data Reunião: [DD/MM]</li><li>Registro/Ata: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link]</a></li><li>Lições Aprendidas: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Melhorias Próx. Session: Definidas</li></ul>' },
    { phase: 'pos-producao-encerramento', title: '4.9 Arquivamento Final do Projeto', description: 'Organizar e armazenar toda a documentação e material final.', details: '<ul><li>Pasta Digital Final: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Localização/Link]</a></li><li>Brutos Arquivados: [Localização]</li><li>Masters Arquivados: [Localização]</li><li>Docs Arquivados: OK</li></ul>' },
].map(task => ({...task, completed: false })); // Garante que completed seja false por padrão


// --- Funções de Gerenciamento de Dados (LocalStorage) ---
function getAllSessions() { try { return JSON.parse(localStorage.getItem(LS_KEY_SESSION_INDEX) || '[]'); } catch (e) { console.error("Error parsing session index:", e); localStorage.removeItem(LS_KEY_SESSION_INDEX); return []; } }
function saveAllSessions(sessions) { try { localStorage.setItem(LS_KEY_SESSION_INDEX, JSON.stringify(sessions)); } catch (e) { console.error("Error saving session index:", e); showToast('Erro ao salvar índice!', 'error'); } }
function loadSessionTasks(sessionId, includeDeleted = false) { const key = `${LS_KEY_TASKS_PREFIX}${sessionId}`; try { const storedTasks = localStorage.getItem(key); let tasks = storedTasks ? JSON.parse(storedTasks) : []; if (!storedTasks && sessionId !== DEFAULT_SESSION_ID) { console.log(`Initializing tasks for session ${sessionId} from template.`); tasks = defaultTasksTemplate.map(task => ({ ...task, id: crypto.randomUUID(), completed: false })); saveSessionTasks(sessionId, tasks); } return includeDeleted ? tasks : tasks; } catch (e) { console.error(`Error loading tasks for session ${sessionId}:`, e); localStorage.removeItem(key); showToast(`Erro ao carregar tarefas!`, 'error'); return []; } }
function saveSessionTasks(sessionId, tasks) { const key = `${LS_KEY_TASKS_PREFIX}${sessionId}`; try { localStorage.setItem(key, JSON.stringify(tasks)); } catch (e) { console.error(`Error saving tasks:`, e); showToast(`Erro ao salvar tarefas!`, 'error'); } }
function loadDeletedSessionTasks(sessionId) { const key = `${LS_KEY_DELETED_TASKS_PREFIX}${sessionId}`; try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { console.error(`Error loading deleted tasks:`, e); localStorage.removeItem(key); showToast('Erro ao carregar tarefas excluídas!', 'error'); return []; } }
function saveDeletedSessionTasks(sessionId, deletedTasks) { const key = `${LS_KEY_DELETED_TASKS_PREFIX}${sessionId}`; try { localStorage.setItem(key, JSON.stringify(deletedTasks)); } catch (e) { console.error(`Error saving deleted tasks:`, e); showToast('Erro ao salvar tarefas excluídas!', 'error'); } }
function loadSessionNotes(sessionId) { const key = `${LS_KEY_NOTES_PREFIX}${sessionId}`; try { return localStorage.getItem(key) || ''; } catch (e) { console.error(`Error loading notes:`, e); return ''; } }
function saveSessionNotes(sessionId, notes) { const key = `${LS_KEY_NOTES_PREFIX}${sessionId}`; try { localStorage.setItem(key, notes); return true; } catch (e) { console.error(`Error saving notes:`, e); showToast(`Erro ao salvar notas!`, 'error'); return false; } }


// --- Funções Auxiliares de UI ---
function showToast(message, type = 'info') {
    // Tenta encontrar o elemento de status (pode não existir na dashboard)
    const statusElement = document.getElementById('notesStatus');
    if (!statusElement) {
        console.log(`Toast [${type}]: ${message}`); // Fallback para console
        return;
    }
    let className = 'text-xs h-4 flex-grow ';
    switch (type) {
        case 'success': className += 'text-green-600 dark:text-green-400'; break;
        case 'error': className += 'text-red-600 dark:text-red-400'; break;
        default: className += 'text-blue-600 dark:text-blue-400'; // Info
    }
    statusElement.textContent = message;
    statusElement.className = className;
    // Limpa após um tempo
    setTimeout(() => { if (statusElement.textContent === message) statusElement.textContent = ''; }, 3500);
}

function updateFooterInfo() {
    const yearSpan = document.getElementById('currentYear'); // Para dashboard
    const lastUpdatedSpan = document.getElementById('lastUpdated'); // Para session.html
    const appVersionSpan = document.getElementById('appVersion'); // Para session.html

    if(yearSpan) yearSpan.textContent = new Date().getFullYear();

    if (lastUpdatedSpan) {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        lastUpdatedSpan.textContent = `${day}/${month}/${year}`;
    }
     if (appVersionSpan) {
         // Definir a versão atual aqui (pode ser hardcoded ou vir de outro lugar)
         appVersionSpan.textContent = "1.2.0";
     }
}

// --- Funções de Tema ---
function applyTheme(theme) {
    const htmlElement = document.documentElement;
    const sunIcon = document.querySelector('#themeToggle .icon-sun');
    const moonIcon = document.querySelector('#themeToggle .icon-moon');

    if (theme === 'dark') {
      htmlElement.classList.add('dark');
      sunIcon?.classList.replace('block', 'hidden');
      moonIcon?.classList.replace('hidden', 'block');
    } else {
      htmlElement.classList.remove('dark');
      sunIcon?.classList.replace('hidden', 'block');
      moonIcon?.classList.replace('block', 'hidden');
    }
     // Re-inicializa icones LDEPOIS de mudar a classe dark/light
     if (typeof lucide !== 'undefined') {
        try { lucide.createIcons(); } catch (e) { console.error("Lucide error on theme change:", e); }
    }
  }

function toggleTheme() {
    const htmlElement = document.documentElement;
    const currentTheme = htmlElement.classList.contains('dark') ? 'light' : 'dark';
    try {
        localStorage.setItem(LS_KEY_THEME, currentTheme);
    } catch (error) {
        console.error("Failed to save theme preference:", error);
    }
    applyTheme(currentTheme);
  }

function loadTheme() {
    let savedTheme = 'light'; // Default
    try {
        savedTheme = localStorage.getItem(LS_KEY_THEME) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } catch (error) {
        console.error("Failed to load theme preference:", error);
        savedTheme = (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    applyTheme(savedTheme);
  }

// --- Função Auxiliar para URL ---
function getCurrentSessionIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlSessionId = urlParams.get('session');
    // Retorna null se não encontrar ou for vazio, para forçar redirecionamento
    return urlSessionId && urlSessionId.trim() !== '' ? urlSessionId.trim() : null;
}