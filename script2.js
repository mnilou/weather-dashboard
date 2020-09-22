//Hides elements that will show once the first search goes through.
$(document).ready(function () {
  $(".current-box").hide();
  $(".forecast-banner").hide();
  var forecastDisplay;

  //Pulls previous city searches from local storage.
  function allStorage() {
    var values = [],
      keys = Object.keys(localStorage),
      i = keys.length;
    while (i--) {
      values.push(localStorage.getItem(keys[i]));
    }
    for (j = 0; j < values.length; j++) {
      $(".prev-list").prepend(
        "<button class='prev-city mt-1'>" + values[j] + "</button>"
      );
    }
  }
  allStorage();

  //Clears all local storage items and previous searches from the page.
  $(".clear").on("click", function () {
    localStorage.clear();
    $(".prev-city").remove();
  });

  //This function collects all the info from the weather APIs to display on the page
  $(".search").on("click", function () {
    var subject = $(".subject").val();
    console.log(subject);
    var queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${subject}&appid=443b8a6200a4e8cbb81798c7fbd4f928&units=imperial`;
    var queryURL2 =
      "https://api.openweathermap.org/data/2.5/forecast?q=" +
      subject +
      "&appid=443b8a6200a4e8cbb81798c7fbd4f928";
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
        404: function () {
          return;
        },
      },
    }).then(function (response) {
      console.log(response);
      $(".prev-list").prepend(
        "<button class='prev-city mt-1'>" + subject + "</button>"
      );
      localStorage.setItem(subject, subject);
      $("#today").empty();
      var card = $("<div>").addClass("card");
      var cardBody = $("<div>").addClass("card-body");
      var iconCode = response.weather[0].icon;
      var iconURL = "http://openweathermap.org/img/w/" + iconCode + ".png";
      var icon = $("<img>").attr("src", iconURL);
      var cardTitle = $("<h2>").addClass("card-title").text(response.name);
      var currentTemp = response.main.temp;
      var temp = $("<h4>")
        .addClass("card-text")
        .text("Temperature: " + currentTemp.toFixed(0) + " °F");
      var hum = $("<h4>")
        .addClass("card-text")
        .text("Humidity: " + response.main.humidity + "%");
      var wind = $("<h4>")
        .addClass("card-text")
        .text("Wind Speed: " + response.wind.speed + " MPH");
        var uv = $("<h4>").addClass("UV Index: " + response[0].value)
      $(".current-box").show();
      $(".forecast-banner").show();
      // $("#current-city").text(response.name + " " + moment().format("l"));
      
      $("#today").append(
        card.append(cardBody.append(cardTitle.append(icon), temp, hum, wind, uv))
      );

      lat = response.coord.lat;
      lon = response.coord.lon;

      queryURL =
        "http://api.openweathermap.org/data/2.5/uvi/forecast?&lat=" +
        lat +
        "&lon=" +
        lon +
        "&appid=443b8a6200a4e8cbb81798c7fbd4f928";
      //This is nested ajax request that gets the UV index but uses longitude and latitude from the previous ajax request to do so.
      $.ajax({
        url: queryURL,
        method: "GET",
      }).then(function (response) {
        $(".current-uv").text("UV Index: " + response[0].value);
      });
    });

    //This ajax request collects weather data for the next 5 days (specifically it is grabbing the stays from noon, as opposed to every few hours)
    $.ajax({
      url: queryURL2,
      method: "GET",
    }).then(function (response) {
      var forecastTimes = response.list;
      for (i = 0; i < forecastTimes.length; i++) {
        if (forecastTimes[i].dt_txt[12] === "2") {
          var forecastDate = forecastTimes[i].dt_txt;
          var forecastDateDisplay =
            forecastDate.charAt(5) +
            forecastDate.charAt(6) +
            "/" +
            forecastDate.charAt(8) +
            forecastDate.charAt(9) +
            "/" +
            forecastDate.charAt(0) +
            forecastDate.charAt(1) +
            forecastDate.charAt(2) +
            forecastDate.charAt(3);
          var forecastIcon = forecastTimes[i].weather[0].icon;
          var forecastIconURL =
            "http://openweathermap.org/img/w/" + forecastIcon + ".png";
          var forecastTemp = forecastTimes[i].main.temp * (9 / 5) - 459.67;
          var forecastHum = forecastTimes[i].main.humidity;
          var forecastWind = forecastTimes[i].wind.speed;
          var forecastUV = forecastTimes[i].value;
          if (forecastDisplay === false || forecastDisplay === undefined) {
            $(".forecast-list").append(
              "<div class='my-3 pb-3 col-md-2 col-lg-2 forecast-day'>" +
                "<h5>" +
                forecastDateDisplay +
                "<h5>" +
                "<img class='ficon' src=" +

                forecastIconURL +
                " alt='Weather icon'>" +
                "<div>Temp: " +

                forecastTemp.toFixed(1) +
                " °F" +
                "</div><div>Humidity: " +

                forecastHum +
                "%</div></div></div>Humidity: " +

                forecastWind +
                "</div><div>MPH " +

                forecastUV +
                "</div><div>MPH "
               
            );
          }
        }
      }
      forecastDisplay = true;
    });
  });

  //This will search the weather stats for the previous city when clicked.
  $(document).on("click", ".prev-city", function () {
    var subject = $(this).text();
    $(".subject").val(subject);
    $(".search").click();
    $(this).remove();
  });
});
