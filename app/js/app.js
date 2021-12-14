const apiKey = "4d8fb5b93d4af21d66a2948710284366";

$(document).ready(function () {
    $(".form__city").focus();
});

$(".main__form").submit(function (e) {
    e.preventDefault();
    if ($(".form__city").hasClass("busy")) {
        return;
    }
    $(".form__city").addClass("busy");
    setTimeout(() => {
        $(".form__city").removeClass("busy");
    }, 1000)
    $(".form__city").val() ? inputVal = $(".form__city").val() : inputVal = "Cape Town"; //Sets city to "Cape Town" if no input was recieved
    $(".form__city").val("");
    $.getJSON(`http://api.openweathermap.org/geo/1.0/direct?q=${inputVal}&limit=1&appid=${apiKey}`)
        .done(function (data) {
            const cityName = `${data[0].name}, ${data[0].country}`;
            let yesterdayTime;
            $.getJSON(`https://api.openweathermap.org/data/2.5/onecall?lat=${data[0].lat}&lon=${data[0].lon}&exclude=daily,minutely,alerts&appid=${apiKey}&units=metric`)
                .done(async function (data) {
                    console.log(data)
                    const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    const calcTime = new Date((data.current.dt + (new Date(Date.now() * 1000).getTimezoneOffset() * 60) + data.timezone_offset) * 1000); //Calculates timezone of city compared to your timezone
                    const dateTime = `${weekDays[calcTime.getDay()]} ${calcTime.getDate()} ${months[calcTime.getMonth()]} ${clockTime(calcTime.getHours())}:${clockTime(calcTime.getMinutes())}`;
                    let uvIndex = "";
                    yesterdayTime = data.current.dt - 86400;
                    if ($(".main__form").hasClass("invalid")) {
                        $(".form__flash").css("opacity", 0);
                        $(".main__form").removeClass("invalid");
                    }
                    if (data.current.dt < data.current.sunrise || data.current.dt > data.current.sunset) {
                        $("html").addClass("dark");
                    } else {
                        $("html").removeClass("dark");
                    }
                    if (data.current.uvi < 3) {
                        uvIndex = "Low";
                    } else if (data.current.uvi < 6) {
                        uvIndex = "Medium";
                    } else if (data.current.uvi < 8) {
                        uvIndex = "High";
                    } else if (data.current.uvi < 11) {
                        uvIndex = "Very High";
                    } else {
                        uvIndex = "Extremely High";
                    }
                    $(".weather__city").html(`<i class="fas fa-map-marker-alt mr-2"></i><span class="text-xl font-semibold">${cityName}</span>`);
                    $(".weather__date").html(`<span class="text-base font-semibold">${dateTime}</span>`);
                    $(".weather__desc").html(data.current.weather[0].main);
                    $(".weather__temp").html(`<img src="http://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png" alt="Weather icon">${Math.ceil(data.current.temp)}&deg;`);
                    // $(".weather__minmax").html(`${Math.ceil(data.current.temp_max)}&deg; / ${Math.ceil(data.current.temp_min)}&deg; - Feels Like ${Math.ceil(data.current.feels_like)}&deg;`);
                    $(".weather__minmax").html(`Feels Like ${Math.ceil(data.current.feels_like)}&deg;`);
                    $.getJSON(`http://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${data.lat}&lon=${data.lon}&dt=${yesterdayTime}&appid=${apiKey}&units=metric`)
                        .done(function (data) {
                            $(".weather__yest").html(`Yesterday ${Math.ceil(data.current.temp)}&deg;`);
                        })
                        .fail(function () {
                            $(".main__form").addClass("invalid");
                            $(".flash__message").text("Could Not Fetch Yesterday's Temperature");
                            $(".form__flash").css("opacity", 1);
                        })
                    $(".weather__details").removeClass("hidden")
                    $(".details__humidity").html(`<i class="fas fa-tint mr-2"></i>${data.current.humidity}%`);
                    $(".details__uvi").html(`<i class="fas fa-sun mr-2"></i>${uvIndex}`);
                })
                .fail(function () {
                    $(".main__form").addClass("invalid");
                    $(".flash__message").text("Enter A Valid City Name");
                    $(".form__flash").css("opacity", 1);
                })
        })
        .fail(function () {
            $(".main__form").addClass("invalid");
            $(".flash__message").text("Enter A Valid City Name");
            $(".form__flash").css("opacity", 1);
        })
});



function clockTime(num) {
    if (num.toString().length === 1) {
        return num.toString().padStart(2, "0");
    } else {
        return num;
    }
}