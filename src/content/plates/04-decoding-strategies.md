---
numeral: IV
order: 4
title: Autoregressive decoding strategies
short: Decoding strategies
taxon: Lingua autoregressiva
family: Recurrent networks
habitat: WikiText-2
observed: 2025
period: May 2025
domain: NLP
team: solo
stack: [Python, PyTorch, NLTK, NumPy, Matplotlib, NetworkX]
abstract: >-
  The same language model writes differently depending on how you read from it. I trained a two-layer
  LSTM on WikiText-2 and compared greedy decoding, beam search, top-k and nucleus sampling, with BLEU
  and ROUGE scores and with drawings of the decoding process itself: beam trees, probability cut-offs,
  cumulative-mass curves.
featured: false
engraving: beamtree
figCaption: A beam search unfolding left to right, from the prompt “Climate change remains one”. Pruned branches fade out and the surviving beam is traced in red. The log-probabilities shown are illustrative.
figAlt: Engraving of a branching tree growing from left to right, each branch labelled with a word and a probability; most branches are pruned and drawn faint, one path through the tree is highlighted in vermilion.
links:
  - { label: Repository, href: 'https://github.com/julber95/autoregressive-decoding-strategies' }
resultsCaption: Scores on the prompt “Climate change remains one…”, scored against the reference sentence. Two prompts in total, so read these as an illustration, not a benchmark.
results:
  - { label: Greedy, value: 'BLEU 0.348 · ROUGE-L 0.546' }
  - { label: Top-k (k = 10), value: 'BLEU 0.289 · ROUGE-L 0.539' }
  - { label: Top-k (k = 5), value: 'BLEU 0.191 · ROUGE-L 0.364' }
  - { label: Nucleus (p = 0.6), value: 'BLEU 0.348 · ROUGE-L 0.546' }
  - { label: Beam (width 5), value: 'BLEU 0.349 · ROUGE-L 0.583' }
  - { label: Beam (width 10), value: 'BLEU 0.405 · ROUGE-L 0.583', best: true }
---

## Problem

Decoding is the part of text generation that gets the least attention. A model outputs a distribution over
the next token; *how* you pick from it decides whether the text is repetitive, coherent or surprising.
The goal was to build the four standard strategies by hand and look closely at the quality–diversity trade-off each one makes.

## Method

- **Model.** Word-level LSTM: 300-d embeddings, 2 stacked layers of 512 units, dropout 0.5, a linear projection back to the vocabulary. Adam (lr 10⁻³), gradient clipping at 5, batches of 32 sequences of 35 tokens, 30 epochs.
- **Data.** WikiText-2, with lines dominated by `<unk>` filtered out before tokenisation.
- **Decoders.** Greedy, beam search (width 5 and 10), top-k (k = 5, 10) and nucleus sampling (p = 0.6), all written from scratch.
- **Evaluation.** BLEU (clipped n-gram precision with a brevity penalty), ROUGE-2 and ROUGE-L, plus visual diagnostics: beam-search trees, dynamic nucleus cut-offs, cumulative-probability curves.

<aside class="note">Validation loss reached its minimum around epoch 7 and then slowly rose, which is overfitting. I kept the best checkpoint rather than regularising further, because the subject was decoding.</aside>

## Results

On both prompts, **beam search with width 10** gave the highest BLEU and ROUGE-2. Greedy and nucleus
(p = 0.6) produced *identical* continuations on both prompts, which suggests that a tight nucleus collapses to
the argmax on a small model. Top-k sampling makes the trade-off explicit: smaller k gives more novelty and
less overlap with the reference.

<aside class="note">With only two prompts, these numbers illustrate the behaviour; they don't rank the methods statistically.</aside>
