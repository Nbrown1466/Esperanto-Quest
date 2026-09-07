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
- Use FIGHT or ACT to answer Esperanto questions, then dodge with WASD, arrows, or dragging your heart.
- Correct answers grant a shield; two successful ACT answers unlock MERCY after dodging.
- Use ITEM for a potion. Escape pauses the dodge arena. Gentle mode slows attacks.
- Find a key and stairs to descend. Your best floor reached is saved in this browser; the current run is not saved on refresh.
- The right panel scrolls independently to keep supplies, notebook, lore, and log accessible.

## Verify

With Node.js 22 or newer:

```sh
node test-game.cjs
```

The checks cover dungeon connectivity, 1,000 floor initializations, mystery markers, sound clues, combat, generated characters, shops, scores, and roaming-monster behavior. The GitHub workflow runs these checks without rewriting the game.
