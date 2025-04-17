document.addEventListener('DOMContentLoaded', () => {
  // --- Seletores Globais ---
  const themeToggleButton = document.getElementById('themeToggle');
  const htmlElement = document.documentElement;
  const progressBar = document.getElementById('progressBar');
  const progressPercentage = document.getElementById('progressPercentage');
  const phaseNavContainer = document.querySelector('nav[role="tablist"]');
  const phaseContentContainer = document.getElementById('phaseContentContainer'); // Container para DELEGAÇÃO de eventos de tarefa
  const notesTextarea = document.getElementById('projectNotes');
  const saveNotesButton = document.getElementById('saveNotesBtn');
  const notesStatus = document.getElementById('notesStatus');
  const sessionTitleElement = document.getElementById('sessionTitle');
  const sessionNumberTitleSpan = document.getElementById('sessionNumberTitle');
  const sessionNumberNotesTitleSpan = document.getElementById('sessionNumberNotesTitle');
  const appVersionSpan = document.getElementById('appVersion');
  const lastUpdatedSpan = document.getElementById('lastUpdated');
  const renameSessionBtn = document.getElementById('renameSessionBtn');
  const deleteSessionBtn = document.getElementById('deleteSessionBtn');
  const goToDashboardBtn = document.getElementById('goToDashboardBtn');

  // --- Constantes ---
  const LS_KEY_THEME = 'themePreference';
  const LS_KEY_SESSION_INDEX = 'session_index';
  const LS_KEY_TASKS_PREFIX = 'session_tasks_';
  const LS_KEY_NOTES_PREFIX = 'session_notes_';
  const DEFAULT_SESSION_ID = 'default_session';

  // --- Template Padrão de Tarefas (usando crypto.randomUUID()) ---
  const defaultTasksTemplate = [
      // Fase 1: Definição e Iniciação
      { id: crypto.randomUUID(), phase: 'definicao-iniciacao', title: '1.1 Objetivos Específicos', description: 'Definir metas claras para esta session.', details: '<ul><li>Ex: Gravar Temporada #[X] (6 episódios 30 min).</li><li>Ex: Capturar entrevistas (Artistas + [Y] Convidados).</li><li>Ex: Link Metas: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Adicionar Link]</a></li></ul>', completed: false },
      { id: crypto.randomUUID(), phase: 'definicao-iniciacao', title: '1.2 Confirmação Chave', description: 'Bloquear data, local e talentos principais.', details: '<ul><li>Data Confirmada: [DD/MM/AAAA HH:MM]</li><li>Local Confirmado: [Nome] - <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Contrato]</a></li><li>Talentos Confirmados: [Nomes]</li></ul>', completed: false },
      { id: crypto.randomUUID(), phase: 'definicao-iniciacao', title: '1.3 Orçamento Preliminar', description: 'Estimativa inicial de custos e validação de verba.', details: '<ul><li>Estimativa: R$ [Valor] / Verba: R$ [Valor]</li><li>Planilha Preliminar: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Adicionar Link]</a></li><li>Aprovação: [Nome/Data]</li></ul>', completed: false },
      { id: crypto.randomUUID(), phase: 'definicao-iniciacao', title: '1.4 Definição Equipe Core', description: 'Atribuir responsabilidades chave da produção.', details: '<ul><li>Prod. Executiva: [Nome]</li><li>Direção/Artístico: [Nome]</li><li>Técnico A/V: [Nome/Empresa]</li><li>Comunicação: [Nome]</li><li>Financeiro: [Nome]</li></ul>', completed: false },
      // Fase 2: Planejamento e Preparação
      { id: crypto.randomUUID(), phase: 'planejamento-preparacao', title: '2.1 Cronograma Detalhado', description: 'Definir todas as datas e prazos chave.', details: '<ul><li>Datas VTs: [DD/MM]</li><li>Run-of-Show: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Cronograma Completo: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Planilha]</a></li><li>Prazos Pós: [Datas]</li></ul>', completed: false },
      { id: crypto.randomUUID(), phase: 'planejamento-preparacao', title: '2.2 Orçamento Detalhado e Fluxo', description: 'Finalizar planilha de custos e cronograma de pagamentos.', details: '<ul><li>Planilha Final: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link]</a></li><li>Fluxo Pagamentos: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Aprovação Final: [Nome/Data]</li></ul>', completed: false },
      { id: crypto.randomUUID(), phase: 'planejamento-preparacao', title: '2.3 Roteiro e Conteúdo', description: 'Definir estrutura dos episódios, pautas, perguntas.', details: '<ul><li>Estrutura Geral: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Roteiros/Pautas: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Pasta]</a></li><li>Aprovação Final: [Nome/Data]</li></ul>', completed: false },
      { id: crypto.randomUUID(), phase: 'planejamento-preparacao', title: '2.4 Plano Técnico (A/V)', description: 'Definir equipamentos, rider, mapa de palco/luz.', details: '<ul><li>Lista Equipamentos: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link]</a></li><li>Mapa Palco/Luz: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Imagem]</a></li><li>Plano Áudio: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Fornecedor: [Nome/Contato]</li></ul>', completed: false },
      { id: crypto.randomUUID(), phase: 'planejamento-preparacao', title: '2.5 Plano de Comunicação (Pré)', description: 'Estratégia divulgação pré-gravação, convites, redes sociais.', details: '<ul><li>Estratégia: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Lista Convidados: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link]</a></li><li>Cronograma Posts: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link]</a></li></ul>', completed: false },
      { id: crypto.randomUUID(), phase: 'planejamento-preparacao', title: '2.6 Design e Identidade Visual', description: 'Finalizar cenografia, artes gráficas (GCs, vinhetas).', details: '<ul><li>Projeto Cenográfico: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Desenho]</a></li><li>Pacote Gráfico: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Pasta]</a></li><li>Aprovação Final: [Nome/Data]</li></ul>', completed: false },
      { id: crypto.randomUUID(), phase: 'planejamento-preparacao', title: '2.7 Contratos e Acordos', description: 'Formalizar todos os acordos legais e financeiros.', details: '<ul><li>Contratos Talentos: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Pasta]</a></li><li>Contrato Local: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Ref]</a></li><li>Seguro: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Apólice Ref]</a></li></ul>', completed: false },
      { id: crypto.randomUUID(), phase: 'planejamento-preparacao', title: '2.8 Logística Detalhada', description: 'Planejar transporte, alimentação, hospedagem, credenciamento.', details: '<ul><li>Plano Transporte: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Hospedagem: [Confirmações]</li><li>Catering: [Cardápio/Ref]</li><li>Credenciais: OK</li></ul>', completed: false },
      { id: crypto.randomUUID(), phase: 'planejamento-preparacao', title: '2.9 Plano de Contingência', description: 'Identificar riscos e planejar soluções alternativas (Plano B, C).', details: '<ul><li>Mapeamento Riscos: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Planos B (Téc, Pessoal, Log): Definidos</li><li>Contatos Emergência: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li></ul>', completed: false },
      { id: crypto.randomUUID(), phase: 'planejamento-preparacao', title: '2.10 Definição Métricas Sucesso', description: 'Estabelecer KPIs para avaliar o resultado da session.', details: '<ul><li>KPIs Produção: [...]</li><li>KPIs Conteúdo: [...]</li><li>KPIs Audiência: [...]</li><li>KPIs Negócio: [...]</li><li>Doc Métricas: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link]</a></li></ul>', completed: false },
      { id: crypto.randomUUID(), phase: 'planejamento-preparacao', title: '2.11 Reunião Geral Alinhamento Final', description: 'Kick-off final com toda a equipe chave antes da execução.', details: '<ul><li>Data: [DD/MM/AAAA]</li><li>Pauta: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Ata/Registro: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link]</a></li></ul>', completed: false },
      // Fase 3: Execução
      { id: crypto.randomUUID(), phase: 'execucao', title: '3.1 Montagem e Testes Finais', description: 'Preparar set, equipamentos e verificar tudo no local.', details: '<ul><li>Montagem A/V: OK [HH:MM]</li><li>Passagem Som/Luz/Rec: OK [HH:MM]</li><li>Cenário/Arte: OK [HH:MM]</li><li>Comunicação Interna: OK</li></ul>', completed: false },
      { id: crypto.randomUUID(), phase: 'execucao', title: '3.2 Recepção e Briefing Final', description: 'Receber artistas, convidados e alinhar últimos detalhes.', details: '<ul><li>Talentos Chegaram: [HH:MM] / Briefing OK: [HH:MM]</li><li>Convidados Chegaram: [HH:MM] / Recepção OK</li><li>Briefing Equipe Final: [HH:MM]</li></ul>', completed: false },
      { id: crypto.randomUUID(), phase: 'execucao', title: '3.3 Gravação Blocos/Episódios', description: 'Executar a gravação conforme o run-of-show.', details: '<ul><li>Início REC: [HH:MM] / Fim REC: [HH:MM]</li><li>Run-of-Show Seguido: [Sim/Não - Obs]</li><li>Check A/V Periódico: OK</li></ul>', completed: false },
      { id: crypto.randomUUID(), phase: 'execucao', title: '3.4 Captura Conteúdo Adicional', description: 'Gravar material extra (bastidores, entrevistas, docs).', details: '<ul><li>Entrevistas Gravadas: [HH:MM - HH:MM]</li><li>Imagens Making-of: Capturadas</li><li>Termos Imagem Coletados: OK</li></ul>', completed: false },
      { id: crypto.randomUUID(), phase: 'execucao', title: '3.5 Gestão de Imprevistos', description: 'Lidar com problemas que surgirem durante a gravação.', details: '<ul><li>Problemas Ocorridos: [Descrever ou N/A]</li><li>Solução Aplicada: [Descrever]</li><li>Plano Contingência Usado: [Sim/Não - Qual?]</li></ul>', completed: false },
      { id: crypto.randomUUID(), phase: 'execucao', title: '3.6 Coleta Feedback Imediato', description: 'Conversa rápida com equipe e artistas sobre a experiência.', details: '<ul><li>Feedback Equipe: [Registrado]</li><li>Feedback Talentos: [Registrado]</li><li>Notas Rápidas: [Ver Anotações]</li></ul>', completed: false },
      { id: crypto.randomUUID(), phase: 'execucao', title: '3.7 Desmontagem e Segurança Material', description: 'Desmontar set e garantir a segurança do material gravado.', details: '<ul><li>Desmontagem A/V: OK [HH:MM]</li><li>Checklist Equip.: OK</li><li>Material Gravado Seguro: OK [Resp: Nome]</li><li>Local Limpo: OK</li></ul>', completed: false },
      // Fase 4: Pós-Produção e Encerramento
      { id: crypto.randomUUID(), phase: 'pos-producao-encerramento', title: '4.1 Backup e Organização Bruto', description: 'Salvar TODO material gravado (mín. 2 cópias) e catalogar.', details: '<ul><li>Backup 1: [Local/HD] / Backup 2: [Nuvem]</li><li>Verificação Integridade: OK</li><li>Organização Pastas: OK</li><li>Planilha Logs: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link]</a></li><li>Concluído: [DD/MM/AAAA] por [Nome]</li></ul>', completed: false },
      { id: crypto.randomUUID(), phase: 'pos-producao-encerramento', title: '4.2 Edição Vídeo e Áudio', description: 'Montagem, cor, mixagem, trilha.', details: '<ul><li>Resp. Edição Vídeo/Áudio: [Nome/Empresa]</li><li>1º Corte: [DD/MM] / Final: [DD/MM]</li><li>Trilha/Direitos: OK <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Ref]</a></li><li>Finalização (Cor/Master): [DD/MM]</li></ul>', completed: false },
      { id: crypto.randomUUID(), phase: 'pos-producao-encerramento', title: '4.3 Aprovações Finais', description: 'Obter aprovação final dos cortes pelos stakeholders chave.', details: '<ul><li>Aprovação Interna: [Nome/Data]</li><li>Aprovação Talentos: [Nome/Data]</li><li>Aprovação Patrocinadores: [Nome/Data]</li><li>Versão Master Aprovada: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Final]</a></li></ul>', completed: false },
      { id: crypto.randomUUID(), phase: 'pos-producao-encerramento', title: '4.4 Criação Materiais Divulgação Pós', description: 'Produzir teasers, trailers, clipes, posts para lançamento.', details: '<ul><li>Peças Definidas: [Lista]</li><li>Materiais Criados: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Pasta]</a></li><li>Textos/Copy: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Aprovação Materiais: [Nome/Data]</li></ul>', completed: false },
      { id: crypto.randomUUID(), phase: 'pos-producao-encerramento', title: '4.5 Distribuição e Lançamento', description: 'Publicar o conteúdo final nas plataformas definidas.', details: '<ul><li>Cronograma Lançamento: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Calendário]</a></li><li>Uploads (YT, Spotify): OK [Datas]</li><li>Posts Redes Sociais: OK</li><li>Envio Imprensa: OK [Data]</li></ul>', completed: false },
      { id: crypto.randomUUID(), phase: 'pos-producao-encerramento', title: '4.6 Análise de Métricas Pós-Lançamento', description: 'Coletar e analisar os resultados com base nos KPIs definidos.', details: '<ul><li>Relatório Analytics (YT, Spotify, Social): <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link]</a></li><li>Análise vs KPIs: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Relatório Final: [DD/MM]</li></ul>', completed: false },
      { id: crypto.randomUUID(), phase: 'pos-producao-encerramento', title: '4.7 Pagamentos Finais e Fechamento Financeiro', description: 'Realizar últimos pagamentos e conciliar o orçamento final.', details: '<ul><li>Pagamentos Finais: OK [Datas]</li><li>Conciliação Orçamento: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Planilha Final]</a></li><li>Relatório Financeiro Final: [DD/MM]</li></ul>', completed: false },
      { id: crypto.randomUUID(), phase: 'pos-producao-encerramento', title: '4.8 Reunião Pós-Mortem (Lições Aprendidas)', description: 'Analisar o que funcionou, o que não funcionou, e documentar.', details: '<ul><li>Data Reunião: [DD/MM]</li><li>Registro/Ata: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link]</a></li><li>Lições Aprendidas: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Melhorias Próx. Session: Definidas</li></ul>', completed: false },
      { id: crypto.randomUUID(), phase: 'pos-producao-encerramento', title: '4.9 Arquivamento Final do Projeto', description: 'Organizar e armazenar toda a documentação e material final.', details: '<ul><li>Pasta Digital Final: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Localização/Link]</a></li><li>Brutos Arquivados: [Localização]</li><li>Masters Arquivados: [Localização]</li><li>Docs Arquivados: OK</li></ul>', completed: false },
  ];

  // --- Variáveis de Estado ---
  let currentSessionId = DEFAULT_SESSION_ID; // Será atualizado em initializeApp

  // --- Funções de Gerenciamento de Dados (LocalStorage) ---
  // (Incluir aqui as funções getAllSessions, saveAllSessions, loadSessionTasks,
  // saveSessionTasks, loadSessionNotes, saveSessionNotes da resposta anterior)
    /** Obtém o índice de todas as sessions do localStorage */
    function getAllSessions() {
        try {
            return JSON.parse(localStorage.getItem(LS_KEY_SESSION_INDEX) || '[]');
        } catch (e) {
            console.error("Error parsing session index:", e);
            localStorage.removeItem(LS_KEY_SESSION_INDEX); // Limpa índice corrompido
            return [];
        }
    }
    /** Salva o índice de sessions no localStorage */
    function saveAllSessions(sessions) {
        try {
            localStorage.setItem(LS_KEY_SESSION_INDEX, JSON.stringify(sessions));
        } catch (e) {
            console.error("Error saving session index:", e);
            showToast('Erro ao salvar índice de sessions!', 'error');
        }
    }
    /** Carrega as tarefas de uma session específica, inicializando do template se necessário */
    function loadSessionTasks(sessionId) {
        const key = `${LS_KEY_TASKS_PREFIX}${sessionId}`;
        try {
            const storedTasks = localStorage.getItem(key);
            if (storedTasks) {
                // TODO: Adicionar validação/migração de schema se a estrutura da tarefa mudar no futuro
                return JSON.parse(storedTasks);
            } else if (sessionId !== DEFAULT_SESSION_ID) { // Só inicializa se não for a default
                console.log(`No tasks found for session ${sessionId}, initializing from template.`);
                // Deep copy do template para evitar mutações acidentais
                const newSessionTasks = JSON.parse(JSON.stringify(defaultTasksTemplate));
                // Atribui IDs únicos baseados em UUID na criação real, se necessário
                // newSessionTasks.forEach(task => task.id = crypto.randomUUID()); // Garante IDs únicos por session
                saveSessionTasks(sessionId, newSessionTasks); // Salva a cópia inicial
                return newSessionTasks;
            } else {
                return []; // Default session não tem tarefas por padrão
            }
        } catch (e) {
            console.error(`Error loading or parsing tasks for session ${sessionId}:`, e);
            localStorage.removeItem(key); // Limpa dados corrompidos
            showToast(`Erro ao carregar tarefas da session ${sessionId}!`, 'error');
            return [];
        }
    }
    /** Salva as tarefas de uma session específica */
    function saveSessionTasks(sessionId, tasks) {
        const key = `${LS_KEY_TASKS_PREFIX}${sessionId}`;
        try {
            localStorage.setItem(key, JSON.stringify(tasks));
        } catch (e) {
            console.error(`Error saving tasks for session ${sessionId}:`, e);
            showToast(`Erro ao salvar tarefas da session ${sessionId}!`, 'error');
        }
    }
    /** Carrega as notas de uma session específica */
    function loadSessionNotes(sessionId) {
        const key = `${LS_KEY_NOTES_PREFIX}${sessionId}`;
        try {
            return localStorage.getItem(key) || '';
        } catch (e) {
            console.error(`Error loading notes for session ${sessionId}:`, e);
            return '';
        }
    }
    /** Salva as notas de uma session específica */
    function saveSessionNotes(sessionId, notes) {
        const key = `${LS_KEY_NOTES_PREFIX}${sessionId}`;
        try {
            localStorage.setItem(key, notes);
            return true; // Indica sucesso
        } catch (e) {
            console.error(`Error saving notes for session ${sessionId}:`, e);
            showToast(`Erro ao salvar anotações da session ${sessionId}!`, 'error');
            return false; // Indica falha
        }
    }

  // --- Funções Auxiliares e de UI ---
    /** Obtém o ID da sessão atual da URL ou retorna o padrão */
    function getCurrentSessionIdFromUrl() { /* ... (código da resposta anterior) ... */ }
    /** Atualiza os elementos da UI com nome/número da session */
    function updateSessionDisplayInfo(sessionId) { /* ... (código da resposta anterior) ... */ }
    /** Atualiza informações no rodapé (versão e data) */
    function updateFooterInfo() { /* ... (código da resposta anterior) ... */ }
    /** Mostra feedback temporário */
    function showToast(message, type = 'info') { /* ... (código da resposta anterior) ... */ }
    /** Aplica o tema (dark ou light) à UI */
    function applyTheme(theme) { /* ... (código da resposta anterior) ... */ }
    /** Alterna entre os temas claro e escuro e salva a preferência */
    function toggleTheme() { /* ... (código da resposta anterior, usando LS_KEY_THEME) ... */ }
    /** Carrega o tema salvo ou prefere o do sistema */
    function loadTheme() { /* ... (código da resposta anterior, usando LS_KEY_THEME) ... */ }
    /** Alterna a visibilidade e o estado ativo para a fase selecionada */
    function switchPhase(targetPhase) { /* ... (código da resposta anterior) ... */ }
    /** Atualiza a barra de progresso para a session atual */
    function updateProgressBar(sessionId) { /* ... (código da resposta anterior) ... */ }
     /** Função auxiliar para gerar o HTML de um único card */
    function createTaskCardHtml(task) { /* ... (código da resposta anterior) ... */ }

    // --- Renderização Dinâmica ---
    /** Renderiza os cards de tarefa para a session atual nas respectivas fases */
    function renderTasks(sessionId) {
        console.log(`Rendering tasks for session: ${sessionId}`);
        const tasks = loadSessionTasks(sessionId);
        const taskLists = {
            'definicao-iniciacao': document.querySelector('#definicao-iniciacao-content .task-list'),
            'planejamento-preparacao': document.querySelector('#planejamento-preparacao-content .task-list'),
            'execucao': document.querySelector('#execucao-content .task-list'),
            'pos-producao-encerramento': document.querySelector('#pos-producao-encerramento-content .task-list'),
        };

        // Limpa listas existentes e placeholders
        Object.values(taskLists).forEach(list => {
            if (list) list.innerHTML = '';
        });

        // Verifica se há tarefas para renderizar
        if (!tasks || tasks.length === 0) {
             let message = "Nenhuma tarefa encontrada para esta session.";
             if (sessionId === DEFAULT_SESSION_ID) {
                 message = 'Este é o guia geral. Crie ou selecione uma session no dashboard.';
             }
             Object.values(taskLists).forEach(list => {
                 if (list) list.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 italic p-4">${message}</p>`;
             });
             updateProgressBar(sessionId); // Garante que a barra esteja em 0%
             if (typeof lucide !== 'undefined') lucide.createIcons(); // Atualiza ícones (caso haja algum fora das tarefas)
             return;
        }

        // Agrupa tarefas por fase para inserção otimizada
        const tasksByPhase = tasks.reduce((acc, task) => {
            if (!acc[task.phase]) acc[task.phase] = [];
            acc[task.phase].push(task);
            return acc;
        }, {});

        // Cria e insere os cards por fase
        Object.entries(tasksByPhase).forEach(([phase, phaseTasks]) => {
            const listContainer = taskLists[phase];
            if (listContainer) {
                const fragment = document.createDocumentFragment(); // Usar fragmento para performance
                phaseTasks.forEach(task => {
                    const cardWrapper = document.createElement('div'); // Wrapper para facilitar innerHTML
                    cardWrapper.innerHTML = createTaskCardHtml(task);
                    fragment.appendChild(cardWrapper.firstElementChild); // Adiciona o card real ao fragmento
                });
                listContainer.appendChild(fragment); // Adiciona todos os cards da fase de uma vez
            }
        });

        // (Re)Inicializar ícones Lucide APÓS adicionar os elementos ao DOM
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        } else {
            console.warn("Lucide library not loaded, icons may not appear.");
        }

        updateProgressBar(sessionId); // Atualiza a barra após renderizar
    }


  // --- Handlers de Eventos (Delegação) ---

  /** Handler unificado para eventos dentro do container das fases */
  function handleCardEvents(event) {
      const target = event.target; // Elemento que disparou o evento

      // Checkbox Change
      if (target.matches('.task-checkbox')) {
          // O evento 'change' dispara no checkbox
          handleCheckboxChange(target, currentSessionId); // Passa o ID da session atual
      }
      // Click em Botões (usar closest para pegar o botão mesmo se clicar no ícone)
      else {
          const deleteButton = target.closest('.delete-task-btn');
          const editDetailsButton = target.closest('.edit-task-details-btn');

          if (deleteButton) {
              handleDeleteTask(deleteButton, currentSessionId);
          } else if (editDetailsButton) {
              handleEditTaskDetails(editDetailsButton, currentSessionId);
          }
      }
  }

  /** Manipulador para mudança de estado de um checkbox de tarefa */
  function handleCheckboxChange(checkbox, sessionId) { /* ... (código da resposta anterior) ... */ }
  /** Manipulador para o botão 'Excluir Tarefa' */
  function handleDeleteTask(button, sessionId) { /* ... (código da resposta anterior, re-renderiza com renderTasks) ... */
       const taskId = button.dataset.taskId;
        const tasks = loadSessionTasks(sessionId);
        const task = tasks.find(t => t.id === taskId);
        const taskTitle = task ? task.title : taskId;

        if (confirm(`Tem certeza que deseja excluir a tarefa "${taskTitle}" desta session?`)) {
            let updatedTasks = tasks.filter(task => task.id !== taskId);
            saveSessionTasks(sessionId, updatedTasks);
            renderTasks(sessionId); // Re-renderiza a lista da session atual
            showToast('Tarefa excluída com sucesso!', 'success');
        }
  }
  /** Manipulador para o botão 'Editar Detalhes' */
    function handleEditTaskDetails(button, sessionId) {
        const taskId = button.dataset.taskId;
        const tasks = loadSessionTasks(sessionId);
        const taskIndex = tasks.findIndex(t => t.id === taskId);

        if (taskIndex > -1) {
            const task = tasks[taskIndex];
            const currentDetails = task.details || '';
            // **ALERTA:** Usar prompt para HTML é PÉSSIMO para UX e segurança.
            // Ideal seria um modal com um editor de texto rico (mesmo que simples) ou textarea.
            const newDetails = prompt(`Editar detalhes para "${task.title}":\n(Cuidado! Use HTML válido. Ex: <ul><li>Item</li><li><a href='...'>Link</a></li></ul>)`, currentDetails);

            // Verifica se o usuário não cancelou (null) e se o conteúdo mudou
            if (newDetails !== null && newDetails !== currentDetails) {
                tasks[taskIndex].details = newDetails;
                saveSessionTasks(sessionId, tasks);
                renderTasks(sessionId); // Re-renderiza TUDO para simplicidade e garantir atualização correta
                showToast('Detalhes da tarefa atualizados!', 'success');
            } else if (newDetails !== null) {
                 showToast('Nenhuma alteração feita.', 'info');
            }
        } else {
            console.error(`Task with ID ${taskId} not found for editing details.`);
            showToast('Erro: Tarefa não encontrada.', 'error');
        }
    }

  // --- Lógica das Anotações ---
  let saveNoteTimeout;
  let noteTypingTimeout;
  /** Salva as notas da session atual */
  function saveNotesHandler(sessionId) { /* ... (código da resposta anterior) ... */ }
  /** Handler para input de notas com auto-save */
  function handleNotesInput(sessionId) { /* ... (código da resposta anterior) ... */ }
  /** Carrega as notas da session atual */
  function loadNotes(sessionId) { /* ... (código da resposta anterior) ... */ }

  // --- Funções CRUD para Sessions (Disparadas pelos botões no Header) ---
    /** Renomeia a session atual */
    function renameCurrentSession(sessionId) {
        if (!sessionId || sessionId === DEFAULT_SESSION_ID) {
            showToast("Não é possível renomear a session padrão.", 'info');
            return;
        }
        const sessions = getAllSessions();
        const sessionIndex = sessions.findIndex(s => s.id === sessionId);

        if (sessionIndex > -1) {
            const currentName = sessions[sessionIndex].name;
            const newName = prompt(`Renomear Session "${currentName}":`, currentName);

            if (newName && newName.trim() !== '' && newName.trim() !== currentName) {
                sessions[sessionIndex].name = newName.trim();
                saveAllSessions(sessions);
                updateSessionDisplayInfo(sessionId); // Atualiza título na UI
                showToast("Session renomeada com sucesso!", 'success');
            } else if (newName !== null) { // Não cancelou, mas nome inválido ou igual
                showToast("Nome inválido ou não modificado.", 'info');
            }
        } else {
             showToast("Erro: Session atual não encontrada no índice.", 'error');
        }
    }
    /** Exclui a session atual */
    function deleteCurrentSession(sessionId) {
         if (!sessionId || sessionId === DEFAULT_SESSION_ID) {
             showToast("Não é possível excluir a session padrão.", 'info');
             return;
         }
         const sessions = getAllSessions();
         const sessionToDelete = sessions.find(s => s.id === sessionId);

         if (sessionToDelete && confirm(`Tem certeza que deseja EXCLUIR PERMANENTEMENTE a Session "${sessionToDelete.name}" e todos os seus dados (tarefas e notas)? ESTA AÇÃO NÃO PODE SER DESFEITA.`)) {
             // Remove do índice
             const updatedSessions = sessions.filter(s => s.id !== sessionId);
             saveAllSessions(updatedSessions);

             // Remove dados específicos da session
             try {
                 localStorage.removeItem(`${LS_KEY_TASKS_PREFIX}${sessionId}`);
                 localStorage.removeItem(`${LS_KEY_NOTES_PREFIX}${sessionId}`);
             } catch (e) {
                 console.error(`Error removing data for deleted session ${sessionId}:`, e);
                 showToast('Erro ao remover dados da session excluída!', 'error');
             }

             showToast(`Session "${sessionToDelete.name}" excluída. Redirecionando...`, 'success');
             // Redireciona para o dashboard após exclusão
             setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
         }
    }

  // --- Inicialização Geral ---
  function initializeApp() {
      console.log("Initializing Sons & Sessions Guide...");
      currentSessionId = getCurrentSessionIdFromUrl(); // Define o ID da session atual

      updateSessionDisplayInfo(currentSessionId); // Atualiza títulos/nomes
      updateFooterInfo();
      loadTheme();

      renderTasks(currentSessionId); // Renderiza tarefas da session atual
      loadNotes(currentSessionId); // Carrega notas da session atual

      // --- Adiciona Listeners ---

      // Delegação para eventos de tarefa (change e click)
      if (phaseContentContainer) {
          // Adiciona um listener para 'change' (checkboxes)
          phaseContentContainer.addEventListener('change', handleCardEvents);
          // Adiciona um listener para 'click' (botões delete/edit, links nos detalhes)
          phaseContentContainer.addEventListener('click', handleCardEvents);
      } else {
          console.error("Critical: Phase content container not found. Task interactions will fail.");
      }

      // Listeners Gerais (Botões do Header, Navegação de Fase, Notas)
      themeToggleButton?.addEventListener('click', toggleTheme);
      phaseNavContainer?.addEventListener('click', (event) => {
          const button = event.target.closest('.phase-nav-btn');
          if (button && !button.classList.contains('active') && button.dataset.phase) {
              switchPhase(button.dataset.phase);
          }
      });
      saveNotesButton?.addEventListener('click', () => saveNotesHandler(currentSessionId));
      notesTextarea?.addEventListener('input', () => handleNotesInput(currentSessionId));
      renameSessionBtn?.addEventListener('click', () => renameCurrentSession(currentSessionId));
      deleteSessionBtn?.addEventListener('click', () => deleteCurrentSession(currentSessionId));
      goToDashboardBtn?.addEventListener('click', () => {
           // Garantir que o dashboard exista
           window.location.href = 'dashboard.html'; // Mude se o nome for diferente
      });

      // Inicializar Ícones Lucide (chamar DEPOIS de renderTasks inicial)
      if (typeof lucide !== 'undefined') {
          try {
              lucide.createIcons();
          } catch (e) {
              console.error("Error creating Lucide icons:", e);
          }
      } else {
          console.warn("Lucide library not loaded, icons may not appear.");
      }

      // Foco inicial na primeira aba
      const initialActiveButton = phaseNavContainer?.querySelector('.phase-nav-btn.active');
      initialActiveButton?.focus();

      console.log(`Initialization complete for Session: ${currentSessionId}`);
  }

  // --- Executa a inicialização ---
  try {
      initializeApp();
  } catch (error) {
      console.error("FATAL ERROR during initialization:", error);
      // Tentar mostrar um erro para o usuário de forma simples
      document.body.innerHTML = `<div style="padding: 20px; text-align: center; color: red; font-family: sans-serif;">
          <h1>Erro Crítico</h1>
          <p>Ocorreu um erro ao carregar o Guia Prático. Verifique o console do navegador (F12) para detalhes.</p>
          <p>${error.message}</p>
      </div>`;
  }

}); // Fim do DOMContentLoaded
