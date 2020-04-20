/*jshint esversion: 6 */

google.charts.load('current', {
  'packages': ['corechart']
});

//google.charts.setOnLoadCallback(drawChart);

const topAppBar = mdc.topAppBar.MDCTopAppBar.attachTo(document.querySelector('.mdc-top-app-bar'));
const drawer = mdc.drawer.MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
const apiEndPoint = 'https://pomber.github.io/covid19/timeseries.json';

let countries = [];
let selectedCountries = [];

topAppBar.listen('MDCTopAppBar:nav', () => {
  drawer.open = !drawer.open;
});

document.querySelectorAll('.mdc-list-item').forEach(item => {
  item.addEventListener('click', event => {
    //handle click
    switch (item.id) {
      case 'home-button':
        document.querySelector('.mdc-top-app-bar__title').innerHTML = "Home";
        document.querySelector('#home').style.display = "block";
        document.getElementById('data').style.display = "none";
        document.getElementById('about').style.display = "none";
        console.log("home button pressed");
        drawer.open = !drawer.open;
        break;
      case 'data-button':
        document.querySelector('.mdc-top-app-bar__title').innerHTML = "Table";
        document.getElementById('home').style.display = "none";
        document.getElementById('data').style.display = "block";
        document.getElementById('about').style.display = "none";
        console.log("table button pressed");
        drawer.open = !drawer.open;
        break;
      case 'about-button':
        document.querySelector('.mdc-top-app-bar__title').innerHTML = "Chart";
        document.getElementById('home').style.display = "none";
        document.getElementById('data').style.display = "none";
        document.getElementById('about').style.display = "block";
        console.log("chart button pressed");
        drawer.open = !drawer.open;
        break;
      default:
        console.log("something else pressed");
        break;
    }
  });
});

document.querySelector('#addCountryButton').addEventListener('click', event => {
  addToCountries();
});

document.querySelector('#graphCountryButton').addEventListener('click', event => {
  clearTable();
  createTable();
  drawChart();
});

fetch(apiEndPoint).then(res => {
  return res.json();
}).then(json => {
  for (let key in json) {
    countries.push(key);

    let option = document.createElement('option');
    option.value = key;
    document.querySelector('#countries').appendChild(option);
  }
}).catch(err => alert(err));

function addToCountries() {
  if (selectedCountries.includes(document.querySelector('#countryInput').value)) {
    alert("Country is already added. Please select a different country.");
    return;
  } else if (document.querySelector('#countryInput').value === '') {
    alert("Please select a country.");
    return;
  }
  selectedCountries.push(document.querySelector('#countryInput').value);

  let listItem = document.createElement('li');
  listItem.textContent = document.querySelector('#countryInput').value;
  listItem.className = 'mdc-list-item';
  document.querySelector('#countryList').appendChild(listItem);
}

function createTable() {
  let data = [];

  fetch(apiEndPoint).then(res => {
    return res.json();
  }).then(json => {
    let dateData = json[selectedCountries[0]].map(i => {
      return i.date;
    });

    data.push(dateData);

    for (let country in selectedCountries) {
      let countryCases = json[selectedCountries[country]].map(i => {
        return i.confirmed;
      });

      data.push(countryCases);
    }

    for (let i = 0; i < data[0].length; i++) { //length of date column
      let tableRow = document.createElement('tr');
      tableRow.className = 'mdc-data-table__row';

      for (let j = 0; j < data.length; j++) {
        let cell = document.createElement('td');
        cell.className = 'mdc-data-table__cell';
        cell.textContent = data[j][i];
        tableRow.appendChild(cell);

        document.querySelector('table tbody').appendChild(tableRow);
      }

    }

  }).catch(err => alert(err));

  let tableHeaderRow = document.createElement('th');
  tableHeaderRow.className = 'mdc-data-table__header-cell';
  tableHeaderRow.textContent = 'Date';
  document.querySelector('.mdc-data-table__header-row').appendChild(tableHeaderRow);

  for (let country in selectedCountries) {
    let tableHeaderCountry = document.createElement('th');
    tableHeaderCountry.className = 'mdc-data-table__header-cell';
    tableHeaderCountry.textContent = selectedCountries[country];
    document.querySelector('.mdc-data-table__header-row').appendChild(tableHeaderCountry);
  }
}

function clearTable() {
  document.querySelector('.mdc-data-table__header-row').innerHTML = "";
  document.querySelector('.mdc-data-table__content').innerHTML = "";
}

function drawChart() {
  let data = [];
  let dataHeader = ["Date"];
  for (let country in selectedCountries) {
    dataHeader.push(selectedCountries[country]);
  }

  data.push(dataHeader);

  fetch(apiEndPoint).then(res => {
    return res.json();
  }).then(json => {
    for (let i = 0; i < json[selectedCountries[0]].length; i++) {
      let tableData = [];
      tableData.push(json[selectedCountries[0]][i].date);
      for (let country in selectedCountries) {
        tableData.push(json[selectedCountries[country]][i].confirmed);
      }
      //
      data.push(tableData);
    }

    console.log(data);

    let googleChartData = google.visualization.arrayToDataTable(data);

    let options = {
      title: 'Confirmed cases of COVID-19',
      curveType: 'function',
      width: 1500,
      height: 950,
      legend: {
        position: 'right'
      },
      hAxis: {
        title: 'Time',
        showTextEvery: 10
      },
      vAxis: {
        title: 'Cases',
        viewWindowMode: 'maximized',
        minorGridlines: 0
      }
    };

    let chart = new google.visualization.LineChart(document.querySelector('#chart_div'));

    chart.draw(googleChartData, options);

    document.querySelector('.mdc-top-app-bar__title').innerHTML = "Chart";
    document.getElementById('home').style.display = "none";
    document.getElementById('data').style.display = "none";
    document.getElementById('about').style.display = "block";
  }).catch(err => alert(err));
}
