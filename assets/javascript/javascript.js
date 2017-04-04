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
	var n = 0;
	var sortedAsc = false;
	var sortedDesc = false;

	// Add Train to Database
	$("#submit").click(function(event) {
		name = $("#input-train-name").val().trim();
		destination = $("#input-destination").val().trim();
		firstTime = $("#input-first-time").val().trim();
		frequency = $("#input-frequency").val().trim();

		// Push data to database
		database.ref().push({
		  name: name,
		  destination: destination,
		  firstTime: firstTime,
		  frequency: frequency,
		});

		// Clear input fields
		var inputs = [$("#input-train-name"), $("#input-destination"), $("#input-first-time"), $("#input-frequency")];
		for (i = 0; i < inputs.length; i++) {
			inputs[i].val("");
		}
	});

	// Add Train to table
	database.ref().on("child_added", function(snapshot) {
		var child = snapshot.val();

		// Get key for the object
		database.ref().on("value", function(snapshot) {
			var newSv = snapshot.val();
			keys = Object.keys(newSv);
			keys.reverse();
		}, function(errorObject) {
			console.log("Errors handled: " + errorObject.code);
		});
		var key = keys[n];

		// Calculate Next Arrival and Minutes Away
	  	var firstTime = child.firstTime;
	  	var frequency = child.frequency;
	  	var firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, "years");
	  	var currentTime = moment();
	  	var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
	  	var timeApart = diffTime % frequency;
	  	var minutesAway = frequency - timeApart;
	  	var nextArrival = moment(moment().add(minutesAway, "minutes")).format("h:mm A");
	  	var timestamp = moment().format("X") * n / Math.pow(10, 9);

	  	// Create row
	  	$("#trains-table tbody").append("<tr data-index=\"" + n + "\" data-timestamp=\"" + timestamp + "\"><td></td><td></td><td></td><td></td><td></td></tr>");

	  	// Add values to corresponding column
	  	var rowTds = $("#trains-table")
	  		.children()
	  		.eq(1)
	  		.children("tr")
	  		.eq(n)
	  		.children("td");
	  	var headings = [child.name, child.destination, child.frequency, nextArrival, minutesAway];
	  	for (var i = 0; i < headings.length; i++) {
	  		rowTds.eq(i).text(headings[i]);
	  		rowTds.eq(i).attr("data-index", n);
	  	}

	  	// Append Remove Button
	  	var removeButton = $("<button>");
	  	removeButton.attr("type", "button");
	  	removeButton.attr("class", "btn btn-danger remove-button");
	  	removeButton.attr("data-index", n);
	  	removeButton.attr("data-key", key);
	  	removeButton.html("<i class=\"fa fa-trash\" aria-hidden=\"true\"></i>");
	  	$("#trains-table tbody tr:last td:last").append(removeButton);

	  	// Append Edit Button
	  	var editButton = $("<button>");
	  	editButton.attr("type", "button");
	  	editButton.attr("class", "btn btn-primary edit-button");
	  	editButton.attr("data-index", n);
	  	editButton.attr("data-key", key);
	  	editButton.html("<i class=\"fa fa-pencil\" aria-hidden=\"true\"></i>");
	  	$("#trains-table tbody tr:last td:last").append(editButton);

	  	n++;
	}, function(errorObject) {
		console.log("Errors handled: " + errorObject.code);
	});

	// Update Table
	setInterval(function() {
		$("#currentTime").text(moment().format("LTS"));
		var thisTime = moment().format("LT");
		if (thisTime !== lastTime) {
			// Get objects from database
			database.ref().on("value", function(snapshot) {
				sv = snapshot.val();
				if (sv !== null) {
					keys = Object.keys(sv);
					keys.reverse();
				}
			}, function(errorObject) {
				console.log("Errors handled: " + errorObject.code);
			});

			// Update each row of the table
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];
				var object = sv[key];

				// Calculate Next Arrival and Minutes Away
			  	var firstTime = object.firstTime;
			  	var frequency = object.frequency;
			  	var firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, "years");
			  	var currentTime = moment();
			  	var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
			  	var timeApart = diffTime % frequency;
			  	var minutesAway = frequency - timeApart;
			  	var nextArrival = moment(moment().add(minutesAway, "minutes")).format("h:mm A");

			  	// Update Next Arrival and Minutes Away in table
			  	unsort();
			  	var rowTds = $("#trains-table")
			  		.children()
			  		.eq(1)
			  		.children("tr")
			  		.eq(i)
			  		.children("td");

			  	rowTds.eq(3).text(nextArrival);
			  	rowTds.eq(4).text(minutesAway);

			  	// Append Remove Button
			  	var removeButton = $("<button>");
			  	removeButton.attr("type", "button");
			  	removeButton.attr("class", "btn btn-danger remove-button");
			  	removeButton.attr("data-index", i);
			  	removeButton.attr("data-key", key);
			  	removeButton.html("<i class=\"fa fa-trash\" aria-hidden=\"true\"></i>");
			  	rowTds.eq(4).append(removeButton);

			  	// Append Edit Button
			  	var editButton = $("<button>");
			  	editButton.attr("type", "button");
			  	editButton.attr("class", "btn btn-primary edit-button");
			  	editButton.attr("data-index", i);
			  	editButton.attr("data-key", key);
			  	editButton.html("<i class=\"fa fa-pencil\" aria-hidden=\"true\"></i>");
			  	rowTds.eq(4).append(editButton);
			}

			if (sortedAsc) {
				sortTableAsc(sortedByAsc);
			}
			else if (sortedDesc) {
				sortTableDesc(sortedByDesc);
			}

			lastTime = moment().format("LT");
		}
	}, 1000);

	// Remove Train
	$(document).on("click", ".remove-button", function() {
		// Remove it from the screen
		// $("tr [data-index=" + $(this).data("index") + "]").remove();

		// Remove it from the database
		database.ref().child($(this).data("key")).remove();
		window.location.reload();
	});

	// Show Update Window
	$(document).on("click", ".edit-button", function() {
		$(".update-bg").css({
			"display": "block",
		});
		$("#update-window").css({
			"display": "block",
		});

		var self = $(this);
		// Get object from database
		database.ref().on("value", function(snapshot) {
			var sv = snapshot.val();
			object = sv[self.attr("data-key")];
		}, function(errorObject) {
			console.log("Errors handled: " + errorObject.code);
		});

		// Show current values on form
		$("#update-train-name").val(object.name);
		$("#update-destination").val(object.destination);
		$("#update-first-time").val(object.firstTime);
		$("#update-frequency").val(object.frequency);

		$("#submit-update").attr("data-index", self.data("index"));
		$("#submit-update").attr("data-key", self.data("key"));
	});

	// Update Info
	$("#submit-update").click(function(event) {
		event.preventDefault();
		$(".update-bg").css({
			"display": "none",
		});
		$("#update-window").css({
			"display": "none",
		});

		// Update object in database
		database.ref("/" + $(this).attr("data-key")).update({
		  name: $("#update-train-name").val().trim(),
		  destination: $("#update-destination").val().trim(),
		  firstTime: $("#update-first-time").val().trim(),
		  frequency: $("#update-frequency").val().trim(),
		});

		// Calculate Next Arrival and Minutes Away
	  	var firstTime = $("#update-first-time").val().trim();
	  	var frequency = $("#update-frequency").val().trim();
	  	var firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, "years");
	  	var currentTime = moment();
	  	var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
	  	var timeApart = diffTime % frequency;
	  	var minutesAway = frequency - timeApart;
	  	var nextArrival = moment(moment().add(minutesAway, "minutes")).format("h:mm A");

	  	// Update table
	  	var rowTds = $("#trains-table")
	  		.children()
	  		.eq(1)
	  		.children("tr")
	  		.eq($(this).attr("data-index"))
	  		.children("td");

	  	rowTds.eq(0).text($("#update-train-name").val().trim());
	  	rowTds.eq(1).text($("#update-destination").val().trim());
	  	rowTds.eq(2).text($("#update-frequency").val().trim());
	  	rowTds.eq(3).text(nextArrival);
	  	rowTds.eq(4).text(minutesAway);

	  	// Append Remove Button
	  	var removeButton = $("<button>");
	  	removeButton.attr("type", "button");
	  	removeButton.attr("class", "btn btn-danger remove-button");
	  	removeButton.attr("data-index", $(this).attr("data-index"));
	  	removeButton.attr("data-key", $(this).attr("data-key"));
	  	removeButton.html("<i class=\"fa fa-trash\" aria-hidden=\"true\"></i>");
	  	rowTds.eq(4).append(removeButton);

	  	// Append Edit Button
	  	var editButton = $("<button>");
	  	editButton.attr("type", "button");
	  	editButton.attr("class", "btn btn-primary edit-button");
	  	editButton.attr("data-index", $(this).attr("data-index"));
	  	editButton.attr("data-key", $(this).attr("data-key"));
	  	editButton.html("<i class=\"fa fa-pencil\" aria-hidden=\"true\"></i>");
	  	rowTds.eq(4).append(editButton);

	  	$("#submit-update").removeAttr("data-index");
		$("#submit-update").removeAttr("data-key");
	});

	// Close Update Window
	$("#cancel-update").click(function(event) {
		event.preventDefault();
		$(".update-bg").css({
			"display": "none",
		});
		$("#update-window").css({
			"display": "none",
		});

	  	$("#submit-update").removeAttr("data-index");
		$("#submit-update").removeAttr("data-key");
	});

	// Sort Table Ascending
	function sortTableAsc(sortCol) {
		var table, rows, switching, x, y, shouldSwitch;
		table = document.getElementById("trains-table");
		switching = true;
		while (switching) {
			switching = false;
			rows = table.getElementsByTagName("TR");
			for (var i = 1; i < (rows.length - 1); i++) {
				shouldSwitch = false;
				x = rows[i].getElementsByTagName("TD")[sortCol];
				y = rows[i+1].getElementsByTagName("TD")[sortCol];
				if (sortCol === "2" || sortCol === "4") {
					if (parseInt(x.innerHTML) > parseInt(y.innerHTML)) {
						shouldSwitch= true;
						break;
					}
				}
				else if (sortCol === "3") {
					if (moment(x.innerHTML, "h:mm A").format("X") > moment(y.innerHTML, "h:mm A").format("X")) {
						shouldSwitch= true;
						break;
					}
				}
				else {
					if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
						shouldSwitch= true;
						break;
					}
				}
			}
			if (shouldSwitch) {
				rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
				switching = true;
			}
		}
	}

	$(".fa-caret-down").click(function() {
		var table, rows, switching, x, y, shouldSwitch;
		table = document.getElementById("trains-table");
		switching = true;
		while (switching) {
			switching = false;
			rows = table.getElementsByTagName("TR");
			for (var i = 1; i < (rows.length - 1); i++) {
				shouldSwitch = false;
				x = rows[i].getElementsByTagName("TD")[$(this).attr("data-index")];
				y = rows[i+1].getElementsByTagName("TD")[$(this).attr("data-index")];
				if ($(this).attr("data-index") === "2" || $(this).attr("data-index") === "4") {
					if (parseInt(x.innerHTML) > parseInt(y.innerHTML)) {
						shouldSwitch= true;
						break;
					}
				}
				else if ($(this).attr("data-index") === "3") {
					if (moment(x.innerHTML, "h:mm A").format("X") >moment(y.innerHTML, "h:mm A").format("X")) {
						shouldSwitch= true;
						break;
					}
				}
				else {
					if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
						shouldSwitch= true;
						break;
					}
				}
			}
			if (shouldSwitch) {
				rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
				switching = true;
			}
		}
		sortedAsc = true;
		sortedDesc = false;
		sortedByAsc = $(this).attr("data-index");
		console.log("sortedBy", sortedByAsc);
	});

	// Sort Table Descending
	function sortTableDesc(sortCol) {
		var table, rows, switching, x, y, shouldSwitch;
		table = document.getElementById("trains-table");
		switching = true;
		while (switching) {
			switching = false;
			rows = table.getElementsByTagName("TR");
			for (var i = 1; i < (rows.length - 1); i++) {
				shouldSwitch = false;
				x = rows[i].getElementsByTagName("TD")[sortCol];
				y = rows[i+1].getElementsByTagName("TD")[sortCol];
				if (sortCol === "2" || sortCol === "4") {
					if (parseInt(x.innerHTML) < parseInt(y.innerHTML)) {
						shouldSwitch= true;
						break;
					}
				}
				else if (sortCol === "3") {
					if (moment(x.innerHTML, "h:mm A").format("X") < moment(y.innerHTML, "h:mm A").format("X")) {
						shouldSwitch= true;
						break;
					}
				}
				else {
					if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
						shouldSwitch= true;
						break;
					}
				}
			}
			if (shouldSwitch) {
				rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
				switching = true;
			}
		}
	}

	$(".fa-caret-up").click(function() {
		var table, rows, switching, x, y, shouldSwitch;
		table = document.getElementById("trains-table");
		switching = true;
		while (switching) {
			switching = false;
			rows = table.getElementsByTagName("TR");
			for (var i = 1; i < (rows.length - 1); i++) {
				shouldSwitch = false;
				x = rows[i].getElementsByTagName("TD")[$(this).attr("data-index")];
				y = rows[i+1].getElementsByTagName("TD")[$(this).attr("data-index")];
				if ($(this).attr("data-index") === "2" || $(this).attr("data-index") === "4") {
					if (parseInt(x.innerHTML) < parseInt(y.innerHTML)) {
						shouldSwitch= true;
						break;
					}
				}
				else if ($(this).attr("data-index") === "3") {
					if (moment(x.innerHTML, "h:mm A").format("X") < moment(y.innerHTML, "h:mm A").format("X")) {
						shouldSwitch= true;
						break;
					}
				}
				else {
					if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
						shouldSwitch= true;
						break;
					}
				}
			}
			if (shouldSwitch) {
				rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
				switching = true;
			}
		}
		sortedAsc = false;
		sortedDesc = true;
		sortedByAsc = $(this).attr("data-index");
	});

	// Unsort table
	function unsort() {
		var table, rows, switching, x, y, shouldSwitch;
		table = document.getElementById("trains-table");
		switching = true;
		while (switching) {
			switching = false;
			rows = table.getElementsByTagName("TR");
			for (var i = 1; i < (rows.length - 1); i++) {
				shouldSwitch = false;
				x = rows[i];
				y = rows[i+1];
				if (parseFloat(x.getAttribute("data-timestamp")) > parseFloat(y.getAttribute("data-timestamp"))) {
					shouldSwitch= true;
					break;
				}
			}
			if (shouldSwitch) {
				rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
				switching = true;
			}
		}
	}
});