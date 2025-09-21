const fs = require('fs');
const https = require('https');

// URL du fichier JSON
const url = 'https://lorcanajson.org/files/current/en/allCards.json';

// Fonction pour récupérer le JSON depuis une URL
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

// Fonction pour transformer et sauvegarder les cartes
async function modifyJsonFile(outputFilePath) {
  try {
    const jsonObject = await fetchJSON(url);
    const result = {};
    let errorCount = 0;

    jsonObject.cards.forEach(c => {
      const cardId = c.fullIdentifier.replace(/ /g, '').replace(/•/g, '-');
      const newCard = {
        id: cardId,
        face: {
          front: {
            name: c.fullName,
            type: c.type,
            cost: c.cost,
            image: c.images.full,
            isHorizontal: c.type === "Location"
          }
        },
        name: c.fullName,
        type: c.type,
        cost: c.cost,
        rarity: c.rarity,
        lore: c.lore,
        strength: c.strength,
        willpower: c.willpower,
        color: c.colors ?? [c.color],
      };

      if (result[cardId]) {
        console.log(`Error: card ${c.fullName} already exists with id ${cardId}`);
        errorCount += 1;
      } else if (c.color && c.color !== "") {
        result[cardId] = newCard;
      } else {
        // Probablement des cartes coop
        errorCount += 1;
      }
    });

    // Sauvegarder le nouvel objet JSON
    fs.writeFileSync(outputFilePath, JSON.stringify(result, null, 2), 'utf8');
    console.log(`Saved ${Object.keys(result).length} cards (failed for ${errorCount})`);

  } catch (err) {
    console.error('Erreur lors du traitement ou du fetch:', err);
  }
}

// Appel de la fonction
const outputFilePath = 'LorcanaCards.json';
modifyJsonFile(outputFilePath);
