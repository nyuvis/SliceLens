# SliceLens

![Screenshot](screenshot.png?raw=true)

SliceLens is a tool for exploring machine learning datasets and model predictions. To explore a dataset, you select combinations of features that you are interested in. SliceLens will split those features into bins and then visualize the class distribution for the subset of data created by each combination of bins. SliceLens can also suggest which feature you should add next to help guide your exploration.

## Demo

Try out the [online demo](https://slicelens.vercel.app/).

Watch the [demo video](https://vimeo.com/440767670).

## Suggestion Criteria

SliceLens can use several criteria to suggest the next feature for the user to add:

- **Purity** suggests the feature that results in the subsets with the lowest weighted average entropy.
- **Error deviation** suggests the feature that leads to the subsets with highest standard deviation of percent error.
- **Error count** suggests the feature that leads to the individual subset that has the highest number of errors.
- **Error percent** suggests the feature that leads to the individual subset that has the highest percent of errors.

## How to run

First clone this repository and install [npm](https://www.npmjs.com/get-npm). Then run the following:

```bash
# install the dependencies
npm install

# build and run the app
npm run build
npm run start
```

## Using your own data

To use the tool with your own dataset, in the top-left corner of the UI, you can click "Use my own dataset" and then "Select File". Alternatively, you can add your dataset to the list of demo datasets. To do this, add a row to the file `datasets/datasets.csv`. The first column is the display name for the dataset and the second column is the path to the dataset. The path can be a URL or a path to a file in the `datasets` directory.

Your dataset must be a CSV file that has a "label" column, representing the ground truth class label for each row. Optionally, the dataset can also contain a "prediction" column, representing a predicted value for each row.

## Demo Datasets

* [Heart Disease](http://archive.ics.uci.edu/ml/datasets/Heart+Disease)
* [Census Income](http://archive.ics.uci.edu/ml/datasets/Census+Income)
* [Broward County COMPAS](https://doi.org/10.1126/sciadv.aao5580)
  * Dressel, Julia, and Hany Farid. “The Accuracy, Fairness, and Limits of Predicting Recidivism.” Science Advances, vol. 4, no. 1, 17 Jan. 2018, doi:10.1126/sciadv.aao5580.
  * Based on `BROWARD_CLEAN.csv` from the above article's [data and material](https://farid.berkeley.edu/downloads/publications/scienceadvances17/).