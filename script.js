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

  // --- Template Padrão de Tarefas (IDs serão gerados na criação) ---
  const defaultTasksTemplate = [
      // Fase 1: Definição e Iniciação
      { phase: 'definicao-iniciacao', title: '1.1 Objetivos Específicos', description: 'Definir metas claras para esta session.', details: '<ul><li>Ex: Gravar Temporada #[X] (6 episódios 30 min).</li><li>Ex: Capturar entrevistas (Artistas + [Y] Convidados).</li><li>Ex: Link Metas: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Adicionar Link]</a></li></ul>', completed: false },
      { phase: 'definicao-iniciacao', title: '1.2 Confirmação Chave', description: 'Bloquear data, local e talentos principais.', details: '<ul><li>Data Confirmada: [DD/MM/AAAA HH:MM]</li><li>Local Confirmado: [Nome] - <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Contrato]</a></li><li>Talentos Confirmados: [Nomes]</li></ul>', completed: false },
      { phase: 'definicao-iniciacao', title: '1.3 Orçamento Preliminar', description: 'Estimativa inicial de custos e validação de verba.', details: '<ul><li>Estimativa: R$ [Valor] / Verba: R$ [Valor]</li><li>Planilha Preliminar: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Adicionar Link]</a></li><li>Aprovação: [Nome/Data]</li></ul>', completed: false },
      { phase: 'definicao-iniciacao', title: '1.4 Definição Equipe Core', description: 'Atribuir responsabilidades chave da produção.', details: '<ul><li>Prod. Executiva: [Nome]</li><li>Direção/Artístico: [Nome]</li><li>Técnico A/V: [Nome/Empresa]</li><li>Comunicação: [Nome]</li><li>Financeiro: [Nome]</li></ul>', completed: false },
      // Fase 2: Planejamento e Preparação
      { phase: 'planejamento-preparacao', title: '2.1 Cronograma Detalhado', description: 'Definir todas as datas e prazos chave.', details: '<ul><li>Datas VTs: [DD/MM]</li><li>Run-of-Show: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Cronograma Completo: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Planilha]</a></li><li>Prazos Pós: [Datas]</li></ul>', completed: false },
      { phase: 'planejamento-preparacao', title: '2.2 Orçamento Detalhado e Fluxo', description: 'Finalizar planilha de custos e cronograma de pagamentos.', details: '<ul><li>Planilha Final: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link]</a></li><li>Fluxo Pagamentos: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Aprovação Final: [Nome/Data]</li></ul>', completed: false },
      { phase: 'planejamento-preparacao', title: '2.3 Roteiro e Conteúdo', description: 'Definir estrutura dos episódios, pautas, perguntas.', details: '<ul><li>Estrutura Geral: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Roteiros/Pautas: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Pasta]</a></li><li>Aprovação Final: [Nome/Data]</li></ul>', completed: false },
      { phase: 'planejamento-preparacao', title: '2.4 Plano Técnico (A/V)', description: 'Definir equipamentos, rider, mapa de palco/luz.', details: '<ul><li>Lista Equipamentos: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link]</a></li><li>Mapa Palco/Luz: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Imagem]</a></li><li>Plano Áudio: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Fornecedor: [Nome/Contato]</li></ul>', completed: false },
      { phase: 'planejamento-preparacao', title: '2.5 Plano de Comunicação (Pré)', description: 'Estratégia divulgação pré-gravação, convites, redes sociais.', details: '<ul><li>Estratégia: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Lista Convidados: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link]</a></li><li>Cronograma Posts: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link]</a></li></ul>', completed: false },
      { phase: 'planejamento-preparacao', title: '2.6 Design e Identidade Visual', description: 'Finalizar cenografia, artes gráficas (GCs, vinhetas).', details: '<ul><li>Projeto Cenográfico: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Desenho]</a></li><li>Pacote Gráfico: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Pasta]</a></li><li>Aprovação Final: [Nome/Data]</li></ul>', completed: false },
      { phase: 'planejamento-preparacao', title: '2.7 Contratos e Acordos', description: 'Formalizar todos os acordos legais e financeiros.', details: '<ul><li>Contratos Talentos: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Pasta]</a></li><li>Contrato Local: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Ref]</a></li><li>Seguro: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Apólice Ref]</a></li></ul>', completed: false },
      { phase: 'planejamento-preparacao', title: '2.8 Logística Detalhada', description: 'Planejar transporte, alimentação, hospedagem, credenciamento.', details: '<ul><li>Plano Transporte: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Hospedagem: [Confirmações]</li><li>Catering: [Cardápio/Ref]</li><li>Credenciais: OK</li></ul>', completed: false },
      { phase: 'planejamento-preparacao', title: '2.9 Plano de Contingência', description: 'Identificar riscos e planejar soluções alternativas (Plano B, C).', details: '<ul><li>Mapeamento Riscos: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Planos B (Téc, Pessoal, Log): Definidos</li><li>Contatos Emergência: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li></ul>', completed: false },
      { phase: 'planejamento-preparacao', title: '2.10 Definição Métricas Sucesso', description: 'Estabelecer KPIs para avaliar o resultado da session.', details: '<ul><li>KPIs Produção: [...]</li><li>KPIs Conteúdo: [...]</li><li>KPIs Audiência: [...]</li><li>KPIs Negócio: [...]</li><li>Doc Métricas: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link]</a></li></ul>', completed: false },
      { phase: 'planejamento-preparacao', title: '2.11 Reunião Geral Alinhamento Final', description: 'Kick-off final com toda a equipe chave antes da execução.', details: '<ul><li>Data: [DD/MM/AAAA]</li><li>Pauta: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Ata/Registro: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link]</a></li></ul>', completed: false },
      // Fase 3: Execução
      { phase: 'execucao', title: '3.1 Montagem e Testes Finais', description: 'Preparar set, equipamentos e verificar tudo no local.', details: '<ul><li>Montagem A/V: OK [HH:MM]</li><li>Passagem Som/Luz/Rec: OK [HH:MM]</li><li>Cenário/Arte: OK [HH:MM]</li><li>Comunicação Interna: OK</li></ul>', completed: false },
      { phase: 'execucao', title: '3.2 Recepção e Briefing Final', description: 'Receber artistas, convidados e alinhar últimos detalhes.', details: '<ul><li>Talentos Chegaram: [HH:MM] / Briefing OK: [HH:MM]</li><li>Convidados Chegaram: [HH:MM] / Recepção OK</li><li>Briefing Equipe Final: [HH:MM]</li></ul>', completed: false },
      { phase: 'execucao', title: '3.3 Gravação Blocos/Episódios', description: 'Executar a gravação conforme o run-of-show.', details: '<ul><li>Início REC: [HH:MM] / Fim REC: [HH:MM]</li><li>Run-of-Show Seguido: [Sim/Não - Obs]</li><li>Check A/V Periódico: OK</li></ul>', completed: false },
      { phase: 'execucao', title: '3.4 Captura Conteúdo Adicional', description: 'Gravar material extra (bastidores, entrevistas, docs).', details: '<ul><li>Entrevistas Gravadas: [HH:MM - HH:MM]</li><li>Imagens Making-of: Capturadas</li><li>Termos Imagem Coletados: OK</li></ul>', completed: false },
      { phase: 'execucao', title: '3.5 Gestão de Imprevistos', description: 'Lidar com problemas que surgirem durante a gravação.', details: '<ul><li>Problemas Ocorridos: [Descrever ou N/A]</li><li>Solução Aplicada: [Descrever]</li><li>Plano Contingência Usado: [Sim/Não - Qual?]</li></ul>', completed: false },
      { phase: 'execucao', title: '3.6 Coleta Feedback Imediato', description: 'Conversa rápida com equipe e artistas sobre a experiência.', details: '<ul><li>Feedback Equipe: [Registrado]</li><li>Feedback Talentos: [Registrado]</li><li>Notas Rápidas: [Ver Anotações]</li></ul>', completed: false },
      { phase: 'execucao', title: '3.7 Desmontagem e Segurança Material', description: 'Desmontar set e garantir a segurança do material gravado.', details: '<ul><li>Desmontagem A/V: OK [HH:MM]</li><li>Checklist Equip.: OK</li><li>Material Gravado Seguro: OK [Resp: Nome]</li><li>Local Limpo: OK</li></ul>', completed: false },
      // Fase 4: Pós-Produção e Encerramento
      { phase: 'pos-producao-encerramento', title: '4.1 Backup e Organização Bruto', description: 'Salvar TODO material gravado (mín. 2 cópias) e catalogar.', details: '<ul><li>Backup 1: [Local/HD] / Backup 2: [Nuvem]</li><li>Verificação Integridade: OK</li><li>Organização Pastas: OK</li><li>Planilha Logs: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link]</a></li><li>Concluído: [DD/MM/AAAA] por [Nome]</li></ul>', completed: false },
      { phase: 'pos-producao-encerramento', title: '4.2 Edição Vídeo e Áudio', description: 'Montagem, cor, mixagem, trilha.', details: '<ul><li>Resp. Edição Vídeo/Áudio: [Nome/Empresa]</li><li>1º Corte: [DD/MM] / Final: [DD/MM]</li><li>Trilha/Direitos: OK <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Ref]</a></li><li>Finalização (Cor/Master): [DD/MM]</li></ul>', completed: false },
      { phase: 'pos-producao-encerramento', title: '4.3 Aprovações Finais', description: 'Obter aprovação final dos cortes pelos stakeholders chave.', details: '<ul><li>Aprovação Interna: [Nome/Data]</li><li>Aprovação Talentos: [Nome/Data]</li><li>Aprovação Patrocinadores: [Nome/Data]</li><li>Versão Master Aprovada: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Final]</a></li></ul>', completed: false },
      { phase: 'pos-producao-encerramento', title: '4.4 Criação Materiais Divulgação Pós', description: 'Produzir teasers, trailers, clipes, posts para lançamento.', details: '<ul><li>Peças Definidas: [Lista]</li><li>Materiais Criados: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Pasta]</a></li><li>Textos/Copy: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Aprovação Materiais: [Nome/Data]</li></ul>', completed: false },
      { phase: 'pos-producao-encerramento', title: '4.5 Distribuição e Lançamento', description: 'Publicar o conteúdo final nas plataformas definidas.', details: '<ul><li>Cronograma Lançamento: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Calendário]</a></li><li>Uploads (YT, Spotify): OK [Datas]</li><li>Posts Redes Sociais: OK</li><li>Envio Imprensa: OK [Data]</li></ul>', completed: false },
      { phase: 'pos-producao-encerramento', title: '4.6 Análise de Métricas Pós-Lançamento', description: 'Coletar e analisar os resultados com base nos KPIs definidos.', details: '<ul><li>Relatório Analytics (YT, Spotify, Social): <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link]</a></li><li>Análise vs KPIs: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Relatório Final: [DD/MM]</li></ul>', completed: false },
      { phase: 'pos-producao-encerramento', title: '4.7 Pagamentos Finais e Fechamento Financeiro', description: 'Realizar últimos pagamentos e conciliar o orçamento final.', details: '<ul><li>Pagamentos Finais: OK [Datas]</li><li>Conciliação Orçamento: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Planilha Final]</a></li><li>Relatório Financeiro Final: [DD/MM]</li></ul>', completed: false },
      { phase: 'pos-producao-encerramento', title: '4.8 Reunião Pós-Mortem (Lições Aprendidas)', description: 'Analisar o que funcionou, o que não funcionou, e documentar.', details: '<ul><li>Data Reunião: [DD/MM]</li><li>Registro/Ata: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link]</a></li><li>Lições Aprendidas: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Link Doc]</a></li><li>Melhorias Próx. Session: Definidas</li></ul>', completed: false },
      { phase: 'pos-producao-encerramento', title: '4.9 Arquivamento Final do Projeto', description: 'Organizar e armazenar toda a documentação e material final.', details: '<ul><li>Pasta Digital Final: <a href="#" target="_blank" class="text-[var(--brand-primary)] hover:underline">[Localização/Link]</a></li><li>Brutos Arquivados: [Localização]</li><li>Masters Arquivados: [Localização]</li><li>Docs Arquivados: OK</li></ul>', completed: false },
  ];

  // --- Variáveis de Estado ---
  let currentSessionId = DEFAULT_SESSION_ID;

  // --- Funções de Gerenciamento de Dados (LocalStorage) ---
  // (Colar aqui as funções: getAllSessions, saveAllSessions, loadSessionTasks,
  // saveSessionTasks, loadSessionNotes, saveSessionNotes da resposta anterior)
    function getAllSessions() { try { return JSON.parse(localStorage.getItem(LS_KEY_SESSION_INDEX) || '[]'); } catch (e) { console.error("Error parsing session index:", e); localStorage.removeItem(LS_KEY_SESSION_INDEX); return []; } }
    function saveAllSessions(sessions) { try { localStorage.setItem(LS_KEY_SESSION_INDEX, JSON.stringify(sessions)); } catch (e) { console.error("Error saving session index:", e); showToast('Erro ao salvar índice de sessions!', 'error'); } }
    function loadSessionTasks(sessionId) { const key = `${LS_KEY_TASKS_PREFIX}${sessionId}`; try { const storedTasks = localStorage.getItem(key); if (storedTasks) { return JSON.parse(storedTasks); } else if (sessionId !== DEFAULT_SESSION_ID) { console.log(`No tasks found for session ${sessionId}, initializing from template.`); const newSessionTasks = defaultTasksTemplate.map(task => ({ ...task, id: crypto.randomUUID(), completed: false })); saveSessionTasks(sessionId, newSessionTasks); return newSessionTasks; } else { return []; } } catch (e) { console.error(`Error loading or parsing tasks for session ${sessionId}:`, e); localStorage.removeItem(key); showToast(`Erro ao carregar tarefas da session ${sessionId}!`, 'error'); return []; } }
    function saveSessionTasks(sessionId, tasks) { const key = `${LS_KEY_TASKS_PREFIX}${sessionId}`; try { localStorage.setItem(key, JSON.stringify(tasks)); } catch (e) { console.error(`Error saving tasks for session ${sessionId}:`, e); showToast(`Erro ao salvar tarefas da session ${sessionId}!`, 'error'); } }
    function loadSessionNotes(sessionId) { const key = `${LS_KEY_NOTES_PREFIX}${sessionId}`; try { return localStorage.getItem(key) || ''; } catch (e) { console.error(`Error loading notes for session ${sessionId}:`, e); return ''; } }
    function saveSessionNotes(sessionId, notes) { const key = `${LS_KEY_NOTES_PREFIX}${sessionId}`; try { localStorage.setItem(key, notes); return true; } catch (e) { console.error(`Error saving notes for session ${sessionId}:`, e); showToast(`Erro ao salvar anotações da session ${sessionId}!`, 'error'); return false; } }


  // --- Funções Auxiliares e de UI ---
    function getCurrentSessionIdFromUrl() { const urlParams = new URLSearchParams(window.location.search); const urlSessionId = urlParams.get('session'); return urlSessionId && urlSessionId.trim() !== '' ? urlSessionId : DEFAULT_SESSION_ID; }
    function updateSessionDisplayInfo(sessionId) { let displayName = `Session Padrão`; let isDefault = sessionId === DEFAULT_SESSION_ID; if (!isDefault) { const sessions = getAllSessions(); const sessionData = sessions.find(s => s.id === sessionId); displayName = sessionData ? sessionData.name : `Session #${sessionId}`; } else { displayName = "Guia Prático Geral"; } if (sessionNumberTitleSpan) sessionNumberTitleSpan.textContent = displayName; document.title = `Sons & Sessions | ${displayName}`; if (sessionNumberNotesTitleSpan) sessionNumberNotesTitleSpan.textContent = displayName; if (renameSessionBtn) renameSessionBtn.disabled = isDefault; if (deleteSessionBtn) deleteSessionBtn.disabled = isDefault;}
    function updateFooterInfo() { if (appVersionSpan) appVersionSpan.textContent = "1.1.0"; if (lastUpdatedSpan) { const today = new Date(); const day = String(today.getDate()).padStart(2, '0'); const month = String(today.getMonth() + 1).padStart(2, '0'); const year = today.getFullYear(); lastUpdatedSpan.textContent = `${day}/${month}/${year}`; } }
    function showToast(message, type = 'info') { if (!notesStatus) return; let className = 'text-xs h-4 flex-grow '; switch (type) { case 'success': className += 'text-green-600 dark:text-green-400'; break; case 'error': className += 'text-red-600 dark:text-red-400'; break; default: className += 'text-blue-600 dark:text-blue-400'; } notesStatus.textContent = message; notesStatus.className = className; setTimeout(() => { if (notesStatus.textContent === message) notesStatus.textContent = ''; }, 3500); }
    function applyTheme(theme) { const sunIcon = themeToggleButton?.querySelector('.icon-sun'); const moonIcon = themeToggleButton?.querySelector('.icon-moon'); if (theme === 'dark') { htmlElement.classList.add('dark'); sunIcon?.classList.replace('block', 'hidden'); moonIcon?.classList.replace('hidden', 'block'); } else { htmlElement.classList.remove('dark'); sunIcon?.classList.replace('hidden', 'block'); moonIcon?.classList.replace('block', 'hidden'); } }
    function toggleTheme() { const currentTheme = htmlElement.classList.contains('dark') ? 'light' : 'dark'; try { localStorage.setItem(LS_KEY_THEME, currentTheme); } catch (error) { console.error("Failed to save theme preference:", error); } applyTheme(currentTheme); }
    function loadTheme() { let savedTheme = 'light'; try { savedTheme = localStorage.getItem(LS_KEY_THEME) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); } catch (error) { console.error("Failed to load theme preference:", error); savedTheme = (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); } applyTheme(savedTheme); }
    function switchPhase(targetPhase) { phaseNavButtons.forEach(button => { const isTarget = button.dataset.phase === targetPhase; button.classList.toggle('active', isTarget); button.setAttribute('aria-selected', String(isTarget)); }); const phaseContents = phaseContentContainer?.querySelectorAll('.phase-content'); phaseContents?.forEach(section => { const isTarget = section.id === `${targetPhase}-content`; section.classList.toggle('hidden', !isTarget); section.setAttribute('aria-hidden', String(!isTarget)); if (isTarget) section.focus({ preventScroll: true }); }); }
    function updateProgressBar(sessionId) { if (!progressBar || !progressPercentage) return; const tasks = loadSessionTasks(sessionId); const totalTasks = tasks.length; if (totalTasks === 0) { progressBar.style.width = '0%'; progressPercentage.textContent = '0%'; return; } const completedTasks = tasks.filter(task => task.completed).length; const percentage = Math.round((completedTasks / totalTasks) * 100); progressBar.style.width = `${percentage}%`; progressPercentage.textContent = `${percentage}%`; }
    function createTaskCardHtml(task) { return ` <div class="task-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-[var(--brand-primary)]/10 transition-shadow duration-200 ${task.completed ? 'task-completed' : ''}" data-task-id="${task.id}"> <div class="flex flex-col sm:flex-row justify-between items-start gap-4"> <div class="flex-grow min-w-0"> <div class="flex items-start"> <input type="checkbox" id="${task.id}" class="task-checkbox mt-1 mr-3 flex-shrink-0" ${task.completed ? 'checked' : ''}> <label for="${task.id}" class="font-semibold text-gray-800 dark:text-gray-100 cursor-pointer break-words">${task.title}</label> </div> <p class="text-gray-600 dark:text-gray-400 text-sm mt-1 pl-7 break-words"> ${task.description} </p> </div> <div class="text-sm w-full sm:w-auto flex-shrink-0 pl-7 sm:pl-0 mt-2 sm:mt-0 space-y-1 sm:flex sm:flex-col sm:items-end"> ${task.details ? ` <details class="w-full group"> <summary class="font-medium text-gray-700 dark:text-gray-300 hover:text-[var(--brand-primary)] dark:hover:text-[var(--brand-primary)] inline-flex items-center cursor-pointer list-none"> <span>Ver detalhes</span> <i data-lucide="chevron-down" class="details-chevron w-4 h-4 ml-1 group-open:rotate-180 transition-transform" aria-hidden="true"></i> </summary> <div class="details-content mt-3 pt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 prose prose-sm dark:prose-invert max-w-none prose-a:text-[var(--brand-primary)] prose-a:no-underline hover:prose-a:underline"> ${task.details} <button class="edit-task-details-btn" data-task-id="${task.id}"><i data-lucide="edit-3" class="w-3 h-3 mr-1"></i>Editar Detalhes</button> </div> </details>` : '<button class="edit-task-details-btn" data-task-id="${task.id}"><i data-lucide="plus-circle" class="w-3 h-3 mr-1"></i>Adicionar Detalhes</button>'} <button class="delete-task-btn" data-task-id="${task.id}"><i data-lucide="trash-2" class="w-3 h-3 mr-1"></i>Excluir Tarefa</button> </div> </div> </div> `; }

    // --- Renderização Dinâmica ---
    function renderTasks(sessionId) {
        console.log(`Rendering tasks for session: ${sessionId}`);
        const tasks = loadSessionTasks(sessionId);
        const taskLists = { /* ... (código anterior para pegar os .task-list) ... */
             'definicao-iniciacao': document.querySelector('#definicao-iniciacao-content .task-list'),
             'planejamento-preparacao': document.querySelector('#planejamento-preparacao-content .task-list'),
             'execucao': document.querySelector('#execucao-content .task-list'),
             'pos-producao-encerramento': document.querySelector('#pos-producao-encerramento-content .task-list'),
         };

        // Limpa listas existentes e placeholders
        Object.values(taskLists).forEach(list => { if (list) list.innerHTML = ''; });

        if (!tasks || tasks.length === 0) { /* ... (código anterior para mensagem de 'nenhuma tarefa') ... */
             let message = "Nenhuma tarefa encontrada para esta session.";
             if (sessionId === DEFAULT_SESSION_ID) { message = 'Este é o guia geral. Crie ou selecione uma session no dashboard.'; }
             Object.values(taskLists).forEach(list => { if (list) list.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 italic p-4">${message}</p>`; });
             updateProgressBar(sessionId);
             if (typeof lucide !== 'undefined') { try { lucide.createIcons(); } catch(e){ console.error(e); } }
             return;
        }

        // Agrupa tarefas por fase e gera HTML
        const tasksByPhaseHtml = tasks.reduce((acc, task) => {
            if (!acc[task.phase]) acc[task.phase] = '';
            acc[task.phase] += createTaskCardHtml(task); // Concatena strings HTML
            return acc;
        }, {});

        // Define o innerHTML de cada lista de uma vez (mais simples)
        Object.entries(tasksByPhaseHtml).forEach(([phase, phaseHtml]) => {
            const listContainer = taskLists[phase];
            if (listContainer) {
                listContainer.innerHTML = phaseHtml;
            } else {
                console.warn(`Container for phase ${phase} not found.`);
            }
        });

        // (Re)Inicializar ícones Lucide APÓS o innerHTML ser definido
        if (typeof lucide !== 'undefined') {
            try { lucide.createIcons(); } catch (e) { console.error("Error creating Lucide icons after task render:", e); }
        } else { console.warn("Lucide library not loaded, icons may not appear."); }

        updateProgressBar(sessionId); // Atualiza a barra após renderizar
    }

  // --- Handlers de Eventos (Delegação) ---
    function handleCardEvents(event) {
        const target = event.target;
        if (target.matches('.task-checkbox')) {
            handleCheckboxChange(target, currentSessionId);
        } else {
            const deleteButton = target.closest('.delete-task-btn');
            const editDetailsButton = target.closest('.edit-task-details-btn');
            if (deleteButton) { handleDeleteTask(deleteButton, currentSessionId); }
            else if (editDetailsButton) { handleEditTaskDetails(editDetailsButton, currentSessionId); }
        }
    }
    function handleCheckboxChange(checkbox, sessionId) { const taskId = checkbox.id; const taskCard = checkbox.closest('.task-card'); const isCompleted = checkbox.checked; const tasks = loadSessionTasks(sessionId); const taskIndex = tasks.findIndex(t => t.id === taskId); if (taskIndex > -1) { tasks[taskIndex].completed = isCompleted; saveSessionTasks(sessionId, tasks); if (taskCard) { taskCard.classList.toggle('task-completed', isCompleted); } updateProgressBar(sessionId); } else { console.error(`Task with ID ${taskId} not found.`); showToast('Erro ao atualizar tarefa.', 'error'); } }
    function handleDeleteTask(button, sessionId) { const taskId = button.dataset.taskId; const tasks = loadSessionTasks(sessionId); const task = tasks.find(t => t.id === taskId); const taskTitle = task ? task.title : taskId; if (confirm(`Tem certeza que deseja excluir a tarefa "${taskTitle}" desta session?`)) { let updatedTasks = tasks.filter(task => task.id !== taskId); saveSessionTasks(sessionId, updatedTasks); renderTasks(sessionId); showToast('Tarefa excluída!', 'success'); } }
    function handleEditTaskDetails(button, sessionId) { const taskId = button.dataset.taskId; const tasks = loadSessionTasks(sessionId); const taskIndex = tasks.findIndex(t => t.id === taskId); if (taskIndex > -1) { const task = tasks[taskIndex]; const currentDetails = task.details || ''; const newDetails = prompt(`Editar detalhes para "${task.title}":\n(Use HTML simples. Cuidado com aspas!)`, currentDetails); if (newDetails !== null && newDetails !== currentDetails) { tasks[taskIndex].details = newDetails; saveSessionTasks(sessionId, tasks); renderTasks(sessionId); showToast('Detalhes atualizados!', 'success'); } else if (newDetails !== null) { showToast('Nenhuma alteração feita.', 'info'); } } else { console.error(`Task ${taskId} not found.`); showToast('Erro: Tarefa não encontrada.', 'error'); } }

  // --- Lógica das Anotações ---
    let saveNoteTimeout;
    let noteTypingTimeout;
    function saveNotesHandler(sessionId) { if (!notesTextarea || !saveNotesButton || !notesStatus) return; if (saveNotesButton.disabled) return; const notes = notesTextarea.value; saveNotesButton.disabled = true; notesStatus.textContent = 'Salvando...'; notesStatus.className = 'text-xs text-gray-500 dark:text-gray-400 h-4 flex-grow'; setTimeout(() => { const success = saveSessionNotes(sessionId, notes); if(success) { clearTimeout(saveNoteTimeout); notesStatus.textContent = 'Anotações salvas!'; notesStatus.className = 'text-xs text-green-600 dark:text-green-400 h-4 flex-grow'; saveNoteTimeout = setTimeout(() => { notesStatus.textContent = ''; }, 3000); } else { notesStatus.textContent = 'Erro ao salvar!'; notesStatus.className = 'text-xs text-red-600 dark:text-red-400 h-4 flex-grow'; } saveNotesButton.disabled = false; }, 200); }
    function handleNotesInput(sessionId) { if (!notesStatus) return; clearTimeout(noteTypingTimeout); notesStatus.textContent = 'Digitando...'; notesStatus.className = 'text-xs text-gray-500 dark:text-gray-400 h-4 flex-grow'; noteTypingTimeout = setTimeout(() => saveNotesHandler(sessionId), 1500); }
    function loadNotes(sessionId) { if (!notesTextarea) return; notesTextarea.value = loadSessionNotes(sessionId); }

  // --- Funções CRUD para Sessions (Disparadas pelos botões no Header) ---
    function renameCurrentSession(sessionId) { /* ... (código da resposta anterior) ... */ }
    function deleteCurrentSession(sessionId) { /* ... (código da resposta anterior) ... */ }

  // --- Inicialização Geral ---
  function initializeApp() {
      console.log("Initializing Sons & Sessions Guide...");
      // Define o ID da session atual a partir da URL
      currentSessionId = getCurrentSessionIdFromUrl();

      // Atualiza UI com informações da session
      updateSessionDisplayInfo(currentSessionId);
      updateFooterInfo();
      loadTheme(); // Carrega tema

      // Carrega e renderiza dados específicos da session
      renderTasks(currentSessionId);
      loadNotes(currentSessionId);

      // --- Adiciona Listeners ---
      themeToggleButton?.addEventListener('click', toggleTheme);

      // Navegação por Fases
      phaseNavContainer?.addEventListener('click', (event) => {
          const button = event.target.closest('.phase-nav-btn');
          if (button && !button.classList.contains('active') && button.dataset.phase) {
              switchPhase(button.dataset.phase);
          }
      });

      // Delegação para eventos de tarefa (change e click)
      if (phaseContentContainer) {
          phaseContentContainer.addEventListener('change', handleCardEvents);
          phaseContentContainer.addEventListener('click', handleCardEvents);
          console.log("Task event listeners attached via delegation.");
      } else {
          console.error("CRITICAL: Phase content container not found. Task interactions will fail.");
      }

      // Notas
      saveNotesButton?.addEventListener('click', () => saveNotesHandler(currentSessionId));
      notesTextarea?.addEventListener('input', () => handleNotesInput(currentSessionId));

      // Gerenciamento da Session Atual
      renameSessionBtn?.addEventListener('click', () => renameCurrentSession(currentSessionId));
      deleteSessionBtn?.addEventListener('click', () => deleteCurrentSession(currentSessionId));
      goToDashboardBtn?.addEventListener('click', () => { window.location.href = 'dashboard.html'; }); // Mude se o nome for diferente

      // Foco inicial (após renderização)
      const initialActiveButton = phaseNavContainer?.querySelector('.phase-nav-btn.active');
      initialActiveButton?.focus();

      console.log(`Initialization complete for Session: ${currentSessionId}`);
  }

  // --- Executa a inicialização com Tratamento de Erro Global ---
  try {
      initializeApp();
  } catch (error) {
      console.error("FATAL ERROR during initialization:", error);
      // Mostra erro na tela se a inicialização falhar completamente
      document.body.innerHTML = `<div style="padding: 20px; text-align: center; color: red; font-family: sans-serif; background-color: #111; height: 100vh;">
          <h1>Erro Crítico</h1>
          <p>Ocorreu um erro grave ao carregar o Guia Prático. Verifique o console (F12) para detalhes.</p>
          <p style="font-family: monospace; background-color: #333; padding: 10px; border-radius: 5px; color: #ffdddd; text-align: left; white-space: pre-wrap;">${error.message}\n\n${error.stack}</p>
      </div>`;
  }

}); // Fim do DOMContentLoaded
