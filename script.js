document.addEventListener('DOMContentLoaded', () => {
  // --- Seletores Globais ---
  const themeToggleButton = document.getElementById('themeToggle');
  const htmlElement = document.documentElement;
  const progressBar = document.getElementById('progressBar');
  const progressPercentage = document.getElementById('progressPercentage');
  const phaseNavContainer = document.querySelector('nav[role="tablist"]');
  const phaseNavButtons = document.querySelectorAll('.phase-nav-btn');
  const phaseContentContainer = document.getElementById('phaseContentContainer'); // Para add listeners de tarefa
  const notesTextarea = document.getElementById('projectNotes');
  const saveNotesButton = document.getElementById('saveNotesBtn'); // ID atualizado
  const notesStatus = document.getElementById('notesStatus');
  const sessionTitleElement = document.getElementById('sessionTitle'); // H2 inteiro
  const sessionNumberTitleSpan = document.getElementById('sessionNumberTitle'); // Span dentro do H2
  //const sessionNumberIntro = document.getElementById('sessionNumberIntro'); // Removido do HTML atualizado
  const sessionNumberNotesTitleSpan = document.getElementById('sessionNumberNotesTitle'); // Span dentro do H3
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
  const DEFAULT_SESSION_ID = 'default_session'; // Fallback se nenhum ID for encontrado

  // --- Template Padrão de Tarefas ---
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

  // --- Variáveis Globais ---
  let currentSessionId = DEFAULT_SESSION_ID; // ID da session ativa

  // --- Funções de Gerenciamento de Dados ---

  /** Obtém o índice de todas as sessions do localStorage */
  function getAllSessions() { /* ... (código da resposta anterior) ... */ }
  /** Salva o índice de sessions no localStorage */
  function saveAllSessions(sessions) { /* ... (código da resposta anterior) ... */ }
  /** Carrega as tarefas de uma session específica, inicializando do template se necessário */
  function loadSessionTasks(sessionId) { /* ... (código da resposta anterior, incluindo deep copy) ... */ }
  /** Salva as tarefas de uma session específica */
  function saveSessionTasks(sessionId, tasks) { /* ... (código da resposta anterior) ... */ }
  /** Carrega as notas de uma session específica */
  function loadSessionNotes(sessionId) { /* ... (código da resposta anterior) ... */ }
  /** Salva as notas de uma session específica */
  function saveSessionNotes(sessionId, notes) { /* ... (código da resposta anterior) ... */ }

  // --- Funções Auxiliares ---

  /** Obtém o ID da sessão atual da URL ou retorna o padrão */
  function getCurrentSessionIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlSessionId = urlParams.get('session');
    // Validar minimamente se parece um ID razoável (opcional)
    return urlSessionId ? urlSessionId : DEFAULT_SESSION_ID;
  }

  /** Atualiza os elementos da UI com nome/número da session */
  function updateSessionDisplayInfo(sessionId) {
    let displayName = `Session Padrão`; // Fallback
    let displayIdForTitle = '';
    if (sessionId && sessionId !== DEFAULT_SESSION_ID) {
        const sessions = getAllSessions();
        const sessionData = sessions.find(s => s.id === sessionId);
        displayName = sessionData ? sessionData.name : `Session #${sessionId}`;
        displayIdForTitle = `#${sessionId}`;
    } else {
         // Lógica para quando for a default session (talvez desabilitar rename/delete?)
         renameSessionBtn?.setAttribute('disabled', '');
         deleteSessionBtn?.setAttribute('disabled', '');
         displayName = "Guia Prático Geral"; // Ou algo indicativo
    }

    // Atualiza o H2 e o título da página
    if (sessionNumberTitleSpan) sessionNumberTitleSpan.textContent = displayName;
    document.title = `Sons & Sessions | ${displayName}`;

    // Atualiza o H3 das Anotações
    if (sessionNumberNotesTitleSpan) sessionNumberNotesTitleSpan.textContent = displayName;

     // Habilita/Desabilita botões se não for default
    if (sessionId !== DEFAULT_SESSION_ID) {
        renameSessionBtn?.removeAttribute('disabled');
        deleteSessionBtn?.removeAttribute('disabled');
    }
  }

  /** Atualiza informações no rodapé (versão e data) */
  function updateFooterInfo() { /* ... (código da resposta anterior) ... */ }

  /** Mostra feedback temporário */
  function showToast(message, type = 'info') {
      if (!notesStatus) return;
      let className = 'text-xs h-4 flex-grow ';
      switch (type) {
          case 'success': className += 'text-green-600 dark:text-green-400'; break;
          case 'error': className += 'text-red-600 dark:text-red-400'; break;
          default: className += 'text-blue-600 dark:text-blue-400'; // Info
      }
      notesStatus.textContent = message;
      notesStatus.className = className;
      setTimeout(() => { if (notesStatus.textContent === message) notesStatus.textContent = ''; }, 3500);
  }

  // --- Lógica do Tema ---
  function applyTheme(theme) { /* ... (código da resposta anterior) ... */ }
  function toggleTheme() { /* ... (código da resposta anterior, usando LS_KEY_THEME) ... */ }
  function loadTheme() { /* ... (código da resposta anterior, usando LS_KEY_THEME) ... */ }

  // --- Lógica da Navegação por Fases ---
  function switchPhase(targetPhase) { /* ... (código da resposta anterior) ... */ }

  // --- Lógica das Tarefas (Renderização e Ações) ---

  /** Renderiza os cards de tarefa para a session atual */
  function renderTasks(sessionId) {
      const tasks = loadSessionTasks(sessionId);
      const taskLists = {
          'definicao-iniciacao': document.querySelector('#definicao-iniciacao-content .task-list'),
          'planejamento-preparacao': document.querySelector('#planejamento-preparacao-content .task-list'),
          'execucao': document.querySelector('#execucao-content .task-list'),
          'pos-producao-encerramento': document.querySelector('#pos-producao-encerramento-content .task-list'),
      };

      // Limpa placeholders e listas existentes
      Object.values(taskLists).forEach(list => {
          if (list) {
              list.innerHTML = ''; // Limpa conteúdo anterior
          }
      });

      if (tasks.length === 0 && sessionId !== DEFAULT_SESSION_ID) {
           Object.values(taskLists).forEach(list => {
             if(list) list.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400 italic p-4">Nenhuma tarefa encontrada para esta session. Tente recarregar ou verificar o dashboard.</p>';
           });
           return; // Não renderiza mais nada se não houver tarefas
      }
      if (tasks.length === 0 && sessionId === DEFAULT_SESSION_ID) {
           Object.values(taskLists).forEach(list => {
             if(list) list.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400 italic p-4">Este é o guia geral. Crie uma nova session no dashboard para começar.</p>';
           });
           return;
      }


      // Cria e insere os cards
      tasks.forEach(task => {
          const listContainer = taskLists[task.phase];
          if (!listContainer) return; // Ignora se a fase não existir no HTML

          const card = document.createElement('div');
          card.className = `task-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-[var(--brand-primary)]/10 transition-shadow duration-200 ${task.completed ? 'task-completed' : ''}`;
          card.dataset.taskId = task.id; // Guarda o ID no elemento

          // Usar innerHTML é mais fácil mas requer cuidado com XSS se 'details' vier de fontes não confiáveis.
          // Para uso interno, é geralmente aceitável. Alternativa: criar elementos DOM puros.
          card.innerHTML = `
              <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div class="flex-grow min-w-0"> <!-- min-w-0 para evitar overflow de texto longo -->
                  <div class="flex items-start">
                    <input type="checkbox" id="${task.id}" class="task-checkbox mt-1 mr-3 flex-shrink-0" ${task.completed ? 'checked' : ''}>
                    <label for="${task.id}" class="font-semibold text-gray-800 dark:text-gray-100 cursor-pointer break-words">${task.title}</label>
                  </div>
                  <p class="text-gray-600 dark:text-gray-400 text-sm mt-1 pl-7 break-words">
                    ${task.description}
                  </p>
                </div>
                <div class="text-sm w-full sm:w-auto flex-shrink-0 pl-7 sm:pl-0 mt-2 sm:mt-0 space-y-1 sm:space-y-0 sm:flex sm:flex-col sm:items-end"> <!-- Layout dos botões -->
                  ${task.details ? `
                  <details class="w-full group">
                    <summary class="font-medium text-gray-700 dark:text-gray-300 hover:text-[var(--brand-primary)] dark:hover:text-[var(--brand-primary)] inline-flex items-center cursor-pointer list-none">
                      <span>Ver detalhes</span>
                      <i data-lucide="chevron-down" class="details-chevron w-4 h-4 ml-1 group-open:rotate-180 transition-transform" aria-hidden="true"></i>
                    </summary>
                    <div class="details-content mt-3 pt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 prose prose-sm dark:prose-invert max-w-none prose-a:text-[var(--brand-primary)] prose-a:no-underline hover:prose-a:underline">
                      ${task.details}
                       <button class="edit-task-details-btn" data-task-id="${task.id}"><i data-lucide="edit-3" class="w-3 h-3 mr-1"></i>Editar Detalhes</button>
                    </div>
                  </details>` : '<button class="edit-task-details-btn" data-task-id="${task.id}"><i data-lucide="plus-circle" class="w-3 h-3 mr-1"></i>Adicionar Detalhes</button>'}
                  <button class="delete-task-btn" data-task-id="${task.id}"><i data-lucide="trash-2" class="w-3 h-3 mr-1"></i>Excluir Tarefa</button>
                </div>
              </div>
          `;

          listContainer.appendChild(card);
      });

      // (Re)Inicializar ícones Lucide APÓS adicionar os elementos ao DOM
      if (typeof lucide !== 'undefined') {
          lucide.createIcons();
      }

      updateProgressBar(sessionId); // Atualiza a barra após renderizar
  }

  /** Adiciona listeners aos checkboxes e botões dentro dos cards (usando delegação) */
  function addCardEventListeners(container, sessionId) {
       container.removeEventListener('change', handleCardEvents); // Remove listener antigo para evitar duplicação
       container.removeEventListener('click', handleCardEvents);
       container.addEventListener('change', (event) => handleCardEvents(event, sessionId));
       container.addEventListener('click', (event) => handleCardEvents(event, sessionId));
  }

   /** Handler unificado para eventos dentro dos cards (change e click) */
   function handleCardEvents(event, sessionId) {
        // Checkbox Change
        if (event.target.matches('.task-checkbox')) {
            handleCheckboxChange(event.target, sessionId);
        }
        // Delete Button Click
        else if (event.target.matches('.delete-task-btn') || event.target.closest('.delete-task-btn')) {
            const button = event.target.closest('.delete-task-btn');
            handleDeleteTask(button, sessionId);
        }
        // Edit Details Button Click
        else if (event.target.matches('.edit-task-details-btn') || event.target.closest('.edit-task-details-btn')) {
            const button = event.target.closest('.edit-task-details-btn');
            handleEditTaskDetails(button, sessionId);
        }
   }

  /** Atualiza a barra de progresso para a session atual */
  function updateProgressBar(sessionId) { /* ... (código da resposta anterior) ... */ }

  /** Manipulador para mudança de estado de um checkbox de tarefa */
  function handleCheckboxChange(checkbox, sessionId) {
      const taskId = checkbox.id;
      const taskCard = checkbox.closest('.task-card');
      const isCompleted = checkbox.checked;

      const tasks = loadSessionTasks(sessionId);
      const taskIndex = tasks.findIndex(t => t.id === taskId);

      if (taskIndex > -1) {
          tasks[taskIndex].completed = isCompleted;
          saveSessionTasks(sessionId, tasks); // Salva o array modificado

          if (taskCard) {
              taskCard.classList.toggle('task-completed', isCompleted);
          }
          updateProgressBar(sessionId); // Atualiza a barra
      } else {
          console.error(`Task with ID ${taskId} not found for session ${sessionId}.`);
          showToast('Erro ao atualizar tarefa.', 'error');
      }
  }

  /** Manipulador para o botão 'Excluir Tarefa' */
    function handleDeleteTask(button, sessionId) {
        const taskId = button.dataset.taskId;
        const tasks = loadSessionTasks(sessionId);
        const task = tasks.find(t => t.id === taskId);
        const taskTitle = task ? task.title : taskId; // Pega título para confirmação

        if (confirm(`Tem certeza que deseja excluir a tarefa "${taskTitle}" desta session?`)) {
            let updatedTasks = tasks.filter(task => task.id !== taskId);
            saveSessionTasks(sessionId, updatedTasks);
            // Re-renderiza APENAS o card removido (mais performático)
            const cardElement = button.closest('.task-card');
            cardElement?.remove();
            updateProgressBar(sessionId); // Recalcula progresso
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
            // Usar prompt é simples, mas ruim para HTML. Um modal seria melhor.
            const newDetails = prompt(`Editar detalhes para "${task.title}":\n(Use HTML simples: <ul>,<li>,<a>. Cuidado com aspas!)`, currentDetails);

            if (newDetails !== null && newDetails !== currentDetails) {
                tasks[taskIndex].details = newDetails;
                saveSessionTasks(sessionId, tasks);

                // Re-renderiza apenas o card modificado para refletir os detalhes
                const cardElement = button.closest('.task-card');
                const listContainer = cardElement?.closest('.task-list');
                if (cardElement && listContainer) {
                     const newCardHtml = createTaskCardHtml(tasks[taskIndex]); // Função auxiliar para gerar HTML do card
                     cardElement.outerHTML = newCardHtml; // Substitui o HTML do card antigo
                     // Re-adiciona listener ao novo card (ou confia na delegação)
                     // Re-inicializa lucide se necessário
                     if (typeof lucide !== 'undefined') { lucide.createIcons(); }
                } else {
                    renderTasks(sessionId); // Fallback: re-renderiza tudo se não encontrar o card
                }
                showToast('Detalhes da tarefa atualizados!', 'success');
            }
        } else {
            console.error(`Task with ID ${taskId} not found for editing details.`);
            showToast('Erro: Tarefa não encontrada.', 'error');
        }
    }

    /** Função auxiliar para gerar o HTML de um único card */
    function createTaskCardHtml(task) {
         // Copia da lógica dentro do loop de renderTasks
         return `
            <div class="task-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-[var(--brand-primary)]/10 transition-shadow duration-200 ${task.completed ? 'task-completed' : ''}" data-task-id="${task.id}">
               <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
                 <div class="flex-grow min-w-0">
                   <div class="flex items-start">
                     <input type="checkbox" id="${task.id}" class="task-checkbox mt-1 mr-3 flex-shrink-0" ${task.completed ? 'checked' : ''}>
                     <label for="${task.id}" class="font-semibold text-gray-800 dark:text-gray-100 cursor-pointer break-words">${task.title}</label>
                   </div>
                   <p class="text-gray-600 dark:text-gray-400 text-sm mt-1 pl-7 break-words">
                     ${task.description}
                   </p>
                 </div>
                 <div class="text-sm w-full sm:w-auto flex-shrink-0 pl-7 sm:pl-0 mt-2 sm:mt-0 space-y-1 sm:space-y-0 sm:flex sm:flex-col sm:items-end">
                   ${task.details ? `
                   <details class="w-full group">
                     <summary class="font-medium text-gray-700 dark:text-gray-300 hover:text-[var(--brand-primary)] dark:hover:text-[var(--brand-primary)] inline-flex items-center cursor-pointer list-none">
                       <span>Ver detalhes</span>
                       <i data-lucide="chevron-down" class="details-chevron w-4 h-4 ml-1 group-open:rotate-180 transition-transform" aria-hidden="true"></i>
                     </summary>
                     <div class="details-content mt-3 pt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 prose prose-sm dark:prose-invert max-w-none prose-a:text-[var(--brand-primary)] prose-a:no-underline hover:prose-a:underline">
                       ${task.details}
                       <button class="edit-task-details-btn" data-task-id="${task.id}"><i data-lucide="edit-3" class="w-3 h-3 mr-1"></i>Editar Detalhes</button>
                     </div>
                   </details>` : '<button class="edit-task-details-btn" data-task-id="${task.id}"><i data-lucide="plus-circle" class="w-3 h-3 mr-1"></i>Adicionar Detalhes</button>'}
                   <button class="delete-task-btn" data-task-id="${task.id}"><i data-lucide="trash-2" class="w-3 h-3 mr-1"></i>Excluir Tarefa</button>
                 </div>
               </div>
            </div>
        `;
    }


  // --- Lógica das Anotações ---
  let saveNoteTimeout;
  let noteTypingTimeout;

  /** Salva as notas da session atual */
  function saveNotesHandler(sessionId) { /* ... (código da resposta anterior, usando showToast) ... */ }
  /** Handler para input de notas com auto-save */
  function handleNotesInput(sessionId) { /* ... (código da resposta anterior, chamando saveNotesHandler) ... */ }
  /** Carrega as notas da session atual */
  function loadNotes(sessionId) { /* ... (código da resposta anterior) ... */ }

  // --- Funções CRUD para Sessions (Atuam na Session Atual) ---
  function renameCurrentSession(currentSessionId) { /* ... (código da resposta anterior, usando showToast) ... */ }
  function deleteCurrentSession(currentSessionId) { /* ... (código da resposta anterior) ... */ }

  // --- Inicialização Geral ---
  function initializeApp() {
    currentSessionId = getCurrentSessionIdFromUrl(); // Define o ID da session atual
    console.log(`Initializing for Session ID: ${currentSessionId}`);

    updateSessionDisplayInfo(currentSessionId); // Atualiza títulos/nomes
    updateFooterInfo();
    loadTheme();

    renderTasks(currentSessionId); // Renderiza tarefas da session atual
    loadNotes(currentSessionId); // Carrega notas da session atual

    // Adiciona listeners de eventos (delegação para tarefas)
    if (phaseContentContainer) {
        addCardEventListeners(phaseContentContainer, currentSessionId);
    } else {
        console.error("Phase content container not found. Task event listeners not attached.");
    }

    // Listeners Gerais
    themeToggleButton?.addEventListener('click', toggleTheme);
    phaseNavContainer?.addEventListener('click', (event) => {
        const button = event.target.closest('.phase-nav-btn');
        if (button && !button.classList.contains('active') && button.dataset.phase) {
            switchPhase(button.dataset.phase);
        }
    });

    // Listeners das Notas (passando o ID atual)
    saveNotesButton?.addEventListener('click', () => saveNotesHandler(currentSessionId));
    notesTextarea?.addEventListener('input', () => handleNotesInput(currentSessionId));

    // Listeners dos Botões de Gerenciamento da Session ATUAL
    renameSessionBtn?.addEventListener('click', () => renameCurrentSession(currentSessionId));
    deleteSessionBtn?.addEventListener('click', () => deleteCurrentSession(currentSessionId));
    goToDashboardBtn?.addEventListener('click', () => {
        // TODO: Mudar para o nome real da sua dashboard page
        window.location.href = 'dashboard.html';
    });

    // Inicializar Ícones Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    } else {
        console.error("Lucide library not found or failed to load.");
    }

    // Foco inicial na primeira aba para acessibilidade
     const initialActiveButton = phaseNavContainer?.querySelector('.phase-nav-btn.active');
     initialActiveButton?.focus();

    console.log("Sons & Sessions Guide Initialized.");
  }

  // Executa a inicialização
  initializeApp();

}); // Fim do DOMContentLoaded
