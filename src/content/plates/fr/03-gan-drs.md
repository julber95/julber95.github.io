---
order: 3
title: Discriminator rejection sampling pour les GANs
label: Rejection sampling pour les GANs
summary: Quatre variantes du discriminator rejection sampling sur MNIST, d’une règle naïve à la troncature adaptative, et le compromis qualité–diversité de chacune.
observed: 2024
period: nov.–déc. 2024
domain: Generative
team: solo
stack: [Python, PyTorch, torchvision, NumPy, scikit-learn]
abstract: >-
  Le discriminateur d’un GAN entraîné sait encore des choses que le générateur n’a jamais apprises. Le
  discriminator rejection sampling s’en sert comme filtre au moment de l’échantillonnage. J’ai implémenté quatre
  variantes successives sur MNIST, d’une règle d’acceptation naïve à une troncature douce et adaptative du code
  latent, et suivi comment chacune échange qualité des échantillons contre diversité.
engraving: rejection
figCaption: "Le rejection sampling avec des échantillons MNIST. Chaque chiffre généré est placé à une hauteur aléatoire sous l’enveloppe du générateur M·q(x) : sous la densité des données p(x) il est gardé, au-dessus il est rejeté, si bien que les chiffres gardés suivent les deux bosses des données. Dans le DRS, le rapport p/q vient du discriminateur. Densités illustratives."
figAlt: "Gravure de deux courbes sur un même axe : une large bosse en tirets pour le générateur et une courbe bleue à deux bosses pour les données. Des chiffres manuscrits pointillés sont dispersés sous la courbe en tirets ; ceux sous la courbe bleue sont encrés en bleu, ceux au-dessus sont pâles et barrés."
links:
  - { label: Dépôt, href: 'https://github.com/julber95/gan-drs-enhancement-DL' }
resultsCaption: Précision et rappel de la distribution générée pour chaque variante d’échantillonnage (rapport du projet).
results:
  - { label: DRS de base (M global), value: 'P 0,48–0,50 · R 0,21' }
  - { label: DRS par ratio (M par batch), value: 'P 0,51–0,52 · R 0,22' }
  - { label: DRS + troncature douce, value: 'P 0,55 · R 0,16' }
  - { label: DRS + troncature douce adaptative, value: 'P 0,53 · R 0,24', note: 'meilleur équilibre', best: true }
---

## Problème

Les GANs produisent encore des artefacts et ratent des modes. Le *Discriminator Rejection Sampling* (Azadi et al., 2019)
garde chaque échantillon généré avec une probabilité qui dépend du score du discriminateur D(x). La question :
comment régler cette probabilité pour améliorer la qualité sans effondrer la diversité ?

## Méthode

Un GAN entièrement connecté sur MNIST : un générateur à quatre couches et un discriminateur à trois couches (un
discriminateur plus faible s’est révélé un meilleur filtre). J’ai construit quatre variantes l’une après l’autre :
le DRS de base avec un normaliseur global, une règle par ratio recalculée à chaque batch, le DRS avec troncature
douce du code latent, et une troncature douce adaptative qui ne touche que les échantillons mal notés par le discriminateur.

## Résultats

La troncature douce donne la meilleure précision au prix du plus mauvais rappel ; la variante adaptative garde
l’essentiel de cette précision et atteint le meilleur rappel des quatre. Un échantillonneur de Metropolis–Hastings
serait l’étape suivante naturelle.
