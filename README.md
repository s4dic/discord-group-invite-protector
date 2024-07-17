# Discord Group Invite Protector
Permet de vous protéger des raclures qui vous invitent dans des groupes Discord sans votre accord.

## Demonstations
### Message+Déconnexion Silencieuse :
![BlackBox-4610462346](https://github.com/user-attachments/assets/1692253e-4eae-4221-8c8f-f3ebfd403a98)

### Exemple de la gestion des logs:
![image](https://github.com/user-attachments/assets/5020ef0b-a139-4477-b91a-5a18e3b4cebd)

# Installation:

- 1 : suivez les instruction d'installation:<br>
  ```curl -fsSL https://deb.nodesource.com/setup_22.x | bash -```<br>
  ```apt install -y nodejs```<br>
  Une autre méthode moins fiable est disponible [ICI](https://nodejs.org/en/download)
- 2 : Clonner/Télécharger ce repository git sur votre machine (idéallement un serveur linux 🤓)
- 3 : Si vous voulez les log commencer par faire un groupe discord et noter l'id du groupe
- 4 : rajouter l'id du canal dans le dossier whitelist.txt et rajouter tous les groupes que vous souhaitez garder comme actif, vous pouvez mettre des commentaires avec `#`:<br>
![image](https://github.com/user-attachments/assets/3d563e30-5e51-41dc-ad49-f43fabf3b2aa)
- 5 : Éditez le fichier "index.js", et rajouter les elements suivant:<br>
    - Dans "token", mettez votre token Discord.<br>
    - Dans "notificationGroupId", mettez l'ID de votre groupe permettant de visionner les logs.<br>
    - Dans "leaveMessage", mettez le message qui sera envoyé dans le groupe qui vous a invité.<br>
    - Activez ensuite les options désirées en utilisant "True" pour activer et "False" pour désactiver.
- 6: faites un chmod +x sur le fichier start.sh et demarrez le service : ```./start.sh```<br>
![image](https://github.com/user-attachments/assets/7cfd4992-0fa0-488a-9046-b841b1ac5aa9)
