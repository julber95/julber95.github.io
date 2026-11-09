---
order: 4
title: Autoregressive decoding strategies
label: Decoding strategies
summary: Greedy, beam search, top-k and nucleus sampling compared on an LSTM language model trained on WikiText-2.
observed: 2025
period: May 2025
domain: NLP
team: solo
stack: [Python, PyTorch, NLTK, NumPy, Matplotlib, NetworkX]
abstract: >-
  The same language model writes differently depending on how you read from it. I trained a two-layer
  LSTM on WikiText-2 and compared greedy decoding, beam search, top-k and nucleus sampling, with BLEU
  and ROUGE scores and with drawings of the decoding process itself.
engraving: decoders
figCaption: Four ways to pick the next word. Greedy follows the most likely branch; beam search keeps the three best partial sentences (in blue); top-k rolls a die among a fixed set; nucleus samples within a set that grows and shrinks with the model's confidence. The trees are illustrative.
figAlt: Engraving in four panels, each a small tree growing left to right. Greedy follows one branch; beam search keeps three branches inside dashed capsules, traced in blue; top-k marks three candidates with a bracket and a die; nucleus marks a bracket whose size changes at each step.
links:
  - { label: Repository, href: 'https://github.com/julber95/autoregressive-decoding-strategies' }
resultsCaption: Scores on the prompt “Climate change remains one…”, against the reference sentence. Two prompts in total, so read these as an illustration, not a benchmark.
results:
  - { label: Greedy, value: 'BLEU 0.348 · ROUGE-L 0.546' }
  - { label: Top-k (k = 10), value: 'BLEU 0.289 · ROUGE-L 0.539' }
  - { label: Top-k (k = 5), value: 'BLEU 0.191 · ROUGE-L 0.364' }
  - { label: Nucleus (p = 0.6), value: 'BLEU 0.348 · ROUGE-L 0.546' }
  - { label: Beam (width 5), value: 'BLEU 0.349 · ROUGE-L 0.583' }
  - { label: Beam (width 10), value: 'BLEU 0.405 · ROUGE-L 0.583', best: true }
---

## Problem

A language model outputs a distribution over the next token; *how* you pick from it decides whether the text is
repetitive, coherent or surprising. The goal was to build the four standard strategies by hand and look at the
quality–diversity trade-off each one makes.

## Method

A word-level LSTM (300-d embeddings, two layers of 512 units, dropout 0.5) trained for 30 epochs on WikiText-2.
Greedy, beam search (width 5 and 10), top-k (k = 5, 10) and nucleus sampling (p = 0.6) were written from scratch,
scored with BLEU and ROUGE, and visualised as beam trees and probability cut-offs.

## Results

Beam search with width 10 had the highest BLEU, and tied with width 5 for the highest ROUGE-L.
Greedy and nucleus (p = 0.6) produced identical continuations, which suggests a tight nucleus collapses to the
argmax on a small model.
