export const environment = {
  production: false,
  // URL unique de la Gateway spring Cloud
  gatewayUrl: 'http://localhost:8765',

  endpoints: {
    theses: '/api/v1/theses',
    axes: '/api/v1/axes-recherche',
    domaines: '/api/v1/domaines-recherche',
    livrables: '/api/v1/livrables',
    evaluations: '/api/v1/evaluations',
    aiChat: '/api/ai/chat',
    aiSearch: '/api/ai/search',
    aiSummarize: '/api/ai/summarize',
    users: '/api/users'
  }
}

  