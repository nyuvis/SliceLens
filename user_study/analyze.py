from pathlib import Path
from itertools import tee, chain
from math import comb
from collections import defaultdict
import json


''' dataset info '''
COUNTS = {
    'bank': {
        'features': 19,
        'combos': (comb(19, 0) + comb(19, 1) +
                   comb(19, 2) + comb(19, 3) + comb(19, 4))
    },
    'rain': {
        'features': 23,
        'combos': (comb(23, 0) + comb(23, 1) +
                   comb(23, 2) + comb(23, 3) + comb(23, 4))
    },
}


''' reading data '''


def get_file_paths(path_str):
    return sorted(list(Path(path_str).glob('*.json')))


def read_logs(path):
    contents = json.loads(path.read_text())
    return [json.loads(entry) for entry in contents]


def read_notes(path):
    # remove notes with empty bodies
    return [
        note
        for note in json.loads(path.read_text())
        if note['body'].strip()
    ]


def read_data(logs_paths, notes_paths):
    data = []
    excluded_participants = {'03', '08'}

    for log_path, note_path in zip(logs_paths, notes_paths):
        assert(log_path.stem == note_path.stem)

        [participant, guidance, dataset, order] = log_path.stem.split('-')
        logs = read_logs(log_path)
        notes = read_notes(note_path)

        if participant not in excluded_participants:
            data.append({
                'participant': participant,
                'ratings': guidance == 'ratings',
                'dataset': dataset,
                'order': '1st' if order == 'first' else '2nd',
                'notes': notes,
                'logs': logs
            })

    return data


''' transforming data  '''


# https://docs.python.org/3/library/itertools.html#itertools-recipes
def pairwise(iterable):
    "s -> (s0,s1), (s1,s2), (s2, s3), ..."
    "[1, 2, 3, 4 ,5] -> (1, 2), (2, 3), (3, 4), (4, 5)"

    a, b = tee(iterable)
    next(b, None)
    return zip(a, b)


def set_visited_features(run, threshold=1000):
    # get the selected features after each feature add and feature remove event
    # and the timestamp for the event
    states = []

    for entry in run['logs']:
        # entry['selected'] gives selected features before the add/remove
        if entry['event'] == 'feature-add':
            state = entry['selected'] + [entry['feature']]
            states.append((tuple(sorted(state)), entry['time']))
        elif entry['event'] == 'feature-remove':
            state = entry['selected'].copy()
            state.remove(entry['feature'])
            states.append((tuple(sorted(state)), entry['time']))

    # get the amount of time spent on each state
    # set time spent for the last state to infinity
    # so that is it always counted

    time_spent_on_states = []
    for ((_, t1), (_, t2)) in pairwise(states):
        time_spent_on_states.append(t2 - t1)
    time_spent_on_states.append(float('infinity'))

    # filter out states that were looked at for less than the threshold
    # visited is a list of tuples of strings
    visited = []
    for ((state, _), time_on_state) in zip(states, time_spent_on_states):
        if time_on_state >= threshold:
            visited.append(state)

    combos = sorted(set(visited))
    # chain(*combos) flattens the list of tuples of strings
    # into an iterable of strings
    features = sorted(set(chain(*combos)))

    num_total_combos = COUNTS[run['dataset']]['combos']
    num_total_features = COUNTS[run['dataset']]['features']

    run['states_visited'] = combos
    run['num_states_visited'] = len(combos)
    run['pct_states_visited'] = len(combos) / num_total_combos
    run['features_used'] = features
    run['num_features_used'] = len(features)
    run['pct_features_used'] = len(features) / num_total_features


def set_note_stats(run):
    combos = sorted(list({
        tuple(sorted(note['state']['selectedFeatures']))
        for note in run['notes']
    }))

    features = sorted(set(chain(*combos)))

    num_total_combos = COUNTS[run['dataset']]['combos']
    num_total_features = COUNTS[run['dataset']]['features']

    run['num_notes'] = len(run['notes'])
    run['states_with_notes'] = combos
    run['num_states_with_notes'] = len(combos)
    run['pct_states_with_notes'] = len(combos) / num_total_combos
    run['features_with_notes'] = features
    run['num_features_with_notes'] = len(features)
    run['pct_features_with_notes'] = len(features) / num_total_features
    run['pct_visited_states_with_notes'] = (run['num_states_with_notes'] /
                                            run['num_states_visited'])


def nested_groupby(data, key1, key2):
    groups = defaultdict(dict)

    for run in data:
        groups[run[key1]][run[key2]] = run

    return groups


def compare_ratings(data):
    groups = nested_groupby(data, 'participant', 'ratings')

    values = [
        'num_states_visited',
        'pct_features_used',
        'num_states_with_notes',
        'pct_features_with_notes',
        'pct_visited_states_with_notes'
    ]
    counts = defaultdict(int)

    for participant, ratings_to_run in groups.items():
        run_yes_ratings = ratings_to_run[True]
        run_no_ratings = ratings_to_run[False]

        for value in values:
            if run_yes_ratings[value] < run_no_ratings[value]:
                counts[value] += 1

    return counts


def transform_data(data):
    for run in data:
        set_visited_features(run)
        set_note_stats(run)

    return data


''' writing data '''


def output_runs(data):
    # don't output logs and notes
    copies = []
    for run in data:
        copy = run.copy()
        copy.pop('notes', None)
        copy.pop('logs', None)
        copies.append(copy)

    copies.sort(key=lambda x: (x['participant'], x['ratings']))

    with open('user-study-stats.json', 'w') as jsonfile:
        json.dump(copies, jsonfile, indent=2)


def print_comparisons(ratings_comparison):
    print('Number of participants who have a lower value with ratings:')
    for key, value in ratings_comparison.items():
        print(f'{key} {value}')


''' main '''


def process_data(logs_paths, notes_paths):
    data = read_data(logs_paths, notes_paths)
    data = transform_data(data)
    return data


def main():
    logs_paths = get_file_paths('./logs')
    notes_paths = get_file_paths('./notes')

    data = process_data(logs_paths, notes_paths)

    ratings_comparison = compare_ratings(data)

    output_runs(data)
    print_comparisons(ratings_comparison)


if __name__ == '__main__':
    main()
