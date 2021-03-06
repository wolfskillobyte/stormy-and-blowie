// VARIABLES
var searchBtn = document.querySelector("#search-btn");
var currentForecastEl = document.querySelector("#current-forecast");
var futureForecastEl = document.querySelector("#future-forecast");
var searchResultsEl = document.querySelector("#results");
var imgContainer = document.querySelector("#img-container");
var searchHistory = document.querySelector("#search-history");
//
var currentDate = moment().format("dddd, MMM Do");
$("#current-date").text(currentDate);
var forecastDate2 = moment().add(1, "days").format("MMM D");
var forecastDate3 = moment().add(2, "days").format("MMM D");
var forecastDate4 = moment().add(3, "days").format("MMM D");
//
var userInput = [];

// FUNCTIONS

function roundNum(num) {
  return Math.floor(num);
}

searchBtn.addEventListener("click", function (event) {
  event.preventDefault();
  // get value of search input
  var searchQuery = document.querySelector("#search-bar").value;
  // if nothing entered, they'll receive an alert
  if (searchQuery === "") {
    $("#error-msg").addClass("show");
    $("#error-msg").text("Please make a valid entry before submitting");
    $("#error-msg").delay(3000).fadeOut();
  }
  // otherwise, start the waterfall of functions
  else {
    updateStorage(searchQuery);
    getCityData(searchQuery);
    loadHistoryBtns(searchQuery);
  }
});

function updateStorage(searchQuery) {
    userInput.push(searchQuery)
    localStorage.setItem("queries", JSON.stringify(userInput));
}

function getCityData(searchQuery) {
    console.log(userInput);

  var cityData =
    "https://api.openweathermap.org/geo/1.0/direct?q=" +
    searchQuery +
    "&limit=1&appid=096c6b1c200b27403244ac76a0e8bd2d";

  fetch(cityData).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        // if nothing comes back, console log
        if (data === "[]") {
          $("#error").textContent = "That didn't work. Try again.";
        } else {
          // if data received, set lat/lon to localstorage
          localStorage.setItem("lat", data[0].lat);
          localStorage.setItem("lon", data[0].lon);
          console.log("City data for: " + data[0].name, data[0].state);
          //when submit is clicked, text will persist
          $("#search-bar").textContent = data[0].name;
          // fetch weather data for city
          getWeatherData(data[0].name, data[0].state);
        }
      });
    }
  });
}

function getWeatherData(city, state) {
  var lat = localStorage.getItem("lat");
  var lon = localStorage.getItem("lon");

  var dataURL =
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    lat +
    "&lon=" +
    lon +
    "&units=imperial&exclude=minutely,hourly&appid=096c6b1c200b27403244ac76a0e8bd2d";

  fetch(dataURL)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          displayCurrent(data.current, city, state);
          displayForecast(data.daily);
        });
      } else {
        console.log("error");
      }
    })
    .catch(function (error) {
      console.log("unable to connect to openweather");
    });
}

function displayCurrent(weather, city, state) {
  // CLEAR OLD
  currentForecastEl.textContent = "";
  searchResultsEl.textContent = "";
  imgContainer.textContent = "";
  $("#search-bar").val("");
  $("#current-forecast").removeClass("invisible");
  // SHOW CURRENT WEATHER FOR SEARCH QUERY
  var cityStateEl = document.createElement("h3");
  cityStateEl.textContent =
    "Showing current weather for: " + city + ", " + state;
  var timeStamp = document.createElement("p");
  timeStamp.textContent = "The current time is ";
  searchResultsEl.appendChild(cityStateEl);
  // IMG
  var currentImg = document.createElement("img");
  currentImg.setAttribute("src", "https://openweathermap.org/img/wn/" + weather.weather[0].icon + ".png");
  imgContainer.appendChild(currentImg);
  currentForecastEl.appendChild(imgContainer);
  // WEATHER HEADER
  var currentMainEl = document.createElement("h1");
  currentMainEl.textContent = weather.weather[0].main;
  currentForecastEl.appendChild(currentMainEl);
  // TEMP
  var currentTempEl = document.createElement("h4");
  currentTempEl.textContent = "Temp: " + roundNum(weather.temp) + "\u00B0 F";
  currentForecastEl.appendChild(currentTempEl);
  // FEEL
  var currentFeelEl = document.createElement("h4");
  currentFeelEl.textContent =
    "Feels like: " + roundNum(weather.feels_like) + "\u00B0 F";
  currentForecastEl.appendChild(currentFeelEl);
  // HUMIDITY
  var currentHumidEl = document.createElement("h4");
  currentHumidEl.textContent = "Humidity: " + weather.humidity + "%";
  currentForecastEl.appendChild(currentHumidEl);
  // UVI
  var currentUviEl = document.createElement("h4");
  currentUviEl.textContent = "UV Index: " + weather.uvi;
  // add color classes
  if (weather.uvi <= 2) {
      currentUviEl.classList = "green"
  }
  if (weather.uvi >= 3 && weather.uvi <= 5) {
      currentUviEl.classList = "yellow"
  }
  if (weather.uvi >= 6 && weather.uvi <= 7) {
      currentUviEl.classList = "orange"
  }
  if (weather.uvi >= 8) {
      currentUviEl.classList = "red"
  }
  currentForecastEl.appendChild(currentUviEl);
}

function displayForecast(forecasts) {
  // clear old
  futureForecastEl.textContent = "";
  $("#forecast-header").removeClass("invisible");

  for (var i = 1; i <= 4; i++) {
    // create elements for each forecast object
    var forecastObj = document.createElement("div");
    forecastObj.classList = "card card-small";
    var foreDate = document.createElement("h4");
    foreDate.setAttribute("id", "forecast-" + i);
    forecastObj.appendChild(foreDate);
    var foreImg = document.createElement("img");
    foreImg.setAttribute("src", "https://openweathermap.org/img/wn/" + forecasts[i].weather[0].icon + ".png");
    forecastObj.appendChild(foreImg);
    var foreHeader = document.createElement("h4");
    foreHeader.textContent = forecasts[i].weather[0].main;
    forecastObj.appendChild(foreHeader);
    var foreLow = document.createElement("h5");
    foreLow.textContent = "Low: " + roundNum(forecasts[i].temp.min);
    forecastObj.appendChild(foreLow);
    var foreHigh = document.createElement("h5");
    foreHigh.textContent = "High: " + roundNum(forecasts[i].temp.max);
    forecastObj.appendChild(foreHigh);
    futureForecastEl.appendChild(forecastObj);
  }

  $("#forecast-1").text("Tomorrow");
  $("#forecast-2").text(forecastDate2);
  $("#forecast-3").text(forecastDate3);
  $("#forecast-4").text(forecastDate4);
}

// on page load, find search history in local storage
function loadHistoryBtns(queries) {
  queries = JSON.parse(localStorage.getItem("queries"));
  // if nothing in storage, console log
  if (queries === null) {
    console.log("nothing in storage");
  }
  // otherwise, carry out function to create buttons
  else {
    for (var i = 0; i < queries.length; i++) {
      // create history buttons
      var newBtn = document.createElement("button");
      newBtn.textContent = queries[i];
      newBtn.classList = "btn";
      // newBtn.setAttribute("id", searchQuery)
      searchHistory.appendChild(newBtn);
    }
  }
};

loadHistoryBtns();

$(".btn").on("click", function() {
  var searchQuery = $(this).text();
  console.log(searchQuery);
  getCityData(searchQuery)
})