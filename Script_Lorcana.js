const fs = require('fs');

//https://lorcanajson.org/#downloads

// Fonction pour lire et modifier le fichier JSON
function modifyJsonFile(inputFilePath, outputFilePath) {
    // Lire le fichier JSON
    fs.readFile(inputFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lors de la lecture du fichier JSON:', err);
            return;
        }

        try {
            // Convertir les données JSON en objet
            const jsonObject = JSON.parse(data);


            let result = {}
            let errorCount = 0
    
            jsonObject.cards.forEach((c) => {
                let newCard = {}
                const cardId = c.fullIdentifier.replace(/ /g, '').replace(/•/g, '-');
                newCard = {
                    id: cardId,
                    face: {
                        front: {
                            name: c.fullName,
                            type: c.type,
                            cost: c.cost,
                            image: c.images.full,
                            isHorizontal: c.type == "Location"
                        }
                    },
                    name: c.fullName,
                    type: c.type,
                    cost: c.cost,
                    rarity: c.rarity,
                    lore: c.lore,
                    strength: c.strength,
                    willpower: c.willpower,
                    color: c.colors ? c.colors : [c.color],
                }
                if (result[cardId]) {
                    console.log("Error: card " + c.fullName + " already exist with id " + cardId)
                    errorCount += 1
                } else if (c.color && c.color != "") {
                    result[cardId] = newCard
                } else {
                    // Ursula coop cards most likely
                    //console.log("Error: card " + c.fullName + " has no color")
                    errorCount += 1
                }
            })


            // Sauvegarder le nouvel objet JSON dans un nouveau fichier
            fs.writeFile(outputFilePath, JSON.stringify(result, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error('Erreur lors de l\'écriture du fichier JSON:', err);
                } else {
                    console.log('Le fichier JSON a été modifié et sauvegardé sous', outputFilePath);
                    console.log("Saved " + Object.keys(result).length + " cards on the " + jsonObject.cards.length + " expected. Failed for " + errorCount + " cards")
                }
            });
        } catch (e) {
            console.error('Erreur lors du traitement du fichier JSON:', e);
        }
    });
}

// Utilisation de la fonction
const inputFilePath = 'Lorcana.json';  // Chemin vers le fichier JSON d'entrée
const outputFilePath = 'LorcanaCards.json';  // Chemin vers le fichier JSON de sortie
modifyJsonFile(inputFilePath, outputFilePath);