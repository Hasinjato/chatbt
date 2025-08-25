import cron from 'node-cron';
import fetch from 'node-fetch';
import FormData from 'form-data';
import express from 'express';

// Configuration
const ACCESS_TOKEN = 'EAAedilgaf3gBPVdGSyNyTEoakezZA9tT5WGb8vZCvZBj0TXnh32ZCtKu9UgC8qRjnKs3XUVppgxeHbSAoPFC3oPO2oN1lQWkvs5CpQb9mtcNj5BZCoY7uAktxVipSqfuaFXBrzbqBksXBXB1dQQWaGyOEchoxJmMygJhlTbeapAsaPwBHpG42iU7HGdkCancuuZB1MGJGHVk3Chd52kwZDZD';
const PAGE_ID = '746290111906895';
const JSON_URL = 'https://github.com/Hasinjato/chatbt/blob/main/my.json';

const app = express();
const PORT = process.env.PORT || 3000;


// Middleware basique
app.use(express.json());

// Route health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Facebook Auto-Poster',
    schedule: 'Daily at 9:00 AM',
    github: 'https://github.com/Hasinj/chatbt'
  });
});


// Route pour forcer une publication manuellement
app.post('/publish-now', async (req, res) => {
  try {
    const result = await publishScheduledPost();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Facebook Auto-Poster service started...');
});

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
