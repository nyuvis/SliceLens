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
    ''' get paths to json files in given directory '''
    return sorted(list(Path(path_str).glob('*.json')))


def read_logs(path):
    ''' read log file into a list of dictionaries '''
    contents = json.loads(path.read_text())
    return [json.loads(entry) for entry in contents]


def read_notes(path):
    ''' read note file into a list of dictionaries '''
    return [
        note
        for note in json.loads(path.read_text())
        # remove notes with empty bodies
        if note['body'].strip()
    ]


def read_data(logs_paths, notes_paths):
    ''' return a list of dictionaries
        each dictionary represents one data analysis task from the study
        i refer to each data analysis task as a "run"
        each participant will have two dictionaries
    '''
    data = []
    excluded_participants = {'03', '08'}

    for log_path, note_path in zip(logs_paths, notes_paths):
        # make sure that the log and note files have the same name
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


def pairwise(iterable):
    ''' https://docs.python.org/3/library/itertools.html#itertools-recipes '''
    "s -> (s0,s1), (s1,s2), (s2, s3), ..."
    "[1, 2, 3, 4 ,5] -> (1, 2), (2, 3), (3, 4), (4, 5)"

    a, b = tee(iterable)
    next(b, None)
    return zip(a, b)


def set_visited_features(run, threshold=1000):
    ''' set statistics related to which
        combinations of featues the participant visited '''

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
    ''' set statistics related to the notes that the participant took '''

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
    ''' group the runs by the specified key
        the dictionary goes from key1 to key2 to run
    '''
    groups = defaultdict(dict)

    for run in data:
        groups[run[key1]][run[key2]] = run

    return groups


def compare_ratings(data, stats):
    ''' for each stat, count the number of participants who had a lower
        value during their task with ratings than their task without ratings
    '''
    groups = nested_groupby(data, 'participant', 'ratings')
    # not using a defaultdict dict here because we want there
    # to be a key even when the count is 0
    counts = {key: 0 for key in stats}

    for participant, ratings_to_run in groups.items():
        run_yes_ratings = ratings_to_run[True]
        run_no_ratings = ratings_to_run[False]

        for stat in stats:
            if run_yes_ratings[stat] < run_no_ratings[stat]:
                counts[stat] += 1

    return counts


def compare_order(data, stats):
    ''' for each stat, count the number of participants who had a higher
        value during their second task
    '''
    groups = nested_groupby(data, 'participant', 'order')
    # not using a defaultdict dict here because we want there
    # to be a key even when the count is 0
    counts = {key: 0 for key in stats}

    for participant, order_to_run in groups.items():
        run_first = order_to_run['1st']
        run_second = order_to_run['2nd']

        for stat in stats:
            if run_second[stat] > run_first[stat]:
                counts[stat] += 1

    return counts


def compare_participant_runs(data):
    ''' compare how each participant did in their two runs '''

    # stats to compare
    stats = [
        'num_states_visited',
        'pct_features_used',
        'num_states_with_notes',
        'pct_features_with_notes',
        'pct_visited_states_with_notes'
    ]

    comparisons = {}

    comparisons['ratings'] = compare_ratings(data, stats)
    comparisons['order'] = compare_order(data, stats)

    return comparisons


def transform_data(data):
    for run in data:
        set_visited_features(run)
        set_note_stats(run)

    return data


''' writing data '''


def output_runs(data):
    ''' write runs to a file '''

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


def print_comparisons(comparisons):
    ''' write comparisons of participant runs to stdout '''

    # ratings
    print('Number of participants who had a lower value for the statistic',
          'during their task with ratings than their task without ratings:\n',
          sep='\n')
    for key, value in comparisons['ratings'].items():
        print(f'{key} {value}')

    # order
    print('\nNumber of participants who had a higher value for the statistic',
          'during their second task than their first task:\n',
          sep='\n')
    for key, value in comparisons['order'].items():
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
    comparisons = compare_participant_runs(data)

    output_runs(data)
    print_comparisons(comparisons)


if __name__ == '__main__':
    main()
