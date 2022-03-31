# SliceLens

![Screenshot](screenshot.png?raw=true)

SliceLens is a tool for exploring labeled, tabular, machine learning datasets. To explore a dataset, the user selects combinations of features in the dataset that they are interested in. The tool splits those features into bins and then visualizes the label distributions for the subsets of data created by the intersections of the bins. It is typically not practical for a user to exhaustively explore the subsets created by all possible combinations of features, since there are too many. Therefore, the user must focus on certain combinations. To address this, SliceLens guides the user in determining which feature combinations to explore. Guidance is based on a user-selected rating metric, which assigns a score to the subsets created by a given combination of features. The purpose of the metrics are to detect interesting patterns in the subsets, such as subsets that have high label purity or an uneven distribution of errors. SliceLens uses the metrics to guide the user towards combinations of features that create potentially interesting subsets in two ways. First, SliceLens assigns a rating to each feature based on the subsets that would be created by selecting that feature. This incremental guidance can help the user determine which feature to select next, but it does not tell the user from the start what feature combinations maximize a given metric. To address this, the second form of guidance is that SliceLens can suggest combinations of features ranked according to the chosen metric, which the user can then cycle through.

## Demo

Try out the [online demo](https://slicelens.vercel.app/).

Watch the [demo video](https://vimeo.com/694639883).

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

To use the tool with your own dataset, in the top-left corner of the UI, you can click "Use my own dataset" and then "Select File". Alternatively, you can add your dataset to the list of demo datasets. To do this, add a row to the file `public/datasets/datasets.csv`. The first column is the display name for the dataset and the second column is the path to the dataset. The path can be a URL or a path to a file in the `public/datasets` directory.

Your dataset must be a CSV file that has a "label" column, representing the ground truth class label for each row. Optionally, the dataset can also contain a "prediction" column, representing a predicted value for each row.

## Demo Datasets

### UCI Machine Learning Repository

Dua, D. and Graff, C. (2019). UCI Machine Learning Repository [http://archive.ics.uci.edu/ml]. Irvine, CA: University of California, School of Information and Computer Science.

* [Heart Disease](http://archive.ics.uci.edu/ml/datasets/Heart+Disease)
* [Census Income](http://archive.ics.uci.edu/ml/datasets/Census+Income)
* [Spam](https://archive.ics.uci.edu/ml/datasets/spambase)
* [Student Performance](https://archive.ics.uci.edu/ml/datasets/Student+Performance)
  * P. Cortez and A. Silva. Using Data Mining to Predict Secondary School Student Performance. In A. Brito and J. Teixeira Eds., Proceedings of 5th FUture BUsiness TEChnology Conference (FUBUTEC 2008) pp. 5-12, Porto, Portugal, April, 2008, EUROSIS, ISBN 978-9077381-39-7.
* [Bank Marketing Data Set](https://archive.ics.uci.edu/ml/datasets/Bank+Marketing)
  * S. Moro, P. Cortez and P. Rita. A Data-Driven Approach to Predict the Success of Bank Telemarketing. Decision Support Systems, Elsevier, 62:22-31, June 2014
* [Bike Sharing Dataset](https://archive.ics.uci.edu/ml/datasets/bike+sharing+dataset)
  * Fanaee-T, Hadi, and Gama, Joao, 'Event labeling combining ensemble detectors and background knowledge', Progress in Artificial Intelligence (2013): pp. 1-15, Springer Berlin Heidelberg, [Web Link](https://link.springer.com/article/10.1007/s13748-013-0040-3).

### Penn Machine Learning Benchmarks

Le, Trang T., William La Cava, Joseph D. Romano, John T. Gregg, Daniel J. Goldberg, Praneel Chakraborty, Natasha L. Ray, Daniel Himmelstein, Weixuan Fu, and Jason H. Moore. PMLB v1. 0: an open source dataset collection for benchmarking machine learning methods. arXiv preprint arXiv:2012.00058 (2020).

* [tokyo1](https://epistasislab.github.io/pmlb/profile/tokyo1.html)
* [churn](https://epistasislab.github.io/pmlb/profile/churn.html)
* [503_wind](https://epistasislab.github.io/pmlb/profile/503_wind.html)
* [573_cpu_act](https://epistasislab.github.io/pmlb/profile/573_cpu_act.html)
* [1191_BNG_pbc](https://epistasislab.github.io/pmlb/profile/1191_BNG_pbc.html)
* [574_house_16H](https://epistasislab.github.io/pmlb/profile/574_house_16H.html)

### Other

* [Broward County COMPAS](https://doi.org/10.1126/sciadv.aao5580)
  * Dressel, Julia, and Hany Farid. “The Accuracy, Fairness, and Limits of Predicting Recidivism.” Science Advances, vol. 4, no. 1, 17 Jan. 2018, doi:10.1126/sciadv.aao5580.
  * Based on `BROWARD_CLEAN.csv` from the above article's [data and material](https://farid.berkeley.edu/downloads/publications/scienceadvances17/).
* [Rain in Australia](https://www.kaggle.com/jsphyg/weather-dataset-rattle-package)

## Rating Metrics

SliceLens can use several metrics to assign a rating to each feature or to generate suggested feature combinations.

### Classification

* **Purity**: The purity metric is useful for guiding users to features that do better jobs at separating the instances into subsets by their ground truth label. The metric gives higher ratings to subsets that have a lower weighted average entropy, based only on the ground truth labels.
* **Error deviation**: The error deviation metric seeks to identify sets of subsets that have uneven distribution of errors, meaning that some subsets have a disproportionately high or low amount of errors. The metric gives higher ratings to sets of subsets with higher standard deviation of percent error. For a given set of subsets, the error deviation metric calculates the error rate for each subset and then takes their standard deviation.
* **Error count** and **Error percent** give higher ratings to features that lead to subsets with higher max number or percent of errors, respectively.

### Regression

* **Similarity**: The similarity metric guides users in finding subsets that group instances with similar labels, similar to the purity metric for classification datasets. The similarity metric calculates the standard deviation of the ground truth labels in each subset and takes their weighted average.
* **MSE Deviation**: Similar to the error deviation metric for classification datasets, the MSE deviation metric guides users towards sets of subsets that have uneven error distributions. That is, it can help the user find feature combinations that result in subsets where some subsets have worse errors than others. To calculate the MSE deviation metric for a given set of subsets, SliceLens computes the mean-squared error for each subset and takes their standard deviation.

## Feature Combination Suggestion Algorithm Evaluation

[Observable notebook](https://observablehq.com/d/81aa53d223663a72).
