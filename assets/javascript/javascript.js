$(document).ready(function($) {
	var config = {
		apiKey: "AIzaSyAPI38Au_SyYIs6g7X-YRTYgHNF5GiqPlM",
		authDomain: "train-scheduler-d1c1e.firebaseapp.com",
		databaseURL: "https://train-scheduler-d1c1e.firebaseio.com",
		projectId: "train-scheduler-d1c1e",
		storageBucket: "train-scheduler-d1c1e.appspot.com",
		messagingSenderId: "1025277744179"
	};

	firebase.initializeApp(config);

	var database = firebase.database();
	var name = "";
	var destination = "";
	var firstTime = "";
	var frequency = 0;
	var lastTime = moment().format("LT");

	// Update Table
	setInterval(function() {
		$("#currentTime").text(moment().format("LTS"));
		var currentTime = moment().format("LT");
		if (currentTime !== lastTime) {
			// update table
			// console.log("update the table");
			lastTime = moment().format("LT");
		}
		else {
			// console.log("It's the same time");
		}
	}, 1000);

	// Add Train to Database
	$("#submit").click(function(event) {
		event.preventDefault();

		name = $("#input-train-name").val().trim();
		destination = $("#input-destination").val().trim();
		firstTime = $("#input-first-time").val().trim();
		frequency = $("#input-frequency").val().trim();

		// Code for handling the push
		database.ref().push({
		  name: name,
		  destination: destination,
		  firstTime: firstTime,
		  frequency: frequency,
		});

		var inputs = [$("#input-train-name"), $("#input-destination"), $("#input-first-time"), $("#input-frequency")];
		for (i = 0; i < inputs.length; i++) {
			inputs[i].val("");
		}
	});

	// Add Train to Table
	database.ref().on("value", function(snapshot) {
		var sv = snapshot.val();
		if (sv !== null) {
			keys = Object.keys(sv);

			for (var i = 0; i < keys.length; i++) {
				var lastKey = keys[i];
				var lastObj = sv[lastKey];
			  	var firstTime = lastObj.firstTime;
			  	var frequency = lastObj.frequency;

			  	var firstTimeConverted = moment(firstTime, "hh:mm").subtract(1, "years");
			  	var currentTime = moment();
			  	var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
			  	var timeApart = diffTime % frequency;
			  	var minutesAway = frequency - timeApart;
			  	var nextArrival = moment(moment().add(minutesAway, "minutes")).format("hh:mm");

			  	$("#trains-table tbody").append("<tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>");
			  	var rowTds = $("#trains-table")
			  		.children()
			  		.eq(1)
			  		.children("tr")
			  		.eq(i)
			  		.children("td");

			  	var headings = [lastObj.name, lastObj.destination, lastObj.frequency, nextArrival, minutesAway];
			  	for (var j = 0; j < headings.length; j++) {
			  		rowTds.eq(j).text(headings[j]);
			  	}
			}
		}
	}, function(errorObject) {
	  console.log("Errors handled: " + errorObject.code);
	});
});