//Hides elements that will show once the first search goes through.
$(".current-box").hide();
$(".forecast-banner").hide();
var forecastDisplay;

//Pulls previous city searches from local storage.
function allStorage() {
    var values = [],
        keys = Object.keys(localStorage),
        i = keys.length;
    while ( i-- ) {
        values.push( localStorage.getItem(keys[i]));
    }
    for (j = 0; j < values.length; j++) {
        $(".prev-list").prepend("<button class='prev-city mt-1'>" + values[j] + "</button>");
    }
}
allStorage();

//Clears all local storage items and previous searches from the page.
$(".clear").on("click", function() {
    localStorage.clear();
    $(".prev-city").remove();
});

//This function collects all the info from the weather APIs to display on the page
$(".search").on("click", function() {
    var subject = $(".subject").val();
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + subject + "&appid=3c34658c8e0e9fdb71064b81293a3704";
    var queryURL2 = "https://api.openweathermap.org/data/2.5/forecast?q=" + subject + "&appid=3c34658c8e0e9fdb71064b81293a3704";
    var lat;
    var lon;
    if (forecastDisplay === true) {
        $(".forecast-day").remove();
        forecastDisplay = false;
    }

//This first ajax request collects current weather data and converts info into what we want to display.
    $.ajax({
        url: queryURL,
        method: "GET",
        statusCode: {
            404: function() {
              return;
            }
          }    
    }).then(function(response){
        console.log(response);
        $(".prev-list").prepend("<button class='prev-city mt-1'>" + subject + "</button>");
        localStorage.setItem(subject, subject);
        $(".current-box").show();
        $(".forecast-banner").show();
        var iconcode = response.weather[0].icon;
        var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
        $(".icon").attr('src', iconurl)
        lat = response.coord.lat;
        lon = response.coord.lon;
        $(".current-city").text(response.name + " " + moment().format('l'));
        var currentTemp = response.main.temp * (9/5) - 459.67;
        $(".current-temp").text("Temperature: " + currentTemp.toFixed(1) + " °F");
        $(".current-hum").text("Humidity: " + response.main.humidity + "%");
        $(".current-wind").text("Wind Speed: " + response.wind.speed + " MPH");
        queryURL = "http://api.openweathermap.org/data/2.5/uvi/forecast?&appid=3c34658c8e0e9fdb71064b81293a3704&lat=" + lat + "&lon=" + lon;
//This is nested ajax request that gets the UV index but uses longitude and latitude from the previous ajax request to do so.
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response){
            $(".current-uv").text("UV Index: " + response[0].value);
        })
    })

//This ajax request collects weather data for the next 5 days (specifically it is grabbing the stays from noon, as opposed to every few hours)
    $.ajax({
        url: queryURL2,
        method: "GET"
    }).then(function(response){
        var forecastTimes = response.list;
        for (i = 0; i < forecastTimes.length; i++) {
            if (forecastTimes[i].dt_txt[12] === "2") {
                var forecastDate = forecastTimes[i].dt_txt;
                var forecastDateDisplay = forecastDate.charAt(5) + forecastDate.charAt(6) + "/" + forecastDate.charAt(8) + forecastDate.charAt(9) +
                "/" + forecastDate.charAt(0) + forecastDate.charAt(1) + forecastDate.charAt(2) + forecastDate.charAt(3);
                var forecastIcon = forecastTimes[i].weather[0].icon;
                var forecastIconURL = "http://openweathermap.org/img/w/" + forecastIcon + ".png";
                var forecastTemp = forecastTimes[i].main.temp * (9/5) - 459.67;
                var forecastHum = forecastTimes[i].main.humidity;
                if (forecastDisplay === false || forecastDisplay === undefined) {
                    $(".forecast-list").append("<div class='my-3 pb-3 col-md-2 col-lg-2 forecast-day'>" +
                    "<h5>" + forecastDateDisplay + "<h5>" +
                    "<img class='ficon' src=" + forecastIconURL + " alt='Weather icon'>" + 
                    "<div>Temp: " + forecastTemp.toFixed(1) + " °F" + 
                    "</div><div>Humidity: " + forecastHum + 
                    "%</div></div></div>");
                } 
            }
        }
        forecastDisplay = true;
    })
});

//This will search the weather stats for the previous city when said city is clicked on.
$(document).on("click", ".prev-city", function() {
    var subject = $(this).text();
    $(".subject").val(subject);
    $(".search").click();
    $(this).remove();
});