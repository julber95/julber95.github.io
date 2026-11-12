---
order: 7
title: Classification de texte interprétable à l’INSEE
label: Codage NAF interprétable
summary: Classifieurs légers et explicables qui rangent des descriptions d’entreprises sous ~700 codes NAF, dont un modèle qui prédit les cinq niveaux à la fois.
observed: 2026
period: avr.–juil. 2026
domain: NLP
team: solo
stack: [Python, PyTorch, PyTorch Lightning, Hydra, MLflow, Captum, uv, Argo Workflows, Quarto]
abstract: >-
  Chaque nouvelle entreprise française décrit son activité en une ligne de texte libre, et l’INSEE doit la ranger
  sous l’un des quelque 700 codes de la nomenclature NAF. J’ai comparé des architectures légères et explicables pour
  cette tâche, de FastText à de petits transformers avec label attention, et construit un modèle multi-niveaux qui
  prédit conjointement les cinq niveaux de la hiérarchie. J’ai aussi testé si les explications sont fidèles.
engraving: naftree
figCaption: Quels mots ont compté, et où ils ont mené. Une description d’entreprise illustrative, les mots teintés selon leur poids dans la décision, au-dessus de l’arbre NAF à cinq niveaux ; la branche bleue est le chemin prédit jusqu’à l’une des quelque 700 sous-classes.
figAlt: Gravure d’une courte description d’entreprise en français dont certains mots sont surlignés en bleu, au-dessus d’un arbre à cinq niveaux dont les branches s’affinent de la section à la sous-classe, avec un chemin tracé en bleu de la racine à une seule feuille.
links:
  - { label: Rapport & démo, href: 'https://julber95.github.io/interpretable-text-classification/' }
  - { label: Dépôt, href: 'https://github.com/julber95/interpretable-text-classification' }
  - { label: torchTextClassifiers, href: 'https://github.com/InseeFrLab/torchTextClassifiers' }
resultsCaption: Modèles NAF multi-niveaux contre mono-niveau, parmi les prédictions de sous-classe erronées (rapport et soutenance).
results:
  - { label: 'Erreurs « complètement fausses » (même la section est ratée), mono-niveau', value: '≈ 47 %' }
  - { label: 'Erreurs « complètement fausses », têtes multi-niveaux', value: '29–34 %', best: true }
  - { label: Section / division retrouvées vs troncature (FastText), value: '+8,6 / +9,6 pts' }
  - { label: Section / division retrouvées vs troncature (Label Attention), value: '+9,9 / +13,1 pts', best: true }
---

## Problème

L’INSEE code la description libre de l’activité de chaque nouvelle entreprise selon la nomenclature NAF à cinq
niveaux (section → division → groupe → classe → sous-classe). Des modèles **légers** peuvent-ils égaler le FastText
de production pour une fraction du coût d’un LLM, et leurs prédictions peuvent-elles être **expliquées** fidèlement ?

## Méthode

Construit sur [`torchTextClassifiers`](https://github.com/InseeFrLab/torchTextClassifiers) de l’INSEE : FastText et
de petits encodeurs transformers (FATE), chacun avec mean pooling ou label attention, évalués sur Amazon Reviews,
CLINC150 et NAF 2025 (~1,2 M d’exemples d’entraînement). Un **modèle multi-niveaux** relie un encodeur partagé à cinq
têtes, une par niveau. Les explications de Captum Integrated Gradients et les poids de label attention ont été
vérifiés par un test de fidélité par suppression de mots.

## Résultats

Les têtes par niveau changent la *manière* dont les modèles se trompent plutôt que la fréquence (tableau ci-dessous).
Les têtes peuvent encore se contredire entre elles, ce qui reste une question ouverte. Le rapport interactif complet
est sur [julber95.github.io/interpretable-text-classification](https://julber95.github.io/interpretable-text-classification/).
