const cron = require('node-cron');
const fetch = require('node-fetch');

// Configuration
const ACCESS_TOKEN = 'votre_jeton_acces';
const PAGE_ID = 'votre_id_page';
const JSON_URL = 'https://exemple.com/votre-fichier.json';

// Tâche planifiée pour s'exécuter tous les jours à 9h
cron.schedule('0 9 * * *', async () => {
  console.log('Exécution de la publication quotidienne');
  
  try {
    // Récupération des données JSON
    const response = await fetch(JSON_URL);
    const posts = await response.json();
    
    // Calcul de l'index en fonction de la date
    const today = new Date();
    const startDate = new Date(2023, 0, 1); // Date de début
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
    const postIndex = diffDays % posts.length;
    
    // Publication sur Facebook
    const postResult = await publishToFacebook(ACCESS_TOKEN, PAGE_ID, posts[postIndex]);
    console.log('Publication réussie:', postResult.id);
  } catch (error) {
    console.error('Erreur:', error);
  }
});

async function publishToFacebook(accessToken, pageId, post) {
  const url = `https://graph.facebook.com/v19.0/${pageId}/feed?access_token=${accessToken}`;
  
  const formData = new FormData();
  formData.append('message', post.message);
  
  if (post.image_url) {
    formData.append('url', post.image_url);
  }
  
  const response = await fetch(url, {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
}
