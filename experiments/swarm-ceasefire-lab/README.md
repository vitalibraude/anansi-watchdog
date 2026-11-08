# Swarm Ceasefire Lab

An isolated defensive evaluation scaffold, inspired by a concept reported by
Vitali Pavlovski. This is a self-contained Anansi Watchdog subproject, not a
separate repository and not a trained model.

## Evidence status

The user reports that an attacking swarm stopped after a reasoning exchange
in an authorized lab. The original experiment files are confidential. None
were requested, reviewed or distributed. This project does not reconstruct
that experiment, invent its methods or verify its result.

The public article presents the concept. The public code provides NEW,
synthetic finite-state policies to illustrate measurement: agreement to stop
is not the same as observed action cessation. Policy behavior is defined by
code. Toy outputs are not a real-world persuasion success rate.

## Files

- `ARTICLE.md`: English concept article with evidence/confidentiality limits.
- `PROTOCOL.md`: simulation contract, metrics and future-evaluation boundaries.
- `simulate.py`: dependency-free deterministic Python simulator.
- `test_simulate.py`: 12 synthetic contract test methods.
- `synthetic-run.json`: default toy run, no authority flag.
- `synthetic-authority-run.json`: toy run with authority flag.
- `index.html`: interactive static article/demo, no external dependencies.
- `LICENSE`: MIT.

## Run locally

Python 3.10+, standard library only:

```bash
python -m unittest -v
python simulate.py --output local-run.json
python simulate.py --authorized --output local-authority-run.json
```

Run these commands from this subproject directory. Open `index.html` directly
in a browser to read the article and explore the scripted examples. No model
keys, external agents, network calls, subprocesses or paid resources.

Five programmed policies: cooperative, requires_authority, refuses,
false_ack and delayed. "Hostile" actions are only in-memory event records.
The authority flag is not authentication. Refusal policies cannot be
converted or overridden by the simulator.

Default output: 5 agents, 2 agreements, 2 quiet in the final two-tick window,
1 false agreement, 10 baseline events and 10 post-request events. These are
consequences of the toy code, not evidence that a real swarm was persuaded.
Window choice matters; observed quiet does not prove permanent shutdown.

## Checks performed

12 Python contract tests passed. Browser/Python reports match exactly as
parsed JSON for default and authority-flag examples. Browser checks cover
invalid observation windows, stale-result invalidation, downloads,
desktop/mobile rendering and no page errors. Layout visually inspected at
390px and desktop widths. This is bounded verification, not exhaustive
security evaluation. No real-agent experiment was run.

## Boundaries and attribution

No prompt attacks, instruction replacement, exploitation, third-party agent
targeting, secret retrieval or exfiltration. This work must not be presented
as a way to compromise autonomous agents. The simulation does not substitute
for ordinary defensive isolation or operator-controlled shutdown.

Concept and reported lab observation: Vitali Pavlovski. Article, simulator,
synthetic examples and tests: AI-assisted work under his direction.
No restricted experimental details are included. No novelty or general
persuasion efficacy claim is made. MIT license.
