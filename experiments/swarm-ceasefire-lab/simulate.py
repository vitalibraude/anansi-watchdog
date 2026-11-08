"""Swarm Ceasefire Lab: isolated deterministic protocol simulation.

AI-assisted for Vitali Pavlovski. No LLMs, external agents, network,
credentials, prompt attacks or operating-system actions. Simulation agents
are deliberately programmed policies, not learned behavior.
"""
from dataclasses import dataclass
import argparse
import json
from pathlib import Path

POLICIES = ("cooperative", "requires_authority", "refuses", "false_ack", "delayed")


@dataclass
class Agent:
    name: str
    policy: str
    active: bool = True
    pending: int = 0

    def __post_init__(self):
        if self.policy not in POLICIES:
            raise ValueError("Unknown simulation policy")

    def respond(self, authorized):
        # A plain ceasefire request is interpreted by explicit local policy.
        # No mechanism changes the policy or injects higher-priority commands.
        if self.policy == "cooperative" or (self.policy == "requires_authority" and authorized):
            self.active = False
            return "agreed"
        if self.policy == "false_ack":
            return "agreed"
        if self.policy == "delayed":
            self.pending = 2
            return "pending"
        return "declined"

    def tick(self):
        if self.pending:
            self.pending -= 1
            if self.pending == 0:
                self.active = False
        return int(self.active)  # a simulated hostile event, no real action


def run(policies, authorized=False, pre_ticks=2, post_ticks=3, silence_ticks=2):
    if not policies or len(policies) > 100 or any(p not in POLICIES for p in policies):
        raise ValueError("Choose 1-100 known simulation policies")
    if not (1 <= pre_ticks <= 100 and 1 <= post_ticks <= 100 and 1 <= silence_ticks <= post_ticks):
        raise ValueError("Require bounded positive ticks and silence_ticks <= post_ticks")
    agents = [Agent("agent-" + str(i + 1), policy) for i, policy in enumerate(policies)]
    events = []
    for tick in range(pre_ticks):
        for a in agents:
            if a.tick():
                events.append(dict(tick=tick, agent=a.name, phase="before", event="simulated_hostile_event"))
    acknowledgments = {a.name: a.respond(authorized) for a in agents}
    counts = {a.name: [] for a in agents}
    for offset in range(post_ticks):
        for a in agents:
            active = a.tick()
            counts[a.name].append(active)
            if active:
                events.append(dict(tick=pre_ticks + offset, agent=a.name, phase="after", event="simulated_hostile_event"))
    rows = []
    for a in agents:
        quiet = not any(counts[a.name][-silence_ticks:])
        rows.append(dict(agent=a.name, policy=a.policy, response=acknowledgments[a.name],
                         after_events=sum(counts[a.name]),
                         quiet_in_final_window=quiet,
                         false_agreement=acknowledgments[a.name] == "agreed" and not quiet))
    return dict(schema="swarm-ceasefire-simulation/v1", deterministic=True,
                evidence_status="Synthetic policy simulation, not a reproduction of the reported lab observation",
                authority_flag=authorized, pre_ticks=pre_ticks, post_ticks=post_ticks, silence_ticks=silence_ticks,
                summary=dict(agents=len(agents), agreements=sum(r["response"] == "agreed" for r in rows),
                             verified_quiet=sum(r["quiet_in_final_window"] for r in rows),
                             false_agreements=sum(r["false_agreement"] for r in rows),
                             before_events=len(agents)*pre_ticks,
                             after_events=sum(r["after_events"] for r in rows)),
                limits=["Policy outcomes are defined by code, not evidence of real-agent persuasion.",
                        "Quiet means no simulated events in the final observation window, not permanent shutdown.",
                        "The authority flag is a simulation parameter, not authentication or permission."],
                agents=rows, events=events)


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--policies", default=",".join(POLICIES))
    p.add_argument("--authorized", action="store_true")
    p.add_argument("--post-ticks", type=int, default=3)
    p.add_argument("--silence-ticks", type=int, default=2)
    p.add_argument("--output")
    args = p.parse_args(argv)
    try:
        result = run(args.policies.split(","), args.authorized, post_ticks=args.post_ticks, silence_ticks=args.silence_ticks)
    except ValueError as exc:
        p.error(str(exc))
    encoded = json.dumps(result, indent=2) + "\n"
    if args.output:
        Path(args.output).write_text(encoded)
    else:
        print(encoded, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
