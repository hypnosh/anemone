$( function() {
	// read localStorage to figure out which level we are at
	// send out message in a bottle to get the level's deets
	// render the level

	// what happens when you answer?
	// if it is correct, you go to the next level
	// if it is one of the clue wrongs, you are given another clue
	var o = {
		"img": "http://recaptured.in/puzz/wp-content/uploads/2019/08/Screen-Shot-2019-08-01-at-9.45.33-PM.png",
		"clue-4": ""
	};

	$(".arena").css('backgroundImage', 'url(' + o.img + ')');

	$(".answerzone").submit(function() {
		e.preventDefault();
	}); // .answerzone submit
	for (var i = 4; i >= 1; i--) {
		$(".clue-" + i).css('top', i*30).css('left', i*50);
	}

});