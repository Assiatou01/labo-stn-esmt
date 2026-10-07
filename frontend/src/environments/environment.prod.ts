// Environnement de production.
// L'URL du gateway doit être vide en production si un proxy Angular est configuré,
// ou pointer vers le vrai domaine déployé.
export const environment = {
  production: true,
  apiGatewayUrl: '' // Vide = même origine (proxy Nginx/Apache devant le frontend)
};
