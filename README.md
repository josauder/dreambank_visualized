# DreamBank Visualized - an interactive visualization of more than 20000 dreams!

[Interactive Visualization](https://josauder.github.io/dreambank_visualized)

An in-depth report on the system with all sources and techniques used can be found [here](https://josauder.github.io/dreambank_visualized/dreambank_visualized_technical_report.pdf).

## To play with the visualization locally

Clone the git project

`git clone DreamBankVisualized`

`cd DreamBankVisualized`

Start the HTTP Server

`python -m "SimpleHTTPServer" 8080`

Open a new tab in your browser at `localhost:8080` and dive into the dreams of other!

## For development / modifying

### If you wish to rescrape all the dreams:

`cd DreamScrape`

`python3 extract.py`

Note that there is a manual list of dreams hardcoded into `extract.py`. A list of all avaibale dream series on DreamBank can be found here http://www.dreambank.net/grid.cgi

### If you wish to run `dreams.ipynb` and create your own vectors

You will need to install `sklearn`, `numpy`, `matplotlib`, `tensorflow`, `keras`, and `pandas` with pip.

It is also recommended that you install [Multicore-TSNE](https://github.com/DmitryUlyanov/Multicore-TSNE) by following the instructions as described there, otherwise computation time will be very long.


