Decodecodex
=
Liste et tient à jour la base de donnée du [Decodex du Monde](http://www.lemonde.fr/verification/).
La liste (onglet 1) est mise à jour toutes les heures, et un log (onglet 2) liste les mises à jour (modifications, ajouts ou suppressions).

Le résultat est consultable sur http://bit.ly/decodecodex.

Installation
-
1. Créer une [nouvelle feuille de calcul Google Drive](https://docs.google.com/spreadsheets/create)  
2. Menu *Outils* → *Éditeur de scripts*
3. Copier-coller le [contenu](https://raw.githubusercontent.com/lauregch/decodecodex/master/decodecodex.gs) de `decodecodex.gs` dans l'éditeur
4. Menu *Fichier* → *Enregistrer*
6. Via le menu *Édition* → *Déclencheurs du projet actuel*, créer un déclencheur exécutant la function `__main` à un intervalle choisi (cet intervalle sera celui de la fréquence de vérification des nouveautés sur le Decodex)
7. Valider les demandes d'autorisation du script au compte Google
8. C'est fait !

> **Notes:**
> - Les alertes seront envoyées à l'adresse email liée au compte Google propriétaire de la feuille de calcul.
> - Le log des modifications est vide à la création. Le script étant différentiel, il est impossible de remonter le temps pour récupérer les anciennes modifications. Pour un historique plus ancien, se référer à la [feuille de calcul de l'auteur](https://docs.google.com/spreadsheets/d/1HSmnqJsQTWEurr5Qr2ArS-zQba70_0qmb6zxPYapq6o/edit#gid=1428789681) (créée le 16/02/17),  ou au projet [mparet/decodex-data](https://github.com/mtparet/decodex-data/commits/master) (débutant le 08/02/17).
