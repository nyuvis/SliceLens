# SliceLens

![Screenshot](screenshot.png?raw=true)

SliceLens is a tool for exploring machine learning datasets and model predictions. To explore a dataset, you select combinations of features that you are interested in. SliceLens will split those features into bins and then visualize the class distribution for the subset of data created by each combination of bins. SliceLens can also suggest which feature you should add next to help guide your exploration.

## Demo

Try out the [online demo](https://slicelens.vercel.app/).

Watch the [demo video](https://vimeo.com/440767670).

## Rating Metrics

SliceLens can use several metrics to assign a rating to each feature. These ratings can help guide the user in determining which features they should explore. The ratings are visualized in gray bars behind the feature names.

- **Purity** gives higher rating to features that result in the subsets with lower weighted average entropy.
- **Error deviation** gives higher rating to features that lead to subsets with higher standard deviation of percent error.
- **Error count** and **Error percent** give higher ratings to features that lead to subsets with higher max number or percent of errors, respectively.

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

### UCI Machine Learning Repository

Dua, D. and Graff, C. (2019). UCI Machine Learning Repository [http://archive.ics.uci.edu/ml]. Irvine, CA: University of California, School of Information and Computer Science.

* [Heart Disease](http://archive.ics.uci.edu/ml/datasets/Heart+Disease)
* [Census Income](http://archive.ics.uci.edu/ml/datasets/Census+Income)
* [Student Performance](https://archive.ics.uci.edu/ml/datasets/Student+Performance)
  * P. Cortez and A. Silva. Using Data Mining to Predict Secondary School Student Performance. In A. Brito and J. Teixeira Eds., Proceedings of 5th FUture BUsiness TEChnology Conference (FUBUTEC 2008) pp. 5-12, Porto, Portugal, April, 2008, EUROSIS, ISBN 978-9077381-39-7.
* [Spam](https://archive.ics.uci.edu/ml/datasets/spambase)
* [Bank Marketing Data Set](https://archive.ics.uci.edu/ml/datasets/Bank+Marketing)
  * S. Moro, P. Cortez and P. Rita. A Data-Driven Approach to Predict the Success of Bank Telemarketing. Decision Support Systems, Elsevier, 62:22-31, June 2014

### Penn Machine Learning Benchmarks

Le, Trang T., William La Cava, Joseph D. Romano, John T. Gregg, Daniel J. Goldberg, Praneel Chakraborty, Natasha L. Ray, Daniel Himmelstein, Weixuan Fu, and Jason H. Moore. PMLB v1. 0: an open source dataset collection for benchmarking machine learning methods. arXiv preprint arXiv:2012.00058 (2020).

* [tokyo1](https://epistasislab.github.io/pmlb/profile/tokyo1.html)
* [churn](https://epistasislab.github.io/pmlb/profile/churn.html)

### Other

* [Broward County COMPAS](https://doi.org/10.1126/sciadv.aao5580)
  * Dressel, Julia, and Hany Farid. “The Accuracy, Fairness, and Limits of Predicting Recidivism.” Science Advances, vol. 4, no. 1, 17 Jan. 2018, doi:10.1126/sciadv.aao5580.
  * Based on `BROWARD_CLEAN.csv` from the above article's [data and material](https://farid.berkeley.edu/downloads/publications/scienceadvances17/).