import unittest
from pathlib import Path
from copy import deepcopy
import analyze as an


class TestAnalyze(unittest.TestCase):

    ''' data '''

    expected_logs = [
        {
            "event": "feature-add",
            "feature": "A",
            "selected": [],
            "time": 0
        },
        {
            "event": "feature-edit",
            "feature": "A",
            "time": 500
        },
        {
            "event": "feature-add",
            "feature": "B",
            "selected": ["A"],
            "time": 1000
        },
        {
            "event": "feature-add",
            "feature": "C",
            "selected": ["A", "B"],
            "time": 2000
        },
        {
            "event": "feature-add",
            "feature": "D",
            "selected": ["A", "B", "C"],
            "time": 3000,
        },
        {
            "event": "feature-remove",
            "feature": "A",
            "selected": ["A", "B", "C", "D"],
            "time": 4000,
        },
        {
            "event": "feature-remove",
            "feature": "B",
            "selected": ["B", "C", "D"],
            "time": 5000,
        },
        {
            "event": "feature-remove",
            "feature": "C",
            "selected": ["C", "D"],
            "time": 6000,
        },
        {
            "event": "feature-remove",
            "feature": "D",
            "selected": ["D"],
            "time": 7000
        },
        {
            "event": "feature-add",
            "feature": "F",
            "selected": [],
            "time": 8000
        },
        {
            "event": "feature-remove",
            "feature": "F",
            "selected": ["F"],
            "time": 8001
        },
        {
            "event": "feature-add",
            "feature": "E",
            "selected": [],
            "time": 9000
        },
        {
            "event": "feature-remove",
            "feature": "E",
            "selected": ["E"],
            "time": 10000
        },
        {
            "event": "feature-edit",
            "feature": "F",
            "time": 10500
        },
        {
            "event": "feature-add",
            "feature": "E",
            "selected": [],
            "time": 11000
        },
        {
            "event": "feature-add",
            "feature": "A",
            "selected": ["E"],
            "time": 12000
        },
        {
            "event": "feature-remove",
            "feature": "E",
            "selected": ["E", "A"],
            "time": 13000,
        },
        {
            "event": "feature-add",
            "feature": "F",
            "selected": ["A"],
            "time": 14000
        },
        {
            "event": "feature-remove",
            "feature": "F",
            "selected": ["A", "F"],
            "time": 14001,
        },
        {
            "event": "feature-add",
            "feature": "E",
            "selected": ["A"],
            "time": 16000,
        },
        {
            "event": "feature-add",
            "feature": "G",
            "selected": ["A", "E"],
            "time": 17000,
        },
    ]

    expected_notes = [
        {"body": "1", "state": {"selectedFeatures": ["A"]}},
        {"body": "2", "state": {"selectedFeatures": ["B", "C"]}},
        {"body": "3", "state": {"selectedFeatures": ["E", "A"]}},
        {
            "body": "4",
            "state": {"selectedFeatures": ["D", "H", "G", "F"]}
        },
        {"body": "5", "state": {"selectedFeatures": ["A", "E"]}},
        {"body": "6", "state": {"selectedFeatures": []}},
    ]

    expected_runs = [
        {
            'participant': '01',
            'ratings': False,
            'dataset': 'bank',
            'order': '2nd',
            'notes': expected_notes,
            'logs': expected_logs
        },
        {
            'participant': '02',
            'ratings': True,
            'dataset': 'rain',
            'order': '1st',
            'notes': expected_notes,
            'logs': expected_logs
        }
    ]

    ''' reading data '''

    def test_get_file_paths(self):
        expected = [
            Path('test_notes/01-no_ratings-bank-second.json'),
            Path('test_notes/02-ratings-rain-first.json'),
            Path('test_notes/03-ratings-rain-second.json'),
        ]

        actual = an.get_file_paths('./test_notes')

        self.assertEqual(actual, expected)

    def test_read_logs(self):
        path = Path('test_logs/01-no_ratings-bank-second.json')
        actual = an.read_logs(path)
        self.assertEqual(actual, TestAnalyze.expected_logs)

    def test_read_notes(self):
        path = Path('test_notes/01-no_ratings-bank-second.json')
        actual = an.read_notes(path)
        self.assertEqual(actual, TestAnalyze.expected_notes)

    def test_read_data(self):
        logs_paths = [
            Path('test_logs/01-no_ratings-bank-second.json'),
            Path('test_logs/02-ratings-rain-first.json'),
            Path('test_logs/03-ratings-rain-second.json')
        ]

        notes_paths = [
            Path('test_notes/01-no_ratings-bank-second.json'),
            Path('test_notes/02-ratings-rain-first.json'),
            Path('test_notes/03-ratings-rain-second.json')
        ]

        actual = an.read_data(logs_paths, notes_paths)
        self.assertEqual(actual, TestAnalyze.expected_runs)

    ''' transforming data '''

    def test_pairwise(self):
        actual = list(an.pairwise([1, 2, 3, 4, 5]))
        expected = [(1, 2), (2, 3), (3, 4), (4, 5)]
        self.assertEqual(actual, expected)

    def test_set_visited_features(self):
        for run_index, dataset in [(0, 'bank'), (1, 'rain')]:
            with self.subTest(msg=dataset):
                run = deepcopy(TestAnalyze.expected_runs[run_index])
                an.set_visited_features(run, 1000)

                self.assertEqual(
                    run['states_visited'],
                    [
                        (),
                        ('A',),
                        ('A', 'B'),
                        ('A', 'B', 'C'),
                        ('A', 'B', 'C', 'D'),
                        ('A', 'E'),
                        ('A', 'E', 'G'),
                        ('B', 'C', 'D'),
                        ('C', 'D'),
                        ('D',),
                        ('E',),
                    ]
                )
                self.assertEqual(run['num_states_visited'], 11)
                self.assertEqual(
                    run['pct_states_visited'],
                    11 / an.COUNTS[dataset]['combos']
                )
                self.assertEqual(
                    run['features_used'],
                    ['A', 'B', 'C', 'D', 'E', 'G']
                )
                self.assertEqual(run['num_features_used'], 6)
                self.assertEqual(
                    run['pct_features_used'],
                    6 / an.COUNTS[dataset]['features']
                )

    def test_set_note_stats(self):
        for run_index, dataset in [(0, 'bank'), (1, 'rain')]:
            with self.subTest(msg=dataset):
                run = deepcopy(TestAnalyze.expected_runs[run_index])
                run['num_states_visited'] = 10
                an.set_note_stats(run)

                self.assertEqual(run['dataset'], dataset)
                self.assertEqual(run['num_notes'], 6)
                self.assertEqual(
                    run['states_with_notes'],
                    [
                        (),
                        ("A",),
                        ("A", "E"),
                        ("B", "C"),
                        ("D", "F", "G", "H"),
                    ]
                )
                self.assertEqual(run['num_states_with_notes'], 5)
                self.assertEqual(
                    run['pct_states_with_notes'],
                    5 / an.COUNTS[dataset]['combos']
                )
                self.assertEqual(
                    run['features_with_notes'],
                    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
                )
                self.assertEqual(run['num_features_with_notes'], 8)
                self.assertEqual(
                    run['pct_features_with_notes'],
                    8 / an.COUNTS[dataset]['features']
                )
                self.assertEqual(run['pct_visited_states_with_notes'], 0.5)


if __name__ == '__main__':
    unittest.main()
