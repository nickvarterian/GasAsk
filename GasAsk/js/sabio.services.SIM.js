if (!sabio.services.SIM) {
    sabio.services.SIM = {}
}

sabio.services.SIM.getMPG = function (id, onGetAllSuccess, onGetAllError) {
    var url = "http://www.fueleconomy.gov/ws/rest/ympg/shared/ympgVehicle/"+ id;
    var settings = {
        cache: false
            , dataType: "xml"
            , success: onGetAllSuccess
            , error: onGetAllError
            , type: "GET"
    };
    $.ajax(url, settings);
} // getMPG

sabio.services.SIM.getVehicleId = function (year, make, model, onGetAllSuccess, onGetAllError) {
    var url = "http://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=" + year + "&make=" + make + "&model=" + model;
    var settings = {
        cache: false
            , dataType: "xml"
            , success: onGetAllSuccess
            , error: onGetAllError
            , type: "GET"
    };
    $.ajax(url, settings);
} // getVehicleId

sabio.services.SIM.getModel = function (year, make, onGetAllSuccess, onGetAllError) {
    var url = "http://www.fueleconomy.gov/ws/rest/vehicle/menu/model?year=" + year + "&make=" + make;
    var settings = {
        cache: false
            , dataType: "xml"
            , success: onGetAllSuccess
            , error: onGetAllError
            , type: "GET"
    };
    $.ajax(url, settings);
} // getModel

sabio.services.SIM.getMake = function (year, onGetAllSuccess, onGetAllError) {
    var url = "http://www.fueleconomy.gov/ws/rest/vehicle/menu/make?year=" + year;
    var settings = {
        cache: false
            , dataType: "xml"
            , success: onGetAllSuccess
            , error: onGetAllError
            , type: "GET"
    };
    $.ajax(url, settings);
} // getMake