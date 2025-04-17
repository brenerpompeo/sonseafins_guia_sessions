--- START OF FILE dashboard.js ---

document.addEventListener('DOMContentLoaded', () => {
    const sessionListContainer = document.getElementById('sessionList');
    const createSessionBtn = document.getElementById('createSessionBtn');
    const noSessionsMessage = document.getElementById('noSessionsMessage');
    const themeToggleButton = document.getElementById('themeToggle'); // Adicionado para tema

    // --- Funções da Dashboard ---

    /** Renderiza a lista de sessions existentes */
    function renderSessionList() {
        if (!sessionListContainer || !noSessionsMessage) {
            console.error("Dashboard elements not found (sessionList or noSessionsMessage).");
            return;
        }

        const sessions = getAllSessions(); // Função de common.js
        sessionListContainer.innerHTML = ''; // Limpa a lista

        if (sessions.length === 0) {
            noSessionsMessage.classList.remove('hidden');
        } else {
            noSessionsMessage.classList.add('hidden');
            const fragment = document.createDocumentFragment();
            sessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Mais recentes primeiro

            sessions.forEach(session => {
                const sessionElement = document.createElement('div');
                sessionElement.dataset.sessionId = session.id; // Adiciona ID para referência
                sessionElement.className = 'session-item p-4 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-lg hover:border-[var(--brand-primary)] dark:hover:border-[var(--brand-primary)] transition duration-200 flex justify-between items-center gap-2';

                sessionElement.innerHTML = `
                    <a href="session.html?session=${session.id}" class="font-medium text-[var(--brand-primary)] hover:underline flex-grow mr-4 truncate" title="${session.name || `Session #${session.id}`}">
                        ${session.name || `Session #${session.id}`}
                    </a>
                    <span class="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 whitespace-nowrap">
                        Criada em: ${new Date(session.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                     <button class="delete-session-from-dashboard-btn p-1 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full flex-shrink-0" title="Excluir esta session">
                        <i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i>
                        <span class="sr-only">Excluir</span>
                     </button>
                    `;
                fragment.appendChild(sessionElement);
            });
            sessionListContainer.appendChild(fragment);

            // Reativa ícones Lucide APÓS adicionar os botões à lista
            if (typeof lucide !== 'undefined') {
                try { lucide.createIcons(); } catch(e){ console.error("Lucide error on renderSessionList:", e); }
            }
        }
    }

     /** Exclui uma session diretamente do dashboard */
     function deleteSessionFromDashboard(button) {
         const sessionItem = button.closest('.session-item');
         const sessionId = sessionItem?.dataset.sessionId;
         if (!sessionId) {
            console.error("Could not find session ID for deletion.");
            showToast('Erro ao encontrar ID da session.', 'error');
            return;
         }

         const sessions = getAllSessions();
         const sessionToDelete = sessions.find(s => s.id === sessionId);

         if (!sessionToDelete) {
             showToast("Erro: Session não encontrada para exclusão.", 'error');
             return;
         }

         if (confirm(`Tem certeza que deseja EXCLUIR PERMANENTEMENTE a Session "${sessionToDelete.name}" e todos os seus dados (tarefas e notas)? ESTA AÇÃO NÃO PODE SER DESFEITA.`)) {
             // Remove do índice
             const updatedSessions = sessions.filter(s => s.id !== sessionId);
             saveAllSessions(updatedSessions);

             // Remove dados específicos da session (tarefas ativas, excluídas e notas)
             try {
                 localStorage.removeItem(`${LS_KEY_TASKS_PREFIX}${sessionId}`);
                 localStorage.removeItem(`${LS_KEY_DELETED_TASKS_PREFIX}${sessionId}`);
                 localStorage.removeItem(`${LS_KEY_NOTES_PREFIX}${sessionId}`);
             } catch (e) {
                 console.error(`Error removing data for deleted session ${sessionId}:`, e);
                 showToast('Erro ao remover dados da session excluída!', 'error');
             }

             showToast(`Session "${sessionToDelete.name}" excluída.`, 'success');
             renderSessionList(); // Atualiza a lista na UI
         }
     }


    /** Cria uma nova session */
    function createNewSession() {
        const sessionName = prompt("Digite o nome para a nova Session (ex: Session #3 - Evento Z):");
        if (sessionName === null) return; // Usuário cancelou
        if (!sessionName || sessionName.trim() === '') {
             showToast("Nome da session inválido.", 'error');
             return;
        }

        const sessions = getAllSessions();
        // Cria um ID mais robusto combinando timestamp e aleatório
        const newSessionId = `${Date.now()}-${crypto.randomUUID().substring(0, 8)}`;

        const newSessionData = {
            id: newSessionId,
            name: sessionName.trim(),
            createdAt: new Date().toISOString()
        };

        sessions.push(newSessionData);
        saveAllSessions(sessions); // Salva o índice atualizado

        // Inicializa os dados da nova session (tarefas e notas)
        // Garante que defaultTasksTemplate esteja definido (de common.js)
        if(typeof defaultTasksTemplate !== 'undefined') {
            // Gera tarefas com IDs únicos baseados no template
            const initialTasks = defaultTasksTemplate.map(task => ({
                ...task,
                id: crypto.randomUUID(),
                completed: false
            }));
            saveSessionTasks(newSessionId, initialTasks); // Salva tarefas (de common.js)
            saveSessionNotes(newSessionId, []); // Salva array de notas VAZIO (de common.js)
            console.log(`Session "${sessionName}" created with ID: ${newSessionId}`);
            showToast(`Session "${sessionName}" criada!`, 'success');
            renderSessionList(); // Atualiza a lista na dashboard
        } else {
            console.error("defaultTasksTemplate is not defined. Cannot initialize new session tasks.");
            showToast("Erro: Template de tarefas não encontrado. Session criada sem tarefas.", 'error');
             renderSessionList(); // Atualiza lista mesmo assim
        }
    }

    // --- Inicialização da Dashboard ---
    function initializeDashboard() {
        console.log("Initializing Dashboard...");
        loadTheme(); // Carrega tema preferido
        renderSessionList(); // Renderiza a lista inicial

        // Listener para o botão de criar
        if (createSessionBtn) {
            createSessionBtn.addEventListener('click', createNewSession);
        } else {
             console.error("Create Session Button not found.");
        }

         // Listener para botões de excluir na lista (delegação de evento)
         if (sessionListContainer) {
             sessionListContainer.addEventListener('click', (event) => {
                 // Verifica se o clique foi no botão ou no ícone dentro dele
                 const deleteButton = event.target.closest('.delete-session-from-dashboard-btn');
                 if (deleteButton) {
                     deleteSessionFromDashboard(deleteButton);
                 }
             });
         }

         // Listener para o botão de tema
         if (themeToggleButton) {
            themeToggleButton.addEventListener('click', toggleTheme);
         }

         // Atualiza o rodapé
         updateFooterInfo(); // Função de common.js

         // Inicializa Lucide Ícones (se já não foi feito pelo HTML)
         if (typeof lucide !== 'undefined') {
             try { lucide.createIcons(); } catch (e) { console.error("Lucide error on dashboard init:", e); }
         }

        console.log("Dashboard initialized.");
    }

    // Executa a inicialização da dashboard
    initializeDashboard();
});
--- END OF FILE dashboard.js ---
