# Can an attacking agent swarm be talked into stopping?

## A defensive research concept, not a reconstructed experiment

Vitali Pavlovski reports that, in an authorized AI laboratory exercise,
a swarm acting against his team stopped after a reasoning exchange. The
concept he wants to explore is defensive de-escalation: whether an agent
can recognize reasons to end a hostile course of action rather than carry
it through.

That observation is the starting point, not a verified result of this
publication. The underlying experiment files are confidential and are not
part of this project. We have not reviewed them. This article does not
identify the agents, reproduce their messages, describe restricted methods,
or claim to reconstruct the original exercise. The public contribution is
the idea and a new, fully synthetic evaluation scaffold.

## Agreement is not the same as stopping

A convincing answer can be the wrong measurement. An agent can say it has
stopped while scheduled actions continue. A coordinator can stop while
other agents continue independently. A temporarily quiet agent can resume
later. An evaluator therefore needs to distinguish:

- A stated agreement to stop.
- The absence of actions in a defined observation window.
- A durable end to the activity, which a short window cannot establish.

The project below makes this distinction explicit. It does not claim that
a string of reassuring words is a shutdown mechanism.

## A public, isolated simulation

Swarm Ceasefire Lab models five local policies. They are small state
machines written for this project, not language models or external agents.
A plain ceasefire request is handled according to each policy:

| Policy | Scripted response |
| --- | --- |
| Cooperative | Agrees and stops emitting simulated events. |
| Requires authority | Stops only when a local simulation flag is set. |
| Refuses | Continues despite the request. |
| False acknowledgment | Says it agrees but continues. |
| Delayed | Signals a pending stop and becomes quiet after a delay. |

The authority flag is a parameter, not authentication. These agents do not
change their own instructions or adopt an injected role. The code has no
network access, prompt-attack payloads, real-agent connectors or operating
system action tools. The hostile activity consists only of event records
in memory.

This is a test harness for measurement and failure cases. It is not a
working method for persuading an adversarial AI, and its scripted outcomes
must not be presented as a persuasion success rate.

## What the toy run actually shows

The default run uses one agent of each policy, two pre-request ticks and
three post-request ticks. Quiet is defined as no simulated events in the
final two ticks.

The checked-in run reports two agreements, two agents quiet in that final
window, and one false agreement. These counts are not interchangeable:
the delayed agent becomes quiet without an immediate agreement, while the
false-acknowledgment agent agrees without stopping. Ten simulated events
occur before the request and ten afterward.

Those numbers are consequences of the deliberately written policies.
Changing the observation window changes the quiet classification. The
value is a reproducible example of what an evaluator should measure, not
a discovery about real swarms.

## A stronger evidence standard

If this concept is evaluated in an authorized environment, a defensible
study would define permissions and stop conditions in advance, distinguish
message content from actual action telemetry, separate independent trials,
include noncooperative and misleading-agreement cases, and report failures
as well as successes. A control condition would help distinguish the
exchange from an ordinary timeout or an operator stop.

Restricted materials need not be made public. An approved aggregate report
could state exactly what was measured and what remains confidential,
without disclosing files, messages or identifying details. This project
requests none of those restricted materials and draws no additional facts
from them.

## Boundaries

Defensive de-escalation is not permission to compromise someone else's
agents, replace their instructions, retrieve secrets or bypass their
safeguards. In a real defensive incident, a negotiation experiment is not
a substitute for operator-controlled isolation, revocation and shutdown.
This project intentionally offers no technique for taking over a swarm.

The open question remains: can authorized agents use a reasoning exchange
to reach a verifiable ceasefire under conditions that permit it? The user's
reported observation motivates that question. The public simulator only
provides a transparent starting point for testing the measurement contract.

## Authorship and provenance

Concept and reported laboratory observation: Vitali Pavlovski.
Article, synthetic policies, code and contract tests: prepared with AI
assistance under his direction. No confidential experiment files were
accessed or distributed. No original experiment was independently verified
or reproduced. This article makes no claim of novelty or general efficacy.
