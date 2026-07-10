# EvalNat — Suivi de cohorte

![JavaScript](https://img.shields.io/badge/JavaScript-vanilla-F7DF1E?logo=javascript&logoColor=black) ![Type](https://img.shields.io/badge/Type-site%20statique-0f766e?logo=html5&logoColor=white) ![Deploy](https://img.shields.io/badge/Deploy-GitHub%20Pages-222?logo=githubpages&logoColor=white) ![Données](https://img.shields.io/badge/Données-locales-2e7d32)

https://julientexier86.github.io/Cohorte6-5-4Sankey/

Application web autonome pour suivre les trajectoires d'élèves entre la 6e, la 5e et la 4e à partir des exports des évaluations nationales. Elle relie les fichiers de cohortes, classe les résultats dans trois niveaux et restitue les évolutions sous forme de Sankey, tableaux et tableau de bord.

> **Confidentialité :** les fichiers sont lus et traités dans le navigateur. L'application ne possède ni serveur, ni compte utilisateur, ni envoi de données élèves.

## Ce que permet l'application

- Apparier les élèves entre `6e → 5e → 4e`, ou directement `6e → 4e` si le fichier de 5e est absent.
- Explorer les trajectoires globales, par genre, par établissement d'origine, par compétence et par sélection d'élèves.
- Contrôler la qualité de l'appariement : effectifs reliés, introuvables, ambiguïtés et doublons exclus.
- Corriger ponctuellement un appariement connu sans modifier les fichiers sources.
- Produire des Sankey, tableaux de flux filtrables, exports CSV/PNG/PDF et un classeur Excel de synthèse.
- Comparer deux états de cohorte (A/B) et visualiser les écarts de flux.
- Mémoriser sur le poste les mappings, seuils, favoris et corrections manuelles.

## Démarrage

Ouvrir `index.html` dans un navigateur récent. L'application charge Plotly, SheetJS, Marked et jsPDF depuis des CDN : une connexion Internet est donc nécessaire pour le premier usage dans cette version.

Pour un lancement local pratique :

```sh
python3 -m http.server 4173
```

Puis ouvrir `http://localhost:4173`.

## Préparer les fichiers

Les fichiers `xlsx`, `xls` et `csv` sont acceptés, avec une limite de 35 Mo par fichier. La première feuille du classeur est utilisée. La première ligne exploitable doit contenir les en-têtes ; l'application tente également de détecter une ligne d'en-têtes précédée de lignes de titre.

Chaque cohorte doit idéalement contenir :

| Colonne | 6e | 5e | 4e | Rôle |
| --- | --- | --- | --- | --- |
| Nom | requis | requis si chargé | requis | Appariement |
| Prénom | requis | requis si chargé | requis | Appariement |
| Date de naissance | recommandé | recommandé | recommandé | Lever les homonymies |
| Sexe | recommandé | recommandé | recommandé | Ventilation filles/garçons |
| Établissement d'origine | recommandé | — | — | Filtre établissement |
| Compétence / niveau | recommandé | recommandé | recommandé | Catégorisation et filtre |

Après import, ouvrir **Mapper les colonnes** si les sélections proposées ne sont pas correctes. Les choix peuvent ensuite être mémorisés avec **Mémoriser la configuration**.

## Méthode d'appariement

L'application recherche les correspondances dans cet ordre :

1. nom + prénom + date de naissance ;
2. nom + prénom + sexe ;
3. nom + prénom ;
4. nom/prénom inversés ;
5. nom + premier prénom.

Lorsqu'une clé renvoie plusieurs candidats, la date, le sexe et le premier prénom sont réutilisés pour tenter de lever l'ambiguïté. Une ambiguïté restante est **exclue** : l'application ne choisit jamais arbitrairement la première fiche. Une fiche cible ne peut alimenter qu'un seul flux ; les doublons sont signalés et exclus.

### Corrections manuelles

Le panneau **Contrôle qualité de l'appariement** propose une correction manuelle pour chacune des transitions. Elle doit être réservée aux cas vérifiés dans les données sources. Une correction remplace la recherche automatique pour l'élève source concerné et est stockée uniquement dans le navigateur (`localStorage`). Le bouton d'effacement supprime toutes les corrections locales.

## Catégorisation

Les libellés explicites sont prioritaires : `À besoins`, `Fragile`, `Satisfaisant`, ainsi que plusieurs variantes courantes. Si aucun libellé n'est détecté, l'application calcule la moyenne des colonnes numériques pertinentes et applique les seuils configurables :

- score inférieur au seuil « À besoins » : **À besoins** ;
- score inférieur au seuil « Fragile » : **Fragile** ;
- sinon : **Satisfaisant**.

Les seuils par défaut sont 25 et 50. Les modifier ne change pas les fichiers sources ; il faut régénérer les résultats après modification.

## Lire les résultats

### Sankey

Chaque bande relie une catégorie de départ à une catégorie d'arrivée. Sa largeur représente l'effectif, sa couleur correspond à la catégorie source. Les trois graphiques affichent le total, les filles et les garçons.

### Tableau de bord pédagogique

Il complète le Sankey avec des vues adaptées aux comparaisons :

- **progression nette** : progressions moins décrochages ;
- **maintien « À besoins »** : part des transitions restant dans cette catégorie lors de la dernière phase ;
- **évolution depuis « Fragile »** : part des transitions quittant cette catégorie ;
- **répartition à 100 %** : comparaison indépendante de la taille des cohortes ;
- **matrice de transition** : lecture exacte des neuf flux ;
- **alerte qualité** : avertissement si le taux d'appariement est faible ;
- **lecture rapide** : les principaux flux à surveiller.

Ne pas tirer de conclusion à partir d'un flux de très faible effectif. Vérifier aussi le taux d'appariement avant de comparer deux établissements ou deux cohortes.

### Comparaison A/B

Enregistrer deux états via **Année A** et **Année B**. L'application affiche alors les deux Sankey, les écarts par transition, une heatmap et un histogramme. Comparer des états construits avec les mêmes règles de catégorisation, le même périmètre et des taux d'appariement comparables.

## Exports

| Export | Contenu |
| --- | --- |
| PNG | Les trois Sankey : global, filles, garçons |
| CSV | Matrices de flux ou détail du tableau filtré |
| CSV contrôle | Taux d'appariement, introuvables, ambiguïtés et doublons |
| PDF | Page complète imprimable ou un rapport par établissement sélectionné |
| Excel complet | Synthèse, flux globaux/filles/garçons et contrôle qualité |

Les exports liés à une sélection d'élèves permettent de limiter les noms à des initiales pour réduire l'exposition des données personnelles.

## Confidentialité et bonnes pratiques

- Utiliser uniquement des postes et espaces de stockage autorisés par l'établissement.
- Ne pas publier les exports nominatifs ; privilégier les agrégats et les initiales.
- Masquer ou interpréter avec prudence les groupes de très faible effectif.
- Ne jamais utiliser un appariement ambigu sans vérification manuelle.
- Vérifier le contrôle qualité après chaque nouvel import ou changement de mapping.

## Limites connues

- L'analyse dépend de la qualité et de la stabilité des identifiants entre années.
- Les changements de nom, prénoms multiples ou dates absentes réduisent l'appariement automatique.
- Les seuils numériques sont une règle de classement, pas une mesure psychométrique.
- L'application n'établit pas de causalité : elle décrit des trajectoires observées.
- Les bibliothèques externes sont actuellement chargées depuis Internet.

## Développement et tests

Le projet est volontairement sans chaîne de construction : toute l'application se trouve dans `index.html`. Les tests ciblent les invariants essentiels de normalisation et d'unicité d'appariement.

```sh
npm test
```

## Licence

Voir [LICENSE](LICENSE).
