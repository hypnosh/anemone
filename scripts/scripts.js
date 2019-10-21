/* ANOMENE.COM 
	Author: @hypnosh
*/

$( function() {
	// read localStorage to figure out which level we are at
	// send out message in a bottle to get the level's deets
	// render the level

	// what happens when you answer?
	// if it is correct, you go to the next level
	// if it is one of the clue wrongs, you are given another clue
	var buttonTexts = [
		"Okay! Okay!!",
		"Got it!",
		"Hmmmm...",
		"Fine!",
		"Okie dokie",
		"Al'ight",
		"Alright",
		"I knew that!",
		"You don't say!",
		"Cool"
	];
	$('[data-toggle="tooltip"]').tooltip();
	if (localStorage.anemone_level == undefined) {
		localStorage.anemone_level = 17;
	}
	/* debug section */
	var hashh = window.location.hash;
	if (hashh.split("=")[0] == "#debug") {
		var level = hashh.split("=")[1];
		var debug = 1;
	} else {
		var level = localStorage.anemone_level;
		var debug = 0;
	}
		console.log(level);
	
	// fetch level details based on levelno

	var o = {
		"title": "In the shade",
		"question": "What are we looking at?",
		"answer": "Ray-Ban",
		"routes": {
			"Ray Ban": "Where is the -?", 
			"RayBan": "Where is the -?",
			"Rabbit": "Hoppity hoppity hop. Your answer is a flop!",
		},
		"img": "http://recaptured.in/puzz/wp-content/uploads/2019/08/Screen-Shot-2019-08-01-at-9.45.33-PM.png",
		"clue-1": {"type": "text", "value": "yet another hello world"},
		"clue-2": {"type": "url", "value": "http://recaptured.in/puzz/wp-content/uploads/2019/08/Screen-Shot-2019-08-01-at-9.45.33-PM.png"},
		"clue-3": {"type": "image", "value": "http://recaptured.in/puzz/wp-content/uploads/2019/08/Screen-Shot-2019-08-01-at-9.45.33-PM.png", "width": 300, "height": 300 },
		"clue-4": {"type": "text", "value": "hello world"},
		"source-clue": "Hell here it is!"
	}; // o dummy
	
	jQuery.ajax({
		url: "http://recaptured.in/puzz/wp-json/wp/v2/r3d4?level=" + level,
		success: function(result) {
			
			o = result;
			var current = o.current;
			$("#levelno").text(current);
			if (current > 9999) {
				$("#levelno").addClass('levelnolarge');
			}
			$(".arena").css('backgroundImage', 'url(' + o.img + ')');
			document.title = "Anomene - " + o.title;
			$("#question").html(o.question);
			$("#answeranswer").focus();

			// when the player submits an answer
			$("#answer").submit(function(e) {
				e.preventDefault();
				var myanswer = $("#answeranswer").val().toLowerCase();
				if (myanswer == o.answer) {
					// success! move ahead!
					// send ga event with level number & answer
					if (debug == 0) {
						localStorage.anemone_level = o.next;
					}
					// reload page
					window.reload();
				} else {
					var routes = o.routes;
					var response = routes[myanswer];
					if (response == undefined) {
						response = "Wrong. Try again";
					}
					oneByOne($("#answeranswer"), response, 0);
					// send ga event with level number & myanswer
				}
			}); // .answerzone submit
			
			var hint5 = o["source-clue"];
			$("#dlkjasd09812333").text("<!--" + hint5 + "-->");
			
			for (var i = 4; i >= 1; i--) {
				var lft = window.innerWidth / 2 + (i - 2.5) * 80 - 35;
				if (o["clue-" + i] != undefined) {
					$(".clue-" + i).removeClass("hidden");
				}
			}

			var cluecounter = 0;

			$("#clueModal").on('show.bs.modal', function(event) {
				var btn = $(event.relatedTarget);
				var whichClue = btn.data("name");
				var objj = o[whichClue];
				var objjcluenumber = btn.data("clue");
				var objjtype = objj.type;
				var objjvalue = objj.value;

				var modal = $(this);
				modal.find(".modal-title").text("Clue #" + objjcluenumber);
				modal.find(".modal-footer").find("button").text(buttonTexts[Math.floor(Math.random() * Math.floor(buttonTexts.length))]);
				if (objjtype == "text") {
					modal.find(".modal-body").text(objjvalue);
				} else if (objjtype == "image") {
					modal.find(".modal-body").html("<div class='clue-embedded' style='background-image: url(" + objjvalue +"); width: " + objj.width + "px; height:" + objj.height + "px;'>");
				} else if (objjtype == "url") {
					modal.find(".modal-body").html("<a target='_blank' href='" + objjvalue + "'>How about you try looking here?</a>");
				}
			
				btn.find('i').tooltip('dispose');
				btn.css('opacity', .6).css('color', "#848C45").attr('disabled', "true").html("<i class='glyphicon glyphicon-remove' data-toggle='tooltip' data-placement='top'></i>");
				btn.find('i').attr('title', "You have already used up this clue!").tooltip();
				cluecounter++;
			}); // #clueModal show

			$("#clueModal").on('hidden.bs.modal', function (e) {
				if ((cluecounter == 4) && (Math.random() > 0.3) && localStorage.anemone_sourcehint != 1) {
					$("#finalModal").find(".modal-body").text("Psssst! Have you pressed F12 yet?");
					$("#finalModal").modal('show');
					if (debug == 0) {
						localStorage.anemone_sourcehint = 1;
					}
				}
			}); // #clueModal hidden
		}
	});

	
}); // $

var oneByOneVar;
function oneByOne(theObject, theText, oneByOneCounter) {
	theObject.attr('disabled', "true");
	
	if (oneByOneCounter == 0) {	
		// first iteration
		theObject.val('');
		var delayVar = 800;
	} else {
		delayVar = Math.random() * 100 + 30;
	}
	var targetText = theObject.val();
	if (targetText.length == theText.length) {
		// routine complete
		theObject.removeAttr('disabled').focus().select();

		clearTimeout(oneByOneVar);
	} else {

		oneByOneVar = setTimeout(function() { oneByOne(theObject, theText, oneByOneCounter); }, delayVar);
		var runningText = theText.substr(0, oneByOneCounter);
		oneByOneCounter++;
		theObject.val(runningText);
	}
	
} // oneByOne