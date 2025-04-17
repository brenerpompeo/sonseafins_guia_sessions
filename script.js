document.addEventListener('DOMContentLoaded', () => {
  // --- Seletores Globais ---
  const themeToggleButton = document.getElementById('themeToggle');
  const progressBar = document.getElementById('progressBar');
  const progressPercentage = document.getElementById('progressPercentage');
  const phaseNavContainer = document.getElementById('phaseNav');
  const phaseContentContainer = document.getElementById('phaseContentContainer');
  const notesTextarea = document.getElementById('projectNotes');
  const saveNotesButton = document.getElementById('saveNotesBtn');
  const notesStatus = document.getElementById('notesStatus');
  const sessionNameDisplay = document.getElementById('sessionNameDisplay');
  const sessionNotesTitleDisplay = document.getElementById('sessionNotesTitleDisplay');
  const renameSessionBtn = document.getElementById('renameSessionBtn');
  const deleteSessionBtn = document.getElementById('deleteSessionBtn');
  const goToDashboardBtn = document.getElementById('goToDashboardBtn');
  const showDeletedTasksBtn = document.getElementById('showDeletedTasksBtn');
  const hideDeletedTasksBtn = document.getElementById('hideDeletedTasksBtn');
  const deletedTasksSection = document.getElementById('deletedTasksSection');
  const deletedTaskList = document.getElementById('deletedTaskList');
  const appVersionSpan = document.getElementById('appVersion'); // Adicionado seletor
  const lastUpdatedSpan = document.getElementById('lastUpdated'); // Adicionado seletor

  // --- Variáveis de Estado ---
  let currentSessionId = null;

  // --- Funções de UI Específicas do Guia ---
    function updateSessionDisplayInfo(sessionId) { let displayName = "Erro: Session Inválida"; let isDefault = false; if (sessionId) { const sessions = getAllSessions(); const sessionData = sessions.find(s => s.id === sessionId); displayName = sessionData ? sessionData.name : `Session #${sessionId}`; isDefault = sessionId === DEFAULT_SESSION_ID; } else { isDefault = true; } if (sessionNameDisplay) sessionNameDisplay.textContent = displayName; document.title = `Guia | ${displayName}`; if (sessionNotesTitleDisplay) sessionNotesTitleDisplay.textContent = displayName; if (renameSessionBtn) renameSessionBtn.disabled = isDefault; if (deleteSessionBtn) deleteSessionBtn.disabled = isDefault; }
    function switchPhase(targetPhase) { const phaseNavButtons = phaseNavContainer?.querySelectorAll('.phase-nav-btn'); if (!phaseNavButtons) return; phaseNavButtons.forEach(button => { const isTarget = button.dataset.phase === targetPhase; button.classList.toggle('active', isTarget); button.setAttribute('aria-selected', String(isTarget)); }); const phaseContents = phaseContentContainer?.querySelectorAll('.phase-content'); phaseContents?.forEach(section => { const isTarget = section.id === `${targetPhase}-content`; section.classList.toggle('hidden', !isTarget); section.setAttribute('aria-hidden', String(!isTarget)); if (isTarget) section.focus({ preventScroll: true }); }); }
    function updateProgressBar(sessionId) { if (!progressBar || !progressPercentage) return; const tasks = loadSessionTasks(sessionId); const totalTasks = tasks.length; if (totalTasks === 0) { progressBar.style.width = '0%'; progressPercentage.textContent = '0%'; return; } const completedTasks = tasks.filter(task => task.completed).length; const percentage = Math.round((completedTasks / totalTasks) * 100); progressBar.style.width = `${percentage}%`; progressPercentage.textContent = `${percentage}%`; }
    function createTaskCardHtml(task) { return ` <div class="task-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-[var(--brand-primary)]/10 transition-shadow duration-200 ${task.completed ? 'task-completed' : ''}" data-task-id="${task.id}"> <div class="flex flex-col sm:flex-row justify-between items-start gap-4"> <div class="flex-grow min-w-0"> <div class="flex items-start"> <input type="checkbox" id="${task.id}" class="task-checkbox mt-1 mr-3 flex-shrink-0" ${task.completed ? 'checked' : ''} data-task-id="${task.id}"> <label for="${task.id}" class="font-semibold text-gray-800 dark:text-gray-100 cursor-pointer break-words">${task.title}</label> </div> <p class="text-gray-600 dark:text-gray-400 text-sm mt-1 pl-7 break-words"> ${task.description || ''} </p> </div> <div class="text-sm w-full sm:w-auto flex-shrink-0 pl-7 sm:pl-0 mt-2 sm:mt-0 space-y-1 sm:flex sm:flex-col sm:items-end"> ${task.details ? ` <details class="w-full group"> <summary class="font-medium text-gray-700 dark:text-gray-300 hover:text-[var(--brand-primary)] dark:hover:text-[var(--brand-primary)] inline-flex items-center cursor-pointer list-none"> <span>Ver detalhes</span> <i data-lucide="chevron-down" class="details-chevron w-4 h-4 ml-1 group-open:rotate-180 transition-transform" aria-hidden="true"></i> </summary> <div class="details-content mt-3 pt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 prose prose-sm dark:prose-invert max-w-none prose-a:text-[var(--brand-primary)] prose-a:no-underline hover:prose-a:underline"> ${task.details} <button class="edit-task-details-btn" data-task-id="${task.id}"><i data-lucide="edit-3" class="w-3 h-3 mr-1 pointer-events-none"></i>Editar Detalhes</button> </div> </details>` : '<button class="edit-task-details-btn" data-task-id="${task.id}"><i data-lucide="plus-circle" class="w-3 h-3 mr-1 pointer-events-none"></i>Adicionar Detalhes</button>'} <button class="delete-task-btn" data-task-id="${task.id}"><i data-lucide="trash-2" class="w-3 h-3 mr-1 pointer-events-none"></i>Excluir Tarefa</button> </div> </div> </div> `; }

    // --- Renderização ---
    function renderTasks(sessionId) {
         console.log(`Rendering tasks for session: ${sessionId}`);
         const tasks = loadSessionTasks(sessionId); // Só carrega ativas por padrão
         const taskLists = { /* ... seletores ... */
             'definicao-iniciacao': document.querySelector('#definicao-iniciacao-content .task-list'),
             'planejamento-preparacao': document.querySelector('#planejamento-preparacao-content .task-list'),
             'execucao': document.querySelector('#execucao-content .task-list'),
             'pos-producao-encerramento': document.querySelector('#pos-producao-encerramento-content .task-list'),
         };

         Object.values(taskLists).forEach(list => { if (list) list.innerHTML = ''; });

         if (!tasks || tasks.length === 0) {
             const message = 'Nenhuma tarefa ativa nesta session.';
             Object.values(taskLists).forEach(list => { if (list) list.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 italic p-4">${message}</p>`; });
             updateProgressBar(sessionId);
             if (typeof lucide !== 'undefined') { try { lucide.createIcons(); } catch(e){ console.error(e); } }
             return;
         }

         const tasksByPhaseHtml = tasks.reduce((acc, task) => {
             if (!acc[task.phase]) acc[task.phase] = '';
             // Garante que task.id existe antes de criar o HTML
             if(task.id) acc[task.phase] += createTaskCardHtml(task);
             else console.warn("Task without ID found:", task);
             return acc;
         }, {});

         Object.entries(tasksByPhaseHtml).forEach(([phase, phaseHtml]) => {
             const listContainer = taskLists[phase];
             if (listContainer) { listContainer.innerHTML = phaseHtml; }
             else { console.warn(`Container for phase ${phase} not found.`); }
         });

         if (typeof lucide !== 'undefined') { try { lucide.createIcons(); } catch (e) { console.error("Error creating Lucide icons:", e); } }
         else { console.warn("Lucide library not loaded."); }

         updateProgressBar(sessionId);
     }
    function renderDeletedTasks(sessionId) {
         if (!deletedTaskList) return;
         const deletedTasks = loadDeletedSessionTasks(sessionId);
         deletedTaskList.innerHTML = '';

         if (deletedTasks.length === 0) {
             deletedTaskList.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400 italic py-2">Nenhuma tarefa na lixeira.</p>';
         } else {
             const fragment = document.createDocumentFragment();
             deletedTasks.sort((a,b) => (a.title || "").localeCompare(b.title || "")); // Ordena alfabeticamente
             deletedTasks.forEach(task => {
                 const item = document.createElement('div');
                 item.className = 'deleted-task-item';
                 item.innerHTML = `
                     <span title="${task.title || 'Tarefa sem título'}">${task.title || 'Tarefa sem título'}</span>
                     <button class="restore-task-btn" data-task-id="${task.id}" title="Restaurar tarefa">
                         <i data-lucide="rotate-ccw" class="w-4 h-4 pointer-events-none"></i>
                         <span class="sr-only">Restaurar</span>
                     </button>
                 `;
                 fragment.appendChild(item);
             });
             deletedTaskList.appendChild(fragment);
         }
         if (typeof lucide !== 'undefined') { try { lucide.createIcons(); } catch (e) { console.error(e); } }
     }

  // --- Handlers de Eventos ---
    function handlePhaseNavClick(event) { const button = event.target.closest('.phase-nav-btn'); if (button && !button.classList.contains('active') && button.dataset.phase) { switchPhase(button.dataset.phase); } }
    function handleContentContainerEvents(event) { const target = event.target; if (target.matches('.task-checkbox')) { handleCheckboxChange(target, currentSessionId); } else { const deleteButton = target.closest('.delete-task-btn'); const editDetailsButton = target.closest('.edit-task-details-btn'); if (deleteButton) { handleDeleteTask(deleteButton, currentSessionId); } else if (editDetailsButton) { handleEditTaskDetails(editDetailsButton, currentSessionId); } } }
    function handleDeletedListEvents(event) { const restoreButton = event.target.closest('.restore-task-btn'); if (restoreButton) { handleRestoreTask(restoreButton, currentSessionId); } }
    function handleCheckboxChange(checkbox, sessionId) { const taskId = checkbox.dataset.taskId; // Usa data-task-id
        const taskCard = checkbox.closest('.task-card'); const isCompleted = checkbox.checked; const tasks = loadSessionTasks(sessionId); const taskIndex = tasks.findIndex(t => t.id === taskId); if (taskIndex > -1) { tasks[taskIndex].completed = isCompleted; saveSessionTasks(sessionId, tasks); if (taskCard) { taskCard.classList.toggle('task-completed', isCompleted); } updateProgressBar(sessionId); } else { console.error(`Task ${taskId} not found.`); showToast('Erro ao atualizar.', 'error'); } }
    function handleDeleteTask(button, sessionId) { // Move para excluídas
        const taskId = button.dataset.taskId;
        const allTasks = loadSessionTasks(sessionId, true); // Pega TODAS as tarefas (ativas e potencialmente já marcadas como excluídas se houver erro)
        const taskIndex = allTasks.findIndex(t => t.id === taskId && !t.deleted); // Encontra tarefa ATIVA

        if (taskIndex > -1) {
            const taskToDelete = { ...allTasks[taskIndex] }; // Copia objeto COMPLETO
            if (confirm(`Mover a tarefa "${taskToDelete.title}" para a lixeira?`)) {
                const activeTasks = allTasks.filter(t => t.id !== taskId); // Tarefas ativas restantes
                const deletedTasks = loadDeletedSessionTasks(sessionId);
                if (!deletedTasks.some(t => t.id === taskId)) { // Evita duplicados
                    deletedTasks.push(taskToDelete); // Adiciona objeto completo à lixeira
                    saveDeletedSessionTasks(sessionId, deletedTasks);
                }
                saveSessionTasks(sessionId, activeTasks); // Salva ativas sem a excluída
                renderTasks(sessionId); // Atualiza lista principal
                renderDeletedTasks(sessionId); // Atualiza lixeira
                showToast('Tarefa movida para lixeira!', 'success');
            }
        } else { console.error(`Active task ${taskId} not found.`); showToast('Erro: Tarefa não encontrada ou já excluída.', 'error'); }
    }
    function handleRestoreTask(button, sessionId) { // Restaura da lixeira
        const taskId = button.dataset.taskId;
        const deletedTasks = loadDeletedSessionTasks(sessionId);
        const taskToRestoreIndex = deletedTasks.findIndex(t => t.id === taskId);

        if (taskToRestoreIndex > -1) {
            const restoredTaskData = { ...deletedTasks[taskToRestoreIndex] }; // Pega objeto COMPLETO
            const updatedDeletedTasks = deletedTasks.filter(t => t.id !== taskId); // Remove da lixeira
            const activeTasks = loadSessionTasks(sessionId); // Pega ativas atuais
            if (!activeTasks.some(t => t.id === taskId)) { // Adiciona se não existir
                 // Remove propriedade 'deleted' se existir, e garante 'completed'
                 delete restoredTaskData.deleted;
                 restoredTaskData.completed = restoredTaskData.completed || false;
                 activeTasks.push(restoredTaskData);
                 saveSessionTasks(sessionId, activeTasks); // Salva ativas
                 saveDeletedSessionTasks(sessionId, updatedDeletedTasks); // Salva lixeira
                 renderTasks(sessionId); // Re-renderiza ativas
                 renderDeletedTasks(sessionId); // Re-renderiza lixeira
                 showToast(`Tarefa "${restoredTaskData.title}" restaurada!`, 'success');
            } else {
                 // Tarefa já existe, apenas remove da lixeira
                 saveDeletedSessionTasks(sessionId, updatedDeletedTasks);
                 renderDeletedTasks(sessionId);
                 console.warn(`Task ${taskId} já existe, removendo apenas da lixeira.`);
                 showToast('Tarefa já estava ativa, removida da lixeira.', 'info');
            }
        } else { console.error(`Deleted task ${taskId} not found.`); showToast('Erro ao restaurar.', 'error'); }
    }
    function handleEditTaskDetails(button, sessionId) { const taskId = button.dataset.taskId; const tasks = loadSessionTasks(sessionId); const taskIndex = tasks.findIndex(t => t.id === taskId); if (taskIndex > -1) { const task = tasks[taskIndex]; const currentDetails = task.details || ''; const newDetails = prompt(`Editar detalhes para "${task.title}":\n(HTML simples permitido. Cuidado com aspas!)`, currentDetails); if (newDetails !== null && newDetails !== currentDetails) { tasks[taskIndex].details = newDetails; saveSessionTasks(sessionId, tasks); renderTasks(sessionId); showToast('Detalhes atualizados!', 'success'); } else if (newDetails !== null) { showToast('Nenhuma alteração feita.', 'info'); } } else { console.error(`Task ${taskId} not found.`); showToast('Erro: Tarefa não encontrada.', 'error'); } }
    function saveNotesHandler(sessionId) { let saveNoteTimeout; if (!notesTextarea || !saveNotesButton || !notesStatus) return; if (saveNotesButton.disabled) return; const notes = notesTextarea.value; saveNotesButton.disabled = true; notesStatus.textContent = 'Salvando...'; notesStatus.className = 'text-xs text-gray-500 dark:text-gray-400 h-4 flex-grow'; setTimeout(() => { const success = saveSessionNotes(sessionId, notes); if(success) { clearTimeout(saveNoteTimeout); notesStatus.textContent = 'Anotações salvas!'; notesStatus.className = 'text-xs text-green-600 dark:text-green-400 h-4 flex-grow'; saveNoteTimeout = setTimeout(() => { notesStatus.textContent = ''; }, 3000); } else { notesStatus.textContent = 'Erro ao salvar!'; notesStatus.className = 'text-xs text-red-600 dark:text-red-400 h-4 flex-grow'; } saveNotesButton.disabled = false; }, 200); }
    function handleNotesInput(sessionId) { let noteTypingTimeout; if (!notesStatus) return; clearTimeout(noteTypingTimeout); notesStatus.textContent = 'Digitando...'; notesStatus.className = 'text-xs text-gray-500 dark:text-gray-400 h-4 flex-grow'; noteTypingTimeout = setTimeout(() => saveNotesHandler(sessionId), 1500); }
    function loadNotes(sessionId) { if (!notesTextarea) return; notesTextarea.value = loadSessionNotes(sessionId); }
    function renameCurrentSession(sessionId) { if (!sessionId || sessionId === DEFAULT_SESSION_ID) { showToast("Não pode renomear session padrão.", 'info'); return; } const sessions = getAllSessions(); const sessionIndex = sessions.findIndex(s => s.id === sessionId); if (sessionIndex > -1) { const currentName = sessions[sessionIndex].name; const newName = prompt(`Renomear Session "${currentName}":`, currentName); if (newName && newName.trim() !== '' && newName.trim() !== currentName) { sessions[sessionIndex].name = newName.trim(); saveAllSessions(sessions); updateSessionDisplayInfo(sessionId); showToast("Session renomeada!", 'success'); } else if (newName !== null) { showToast("Nome inválido ou não modificado.", 'info'); } } else { showToast("Erro: Session não encontrada.", 'error'); } }
    function deleteCurrentSession(sessionId) { if (!sessionId || sessionId === DEFAULT_SESSION_ID) { showToast("Não pode excluir session padrão.", 'info'); return; } const sessions = getAllSessions(); const sessionToDelete = sessions.find(s => s.id === sessionId); if (sessionToDelete && confirm(`EXCLUIR PERMANENTEMENTE a Session "${sessionToDelete.name}" e TODOS os seus dados?`)) { const updatedSessions = sessions.filter(s => s.id !== sessionId); saveAllSessions(updatedSessions); try { localStorage.removeItem(`${LS_KEY_TASKS_PREFIX}${sessionId}`); localStorage.removeItem(`${LS_KEY_DELETED_TASKS_PREFIX}${sessionId}`); localStorage.removeItem(`${LS_KEY_NOTES_PREFIX}${sessionId}`); } catch (e) { console.error(`Error removing data for session ${sessionId}:`, e); showToast('Erro ao remover dados!', 'error'); } showToast(`Session "${sessionToDelete.name}" excluída.`, 'success'); setTimeout(() => { window.location.href = 'index.html'; }, 1500); } }


  // --- Inicialização Geral ---
  function initializeApp() {
      console.log("Initializing Session Guide...");
      currentSessionId = getCurrentSessionIdFromUrl();

      if (!currentSessionId) {
          console.error("Session ID is missing from URL. Redirecting to dashboard.");
          alert("ID da Session não encontrado. Retornando para a Dashboard.");
          window.location.replace('index.html');
          return;
      }
       // Verifica se a session realmente existe no índice
       const sessions = getAllSessions();
       if (!sessions.some(s => s.id === currentSessionId)) {
           console.error(`Session ID "${currentSessionId}" not found in index. Redirecting.`);
           alert(`A Session "${currentSessionId}" não foi encontrada. Verifique o ID ou retorne à Dashboard.`);
           window.location.replace('index.html');
           return;
       }

      console.log(`Loading session: ${currentSessionId}`);
      updateSessionDisplayInfo(currentSessionId);
      updateFooterInfo(); // Usar função de common.js
      loadTheme(); // Usar função de common.js

      renderTasks(currentSessionId);
      renderDeletedTasks(currentSessionId);
      loadNotes(currentSessionId);

      // --- Adiciona Listeners ---
      themeToggleButton?.addEventListener('click', toggleTheme); // Usar função de common.js
      phaseNavContainer?.addEventListener('click', handlePhaseNavClick);

      if (phaseContentContainer) {
          phaseContentContainer.addEventListener('change', handleContentContainerEvents);
          phaseContentContainer.addEventListener('click', handleContentContainerEvents);
      } else { console.error("CRITICAL: Phase content container not found."); }

       if (deletedTaskList) {
           deletedTaskList.addEventListener('click', handleDeletedListEvents);
       } else { console.error("Deleted task list container not found."); }

      saveNotesButton?.addEventListener('click', () => saveNotesHandler(currentSessionId));
      notesTextarea?.addEventListener('input', () => handleNotesInput(currentSessionId));
      renameSessionBtn?.addEventListener('click', () => renameCurrentSession(currentSessionId));
      deleteSessionBtn?.addEventListener('click', () => deleteCurrentSession(currentSessionId));
      goToDashboardBtn?.addEventListener('click', () => { window.location.href = 'index.html'; });
       showDeletedTasksBtn?.addEventListener('click', () => { deletedTasksSection?.classList.remove('hidden'); showDeletedTasksBtn.classList.add('hidden'); });
       hideDeletedTasksBtn?.addEventListener('click', () => { deletedTasksSection?.classList.add('hidden'); showDeletedTasksBtn?.classList.remove('hidden'); });

      // Foco inicial na primeira aba ativa
       const initialActiveButton = phaseNavContainer?.querySelector('.phase-nav-btn.active');
       if (initialActiveButton) {
           switchPhase(initialActiveButton.dataset.phase); // Garante que o conteúdo correto seja exibido
           initialActiveButton.focus();
       } else {
            // Fallback se nenhum botão estiver ativo inicialmente
            const firstButton = phaseNavContainer?.querySelector('.phase-nav-btn');
            if (firstButton) {
                 switchPhase(firstButton.dataset.phase);
                 firstButton.focus();
            }
       }


      // Inicializa Lucide Ícones DEPOIS que todo o HTML dinâmico for inserido
      if (typeof lucide !== 'undefined') {
          try { lucide.createIcons(); } catch (e) { console.error("Error creating Lucide icons:", e); }
      } else { console.warn("Lucide library not loaded."); }

      console.log(`Initialization complete for Session: ${currentSessionId}`);
  }

  // --- Executa a inicialização com Tratamento de Erro Global ---
  try { initializeApp(); } catch (error) { console.error("FATAL ERROR during initialization:", error); document.body.innerHTML = `<div style="padding: 20px; text-align: center; color: red; font-family: sans-serif; background-color: #111; height: 100vh;"><h1>Erro Crítico</h1><p>Ocorreu um erro grave ao carregar o Guia Prático. Verifique o console (F12) para detalhes.</p><p style="font-family: monospace; background-color: #333; padding: 10px; border-radius: 5px; color: #ffdddd; text-align: left; white-space: pre-wrap;">${error.message}\n\n${error.stack}</p></div>`; }

}); // Fim do DOMContentLoaded
