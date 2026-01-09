// ============================================
// Internationalization (i18n) System
// Romanian (RO) as default, English (EN) available
// ============================================

export type Language = 'ro' | 'en';

export interface Translations {
  [key: string]: string | Translations;
}

const translations: Record<Language, Translations> = {
  ro: {
    // Common
    common: {
      loading: 'Se încarcă...',
      error: 'Eroare',
      success: 'Succes',
      cancel: 'Anulează',
      save: 'Salvează',
      delete: 'Șterge',
      edit: 'Editează',
      create: 'Creează',
      search: 'Căutare',
      filter: 'Filtrează',
      clear: 'Șterge',
      confirm: 'Confirmă',
      close: 'Închide',
      copy: 'Copiază',
      copied: 'Copiat!',
      retry: 'Reîncearcă',
      back: 'Înapoi',
      next: 'Următorul',
      previous: 'Anterior',
      yes: 'Da',
      no: 'Nu',
      or: 'sau',
      and: 'și',
      all: 'Toate',
      none: 'Niciunul',
      selected: 'selectat(e)',
      required: 'obligatoriu',
      optional: 'opțional',
    },
    
    // App
    app: {
      name: 'Kotaemon',
      tagline: 'Asistent RAG inteligent',
      online: 'Online',
      offline: 'Offline',
      backendUnavailable: 'Backend indisponibil',
    },
    
    // Navigation
    nav: {
      chat: 'Chat',
      library: 'Bibliotecă PDF',
      files: 'Fișiere PDF',
      conversations: 'Conversații',
      projects: 'Proiecte',
      admin: 'Admin',
      adminPrompt: 'Prompt Sistem',
      adminRag: 'Setări RAG',
      adminMemory: 'Memorie',
      adminWorkspaces: 'Workspaces',
      adminUsers: 'Utilizatori',
      settingsModels: 'Modele',
      settingsPrompt: 'Sys Prompt',
      settingsRag: 'Conf. RAG',
      login: 'Autentificare',
      logout: 'Deconectare',
      newChat: 'Conversație nouă',
      newProject: 'Proiect nou',
    },
    
    // Projects
    projects: {
      title: 'Proiecte',
      create: 'Creează proiect',
      edit: 'Editează proiect',
      delete: 'Șterge proiect',
      name: 'Nume proiect',
      namePlaceholder: 'Ex: Cercetare doctorat...',
      description: 'Descriere',
      descriptionPlaceholder: 'Despre ce este acest proiect...',
      color: 'Culoare',
      conversations: 'conversații',
      noConversations: 'Nicio conversație încă',
      moveToProject: 'Mută în proiect',
      removeFromProject: 'Scoate din proiect',
      emptyState: 'Niciun proiect creat',
      emptyStateDescription: 'Creează un proiect pentru a organiza conversațiile.',
      deleteConfirm: 'Sigur vrei să ștergi acest proiect? Conversațiile vor fi păstrate.',
    },
    
    // Export
    export: {
      title: 'Exportă conversația',
      markdown: 'Exportă Markdown',
      pdf: 'Exportă PDF',
      success: 'Conversația a fost exportată',
      error: 'Eroare la export',
    },
    
    // Chat
    chat: {
      placeholder: 'Scrie un mesaj...',
      send: 'Trimite',
      stop: 'Oprește',
      regenerate: 'Regenerează',
      clearChat: 'Șterge conversația',
      deleteConversation: 'Șterge conversația',
      searchingPdfs: 'Caut în PDF-uri...',
      searchingMemory: 'Caut în memoria internă...',
      generating: 'Generez răspuns...',
      noContextFound: 'Nu am găsit context relevant pentru întrebarea ta.',
      emptyState: 'Începe o conversație nouă',
      emptyStateDescription: 'Pune o întrebare și voi căuta în documentele tale și în memoria internă.',
      charCount: 'caractere',
      maxChars: 'maxim',
      sources: 'Surse',
      hideSources: 'Ascunde sursele',
      showSources: 'Arată sursele',
      metadata: 'Metadate',
      model: 'Model',
      latency: 'Latență',
      chunks: 'Fragmente',
      copy: 'Copiază',
      copied: 'Copiat în clipboard!',
      edit: 'Editează mesajul',
      helpful: 'Răspuns util',
      notHelpful: 'Răspuns neutil',
      feedbackThanks: 'Mulțumim pentru feedback!',
      userLabel: 'Tu',
      assistantLabel: 'Asistent',
      hintSend: 'pentru trimitere',
      hintNewLine: 'pentru linie nouă',
      hintStop: 'pentru oprire',
    },
    
    // Quick Suggestions
    suggestions: {
      summarize: 'Rezumă acest document',
      findInfo: 'Găsește informații despre...',
      explain: 'Explică-mi conceptul de...',
      compare: 'Compară diferențele dintre...',
    },
    
    // Sources
    sources: {
      title: 'Surse & Citări',
      usePdfs: 'Caută în PDF-uri',
      useMemory: 'Caută în memorie',
      uploadPdf: 'Încarcă PDF',
      selectDocs: 'Selectează documente',
      allDocs: 'Toate documentele',
      noSources: 'Fără surse',
      pdfSource: 'PDF',
      memorySource: 'Memorie',
      page: 'Pagina',
      score: 'Scor',
      openPdf: 'Deschide PDF',
      viewContext: 'Vezi contextul',
    },
    
    // Reasoning
    reasoning: {
      title: 'Live Reasoning',
      thinking: 'Gândesc...',
      analyzing: 'Analizez întrebarea...',
      searching: 'Caut informații relevante...',
      processing: 'Procesez rezultatele...',
      generating: 'Formulez răspunsul...',
      complete: 'Complet',
      noActivity: 'Nicio activitate',
      noActivityDescription: 'Procesul de gândire va apărea aici când trimiți un mesaj.',
    },
    
    // Library
    library: {
      title: 'Bibliotecă PDF',
      uploadTitle: 'Încarcă documente',
      uploadDescription: 'Trage fișiere PDF aici sau click pentru a selecta',
      uploadButton: 'Selectează fișiere',
      uploading: 'Se încarcă...',
      indexing: 'Se indexează...',
      ready: 'Pregătit',
      failed: 'Eșuat',
      size: 'Dimensiune',
      pages: 'pagini',
      uploadedAt: 'Încărcat la',
      indexedAt: 'Indexat la',
      reindex: 'Reindexează',
      viewPdf: 'Vizualizează',
      deleteDoc: 'Șterge document',
      emptyState: 'Niciun document încărcat',
      emptyStateDescription: 'Încarcă primul tău PDF pentru a începe.',
      maxSize: 'Dimensiune maximă',
      onlyPdf: 'Doar fișiere PDF',
      invalidFile: 'Fișier invalid',
      fileTooLarge: 'Fișierul este prea mare',
      uploadError: 'Eroare la încărcare',
    },
    
    // Files
    files: {
      title: 'Fișiere PDF',
      indexNew: 'Indexează fișiere noi',
      deleteAll: 'Șterge toate fișierele',
      deleteAllTitle: 'Ștergi toate fișierele?',
      deleteAllDescription: 'Toate fișierele PDF și stările lor de indexare vor fi șterse. Această acțiune nu poate fi anulată.',
      deleteAllConfirm: 'Șterge tot',
      deleteAllSuccessTitle: 'Fișiere șterse',
      deleteAllSuccessDescription: 'Toate fișierele au fost șterse.',
      deleteAllErrorDescription: 'Nu s-au putut șterge toate fișierele.',
      uploadTitle: 'Încarcă fișiere PDF',
      uploadDrop: 'Plasează fișierele aici',
      uploadHint: 'Drag & drop sau click pentru a selecta',
      searchPlaceholder: 'Caută fișiere...',
      filterAll: 'Toate',
      filterIndexed: 'Indexate',
      filterNotIndexed: 'Neindexate',
      emptyNone: 'Niciun fișier încărcat',
      emptyFiltered: 'Niciun fișier găsit cu filtrele selectate',
      preview: 'Previzualizare',
      reindex: 'Reindexare',
      deleteConfirmTitle: 'Șterge fișierul?',
      deleteConfirmDescription: 'Ești sigur că vrei să ștergi "{filename}"? Această acțiune nu poate fi anulată.',
      statusIndexing: 'Se indexează',
      statusReady: 'Indexat',
      statusFailed: 'Eșuat',
      statusNotIndexed: 'Neindexat',
      uploadInvalidTitle: 'Format invalid',
      uploadInvalidDescription: 'Doar fișiere PDF sunt acceptate.',
      uploadErrorTitle: 'Eroare',
      uploadErrorDescription: 'Nu s-a putut încărca {filename}',
      loadErrorTitle: 'Nu am putut încărca fișierele',
      loadErrorDescription: 'Verifică conexiunea și încearcă din nou.',
      deleteSuccessTitle: 'Fișier șters',
      deleteSuccessDescription: '{filename} a fost șters.',
      deleteErrorDescription: 'Nu s-a putut șterge fișierul.',
      indexNothingTitle: 'Nimic de indexat',
      indexNothingDescription: 'Toate fișierele sunt deja indexate.',
      indexCompleteTitle: 'Indexare completă',
      indexCompleteDescription: '{indexed} fișiere indexate, {failed} eșuate.',
      indexErrorDescription: 'Indexarea a eșuat.',
      reindexCompleteTitle: 'Reindexare completă',
      reindexCompleteDescription: '{filename} a fost reindexat.',
      reindexErrorDescription: 'Reindexarea a eșuat.',
    },

    // Conversations
    conversations: {
      title: 'Conversații',
      noConversations: 'Nicio conversație',
      noConversationsDescription: 'Începe o conversație nouă din pagina de chat.',
      rename: 'Redenumește',
      delete: 'Șterge',
      messages: 'mesaje',
      lastUpdated: 'Ultima actualizare',
    },
    
    // Admin
    admin: {
      title: 'Panou de administrare',
      dashboard: 'Tablou de bord',
      systemPrompt: 'Prompt sistem',
      ragSettings: 'Setări RAG',
      memory: 'Memorie internă',
      stats: {
        promptVersion: 'Versiune prompt',
        docsReady: 'Documente pregătite',
        docsIndexing: 'În indexare',
        docsFailed: 'Eșuate',
        memoryEntries: 'Înregistrări memorie',
      },
      warning: {
        title: 'Atenție!',
        promptInjection: 'Conținutul utilizatorilor poate conține instrucțiuni. Promptul sistem trebuie să rămână autoritar.',
        editingPrompt: 'Editezi promptul sistem. Modificările vor afecta toate conversațiile noi.',
        editingMemory: 'Editezi memoria internă. Conținutul va fi folosit pentru răspunsuri.',
      },
    },
    
    // Prompt Editor
    prompt: {
      title: 'Editor Prompt Sistem',
      currentVersion: 'Versiunea curentă',
      placeholder: 'Introdu promptul sistem aici...',
      notes: 'Note de versiune',
      notesPlaceholder: 'Descrie modificările...',
      saveNewVersion: 'Salvează versiune nouă',
      testPrompt: 'Testează prompt',
      testDescription: 'Testează promptul fără a-l salva (systemPromptOverride)',
      history: 'Istoric versiuni',
      restore: 'Restaurează',
      noHistory: 'Niciun istoric disponibil',
    },
    
    // RAG Settings
    rag: {
      title: 'Setări RAG',
      chunkSize: 'Dimensiune fragment',
      chunkSizeHelp: 'Numărul de caractere per fragment de text',
      overlap: 'Suprapunere',
      overlapHelp: 'Caractere suprapuse între fragmente',
      topK: 'Top K rezultate',
      topKHelp: 'Numărul maxim de fragmente returnate',
      threshold: 'Prag similaritate',
      thresholdHelp: 'Scorul minim pentru includere (0-1)',
      reranker: 'Activează reranker',
      rerankerHelp: 'Reordonează rezultatele pentru relevanță',
      defaultSources: 'Surse implicite',
      citationVerbosity: 'Detaliu citări',
      citationMinimal: 'Minimal',
      citationNormal: 'Normal',
      citationDetailed: 'Detaliat',
      presets: 'Presetări',
      presetFast: 'Rapid',
      presetBalanced: 'Echilibrat',
      presetPrecise: 'Precis',
    },
    
    // Memory
    memory: {
      title: 'Memorie Internă',
      addEntry: 'Adaugă înregistrare',
      editEntry: 'Editează înregistrare',
      entryTitle: 'Titlu',
      entryTitlePlaceholder: 'Titlul înregistrării...',
      entryContent: 'Conținut',
      entryContentPlaceholder: 'Conținutul înregistrării...',
      entryTags: 'Etichete',
      entryTagsPlaceholder: 'Separă etichetele cu virgulă',
      indexed: 'Indexat',
      notIndexed: 'Neindexat',
      reindex: 'Reindexează',
      reindexAll: 'Reindexează tot',
      import: 'Importă JSON',
      export: 'Exportă JSON',
      emptyState: 'Memoria internă este goală',
      emptyStateDescription: 'Adaugă înregistrări pentru a îmbogăți răspunsurile.',
      deleteConfirm: 'Sigur vrei să ștergi această înregistrare?',
    },
    
    // Auth
    auth: {
      loginTitle: 'Autentificare',
      username: 'Utilizator',
      usernamePlaceholder: 'Introdu numele de utilizator...',
      password: 'Parolă',
      passwordPlaceholder: 'Introdu parola...',
      login: 'Autentificare',
      logout: 'Deconectare',
      invalidCredentials: 'Credențiale invalide',
      accountDisabled: 'Contul este dezactivat',
      loginSuccess: 'Autentificare reușită',
      loginError: 'Eroare la autentificare',
      demoCredentials: 'Credențiale demo',
      sessionExpired: 'Sesiunea a expirat',
      unauthorized: 'Acces neautorizat',
    },
    
    // Errors
    errors: {
      generic: 'A apărut o eroare neașteptată',
      network: 'Eroare de rețea. Verifică conexiunea.',
      unauthorized: 'Nu ai permisiunea necesară',
      forbidden: 'Acces interzis',
      notFound: 'Resursa nu a fost găsită',
      serverError: 'Eroare de server',
      rateLimited: 'Prea multe cereri. Așteaptă',
      seconds: 'secunde',
      payloadTooLarge: 'Fișierul este prea mare',
      validationError: 'Date invalide',
      copyFailed: 'Nu am putut copia în clipboard',
    },
    
    // Accessibility
    a11y: {
      skipToMain: 'Sari la conținut',
      toggleSidebar: 'Deschide/închide bara laterală',
      toggleTheme: 'Schimbă tema',
      toggleLanguage: 'Schimbă limba',
      closeModal: 'Închide fereastra',
      expandSection: 'Extinde secțiunea',
      collapseSection: 'Restrânge secțiunea',
    },

    // Docs
    docs: {
      tabs: {
        migration: 'Migrare',
        overview: 'Prezentare',
        setup: 'Setup & Config',
        n8n: 'n8n Workflows',
        keycloak: 'Keycloak',
        database: 'Bază de Date',
        api: 'API Reference',
        stores: 'State Management',
        components: 'Componente',
      },
    },
  },
  
  en: {
    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      filter: 'Filter',
      clear: 'Clear',
      confirm: 'Confirm',
      close: 'Close',
      copy: 'Copy',
      copied: 'Copied!',
      retry: 'Retry',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      yes: 'Yes',
      no: 'No',
      or: 'or',
      and: 'and',
      all: 'All',
      none: 'None',
      selected: 'selected',
      required: 'required',
      optional: 'optional',
    },
    
    // App
    app: {
      name: 'Kotaemon',
      tagline: 'Intelligent RAG Assistant',
      online: 'Online',
      offline: 'Offline',
      backendUnavailable: 'Backend unavailable',
    },
    
    // Navigation
    nav: {
      chat: 'Chat',
      library: 'PDF Library',
      files: 'PDF Files',
      conversations: 'Conversations',
      projects: 'Projects',
      admin: 'Admin',
      adminPrompt: 'System Prompt',
      adminRag: 'RAG Settings',
      adminMemory: 'Memory',
      adminWorkspaces: 'Workspaces',
      adminUsers: 'Users',
      settingsModels: 'Models',
      settingsPrompt: 'Sys Prompt',
      settingsRag: 'RAG Conf.',
      login: 'Login',
      logout: 'Logout',
      newChat: 'New conversation',
      newProject: 'New project',
    },
    
    // Projects
    projects: {
      title: 'Projects',
      create: 'Create project',
      edit: 'Edit project',
      delete: 'Delete project',
      name: 'Project name',
      namePlaceholder: 'E.g.: PhD research...',
      description: 'Description',
      descriptionPlaceholder: 'What is this project about...',
      color: 'Color',
      conversations: 'conversations',
      noConversations: 'No conversations yet',
      moveToProject: 'Move to project',
      removeFromProject: 'Remove from project',
      emptyState: 'No projects created',
      emptyStateDescription: 'Create a project to organize your conversations.',
      deleteConfirm: 'Are you sure you want to delete this project? Conversations will be kept.',
    },
    
    // Export
    export: {
      title: 'Export conversation',
      markdown: 'Export Markdown',
      pdf: 'Export PDF',
      success: 'Conversation exported',
      error: 'Export error',
    },
    
    // Chat
    chat: {
      placeholder: 'Type a message...',
      send: 'Send',
      stop: 'Stop',
      regenerate: 'Regenerate',
      clearChat: 'Clear chat',
      deleteConversation: 'Delete conversation',
      searchingPdfs: 'Searching PDFs...',
      searchingMemory: 'Searching internal memory...',
      generating: 'Generating response...',
      noContextFound: 'No relevant context found for your question.',
      emptyState: 'Start a new conversation',
      emptyStateDescription: 'Ask a question and I will search your documents and internal memory.',
      charCount: 'characters',
      maxChars: 'maximum',
      sources: 'Sources',
      hideSources: 'Hide sources',
      showSources: 'Show sources',
      metadata: 'Metadata',
      model: 'Model',
      latency: 'Latency',
      chunks: 'Chunks',
      copy: 'Copy',
      copied: 'Copied to clipboard!',
      edit: 'Edit message',
      helpful: 'Helpful response',
      notHelpful: 'Not helpful',
      feedbackThanks: 'Thanks for your feedback!',
      userLabel: 'You',
      assistantLabel: 'Assistant',
      hintSend: 'to send',
      hintNewLine: 'for a new line',
      hintStop: 'to stop',
    },
    
    // Quick Suggestions
    suggestions: {
      summarize: 'Summarize this document',
      findInfo: 'Find information about...',
      explain: 'Explain the concept of...',
      compare: 'Compare the differences between...',
    },
    
    // Sources
    sources: {
      title: 'Sources & Citations',
      usePdfs: 'Search in PDFs',
      useMemory: 'Search in memory',
      uploadPdf: 'Upload PDF',
      selectDocs: 'Select documents',
      allDocs: 'All documents',
      noSources: 'No sources',
      pdfSource: 'PDF',
      memorySource: 'Memory',
      page: 'Page',
      score: 'Score',
      openPdf: 'Open PDF',
      viewContext: 'View context',
    },
    
    // Reasoning
    reasoning: {
      title: 'Live Reasoning',
      thinking: 'Thinking...',
      analyzing: 'Analyzing question...',
      searching: 'Searching for relevant information...',
      processing: 'Processing results...',
      generating: 'Formulating response...',
      complete: 'Complete',
      noActivity: 'No activity',
      noActivityDescription: 'The thinking process will appear here when you send a message.',
    },
    
    // Library
    library: {
      title: 'PDF Library',
      uploadTitle: 'Upload documents',
      uploadDescription: 'Drag PDF files here or click to select',
      uploadButton: 'Select files',
      uploading: 'Uploading...',
      indexing: 'Indexing...',
      ready: 'Ready',
      failed: 'Failed',
      size: 'Size',
      pages: 'pages',
      uploadedAt: 'Uploaded at',
      indexedAt: 'Indexed at',
      reindex: 'Reindex',
      viewPdf: 'View',
      deleteDoc: 'Delete document',
      emptyState: 'No documents uploaded',
      emptyStateDescription: 'Upload your first PDF to get started.',
      maxSize: 'Maximum size',
      onlyPdf: 'PDF files only',
      invalidFile: 'Invalid file',
      fileTooLarge: 'File is too large',
      uploadError: 'Upload error',
    },

    // Files
    files: {
      title: 'PDF Files',
      indexNew: 'Index new files',
      deleteAll: 'Delete all files',
      deleteAllTitle: 'Delete all files?',
      deleteAllDescription: 'All PDF files and their index states will be removed. This action cannot be undone.',
      deleteAllConfirm: 'Delete all',
      deleteAllSuccessTitle: 'Files deleted',
      deleteAllSuccessDescription: 'All files have been deleted.',
      deleteAllErrorDescription: 'Could not delete all files.',
      uploadTitle: 'Upload PDF files',
      uploadDrop: 'Drop files here',
      uploadHint: 'Drag & drop or click to select',
      searchPlaceholder: 'Search files...',
      filterAll: 'All',
      filterIndexed: 'Indexed',
      filterNotIndexed: 'Not indexed',
      emptyNone: 'No files uploaded',
      emptyFiltered: 'No files found for the selected filters',
      preview: 'Preview',
      reindex: 'Reindex',
      deleteConfirmTitle: 'Delete file?',
      deleteConfirmDescription: 'Are you sure you want to delete "{filename}"? This action cannot be undone.',
      statusIndexing: 'Indexing',
      statusReady: 'Indexed',
      statusFailed: 'Failed',
      statusNotIndexed: 'Not indexed',
      uploadInvalidTitle: 'Invalid format',
      uploadInvalidDescription: 'Only PDF files are accepted.',
      uploadErrorTitle: 'Error',
      uploadErrorDescription: 'Could not upload {filename}',
      loadErrorTitle: 'Could not load files',
      loadErrorDescription: 'Check your connection and try again.',
      deleteSuccessTitle: 'File deleted',
      deleteSuccessDescription: '{filename} was deleted.',
      deleteErrorDescription: 'Could not delete the file.',
      indexNothingTitle: 'Nothing to index',
      indexNothingDescription: 'All files are already indexed.',
      indexCompleteTitle: 'Indexing complete',
      indexCompleteDescription: '{indexed} files indexed, {failed} failed.',
      indexErrorDescription: 'Indexing failed.',
      reindexCompleteTitle: 'Reindexing complete',
      reindexCompleteDescription: '{filename} was reindexed.',
      reindexErrorDescription: 'Reindexing failed.',
    },
    
    // Conversations
    conversations: {
      title: 'Conversations',
      noConversations: 'No conversations',
      noConversationsDescription: 'Start a new conversation from the chat page.',
      rename: 'Rename',
      delete: 'Delete',
      messages: 'messages',
      lastUpdated: 'Last updated',
    },
    
    // Admin
    admin: {
      title: 'Admin Panel',
      dashboard: 'Dashboard',
      systemPrompt: 'System Prompt',
      ragSettings: 'RAG Settings',
      memory: 'Internal Memory',
      stats: {
        promptVersion: 'Prompt version',
        docsReady: 'Documents ready',
        docsIndexing: 'Indexing',
        docsFailed: 'Failed',
        memoryEntries: 'Memory entries',
      },
      warning: {
        title: 'Warning!',
        promptInjection: 'User content may contain instructions. The system prompt must remain authoritative.',
        editingPrompt: 'You are editing the system prompt. Changes will affect all new conversations.',
        editingMemory: 'You are editing internal memory. Content will be used for responses.',
      },
    },
    
    // Prompt Editor
    prompt: {
      title: 'System Prompt Editor',
      currentVersion: 'Current version',
      placeholder: 'Enter system prompt here...',
      notes: 'Version notes',
      notesPlaceholder: 'Describe the changes...',
      saveNewVersion: 'Save new version',
      testPrompt: 'Test prompt',
      testDescription: 'Test the prompt without saving (systemPromptOverride)',
      history: 'Version history',
      restore: 'Restore',
      noHistory: 'No history available',
    },
    
    // RAG Settings
    rag: {
      title: 'RAG Settings',
      chunkSize: 'Chunk size',
      chunkSizeHelp: 'Number of characters per text chunk',
      overlap: 'Overlap',
      overlapHelp: 'Overlapping characters between chunks',
      topK: 'Top K results',
      topKHelp: 'Maximum number of chunks returned',
      threshold: 'Similarity threshold',
      thresholdHelp: 'Minimum score for inclusion (0-1)',
      reranker: 'Enable reranker',
      rerankerHelp: 'Reorder results for relevance',
      defaultSources: 'Default sources',
      citationVerbosity: 'Citation detail',
      citationMinimal: 'Minimal',
      citationNormal: 'Normal',
      citationDetailed: 'Detailed',
      presets: 'Presets',
      presetFast: 'Fast',
      presetBalanced: 'Balanced',
      presetPrecise: 'Precise',
    },
    
    // Memory
    memory: {
      title: 'Internal Memory',
      addEntry: 'Add entry',
      editEntry: 'Edit entry',
      entryTitle: 'Title',
      entryTitlePlaceholder: 'Entry title...',
      entryContent: 'Content',
      entryContentPlaceholder: 'Entry content...',
      entryTags: 'Tags',
      entryTagsPlaceholder: 'Separate tags with comma',
      indexed: 'Indexed',
      notIndexed: 'Not indexed',
      reindex: 'Reindex',
      reindexAll: 'Reindex all',
      import: 'Import JSON',
      export: 'Export JSON',
      emptyState: 'Internal memory is empty',
      emptyStateDescription: 'Add entries to enrich responses.',
      deleteConfirm: 'Are you sure you want to delete this entry?',
    },
    
    // Auth
    auth: {
      loginTitle: 'Login',
      username: 'Username',
      usernamePlaceholder: 'Enter username...',
      password: 'Password',
      passwordPlaceholder: 'Enter password...',
      login: 'Login',
      logout: 'Logout',
      invalidCredentials: 'Invalid credentials',
      accountDisabled: 'Account is disabled',
      loginSuccess: 'Login successful',
      loginError: 'Login error',
      demoCredentials: 'Demo credentials',
      sessionExpired: 'Session expired',
      unauthorized: 'Unauthorized access',
    },
    
    // Errors
    errors: {
      generic: 'An unexpected error occurred',
      network: 'Network error. Check your connection.',
      unauthorized: 'You do not have permission',
      forbidden: 'Access forbidden',
      notFound: 'Resource not found',
      serverError: 'Server error',
      rateLimited: 'Too many requests. Wait',
      seconds: 'seconds',
      payloadTooLarge: 'File is too large',
      validationError: 'Invalid data',
      copyFailed: 'Could not copy to clipboard',
    },
    
    // Accessibility
    a11y: {
      skipToMain: 'Skip to content',
      toggleSidebar: 'Toggle sidebar',
      toggleTheme: 'Toggle theme',
      toggleLanguage: 'Toggle language',
      closeModal: 'Close modal',
      expandSection: 'Expand section',
      collapseSection: 'Collapse section',
    },

    // Docs
    docs: {
      tabs: {
        migration: 'Migration',
        overview: 'Overview',
        setup: 'Setup & Config',
        n8n: 'n8n Workflows',
        keycloak: 'Keycloak',
        database: 'Database',
        api: 'API Reference',
        stores: 'State Management',
        components: 'Components',
      },
    },
  },
};

// Get nested translation value
function getNestedValue(obj: Translations, path: string): string {
  const keys = path.split('.');
  let current: Translations | string = obj;
  
  for (const key of keys) {
    if (typeof current === 'string') return path;
    if (current[key] === undefined) return path;
    current = current[key] as Translations | string;
  }
  
  return typeof current === 'string' ? current : path;
}

export function t(key: string, lang: Language = 'ro'): string {
  return getNestedValue(translations[lang], key);
}

export function getTranslations(lang: Language): Translations {
  return translations[lang];
}

export function formatTranslation(
  value: string,
  params: Record<string, string | number>
): string {
  return value.replace(/\{(\w+)\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match
  );
}
