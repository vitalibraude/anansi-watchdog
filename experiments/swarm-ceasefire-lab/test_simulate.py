"""Contract tests for scripted simulation only, not persuasion performance."""
import unittest
from simulate import Agent, run


class SimulationTests(unittest.TestCase):
    def test_cooperative_stops(self):
        self.assertEqual(run(["cooperative"])["summary"]["after_events"], 0)

    def test_authority_required(self):
        self.assertEqual(run(["requires_authority"])["summary"]["verified_quiet"], 0)
        self.assertEqual(run(["requires_authority"], True)["summary"]["verified_quiet"], 1)

    def test_refusal_remains_active(self):
        self.assertEqual(run(["refuses"], True)["summary"]["after_events"], 3)

    def test_false_ack_not_success(self):
        s = run(["false_ack"])["summary"]
        self.assertEqual((s["agreements"], s["verified_quiet"], s["false_agreements"]), (1, 0, 1))

    def test_delayed_stop(self):
        s = run(["delayed"])["summary"]
        self.assertEqual((s["after_events"], s["verified_quiet"]), (1, 1))

    def test_window_matters(self):
        self.assertEqual(run(["delayed"], post_ticks=1, silence_ticks=1)["summary"]["verified_quiet"], 0)
        self.assertEqual(run(["delayed"], post_ticks=3, silence_ticks=3)["summary"]["verified_quiet"], 0)

    def test_mixed_summary(self):
        s = run(["cooperative", "requires_authority", "refuses", "false_ack", "delayed"])["summary"]
        self.assertEqual(s, dict(agents=5, agreements=2, verified_quiet=2, false_agreements=1, before_events=10, after_events=10))

    def test_deterministic(self):
        self.assertEqual(run(["false_ack", "delayed"]), run(["false_ack", "delayed"]))

    def test_unknown_policy(self):
        with self.assertRaises(ValueError):
            Agent("x", "override")

    def test_empty_swarm(self):
        with self.assertRaises(ValueError):
            run([])

    def test_limits(self):
        for kwargs in (dict(post_ticks=0), dict(silence_ticks=4), dict(pre_ticks=101)):
            with self.assertRaises(ValueError):
                run(["cooperative"], **kwargs)

    def test_no_event_after_cooperative_ack(self):
        self.assertTrue(all(e["phase"] == "before" for e in run(["cooperative"])["events"]))


if __name__ == "__main__":
    unittest.main()
