// JavaScript Document
// This first part starts when the window loads
// It access all the elements in the externally linked svg map
// when you click the correct button, it executes
$(window).load(function () {
		
	console.log("Document loaded, including graphics and embedded documents (like SVG)");
	
	// need to do something here that initiates the map according to the crop that's clicked.
	
	yearSlider(); //in slider.js
	
	//changeBackground(); //Sets the background image and attribution line
	
	runChoropleth();
	
	selectLink(); //Adds selected class to clicked links
	
		
});

function getSVG () {
	var a = document.getElementById("mapSvg");
	var svgDoc = a.contentDocument; //get the inner DOM of the map svg
	var svgElement = $(svgDoc).find('path');
	return svgElement
}

//Function to run the JQuery year slider
function yearSlider () {
	var years = [];
	/*years[ 1 ] = "1945";
	years[ 2 ] = "1949";
	years[ 3 ] = "1954";
	years[ 4 ] = "1959";
	years[ 4 ] = "1964";
	years[ 5 ] = "1969";
	years[ 6 ] = "1974";
	years[ 7 ] = "1978";
	years[ 8 ] = "1982";
	years[ 9 ] = "1987";
	years[ 10 ] = "1992";
	years[ 11 ] = "1997";
	years[ 12 ] = "2002";
	years[ 13 ] = "2007";*/
	
	$("#year_range").slider({
		range: false,
		min: 0,
		max:  crop_Con[0].Data.length - 1,
		value: 0,
		step: 1,
		slide: function( event, ui ) {
			//$( "#year_range" ).val(crop_Con[0].Data[ui.value].year);
			var swap = crop_Con[0].Data[ui.value].year;
			$("#year-title").text(swap); 		//runs the choropleth function that colors the map
			choroplethCropland(getSVG(), swap); //calls choropleth function
		}
	})

};

//Runs choropleth when one of the year links is chosen
function runChoropleth() {
	console.log("choropleth run");
	var a = document.getElementById("mapSvg");
	var svgDoc = a.contentDocument; //get the inner DOM of the map svg
	var svgElement = $(svgDoc).find('path');
	
	var year_html = "";
	for(var i = 0; i < crop_Con[0].Data.length; i++)
	{
		/*
		create new link on thingy for crop_Con[0].Data[i].year
		*/
		var yearlist_width = ($("#yearlist").width() - 40) / (crop_Con[0].Data.length - 1);
		//console.log(yearlist_width);
		if ( i == (crop_Con[0].Data.length - 1) ) {
			yearlist_width = "auto";
		}
		year_html += "<a href='#' style='width:" + yearlist_width + "px;'>" + crop_Con[0].Data[i].year + "</a>"; //adds string to empty variable year_links
		
	}
	
	$("#yearlist").html(year_html);
	
	var year_links = $("#yearlist a"); 			//Gets all the links in the list of years at the top
	
	year_links.each( function (){ 				//Does something when any of the year links is clicked
		$(this).on("mousedown",function() { 	//Gets the text within the link that was clicked
			var swap = $(this).text();
			$("#year-title").text(swap); 		//runs the choropleth function that colors the map
			choroplethCropland(svgElement, swap); //calls choropleth function
		});
	});
	
	choroplethCropland(svgElement, crop_Con[0].Data[0].year); //Colors the map with all cropland data

};


//Appends a "selected" class to the navigation when clicked, runs Choropleth function again
function selectLink() {
	
	var crop_links = $("nav a"); //gets the links of "all cropland", "corn", "wheat", "soy"
	crop_links.each( function (){
		$(this).on("mousedown",function() {
			$("nav a").removeClass("selected"); //"selected" is a css class that adds a green background
			var cropname = $(this).attr("alt"); // gets the "alt" tag within the clicked "a" tag which has the crop name
			//var cropjson = $(this).attr("id"); // gets the "id" tag within the clicked "a" tag which has the name of the json file
			
			if (cropname == "All") crop_Con = all_Crop_Con;
			if (cropname == "Corn") crop_Con = Corn_Crop_Con;
			if (cropname == "Wheat") crop_Con = Wheat_Crop_Con;
			if (cropname == "Soy") crop_Con = Soy_Crop_Con;
			
			//console.log(cropjson);
			$("#crop-title").text(cropname); //writes crop name to the h1 title
			$(this).addClass("selected"); //adds the "selected" class to the clicked crop link
			changeBackground();
			runChoropleth();
			yearSlider();
			$('#year-title').text($('#yearlist a')[0].text); //when a new crop link is clicked, this adds the first year from the new data to the title.
		});
	});

};

function changeBackground () {
	var bgimg = $(".selected").attr("alt");
	console.log("changeBackground run");
	
	$("html").css(
		"background-image", 
		"url(img/bg_" + bgimg + ".jpg)"
	);
	
	var byline = $(".photobyline p");
	
	$(byline).each(function(){
		var bylineAlt = $(this).attr("alt");
		if (bgimg == bylineAlt) $(this).show();
		else $(this).hide();
	});
	
	
};

//Adds choropleth coloring
function choroplethCropland(svgElement, swap) {
	
	svgElement.each(function(){
		var Concen = -1; //Concen is the concentration value. We set a negative value for it at first, so the old values from previously clicked crops do not still appear on the map.
		
		var lenA = crop_Con.length;
		for(var i = lenA; i--;){ //var i = 0, len = arr.length; i < len; i++
			//var ANSIattr = $(this).attr("ANSI")
			if(crop_Con[i].ANSI == this.id){
				var lenB = crop_Con[i].Data.length;
				for(var j = 0; j < lenB; j++){
					if(crop_Con[i].Data[j].year == swap){
						Concen = crop_Con[i].Data[j].value;
						break;
					}
				}
				break;
			}
		}
		
		//This function makes a rollover popup for each state
		$(this).on("mouseenter",function(e) {
			var countyname = $(this).attr("inkscape:label");
			PopUp(e, countyname, Concen)
			$(this).attr('stroke-width', '1')
		});
		$(this).on("mouseleave", function() {
			$(this).attr('stroke-width', '0.1')	
		});
		$(this).on("mousedown",function(e) {
			var countyname = $(this).attr("inkscape:label");
			PopUp(e, countyname, Concen)
			$(this).attr('fill', '#ff0')
		});
				
		//This section assigns a hex color to a particular range of numbers
		var fillVal = "#ccc";
	
		if(Concen == 0){
			fillVal = "#eaf6f2"
		}
		else if(50.000 >= Concen && Concen > 0){
			fillVal = "#d2f5ce"
		}
		else if(100.000 >= Concen && Concen > 50.000){
			fillVal = "#c5f0c6"
		}
		else if(150.000 >= Concen && Concen > 100.000){
			fillVal = "#afe8b9"
		}
		else if(200.000 >= Concen && Concen > 150.000){
			fillVal = "#98dfab"
		}
		else if(250.000 >= Concen && Concen > 200.000){
			fillVal = "#81d69d"
		}
		else if(300.000 >= Concen && Concen > 250.000){
			fillVal = "#64cb8c"
		}
		else if(350.000 >= Concen && Concen > 300.000){
			fillVal = "#47c17b"
		}
		else if(400.000 >= Concen && Concen > 350.000){
			fillVal = "#2cb66b"
		}
		else if(450.000 >= Concen && Concen > 400.000){
			fillVal = "#16ae5e"
		}
		else if(500.000 >= Concen && Concen > 450.000){
			fillVal = "#00a650"
		}
		else if(550.000 >= Concen && Concen > 500.000){
			fillVal = "#018d45"
		}
		else if(600.000 >= Concen && Concen > 550.000){
			fillVal = "#026e36"
		}
		else if(640.000 >= Concen && Concen > 600.000){
			fillVal = "#014f27"
		}
		
		$(this).attr('fill', fillVal);
	});
};


function PopUp(e, stateId, Concen) {
	//Do something to the clicked path
	//Returns the crop concentration for the clicked area
	
	var rolloverOutput = stateId + ": ";
	if (Concen == 0) {
		rolloverOutput += "No Data Reported";
		$("#acre-title").text(rolloverOutput);
	}
	else if(670 >= Concen && Concen > 0) {
		rolloverOutput += (Concen).toFixed(3) + " acres per square mile";
		$("#acre-title").text(rolloverOutput); //Puts the cropland concentration number in the h2 tag
	}
	else if (Concen !== 0) {
		rolloverOutput += "No Data Reported";
		$("#acre-title").text(rolloverOutput);
	}
		
};


// Make new array to put the new concentrations
var all_Crop_Con = [];

$.each(us_all_acres_county, function (key, data) {

	//Calculate cropland concentrations for all years available
	var ansi = data.ANSI;
	var state_sqmiles = /*parseFloat(*/data.sqmiles/*.replace(",", ""))*/; //removes commas from data
	
	var crop_concentration1945 = data.y1945 / state_sqmiles
	var crop_concentration1949 = data.y1949 / state_sqmiles
	var crop_concentration1954 = data.y1954 / state_sqmiles
	var crop_concentration1959 = data.y1959 / state_sqmiles
	var crop_concentration1964 = data.y1964 / state_sqmiles
	var crop_concentration1969 = data.y1969 / state_sqmiles
	var crop_concentration1974 = data.y1974 / state_sqmiles
	var crop_concentration1978 = data.y1978 / state_sqmiles
	var crop_concentration1982 = data.y1982 / state_sqmiles
	var crop_concentration1987 = data.y1987 / state_sqmiles
	var crop_concentration1992 = data.y1992 / state_sqmiles
	var crop_concentration1997 = data.y1997 / state_sqmiles
	var crop_concentration2002 = data.y2002 / state_sqmiles
	var crop_concentration2007 = data.y2007 / state_sqmiles

	//make data objects in the new array
	var datarow = {
		"ANSI": ansi,
		"Data": [ 
			/*{ "year": 1945, "value": crop_concentration1945 },
			{ "year": 1949, "value": crop_concentration1949 },
			{ "year": 1954, "value": crop_concentration1954 },
			{ "year": 1959, "value": crop_concentration1959 },
			{ "year": 1964, "value": crop_concentration1964 },
			{ "year": 1969, "value": crop_concentration1969 },
			{ "year": 1974, "value": crop_concentration1974 },
			{ "year": 1978, "value": crop_concentration1978 },
			{ "year": 1982, "value": crop_concentration1982 },
			{ "year": 1987, "value": crop_concentration1987 },
			{ "year": 1992, "value": crop_concentration1992 },*/
			{ "year": 1997, "value": crop_concentration1997 },
			{ "year": 2002, "value": crop_concentration2002 },
			{ "year": 2007, "value": crop_concentration2007 }		
		]
	};
	all_Crop_Con.push(datarow);
});

var crop_Con = all_Crop_Con;



// Make new Array to put Corn Crop Concentrations
var Corn_Crop_Con = []

$.each(us_corn_acresplanted_county, function (key, data) {
	
	var ansi = data.ANSI;
	var county_sqmiles = /*parseFloat(*/data.sqmiles/*.replace(",", ""))*/; //removes commas from data
	
	var crop_concentration1930 = data.y1930 / county_sqmiles
	var crop_concentration1940 = data.y1940 / county_sqmiles
	var crop_concentration1950 = data.y1950 / county_sqmiles
	var crop_concentration1960 = data.y1960 / county_sqmiles
	var crop_concentration1970 = data.y1970 / county_sqmiles
	var crop_concentration1980 = data.y1980 / county_sqmiles
	var crop_concentration1990 = data.y1990 / county_sqmiles
	var crop_concentration2000 = data.y2000 / county_sqmiles
	var crop_concentration2010 = data.y2010 / county_sqmiles
	
	var datarow = {
		"ANSI": ansi,
		"Data":[
			{ "year": 1930, "value": crop_concentration1930 },
			{ "year": 1940, "value": crop_concentration1940 },
			{ "year": 1950, "value": crop_concentration1950 },
			{ "year": 1960, "value": crop_concentration1960 },
			{ "year": 1970, "value": crop_concentration1970 },
			{ "year": 1980, "value": crop_concentration1980 },
			{ "year": 1990, "value": crop_concentration1990 },
			{ "year": 2000, "value": crop_concentration2000 },
			{ "year": 2010, "value": crop_concentration2010 }
		]
	};
	Corn_Crop_Con.push(datarow);
	
});


// Make new Array to put Wheat Crop Concentrations
var Wheat_Crop_Con = []

$.each(us_wheat_acresplanted_county, function (key, data) {
	
	var ansi = data.ANSI;
	var state_sqmiles = /*parseFloat(*/data.sqmiles/*.replace(",", ""))*/; //removes commas from data
	
	//var crop_concentration1910 = data.y1910 / state_sqmiles
	//var crop_concentration1920 = data.y1920 / state_sqmiles
	var crop_concentration1930 = data.y1930 / state_sqmiles
	var crop_concentration1940 = data.y1940 / state_sqmiles
	var crop_concentration1950 = data.y1950 / state_sqmiles
	var crop_concentration1960 = data.y1960 / state_sqmiles
	var crop_concentration1970 = data.y1970 / state_sqmiles
	var crop_concentration1980 = data.y1980 / state_sqmiles
	var crop_concentration1990 = data.y1990 / state_sqmiles
	var crop_concentration2000 = data.y2000 / state_sqmiles
	//var crop_concentration2010 = data.y2010 / state_sqmiles
	
	var datarow = {
		"ANSI": ansi,
		"Data": [
			//{ "year": 1910, "value": crop_concentration1910 },
			//{ "year": 1920, "value": crop_concentration1920 },
			{ "year": 1930, "value": crop_concentration1930 },
			{ "year": 1940, "value": crop_concentration1940 },
			{ "year": 1950, "value": crop_concentration1950 },
			{ "year": 1960, "value": crop_concentration1960 },
			{ "year": 1970, "value": crop_concentration1970 },
			{ "year": 1980, "value": crop_concentration1980 },
			{ "year": 1990, "value": crop_concentration1990 },
			{ "year": 2000, "value": crop_concentration2000 }
			//{ "year": 2010, "value": crop_concentration2010 }
		]
	}
	Wheat_Crop_Con.push(datarow);
	
});


// Make new Array to put Soy Crop Concentrations
var Soy_Crop_Con = []

$.each(us_soy_acresplanted_county, function (key, data) {
	
	var ansi = data.ANSI;
	var state_sqmiles = /*parseFloat(*/data.sqmiles/*.replace(",", ""))*/; //removes commas from data
	
	//var crop_concentration1930 = data.y1930 / state_sqmiles
	var crop_concentration1940 = data.y1940 / state_sqmiles
	var crop_concentration1950 = data.y1950 / state_sqmiles
	var crop_concentration1960 = data.y1960 / state_sqmiles
	var crop_concentration1970 = data.y1970 / state_sqmiles
	var crop_concentration1980 = data.y1980 / state_sqmiles
	var crop_concentration1990 = data.y1990 / state_sqmiles
	var crop_concentration2000 = data.y2000 / state_sqmiles
	var crop_concentration2010 = data.y2010 / state_sqmiles
	
	var datarow = {
		"ANSI": ansi,
		"Data":[
			//{ "year": 1930, "value": crop_concentration1930 },
			{ "year": 1940, "value": crop_concentration1940 },
			{ "year": 1950, "value": crop_concentration1950 },
			{ "year": 1960, "value": crop_concentration1960 },
			{ "year": 1970, "value": crop_concentration1970 },
			{ "year": 1980, "value": crop_concentration1980 },
			{ "year": 1990, "value": crop_concentration1990 },
			{ "year": 2000, "value": crop_concentration2000 },
			{ "year": 2010, "value": crop_concentration2010 }
		]
	}
	Soy_Crop_Con.push(datarow);
	
});


