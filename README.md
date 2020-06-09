# Slice Lens

[Demo](https://mental-model-explorer.now.sh/)

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

* [Graduate Admission](https://www.kaggle.com/mohansacharya/graduate-admissions)
  * Mohan S Acharya, Asfia Armaan, Aneeta S Antony : A Comparison of Regression Models for Prediction of Graduate Admissions, IEEE International Conference on Computational Intelligence in Data Science 2019
* [Heart Disease](http://archive.ics.uci.edu/ml/datasets/Heart+Disease)
* [Census Income](http://archive.ics.uci.edu/ml/datasets/Census+Income)
* [Broward County COMPAS](https://doi.org/10.1126/sciadv.aao5580)
  * Dressel, Julia, and Hany Farid. “The Accuracy, Fairness, and Limits of Predicting Recidivism.” Science Advances, vol. 4, no. 1, 17 Jan. 2018, doi:10.1126/sciadv.aao5580.
  * Based on `BROWARD_CLEAN_SUBSET.csv` from the above article's [https://farid.berkeley.edu/downloads/publications/scienceadvances17/](data and material).