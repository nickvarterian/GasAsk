var sabio = {
    layout: {}
    , page: {
        handlers: {}
        , startUp: null
    }
    , services: { blogs: {} }
};

//var sabio = []; // Create a new empty object called sabio
//sabio.layout = {}; //Create a new "namespaced" empty object called layout inside sabio
//sabio.page = {}; //Create a new "namespaced" empty object called page inside sabio
//sabio.services = {};//Create a new "namespaced" empty object called services inside sabio




sabio.layout.startUp = function () {

   
    if (sabio.page.startUp) {
        console.debug("sabio.layout.startUp fired and found sabio.page.startUp");
        sabio.page.startUp();
    }
};

$(document).ready(sabio.layout.startUp); //Startup/Ready Queue

