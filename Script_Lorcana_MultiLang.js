const fs = require('fs');
const https = require('https');

// URLs
const urlEN = 'https://lorcanajson.org/files/current/en/allCards.json';
const urlFR = 'https://lorcanajson.org/files/current/fr/allCards.json';

// Téléchargement simple JSON
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function modifyJsonFile(outputFilePath) {
  try {
    console.log("📥 Fetch EN...");
    const jsonEN = await fetchJSON(urlEN);

    console.log("📥 Fetch FR...");
    const jsonFR = await fetchJSON(urlFR);

    const result = {};
    let errorCount = 0;

    console.log("🔧 Building EN cards…");

    jsonEN.cards.forEach(c => {
      const cardId = c.fullIdentifier.replace(/ /g, '').replace(/•/g, '-');

      if (!c.color || c.color === "") {
        // cartes coop → on ignore
        errorCount++;
        return;
      }

      const legality = {}
      const f = c.allowedInFormats
      if (f?.Core?.allowed === true) {
        legality.COR = true
      }
      if (f?.Infinity?.allowed === true) {
        legality.INF = true
      }

      const newCard = {
        id: cardId,
        face: {
          front: {
            name: { en: c.fullName },
            type: c.type,
            cost: c.cost,
            image: {
              en: c.images.full
            }, // EN
            isHorizontal: c.type === "Location"
          }
        },
        name: { en: c.fullName },
        type: c.type,
        cost: c.cost,
        rarity: { en: c.rarity },
        lore: c.lore,
        strength: c.strength,
        willpower: c.willpower,
        color: c.colors ?? [c.color],
        _legal: legality
      };

      if (result[cardId]) {
        console.log(`⚠️ Duplicate EN card: ${c.fullName} (${cardId})`);
        errorCount++;
      } else {
        result[cardId] = newCard;
      }
    });

    console.log("🇫🇷 Adding French images…");

    let frOnlyWarnings = 0;

    jsonFR.cards.forEach(c => {
      const cardId = c.fullIdentifier.replace(/ /g, '').replace(/•/g, '-').replace("-FR-", "-EN-");

      if (result[cardId]) {
        // La carte existe → on ajoute l’image FR
        result[cardId].face.front.image.fr = c.images.full;
        result[cardId].face.front.name.fr = c.fullName;
        result[cardId].name.fr = c.fullName;
        result[cardId].rarity.fr = c.rarity;
      } else {
        // Carte FR sans version EN → warning
        console.log(`⚠️ FR card not found in EN: ${cardId} (${c.fullName})`);
        frOnlyWarnings++;
      }
    });

    fs.writeFileSync(outputFilePath, JSON.stringify(result, null, 2), 'utf8');

    console.log(`\n✅ Saved ${Object.keys(result).length} cards`);
    console.log(`⚠️ EN errors: ${errorCount}`);
    console.log(`⚠️ FR-only warnings: ${frOnlyWarnings}`);

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

modifyJsonFile('LorcanaCards_MultiLang.json');
