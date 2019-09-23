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
	var level = localStorage.anemone_level;
	$("#levelno").text(level);
	if (level > 9999) {
		$("#levelno").addClass('levelnolarge');
	}
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
		"clue-2": {"type": "link", "value": "http://recaptured.in/puzz/wp-content/uploads/2019/08/Screen-Shot-2019-08-01-at-9.45.33-PM.png"},
		"clue-3": {"type": "image", "value": "http://recaptured.in/puzz/wp-content/uploads/2019/08/Screen-Shot-2019-08-01-at-9.45.33-PM.png", "width": 300, "height": 300 },
		"clue-4": {"type": "text", "value": "hello world"},
		"source-clue": "Hell here it is!"
	}; // o dummy
	
	$(".arena").css('backgroundImage', 'url(' + o.img + ')');
	document.title = "Anomene - " + o.title;
	$("#question").html(o.question);
	$("#answeranswer").focus();

	$("#answer").submit(function(e) {
		e.preventDefault();
		var myanswer = $("#answeranswer").val();
		if (myanswer == o.answer) {
			// success! move ahead!
			localStorage.anemone_level = parseInt(localStorage.anemone_level) + 1;
		} else {
			var routes = o.routes;

		}
	}); // .answerzone submit
	
	var hint5 = o["source-clue"];
	$("#dlkjasd09812333").text("<!--" + hint5 + "-->");
	
	for (var i = 4; i >= 1; i--) {
		var lft = window.innerWidth / 2 + (i - 2.5) * 80 - 35;
		if (o["clue-" + i] == undefined) {
			$(".clue-" + i).hide();
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
		} else if (objjtype == "link") {
			modal.find(".modal-body").html("<a target='_blank' href='" + objjvalue + "'>How about you try looking here?</a>");
		}
	
		btn.css('opacity', .6).css('color', "#848C45").attr('disabled', "true").html("<i class='glyphicon glyphicon-remove'></i>");
		cluecounter++;
	}); // #clueModal show

	$("#clueModal").on('hidden.bs.modal', function (e) {
		if ((cluecounter == 4) && (Math.random() > 0.3) && localStorage.anemone_source != 1) {
			$("#finalModal").find(".modal-body").text("Psssst! Have you pressed F12 yet?");
			$("#finalModal").modal('show');
			localStorage.anemone_source = 1;
		}
	}); // #clueModal hidden
	
}); // $