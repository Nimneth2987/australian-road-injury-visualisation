# Hospitalised Road Crash Injuries in Australia — D3 Visualisation Website

# Project overview

This project is an interactive D3.js data visualisation website exploring hospitalised injuries from road crashes in Australia from 2011 to 2021. The website presents a short visual data story using four focused charts. Each chart answers a different question about road injury burden, including changes over time, road user share, age patterns, and crash interaction patterns.

The project uses data processed in KNIME and exported into four CSV files. The final website is built using HTML, CSS, JavaScript, and D3.js.

# Target audience

The visualisation is designed for road safety educators, public health teams, transport planners, policy support staff, and students who need to understand road crash injury patterns in a clear and interactive way.

# Website structure

```text
hospitalised-injuries-website/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── chart1.js
│   ├── chart2.js
│   ├── chart3.js
│   └── chart4.js
└── data/
    ├── 01_trend_by_roaduser_remoteness.csv
    ├── 02_roaduser_share_by_year_sex.csv
    ├── 03_age_by_roaduser_year.csv
    └── 04_counterparty_by_roaduser_year.csv
```

## Data files

| CSV file | Purpose | Main fields |
|---|---|---|
| `01_trend_by_roaduser_remoteness.csv` | Shows injury trends over time by road user and remoteness area | Year, RoadUser_Group, Remoteness, Hospitalisations |
| `02_roaduser_share_by_year_sex.csv` | Shows road user injury share by year and sex | Year, RoadUser_Group, Sex, Hospitalisations |
| `03_age_by_roaduser_year.csv` | Shows age profile by road user and year | Year, Age group, RoadUser_Group, Hospitalisations |
| `04_counterparty_by_roaduser_year.csv` | Shows crash interaction pattern by road user and year | Year, RoadUser_Group, Counterparty_Group, Hospitalisations |

## Charts included

| Chart | Type | Filters | Question answered |
|---|---|---|---|
| Chart 1 | Line chart | Road user, Remoteness | How did hospitalised injuries change from 2011 to 2021? |
| Chart 2 | Donut chart | Year, Sex | Which road users carry the largest share of injuries? |
| Chart 3 | Bar chart | Year, Road user | Which age groups are most affected? |
| Chart 4 | Horizontal bar chart | Road user, Year | How do different road users actually get injured? |

## How to run locally

This website must be opened using a local server. Do not double-click `index.html`, because D3 loads CSV files using browser fetch requests, and most browsers block local CSV loading from direct file access.

### Option 1: VS Code Live Server

1. Open the project folder in Visual Studio Code.
2. Install the **Live Server** extension by Ritwick Dey.
3. Right-click `index.html`.
4. Select **Open with Live Server**.
5. The website should open in your browser at a local address such as:

```text
http://127.0.0.1:5500/index.html
```

### Option 2: Python server

If Python is installed, open a terminal in the project folder and run:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Important setup notes

The `index.html` file must be directly inside the main project folder, at the same level as the `css`, `js`, and `data` folders.

Correct:

```text
hospitalised-injuries-website/
├── index.html
├── css/
├── js/
└── data/
```

Incorrect:

```text
hospitalised-injuries-website/
└── index/
    └── index.html
```

If the page opens as `/index/index.html`, the CSS, JavaScript, and CSV files may not load correctly.




The `index.html` file should not be hidden inside another folder. This is important if the website is later published using GitHub Pages.

## Data processing summary

The raw Excel data was processed in KNIME. The workflow first filtered the dataset to traffic-related hospitalised injuries. Then only the required fields were kept, including calendar year, remoteness area, age group, sex, road user, counterparty, and hospitalisation count.

Two derived grouping fields were created using KNIME Rule Engine nodes:

- `RoadUser_Group`: groups road users into major categories such as car driver, car passenger, motorcyclist, pedal cyclist, pedestrian, and other.
- `Counterparty_Group`: groups crash interaction types into simpler categories such as car/van, non-collision, fixed object, motorcycle, pedal cycle, pedestrian/animal, and other/unspecified.

The processed data was then grouped and exported into four CSV files for D3.js.

## Technologies used

- HTML
- CSS
- JavaScript
- D3.js
- KNIME Analytics Platform
- Visual Studio Code

## Limitations

This website uses absolute hospitalisation counts. The results show injury burden, not direct risk. Direct comparison across groups should be interpreted carefully because the data is not normalised by population size, travel exposure, or road user participation.



## Data source

Bureau of Infrastructure and Transport Research Economics (BITRE), *Hospitalised Injury Publication, September 2023*. National hospitalised injuries from road traffic crashes, 2011–2021. The raw data was processed and aggregated in KNIME for this visualisation project.
