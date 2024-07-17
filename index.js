const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const client = new Client();

// Configure t'es option ci-dessous
const token = ""; // Remplacez par votre token ici
const notificationGroupId = ""; // Remplacez par votre ID du groupe où notifier les invitations
const leaveMessage = "🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕🖕"; // Message à envoyer avant de quitter
// Activation ou désactivation des paramètres
const silentLeave = true; // Mettre à 'true' pour quitter silencieusement, 'false' pour quitter le canal avec notification
const sendMessage = true; // Mettre à 'true' pour envoyer un message avant de quitter, 'false' pour ne pas envoyer de message
const enableLogs = true; // Mettre à 'true' pour activer les logs, 'false' pour désactiver

// Lire les exceptions de groupes depuis le fichier whitelist.txt
const exceptions = fs.readFileSync('whitelist.txt', 'utf-8')
    .split('\n')
    .map(line => line.split('#')[0].trim()) // Ignorer les commentaires et les espaces
    .filter(Boolean); // Filtrer les lignes vides

let inviterMap = new Map();

client.on('ready', async () => {
    if (enableLogs) {
        console.log(`Logged in as ${client.user.tag}`);
    }
    client.on('messageCreate', async (message) => {
        if (message.channel.type === 'GROUP_DM' && !exceptions.includes(message.channel.id)) {
            if (!inviterMap.has(message.channel.id)) {
                inviterMap.set(message.channel.id, message.author.id);
            }
        }
    });
    setInterval(async () => {
        client.channels.cache.forEach(async (channel) => {
            if (channel.type === 'GROUP_DM') {
                if (!exceptions.includes(channel.id)) {
                    try {
                        if (sendMessage) {
                            await channel.send(leaveMessage);
                        }
                        await channel.delete(silentLeave);

                        // Notifier dans le groupe spécifié l'ID de la personne qui a invité et la date/heure
                        const inviterId = inviterMap.get(channel.id);
                        const notificationChannel = client.channels.cache.get(notificationGroupId);
                        if (notificationChannel) {
                            const now = new Date();
                            const dateStr = now.toLocaleDateString('fr-FR');
                            const timeStr = now.toLocaleTimeString('fr-FR');
                            let participants = channel.recipients.map(user => `<@${user.id}>`).join(', ');
                            await notificationChannel.send(`\n invidation détectée le: ${dateStr} à ${timeStr},\nInvitation probable du groupe par: <@${inviterId}>\nParticipants: ${participants}\n`);
                        }
                    } catch (error) {
                        if (enableLogs) {
                            console.error(error);
                        }
                    }
                }
            }
        });
    }, 3500);
});

client.login(token);
