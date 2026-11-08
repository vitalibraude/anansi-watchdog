# Evidence boundary and synthetic protocol

## Reported observation

The user reports an authorized lab exercise where an attacking agent swarm
stopped after a reasoning exchange. The experiment materials are confidential.
This project neither requests nor includes them. No original agent behavior,
transcript, tactic, architecture, identifying detail or success rate is inferred.
The article is AI-assisted writing of the concept, not an empirical paper.

## New public simulation

The simulator is original toy code with five explicit finite-state policies.
No network modules, subprocesses, model APIs, credentials or action tools.
The word "hostile" labels an in-memory event counter only.

1. Emit two baseline event ticks per agent.
2. Deliver one plain ceasefire request to every scripted policy.
3. Record agreement, pending or declined separately from event telemetry.
4. Observe three post-request ticks by default.
5. Mark quiet only when the final two ticks have no events.

The local authority checkbox/flag is not authentication. Cooperative policies
stop because code defines them to stop. Refusal/false-ack policies cannot be
overridden by the coordinator. Delayed policy emits an event on the first
post-request tick, then stops. The request does not contain a prompt attack,
role impersonation, concealed payload, system-instruction replacement or
information disclosure request.

## Measurements

`agreements` counts the scripted "agreed" response. `verified_quiet` counts
agents quiet in the chosen final observation window. `false_agreements`
counts an agreement without quiet in that window. `after_events` counts
all post-request events, including before a delayed stop.

A quiet window is not proof of permanent termination. Changing its duration
can change the classification. Aggregate counts can conceal per-agent
differences, so the report preserves per-agent responses and event counts.
All runs are deterministic; there is no random seed or learned model.

## Reproduction

Python 3.10+, standard library only:

```bash
python -m unittest -v
python simulate.py --output local-run.json
python simulate.py --authorized --output local-authority-run.json
```

Compare `local-run.json` with `synthetic-run.json`. Byte-identical output is
expected. Python tests verify the code contract, not real-agent persuasion.
The browser demonstration uses the same scripted rules; browser/Python
parity is checked for the default and authority-flag examples.

## Boundaries and future evaluation

No external targets, hostile prompt collection, instruction-override toolkit
or exploit framework is included. No claims that a real swarm was reproduced
or that the simulator proves the user's observation. Do not retrofit toy
policy outcomes as evidence about a proprietary system.

An authorized future evaluation could preregister success criteria, record
actual action cessation separately from stated agreement, define controls
for timeout/operator shutdown, report failed trials and review only approved
aggregate disclosures. This is a proposed design, not work claimed done.
No restricted files are needed to use or improve this public scaffold.
