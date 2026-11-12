---
order: 6
title: Prédire l’inflammation de la paroi aortique dans les anévrismes abdominaux
label: Inflammation de la paroi aortique (HISA)
summary: Quatre pipelines de variables pour le score d’inflammation HISA sur 369 patients. Le dossier clinique plafonne près du hasard ; les lames atteignent 0,717.
observed: 2026
period: avr. 2026
domain: Medical
team: solo
stack: [Python, scikit-learn, pandas, NumPy, h5py, Matplotlib]
abstract: >-
  Le dossier d’un patient permet-il de prédire à quel point sa paroi aortique est enflammée ? Sur la cohorte HistAAA
  (369 patients atteints d’anévrisme de l’aorte abdominale), j’ai comparé quatre pipelines de variables pour le score
  d’inflammation HISA, en complément tabulaire de l’article original fondé sur le deep learning sur lames entières.
  Les variables cliniques et structurelles plafonnent près du hasard. Les embeddings CTransPath moyennés des lames
  colorées H&E atteignent une AUC de test de 0,717.
engraving: aorta
figCaption: Une coupe de paroi aortique au pointillé, de l’intima à l’adventice. Les infiltrats inflammatoires sont marqués en bleu.
figAlt: Gravure au pointillé d’une bande courbe de paroi artérielle en coupe, avec des fibres élastiques en couches, des plaques calcifiées et quelques amas de cellules inflammatoires en bleu.
links:
  - { label: Dépôt, href: 'https://github.com/julber95/aortic-aneurysm-hisa-prediction' }
  - { label: Rapport (PDF), href: 'https://github.com/julber95/aortic-aneurysm-hisa-prediction/blob/main/report.pdf' }
  - { label: Jeu de données (Zenodo), href: 'https://zenodo.org/records/10998464' }
  - { label: Article de référence, href: 'https://doi.org/10.1186/s13000-025-01684-5' }
resultsCaption: AUC sur le jeu de test mis de côté pour HISA (binaire), meilleur modèle par pipeline. Sélection des modèles par AUC en validation croisée à 5 plis ; test n = 71.
results:
  - { label: Clinique seul (Naive Bayes), value: '0,614', note: 'rappel (élevé) 0,11' }
  - { label: Clinique + structurel (rég. logistique), value: '0,591' }
  - { label: H&E CTransPath moyenné (rég. logistique), value: '0,717', note: 'AUC CV 0,820 ± 0,054', best: true }
  - { label: Tout, grades d’inflammation compris (forêt aléatoire), value: '0,961', note: 'fuite : borne haute seulement' }
  - { label: 'Référence : attention-MIL sur lames entières', value: '0,77–0,79', note: 'Kolbinger et al., validation externe' }
---

## Problème

HISA note le degré d’inflammation d’une paroi aortique anévrismale, et il n’est disponible qu’après la chirurgie,
à partir du tissu. Kolbinger et al. le prédisent à partir d’images de lames entières avec un MIL à attention
(AUC 0,77–0,79). Ma question : **quelle part de ce signal survit dans des représentations tabulaires plus simples ?**

## Méthode

Quatre pipelines, comparés par AUC en validation croisée à 5 plis, avec une seule utilisation du jeu de test :
les variables cliniques préopératoires ; clinique plus histologie structurelle (avec SelectKBest et RFECV) ; toutes
les variables y compris les grades d’inflammation, gardées volontairement comme plafond de fuite ; et les embeddings
H&E CTransPath moyennés par patient, puis une PCA(150).

## Résultats

Les variables préopératoires et structurelles ne portent presque aucun signal ; les embeddings moyennés des lames en
retrouvent une bonne part, sans atteindre le modèle à attention de l’article. La validation est seulement interne :
ces AUC sont donc probablement optimistes par rapport aux cohortes externes de l’article.
