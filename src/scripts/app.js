const myWeatherAPIKey = '04901bda849c03c85e34cc2001a5c026';
const currentWeather = document.querySelector('.current-conditions');
const forecastWeather = document.querySelector('.forecast');
const dateOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

navigator.geolocation.getCurrentPosition(position => {
  const localLatitude = position.coords.latitude;
  const localLongitude = position.coords.longitude;

  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${localLatitude}&lon=${localLongitude}&appid=${myWeatherAPIKey}`)
    .then(resp => {
      if (resp.ok) {
        return resp.json();
      } else {
        throw new Error('No json found');
      }
    })
    .then(localWeather => {
      displayLocalWeather(localWeather);
    });

  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${localLatitude}&lon=${localLongitude}&appid=${myWeatherAPIKey}`)
    .then(resp => {
      if (resp.ok) {
        return resp.json();
      } else {
        throw new Error('No json found');
      }
    })
    .then(forecast => {
      displayForecast(forecast);
    })
});

function displayLocalWeather(info) {
  currentWeather.innerHTML = "";

  currentWeather.insertAdjacentHTML('afterbegin', `
    <h2>Current Conditions</h2>
    <img src="http://openweathermap.org/img/wn/${info.weather[0].icon}@2x.png"/>
    <div class="current">
      <div class="temp">${convertTemprature(info.main.temp)}℃</div>
      <div class="condition">${info.weather[0].description}</div>
    </div>
  `)
}

function convertTemprature(kelvinTemp) {
  return Math.round(kelvinTemp - 273.15);
}

function displayForecast(forecastInfo) {
  let newDateObj = {};

  for (let objOfArray of forecastInfo.list) {
    if (objOfArray.dt_txt.includes(objOfArray.dt_txt.substring(0, 11))) {
      if (newDateObj[convertTime(objOfArray.dt_txt)] === undefined) {
        newDateObj[convertTime(objOfArray.dt_txt)] = [objOfArray];
      } else {
        newDateObj[convertTime(objOfArray.dt_txt)].push(objOfArray);
      }
    }
  }
  
  let weatherHtml = "";
  
  for (let weekdays in newDateObj) {
    let date = new Date();
    let highTemp = [];
    let lowTemp = [];

    let MidNightWeather = newDateObj[weekdays].filter((ele) => {
      const date = new Date(ele.dt_txt);
      return date.getHours() === 0;
    })
    
    if(MidNightWeather[0] !== undefined) {
      weatherHtml += `
      <div class="day">
        <h3>${weekdays}</h3>
        <img src="http://openweathermap.org/img/wn/${MidNightWeather[0]["weather"][0].icon}@2x.png" />
        <div class="description">${MidNightWeather[0]["weather"][0].description}</div>
    `
    }

     if (weekdays !== dateOfWeek[date.getDay()]) {
      for (let results of newDateObj[weekdays]) {
        highTemp.push(results.main.temp_max);
        highTemp.sort((a, b) => b - a);
        lowTemp.push(results.main.temp_min);
        lowTemp.sort((a, b) => a - b);
      }
      weatherHtml += ` 
      <div class="temp">
        <span class="high">${convertTemprature(highTemp[0])}℃</span>/<span class="low">${convertTemprature(lowTemp[0])}℃</span>
      </div>`
    }

    weatherHtml +="</div>"
  }

  forecastWeather.innerHTML = "";
  forecastWeather.insertAdjacentHTML('beforeend', weatherHtml)
}

function convertTime(time) {
  let newDate = new Date(time);
  return dateOfWeek[newDate.getDay()];
}