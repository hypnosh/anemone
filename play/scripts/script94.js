/* ANOMENE.COM 
	Author: @hypnosh
*/

const ajaxUrl = "https://recaptured.in/puzz/wp-json/wp/v2/";
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
$( function() {
	// YTBD: read localStorage to figure out if user is logged in. if not, force login
	// read localStorage to figure out which level we are at
	// store user data (token, email, level reached at the server)

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
	if (localStorage.anemone_userid !== undefined) {
		$(".g-signin2").addClass("hidden");
		$(".g-signout").removeClass("hidden");
	}
	/* debug section */
	var hashh = window.location.hash;
	var hashhed = hashh.split("=");
	if (hashhed[0] == "#debug") {
		if (hashhed[1] == "f") {
			$("#loading").addClass("hidden");
			$("#finished").removeClass("hidden");
		} else {
			var level = hashhed[1];
			var debug = 1;
		}
	} else {
		var level = localStorage.anemone_level;
		var debug = 0;
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
		"clue-2": {"type": "text", "value": "whattay!"},
		"clue-3": {"type": "image", "value": "http://recaptured.in/puzz/wp-content/uploads/2019/08/Screen-Shot-2019-08-01-at-9.45.33-PM.png", "width": 300, "height": 300 },
		"clue-4": {"type": "text", "value": "hello world"},
		"source-clue": "Hell here it is!"
	}; // o dummy
	
	jQuery.ajax({
		url: ajaxUrl + "r3d4?level=" + level,
		success: function(result) {

			o = result;
			var current = o.current;
			// **** send ga event - level loaded - send current
			gaEvent('Level', 'load', 'number', current);

			$("#levelno").text(current);
			if (current > 9999) {
				$("#levelno").addClass('levelnolarge');
			}
			var imgurl = o.img;
			if (typeof imgurl == "object") {
				for (var i = imgurl.length - 1; i >= 0; i--) {
					imgurlx = imgurl[i].split(":");
					imgurl[i] = "url(https:" + imgurlx[1] + ")"; // make the protocol https
				}
				imgurl = imgurl.join(", ");
			}
			// console.log({imgurl: imgurl});
			$(".arena").css('backgroundImage', imgurl);
			document.title = "Anomene - " + o.title;
			var user = 0;
			// window.history.pushState({'page': current, 'user': user}, "", o.title);
			$("#question").html(o.question);

			$("#loading").addClass("hidden"); // remove loader
			$("#loaded").removeClass("hidden"); // show level

			$("#answeranswer").val('').focus();

			// when the player submits an answer
			$("#answer").submit(function(e) {
				e.preventDefault();
				var myanswer = $("#answeranswer").val().toLowerCase();
				if (myanswer == o.answer) {
					// success! move ahead!
					// **** send ga event with level number & answer - ??
					if (debug == 0) {
						if (o.next !== false) {
							localStorage.anemone_level = o.next;
							// send a bottle to the server with new level data
							var payload = { id: localStorage.anemone_userid, level: o.next };
							jQuery.ajax({
								url: ajaxUrl + "player/levelupdate",
								data: payload,
							}).done(function(result) {
								console.log({ levelupdate: result });
								// reload page
								location.reload();
							}).fail(function(result) {
								console.log({ data: payload });
								console.log({ levelupdatefailed: result });
							});
							$("#loading").removeClass("hidden"); // show loader
						} else {
							$("#loaded").fadeOut('fast', function() {
								$("#loaded").addClass("hidden");
								$("#finished").removeClass("hidden");
							});
						}
					}

				} else {
					var routes = o.routes;
					var response = routes[myanswer];
					if (response == undefined) {
						response = "Wrong. Try again";
					}
					// **** send ga event with level number & myanswer
					gaEvent('Answer', 'input', myanswer);
					oneByOne($("#answeranswer"), response, 0);
				}
			}); // .answerzone submit
			
			var hint5 = o["source-clue"];
			// console.log({ source: hint5 });
			if (isMobile) {
				// mobile device
				$("#dlkjasd09clue812333").html(hint5);
				// set a listener to show this item on some action (shake?? :D)
			} else {
				// desktop
				$("#dlkjasd09clue812333").html("<!--  " + hint5 + "  -->");
			} // isMobile
			
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
					modal.find(".modal-body").html("<div class='clue-embedded' style='background-image: url(" + objjvalue +"), url(/play/images/pulse.svg); width: " + objj.width + "px; height:" + objj.height + "px;'>");
				} else if (objjtype == "url") {
					modal.find(".modal-body").html("<a target='_blank' href='" + objjvalue + "'>How about you try looking here?</a>");
				}
			
				btn.find('i').tooltip('dispose');
				btn.css('opacity', .6).css('color', "#848C45").attr('disabled', "true").html("<i class='glyphicon glyphicon-remove' data-toggle='tooltip' data-placement='top'></i>");
				btn.find('i').attr('title', "You have already used up this clue!").tooltip();
				// **** send ga event - cluecounter, objjcluenumber
				gaEvent('Modal', 'access', 'ClueForLevel-' + current, objjcluenumber);
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
		} // ajax success
	}); // fetching the level

	$(".g-signoutlink").on('click', function() {
		signOut();
	}); //  g-signout click

	$("#question").on('click', function() {
		gaEvent('Question', 'click', 'clicked');
	}); // question click
	$("#levelno").on('click', function() {
		gaEvent('LevelNumber', 'click', 'clicked');
	}); // levelno click
	$("#arena").on('click', function() {
		gaEvent('LevelImage', 'click', 'clicked');
	}); // arena click
	$("#question").on('hover', function() {
		gaEvent('Question', 'hover', 'hovered');
	}); // question hover
	$("#levelno").on('hover', function() {
		gaEvent('LevelNumber', 'hover', 'hovered');
	}); // levelno hover
}); // $

var oneByOneVar;
function oneByOne(theObject, theText, oneByOneCounter) {
	// fill text slowly


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


function onSignIn(googleUser) {
	var profile = googleUser.getBasicProfile();
	var token = profile.getId();
	// console.log('ID: ' + id); // Do not send to your backend! Use an ID token instead.
	// console.log('Name: ' + profile.getName() + " (Not storing it. Don't worry)");
	// console.log('Image URL: ' + profile.getImageUrl()  + " (Not storing it. Don't worry)");
	// console.log('Email: ' + profile.getEmail()  + " (Not storing it. Don't worry)"); // This is null if the 'email' scope is not present.
	// localStorage.anemone_userid = id;
	// token, name, email, device, level => id, level
	var serverObject = {
		'token'			: token,
		'name'			: profile.getName(),
		'device'		: navigator.userAgent,
		'email'			: profile.getEmail(),
		'level' 		: localStorage.anemone_level,
		'profilepic'	: profile.getImageUrl(),
	};
	console.log({token: "Fetched"});
	jQuery.ajax({
		url: ajaxUrl + "player/token",
		data: serverObject,
		method: "POST",
	}).done(function(result) {
			// console.log("result follows");
			console.log(result);
			var userID = result.id;
			localStorage.anemone_userid = userID;
			$("#playerName").text("Hi " + result.fname + "!");
			$(".playerPic").css({ backgroundImage: "url(" + serverObject.profilepic +")", border: "none" });
			var last_level = result.level;
			last_level = (last_level == 0 ? 17 : last_level); // if undefined, then level 1
			if (last_level != localStorage.anemone_level) {
				localStorage.anemone_level = last_level;
			}
			// **** send ga event
			gaEvent('SignIn', 'done', 'user', userID);
			$(".g-signin2").addClass("hidden");
			$(".g-signout").removeClass("hidden");
			// console.log("token Server returned");
	}).fail(function(result) {
		console.log("server failed - player/token");
	}); // player-token
	

} // onSignIn - google

function signOut() {
	var auth2 = gapi.auth2.getAuthInstance();
	auth2.signOut().then(function () {
		console.log('User signed out.');
		$(".g-signin2").removeClass("hidden");
		$(".g-signout").addClass("hidden");
		localStorage.removeItem('anemone_userid');
		// **** send ga event
		gaEvent('SignIn', 'done', 'signedout');
	});
} // signOut - google


function gameReset() {
	// some kind of validation?
	var x = prompt("Hark! Who goes there?");
	console.log(1);
	jQuery.ajax({
		url: ajaxUrl + "validate",
		data: { key: x },
		method: "POST",
		success: function(result) {
			console.log(result);
			if (result == "Ok") {
				localStorage.removeItem("anemone_userid");
				localStorage.removeItem("anemone_level");
				return ("Reset!");
			}  else {
				return ("Not allowed!");
			}
			console.log(2);
		}
	});
	console.log(3);
	return false;
} // gameReset

function gaEvent(categoryOfEvent, actionOfEvent, labelOfEvent, valueOfEvent) {
	ga('send', {
		hitType: 'event',
		eventCategory: categoryOfEvent,
		eventAction: labelOfEvent,
		eventLabel: labelOfEvent,
		eventValue: valueOfEvent
	});
} // gaEvent