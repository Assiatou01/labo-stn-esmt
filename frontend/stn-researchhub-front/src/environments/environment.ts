export const environment = {
  production: false,

  // Tous les appels Angular passent par le Gateway
  apiUrl: 'http://localhost:8765',

  keycloak: {
    url: 'http://localhost:8080',
    realm: 'lab-stn-realm',
    clientId: 'user-manager-admin'
  }
};