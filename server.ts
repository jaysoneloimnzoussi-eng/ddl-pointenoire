import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API health
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'operational',
      entity: 'Direction Départementale des Loisirs de Pointe-Noire (DDL-PN)',
      system: 'Système Intégré DDL-PN',
      version: '2.0.0-PROD-2026',
      timestamp: new Date().toISOString(),
      country: 'République du Congo'
    });
  });

  // Server-Side Gemini API Integration for DDL-PN Administrative Assistant
  app.post('/api/ai/assistant', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Le paramètre prompt est requis.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        fallback: true,
        message: 'Clé API Gemini non configurée sur le serveur. Mode local actif.'
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: `Vous êtes l'Assistant IA Administratif et Juridique officiel de la Direction Départementale des Loisirs de Pointe-Noire (DDL-PN), République du Congo (Ministère de l'Industrie Culturelle, Touristique, Artistique et des Loisirs / Direction Générale des Loisirs).
Directeur Départemental : Jean Richard NTSEKE NGOUAKA.
Vous assistez les cadres et inspecteurs (SAA, SAF, SPA, SSID, DGL) dans la rédaction administrative, l'application de la Loi N° 21-2019 du 12 juillet 2019 fixant le régime général des loisirs, la régulation acoustique des établissements nocturnes, le calcul des redevances et la synthèse du PTA 2026.`
        }
      });

      return res.json({
        text: response.text
      });
    } catch (err: any) {
      console.warn('[DDL-PN AI] Erreur de génération Gemini:', err?.message || err);
      return res.status(500).json({
        error: 'Erreur lors de la génération IA',
        details: err?.message
      });
    }
  });

  // Module 8: RSS 2.0 Syndication Feed
  app.get('/api/rss.xml', (_req, res) => {
    const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>DDL-PN - Journal Officiel des Loisirs Sains et Régulations de Pointe-Noire</title>
    <link>https://ddl-pointenoire.cg/rss</link>
    <description>Flux d'actualités officielles, agréments délivrés, événements festifs labellisés, charte acoustique et avis de conformité de la Direction Départementale des Loisirs de Pointe-Noire (MCAPNIT).</description>
    <language>fr-cg</language>
    <copyright>République du Congo - Ministère de la Culture, des Arts, du Tourisme et des Loisirs</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://ddl-pointenoire.cg/api/rss.xml" rel="self" type="application/rss+xml" />

    <item>
      <title>Lancement de la Campagne d'Assainissement Acoustique et Contrôle SAA 2026</title>
      <link>https://ddl-pointenoire.cg/actualites/campagne-acoustique-2026</link>
      <description>La brigade du Service Agrément et Assainissement intensifie les contrôles in situ des décibels et des agréments d'exploitation dans les 6 arrondissements de Pointe-Noire.</description>
      <category>Régulation</category>
      <pubDate>Mon, 22 Sep 2026 08:30:00 GMT</pubDate>
      <guid isPermaLink="false">ddl-actu-2026-001</guid>
    </item>

    <item>
      <title>Promulgation de la Charte des Loisirs Sains et Éco-Responsables</title>
      <link>https://ddl-pointenoire.cg/actualites/charte-loisirs-sains</link>
      <description>Publication du référentiel récompensant les établissements exemplaires de la Côte Sauvage, Mpita et Tié-Tié par l'attribution du Diplôme d'Honneur Départemental.</description>
      <category>Promotion SPA</category>
      <pubDate>Thu, 18 Sep 2026 14:00:00 GMT</pubDate>
      <guid isPermaLink="false">ddl-actu-2026-002</guid>
    </item>

    <item>
      <title>Digitalisation Intégrale des Paiements et Recouvrements DDL-PN</title>
      <link>https://ddl-pointenoire.cg/actualites/digitalisation-recettes-saf</link>
      <description>Le SAF annonce la généralisation du paiement des redevances par MTN Mobile Money, Airtel Money et virement Trésor Public avec quittance numérique et code de contrôle instantané.</description>
      <category>Finances &amp; SAF</category>
      <pubDate>Wed, 10 Sep 2026 10:15:00 GMT</pubDate>
      <guid isPermaLink="false">ddl-actu-2026-003</guid>
    </item>
  </channel>
</rss>`;

    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.send(rssFeed);
  });

  // Calendar sync helper API endpoint for Google Calendar integration
  app.get('/api/calendar/sample-events', (_req, res) => {
    res.json({
      summary: 'Tournées Terrain Brigade SAA - Pointe-Noire',
      events: [
        {
          id: 'cal-001',
          summary: 'Inspection SAA : Le Privilège Lounge VIP (Mpita)',
          description: 'Contrôle agrément, vérification limiteur acoustique et mise en demeure paiement tranche 2. Gérant: M. Michel GOMA (+242 06 612 34 56)',
          location: 'Mpita, Arrondissement 1 Lumumba, Pointe-Noire',
          start: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
          end: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
          parsedData: {
            name: 'Le Privilège Lounge VIP',
            promoter: 'Michel GOMA',
            phone: '+242 06 612 34 56',
            arrondissement: '1_LUMUMBA',
            activity: 'VIP Lounge & Salons Privés',
            surface: 140
          }
        },
        {
          id: 'cal-002',
          summary: 'Recensement In Situ : Bar Dancing Ponton La Belle (Makayabou)',
          description: 'Établissement informel signalé. Mesure de surface au sol, notification frais de dossier et délivrance convocation. Promotrice: Mme Sylvie MAVOUNGOU (+242 05 531 22 11)',
          location: 'Makayabou, Arrondissement 2 Mvou-Mvou, Pointe-Noire',
          start: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
          end: new Date(Date.now() + 1000 * 60 * 60 * 7).toISOString(),
          parsedData: {
            name: 'Bar Dancing Ponton La Belle',
            promoter: 'Sylvie MAVOUNGOU',
            phone: '+242 05 531 22 11',
            arrondissement: '2_MVOUMVOU',
            activity: 'Bar Dancing / Cabaret Live',
            surface: 95
          }
        },
        {
          id: 'cal-003',
          summary: 'Notification Fermeture Administrative : Snack Bar Le Bambou (Fond Tié-Tié)',
          description: 'Exécution arrêté N° 044/DDL-PN/2026 suite à non-réponse mise en demeure 72h. Gérant: M. Patrick LOUVOUANDOU (+242 06 988 77 66)',
          location: 'Fond Tié-Tié, Arrondissement 3 Tié-Tié, Pointe-Noire',
          start: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
          end: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(),
          parsedData: {
            name: 'Snack Bar Le Bambou',
            promoter: 'Patrick LOUVOUANDOU',
            phone: '+242 06 988 77 66',
            arrondissement: '3_TIETIE',
            activity: 'Snack-Bar / Débit de Boissons',
            surface: 65
          }
        }
      ]
    });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    } else {
      app.get('/', (_req, res) => {
        res.send('Dist build not found. Please build the application.');
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DDL-PN Server] Running on http://0.0.0.0:${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch(err => {
  console.error('[DDL-PN Server] Failed to start:', err);
  process.exit(1);
});
