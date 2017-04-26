sabio.page.disMiles = null;
sabio.page.duration = null;
sabio.page.mileageFee = null;
sabio.page.durationFee = null;
sabio.page.durationStr = "";

sabio.page.startUp = function () {

    sabio.page.initializeValidation();

    $('.i-checks').iCheck({
        checkboxClass: 'icheckbox_square-green'
    });

    $("#mpg").inputmask('Regex', { regex: "^[0-9][0-9]$" });
    $("#weeklyWage").inputmask('Regex', { regex: "^[0-9][0-9][0-9][0-9][0-9][0-9][0-9]$" });
    $("#gasPrice").inputmask('Regex', { regex: "^[0-9].[0-9][0-9]$" });

    //geocomplete options
    var options = {
        types: ["geocode", "establishment"]
    };

    //geocomplete origin / destination search initialization
    $("#origin").geocomplete(options).bind("geocode:result", sabio.page.handlers.originResult);
    $("#destination").geocomplete(options).bind("geocode:result", sabio.page.handlers.destinationResult);


    $("#calculate").on("click", calculateDistances);

    $("#clearResults").on("click", sabio.page.handlers.clearResults);

    $(".footable").footable();

    //Find Make, Model to get MPG
    $("#year").on("change", sabio.page.handlers.getMake);
    $("#make").on("change", sabio.page.handlers.getModel);
    $("#model").on("change", sabio.page.handlers.getVehicleId);

} // sabio.page.startUp
//----------------------------------------------------------------------------------------------------------
sabio.page.handlers.getVehicleId = function () {
    var year = $("#year").val();
    var make = $("#make").val();
    var model = $("#model").val();
    sabio.services.SIM.getVehicleId(year, make, model, sabio.page.onGetVehicleIdSuccess, sabio.page.onGetVehicleIdError);
} // sabio.page.handlers.getVehicleId

sabio.page.onGetVehicleIdSuccess = function (xml) {
    $(xml).find('menuItem').each(function () {
        $(this).find("value").each(function () {
            var value = $(this).text();
            sabio.services.SIM.getMPG(value, sabio.page.onGetMPGSuccess, sabio.page.onGetMPGError);
        });
        return false;
    });
} // sabio.page.onGetVehicleIdSuccess

sabio.page.onGetVehicleIdError = function (error) {
    console.log(error);
} // sabio.page.onGetVehicleIdError

sabio.page.onGetMPGSuccess = function (xml) {
    if (!xml) {
        swal("Sorry!", "We do not have your car's mpg! Please Enter", "warning");
    }
    $(xml).find('yourMpgVehicle').each(function () {
        $(this).find("avgMpg").each(function () {
            var mpg = $(this).text();
            $("#mpg").val(Math.round(mpg));
        });
    });
} // onGetMPGSuccess

sabio.page.onGetMPGError = function (error) {
    console.log(error);
} // onGetMPGError

//----------------------------------------------------------------------------------------------------------
sabio.page.handlers.getModel = function () {
    var year = $("#year").val();
    var make = $("#make").val();
    sabio.services.SIM.getModel(year, make, sabio.page.onGetModelSuccess, sabio.page.onGetModelError);
} // sabio.page.handlers.getModel

sabio.page.onGetModelSuccess = function (xml) {
    $("#model").empty();
    var t = "<option value='0' selected>Select</option>"
    $("#model").append(t);
    $("#model").removeAttr("disabled");
    $(xml).find('menuItem').each(function () {
        $(this).find("value").each(function () {
            var value = $(this).text();
            var t = "<option value='" + value + "'>" + value + "</option>";
            $("#model").append(t);
        });
    });
} // sabio.page.onGetModelSuccess

sabio.page.onGetModelError = function (error) {
    console.log(error);
} // sabio.page.onGetModelError
//----------------------------------------------------------------------------------------------------------
sabio.page.handlers.getMake = function () {
    var year = $("#year").val();
    sabio.services.SIM.getMake(year, sabio.page.onGetMakeSuccess, sabio.page.onGetMakeError);
} // sabio.page.handlers.getMake

sabio.page.onGetMakeSuccess = function (xml) {
    $("#model").empty();
    $("#model").prop("disabled", true);
    $("#make").empty();
    var t = "<option value='0' selected>Select</option>"
    $("#make").append(t);
    $("#make").removeAttr("disabled");
    $(xml).find('menuItem').each(function () {
        $(this).find("value").each(function () {
            var value = $(this).text();
            var t = "<option value='" + value + "'>" + value + "</option>";
            $("#make").append(t);
        });
    });
} // sabio.page.onGetMakeSuccess

sabio.page.onGetMakeError = function (error) {
    console.log(error);
} // sabio.page.onGetMakeError
//----------------------------------------------------------------------------------------------------------

//Returns origin google results
sabio.page.handlers.originResult = function (event, result) {
    
    sabio.page.originLat = result.geometry.location.lat();
    sabio.page.originLng = result.geometry.location.lng();

};

//Returns destination google results
sabio.page.handlers.destinationResult = function (event, result) {

    sabio.page.destinationLat = result.geometry.location.lat();
    sabio.page.destinationLng = result.geometry.location.lng();

};

//Calculates distance and time from origin to destination
function calculateDistances() {
    origin = $('#origin').val(); //Get the source string
    destination = $('#destination').val(); //Get the destination string
    arrive = $('#arriveTime').val();
    var service = new google.maps.DistanceMatrixService(); //initialize the distance service
    service.getDistanceMatrix(
        {
            origins: [origin], //set origin, you can specify multiple sources here
            destinations: [destination],//set destination, you can specify multiple destinations here
            travelMode: google.maps.TravelMode.DRIVING, //set the travelmode
            unitSystem: google.maps.UnitSystem.IMPERIAL,//The unit system to use when displaying distance
            transitOptions: {
                departureTime: arrive
            },
            drivingOptions: {
                departureTime: new Date(Date.now()),  // for the time N milliseconds from now.
                trafficModel: 'bestguess'
            },
            avoidHighways: false,
            avoidTolls: false
        }, calcDistance); // here calcDistance is the call back function


}

var format2 = function (n, currency) {
    return currency + n.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
};

var getFormData = function () {
    var data = {
        startAddress: $("#origin").val(),
        endAddress: $("#destination").val(),
        weeklyWage: $("#weeklyWage").val(),
        gasPrice: $("#gasPrice").val(),
        mpg: $("#mpg").val(),
        uberCheck: $("#uberCheck").prop("checked")
    }

    var weeklyGCost = (sabio.page.disMiles / data.mpg) * data.gasPrice * 10;
    var weekGPrice = format2(weeklyGCost, "$");

    var monthlyGWage = data.weeklyWage * 4;
    var monthlyWage = format2(monthlyGWage, "$");
    var yearlyGWage = monthlyGWage * 12;
    var yearlyWage = format2(yearlyGWage, "$");
    var monthlyGCost = (weeklyGCost * 4);
    var monthlyGPrice = format2(monthlyGCost, "$");

    var yearlyGCost = (monthlyGCost * 12);
    var yearlyGPrice = format2(yearlyGCost, "$");

    var uberCost = ((sabio.page.mileageFee + sabio.page.durationFee + 2.30) * 10).toFixed(2);

    var newResultString = $("#calculateResultsTemplate").html();
    var newResult = $(newResultString).clone();

    var subGPrice = weekGPrice.slice(1);
    var cWeeklyWage = (data.weeklyWage - subGPrice).toFixed(2);

    newResult.find(".startAddress").text(data.startAddress);
    newResult.find(".endAddress").text(data.endAddress);
    newResult.find(".weeklyCommuteCost").text(weekGPrice);
    newResult.find(".lessCommuteCost").text(cWeeklyWage);
    newResult.find(".monthlyWage").text((cWeeklyWage * 4).toFixed(2));
    newResult.find(".yearlyWage").text((cWeeklyWage * 52).toFixed(2));
    newResult.find(".monthlyCommuteCost").text(monthlyGPrice);
    newResult.find(".yearlyCommuteCost").text(yearlyGPrice);
    newResult.find(".commuteDuration").text(sabio.page.durationStr);
    newResult.find(".monthlyUberCost").text((uberCost * 4).toFixed(2));
    newResult.find(".yearlyUberCost").text((uberCost * 52).toFixed(2));


    if (data.uberCheck == true) {
        newResult.find(".weeklyUberCost").text(uberCost);
    }


    $(newResult).appendTo("#resultBody");


    $(".footable").trigger("footable_redraw");
    $("#gasAskForm").trigger('reset');
    $('#uberCheck').closest('.icheckbox_square-green').removeClass('checked');

}


function calcDistance(response, status) {
    if ($('#gasAskForm').valid()) {


        if (status != google.maps.DistanceMatrixStatus.OK) { // check if there is valid result
            alert('Error was: ' + status);
        } else {
            var origins = response.originAddresses;
            var destinations = response.destinationAddresses;
            //deleteOverlays();

            for (var i = 0; i < origins.length; i++) {
                var results = response.rows[i].elements;

                for (var j = 0; j < results.length; j++) {
                    var element = results[j];
                    var duration = element.duration.text;

                    //var durationInTraffic = element.duration_in_traffic.value;
                  
                    var disTxt = results[j].distance.text;
                    var disObj = disTxt.split(" ");

                    var durTxt = duration;
                    var durObj = durTxt.split(" ");

                    sabio.page.disMiles = disObj[0];
                    //sabio.page.duration = durObj[0];
                    sabio.page.durationStr = withTrafficDuration(duration);

                    sabio.page.mileageFee = sabio.page.disMiles * .90;
                    //sabio.page.durationFee = sabio.page.duration * .15;
                    getFormData();

                }
            }
        }
    }
}

//Clear our Results
sabio.page.handlers.clearResults = function () {

    $(".calculateResults").remove();

    $(".footable-row-detail-inner").remove();

};

sabio.page.initializeValidation = function () {

    jQuery.validator.setDefaults({
        debug: true
    });

    $('#gasAskForm').validate({
        errorPlacement: function (error, element) {
            return true;
        },
        rules: {
            "origin": {
                required: true
            },
            "destination": {
                required: true
            },
            "mpg": {
                required: true
            },
            "gasPrice": {
                required: true
            },
            "weeklyWage": {
                required: true
            }
        }
    });
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function withTrafficDuration(d) {

    var dArray = d.split(" ");
    var min = 0;
    var hrs = 0;
    var days = 0;
    var dStr = "";


    if (dArray.length == 2) {
        min = dArray[0];
        min = Math.round(min * 2 * getRandomArbitrary(1, 1.5));

    }
    else if (dArray.length == 4) {
        min = dArray[0] * 60 + dArray[2] * 1;
        min = Math.round(min * 2 * getRandomArbitrary(1, 1.5));
    }
    else if (dArray.length == 6) {
        min = dArray[0] * 24 * 60 + dArray[2] * 60 + dArray[4] * 1;
        min = Math.round(min * 2 * getRandomArbitrary(1, 1.5));
    }

    sabio.page.durationFee = min * 0.15;

    if (min < 60) {
        if (min == 1) {
            dStr = min + " min";
        }
        else {
            dStr = min + " mins";
        }
    }
    else if (min > 60 && min < 1440) {
        if (Math.floor(min / 60) == 1) {
            if (min % 60 == 1) {
                dStr = Math.floor(min / 60) + " hr " + min % 60 + " min";
            }
            else {
                dStr = Math.floor(min / 60) + " hr " + min % 60 + " mins";
            }
        }
        else {
            if (min % 60 == 1) {
                dStr = Math.floor(min / 60) + " hrs " + min % 60 + " min";
            }
            else {
                dStr = Math.floor(min / 60) + " hrs " + min % 60 + " mins";
            }
        }
    }

    return dStr;
}
