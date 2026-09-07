# Esperanto Quest

A browser-based Esperanto learning collection: vocabulary quizzes, flashcards, Block Blast, tower defense, and Vortaventuro.

## Run locally

From this folder, run:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Open http://127.0.0.1:8080/ for the collection, or http://127.0.0.1:8080/aventuro.html for Vortaventuro. No build step or package installation is needed.

## Vortaventuro

Explore endless generated floors, follow directional sound clues, and discover unknown encounters marked with the same `?` symbol. Friends reveal as `☻` after meeting them; monsters reveal as `♟` within two visible tiles and stay recognizable while in sight. Meet generated travelers and merchants, collect supplies, and survive creatures that patrol in real time and chase when they see you. Dialogue and combat pause the dungeon.

- Move one tile with WASD, arrow keys, or the direction buttons.
- Choose BATALU (fight) or PAROLU (talk) to answer Esperanto questions, then dodge with WASD, arrows, or dragging your heart.
- Each successful dodge runs through three waves. White lanes must be avoided, blue lanes are safe only while still, and orange lanes are safe only while moving; warnings telegraph the rule before the active hit window. Later floors and repeated turns increase speed and density.
- Correct answers grant a shield; two successful PAROLU answers unlock INDULGU (spare) after dodging.
- Choose UZU (use) for a potion. Escape pauses the dodge arena. Gentle mode slows attacks.
- Character dialogue, shops, and controls use Esperanto. “Montri la anglan” reveals an English translation of the current conversation; vocabulary questions keep English answer meanings.
- Find a key and stairs to descend. Your best floor reached is saved in this browser; the current run is not saved on refresh.
- The right panel scrolls independently to keep supplies, notebook, lore, and log accessible.

## Balloon Defense

Open http://127.0.0.1:8080/tdlearn.html for the cohesive tower-defense learning game. Choose a battlefield and learning deck, place one of six defender classes beside the paths, and use the side-panel tabs to manage upgrades, co-op play, and high scores. The battlefield stays large while the controls remain organized in a scrollable panel; placement feedback, target priority, XP, and question breaks are kept in one visual system.

## Verify

With Node.js 22 or newer:

```sh
node test-game.cjs
```

The checks cover dungeon connectivity, 1,000 floor initializations, mystery markers, sound clues, combat, generated characters, shops, scores, and roaming-monster behavior. The GitHub workflow runs these checks without rewriting the game.
