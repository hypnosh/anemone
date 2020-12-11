/* REKRYPT.COM
	Author: @hypnosh
	https://www.recaptured.in/
*/

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const buttonTexts = [ "Okay! Okay!!", "Got it!", "Hmmmm...", "Fine!", "Okie dokie", "Al'ight", "Alright", "I knew that!", "You don't say!", "Cool" ];
/* isPseudo() - 0 no pseudo, -1 pseudo off, +1 pseudo on */

const ajaxUrl = "https://recaptured.in/puzz/wp-json/wp/v2/";
$( function() {
	$('[data-toggle="tooltip"]').tooltip();
	if (localStorage.anemone_userid !== undefined) {
		$(".g-signin2").addClass("hidden");
		$(".g-signout").removeClass("hidden");
	} else {
		// force login
		$("#login-required").show();
		$("body").addClass("noUser");
		$("#loaded").hide();
	}
	/* debug section */
	// #debug=levelno
	var hashh = window.location.hash;
	var hashhed = hashh.split("=");
	if (hashhed[0] == "#debug") {
		if (hashhed[1] == "f") {
			$("#loading").addClass("hidden");
			finishBeta();
		} else {
			var level = hashhed[1];
			var debug = 1;
		}
	} else {
		// debug is off
		var level = localStorage.anemone_level;
		var debug = 0;
	}

	// fetch level details based on levelno

	// var o = {
	// 	"title": "In the shade",
	// 	"question": "What are we looking at?",
	// 	"answer": "Ray-Ban",
	// 	"routes": {
	// 		"Ray Ban": "Where is the -?",
	// 		"RayBan": "Where is the -?",
	// 		"Rabbit": "Hoppity hoppity hop. Your answer is a flop!",
	// 	},
	// 	"img": "http://recaptured.in/puzz/wp-content/uploads/2019/08/Screen-Shot-2019-08-01-at-9.45.33-PM.png",
	// 	"clue-1": {"type": "text", "value": "yet another hello world"},
	// 	"clue-2": {"type": "text", "value": "whattay!"},
	// 	"clue-3": {"type": "image", "value": "http://recaptured.in/puzz/wp-content/uploads/2019/08/Screen-Shot-2019-08-01-at-9.45.33-PM.png", "width": 300, "height": 300 },
	// 	"clue-4": {"type": "text", "value": "hello world"},
	// 	"source-clue": "Hell here it is!"
	// }; // o dummy

	jQuery.ajax({
		url: ajaxUrl + "r3d4",
		data: {
			level: level
		},
		method: "POST",
		success: function(result) {
			// consoleLog({dbg: "level loaded " + level});
			o = result;
			var current = o.current;
			// **** send ga event - level loaded - send current

			$("#levelno").text(current);
			if (current > 9999) {
				$("#levelno").addClass('levelnolarge');
			}
			if ((o.pseudo == undefined) || (o.pseudo == "")) {
				// normal level, no pseudo
				var imgurl = getImageFromArrays(o.img);
				var docTitle = o.title;
				var docSlug = o.slug;
				var backgroundColor = "#000";
				var docQuestion = o.question;
			} else {
				// psuedo level
				$("body").addClass("pseudoLevel").addClass("hasPseudo");
				var imgurl = getImageFromArrays(o.altimg);
				var docTitle = o.title.split("|")[0];
				var docQuestion = o.question.split("|")[0];
				if (o.pseudo == "nox") {
					var backgroundColor = "#fff";
				}
			}
			$(".arena").css('backgroundColor', backgroundColor);
			$(".arena").css('backgroundImage', imgurl);

			document.title = docTitle + " @ Rekrypt";
			history.pushState({}, document.title, "#" + docSlug);
			gaEvent('Level', 'load', 'number', current);
			
			var user = 0;
			// window.history.pushState({'page': current, 'user': user}, "", o.title);
			$("#question").html(docQuestion);

			$("#loading").addClass("hidden"); // remove loader
			$("#loaded").removeClass("hidden"); // show level

			$("#answeranswer").val('').focus();
			$("#message").text('');

			consoleLog(" ", "live");
			consoleLog("--- --- --- --- --- --- --- --- --- --- --- ---", "live");
			consoleLog("--- Welcome to Rekrypt dear enigmatologist! ---", "live");
			consoleLog("--- Your task here is simple: use any means ---", "live");
			consoleLog("--- necessary to get to the next level.     ---", "live");
			consoleLog("--- The next level is when the number in    ---", "live");
			consoleLog("--- the red box changes.                    ---", "live");
			consoleLog("---                                         ---", "live");
			consoleLog("--- All the best!                           ---", "live");
			consoleLog("--- @hypnosh                                ---", "live");
			consoleLog("--- --- --- --- --- --- --- --- --- --- --- ---", "live");
			consoleLog(" ", "live");

			// when the player submits an answer
			$("#answer").submit(function(e) {
				e.preventDefault();
				consoleLog({dbg: "answer submitted"});
				var myanswer = $("#answeranswer").val().toLowerCase();

				switch(isPseudo()) {
					case 0:
						// no pseudo, normal
					case -1:
						// pseudo & pseodu off
						// answer to compare
						var theAnswer = o.answer;
						// routes to take
						var routes = o.routes;
						// action to take
						var theAction = function() {
							if (o.next !== false) {
								localStorage.anemone_level = o.next;
								// send a bottle to the server with new level data
								var payload = { id: localStorage.anemone_userid, level: o.next };
								jQuery.ajax({
									url: ajaxUrl + "player_levelupdate",
									data: payload,
								}).done(function(result) {
									consoleLog({ levelupdate: result });
									var response = "Good job!";
									var callback = function() {
											$("#loading").removeClass("hidden"); // show loader
											location.reload();
										};
									var oboObject = {
										theObject: $("#message"),
										theText: response,
										oneByOneCounter: 0,
										delayVarBase: 5,
										callback: callback
									};
									oneByOne(oboObject);
									// reload page
								}).fail(function(result) {
									consoleLog({ data: payload });
									consoleLog({ levelupdatefailed: result });
								});
							} else {
								$("#loaded").fadeOut('fast', function() {
									$("#loaded").addClass("hidden");
									finishBeta();
								});
							}
						};
					break;
					case 1:
						// pseudo & pseudo on
						// pseudo answer to compare
						var theAnswer = o.pseudo;
						// pseudo routes to take
						var routes = o.pseudo_routes;
						// pseudo action to take - , question &
						var theAction = function() {
							$("body").removeClass("hasPseudo"); // change pseudo tag
							var imgurl = getImageFromArrays(o.img);
							consoleLog({afterPseudo: imgurl});
							$(".arena").css('backgroundImage', imgurl); // background image
							var docTitle = o.title.split("|")[1];
							document.title = "Rekrypt - " + docTitle; // title
							$("#message").text('');
							var docQuestion = o.question.split("|")[1];
							var oboObject = {
								theObject: $("#question"),
								theText: docQuestion,
								oneByOneCounter: 0,
								delayVarBase: 5,
								callback: function() {}
							};
							oneByOne(oboObject); // question
							$("#answeranswer").val('');
						};
					break;
					default:
				} // isPseudo?

				if (myanswer == theAnswer) {
					// success! move ahead!
					// **** send ga event with level number & answer - ??
					// consoleLog({1: theAnswer, 2: myanswer});
					theAction();
					// correct answer
				} else {

					var response = routes[myanswer];
					if (response == undefined) {
						response = "Wrong. Try again";
					}
					// **** send ga event with level number & myanswer
					gaEvent('Answer', 'input', myanswer);
					const cb = function() {
						$("#answeranswer").focus().select();
					}
					var oboObject = {
						theObject: $("#message"),
						theText: response,
						oneByOneCounter: 0,
						delayVarBase: 30,
						callback: cb
					};
					oneByOne(oboObject);
				} // wrong answer, so route hints
			}); // .answerzone submit

			var hint5 = o["source-clue"];
			switch(isPseudo()) {
				case 0:
					// no pseudo, normal
					hint5 = hint5;
				break;
				case 1:
					// pseudo & pseudo on
					hint5 = hint5.split("|")[0];
				break;
				case -1:
					// pseudo & pseodu off
					hint5 = hint5.split("|")[1];
				break;
				default:
			} // isPseudo?
			// consoleLog({ source: hint5 });
			if (isMobile) {
				// mobile device
				$("#dlkjasd09-clue-812333").html(hint5);
				// set a listener to show this item on some action (long press :D)
				 // how many milliseconds is a long press? - 5 sec
			    var longpress = 5000;
			    // holds the start time
			    var start;

			    $("#arena").on('mousedown', function( e ) {
			        start = new Date().getTime();
			    });

			    $("#arena").on('mouseleave', function( e ) {
			        start = 0;
			    });

			    $("#arena").on('mouseup', function( e ) {
			        if ( new Date().getTime() >= ( start + longpress )  ) {
			        	// long press, show source clue
			    		$("#dlkjasd09-clue-812333").show();
			           	var x = setTimeout(function() {
			           		$("#dlkjasd09-clue-812333").hide();
			           	}, 5000);
			        } else {
			           // short press, do nothing
			        }
			    } );
			} else {
				// desktop
				$("#dlkjasd09-clue-812333").html("<!--  " + hint5 + "  -->");
				consoleLog("You won't get anything here. Maybe in the source", "live");
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
				var objjcluenumber = btn.data("clue");
				var objj = o[whichClue];

				var objjtype = objj.type;
				switch(isPseudo()) {
					case 0:
						// no pseudo, normal
						var objjvalue = objj.value;
					break;
					case 1:
						// pseudo & pseudo on
						if (objjtype == "text") {
							var objjvalue = objj.value.split("|")[0];
						} else {
							consoleLog(whichClue);
							var objjvalue = o[whichClue + "a"].value;
							consoleLog({nontext: objjvalue});
						}
					break;
					case -1:
						// pseudo & pseodu off
						if (objjtype == "text") {
							objjvalue = objj.value.split("|")[1];
						} else {
							var objjvalue = objj.value;
						}
					break;
					default:
				} // isPseudo?

				// var objjvalue = objj.value;

				var modal = $(this);
				modal.find(".modal-title").text("Clue #" + objjcluenumber);
				modal.find(".modal-footer").find("button").text(buttonTexts[Math.floor(Math.random() * Math.floor(buttonTexts.length))]);
				switch(objjtype) {
					case "text":
						modal.find(".modal-body").text(objjvalue);
					break;
					case "image":
						modal.find(".modal-body").html("<div class='clue-embedded' style='background-image: url(" + objjvalue +"), url(/play/images/pulse.svg); width: " + objj.width + "px; height:" + objj.height + "px;'>");
					break;
					case "url":
						modal.find(".modal-body").html("<a target='_blank' href='" + objjvalue + "'>How about you try looking here?</a>");
					break;
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
		consoleLog({dbg: "signing out"});
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

function consoleLog(output, live) {
	if ((window.location.hostname.indexOf(".com") === -1) || (live === "live")) {
		// not live / meant for live
		console.log(output);
	}
} // consoleLog

var oneByOneVar;
function oneByOne(args) {
	// fill text slowly
	// var theObject =  args.theObject, theText =  args.theText, oneByOneCounter = args.oneByOneCounter, delayVarBase = args.delayVarBase, callback = args.callback;
	var theObject = args.theObject,
		theText = args.theText,
		oneByOneCounter = args.oneByOneCounter,
		delayVarBase = args.delayVarBase,
		callback = args.callback,
		increment = args.increment;
	consoleLog({dbg: "triggering OBO: " + theText});
	var isInput = theObject.is('input');

	theObject.attr('disabled', "true");
	if (oneByOneCounter == 0) {
		// first iteration
		if (isInput) {
			theObject.val('');
		} else {
			theObject.html('');
		}
		var delayVar = 30;
	} else {
		delayVar = Math.random() * 50 + delayVarBase;
	}
	var targetText = (isInput ? theObject.val() : theObject.html());
	if (targetText.length == theText.length) {
		// routine complete
		if (isInput) theObject.removeAttr('disabled').focus().select();

		clearTimeout(oneByOneVar);
		if (typeof callback == "function") {
			callback();
		}
	} else {
		if (increment > 1) {
			oneByOneCounter = oneByOneCounter + increment;
		} else {
			oneByOneCounter++;
		}
		var oboObject = {
			theObject: theObject,
			theText: theText,
			oneByOneCounter: oneByOneCounter,
			delayVarBase: 30,
			callback: callback,
			increment: increment
		};
		oneByOneVar = setTimeout(function() { oneByOne(oboObject); }, delayVar);
		var runningText = theText.substr(0, oneByOneCounter);

		if (isInput) {
			theObject.val(runningText);
		} else {
			theObject.html(runningText);
		}
	}

} // oneByOne


function onSignIn(googleUser) {
	var profile = googleUser.getBasicProfile();
	var token = profile.getId();
	// consoleLog('ID: ' + id); // Do not send to your backend! Use an ID token instead.
	// consoleLog('Name: ' + profile.getName() + " (Not storing it. Don't worry)");
	// consoleLog('Image URL: ' + profile.getImageUrl()  + " (Not storing it. Don't worry)");
	// consoleLog('Email: ' + profile.getEmail()  + " (Not storing it. Don't worry)"); // This is null if the 'email' scope is not present.
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
	$("#login-required").hide();
	if ($("body").hasClass("noUser")) {
		//  only if signing in the first time
		$("#signInOutMsg").text("Signing in").show();
	}
	consoleLog({token: "Fetched"});
	jQuery.ajax({
		url: ajaxUrl + "player_token",
		data: serverObject,
		method: "POST",
	}).done(function(result) {
			// consoleLog("result follows");
			// consoleLog(result);
			// consoleLog({dbg: "signed in"});
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
			if ($("body").hasClass("noUser")) {
				//  only if signing in the first time
				// consoleLog({dbg: "reloading because we've signed in"});
				location.reload();
			}
			// consoleLog("token Server returned");
	}).fail(function(result) {
		consoleLog("server failed - player_token");
	}); // player-token
} // onSignIn - google

function signOut() {
	var auth2 = gapi.auth2.getAuthInstance();
	$("#signInOutMsg").text("Signing out").show();
	auth2.signOut().then(function () {
		consoleLog('User signed out.');
		$(".g-signin2").removeClass("hidden");
		$(".g-signout").addClass("hidden");
		localStorage.removeItem('anemone_userid');
		// **** send ga event
		gaEvent('SignIn', 'done', 'signedout');
		consoleLog({dbg: "reloading because we've signed out"});
		location.hash = "";
		location.reload();
	});
} // signOut - google


function gameReset() {
	// some kind of validation?
	var x = prompt("Hark! Who goes there?");
	consoleLog(1);
	jQuery.ajax({
		url: ajaxUrl + "validate",
		data: { key: x },
		method: "POST",
		success: function(result) {
			consoleLog(result);
			if (result == "Ok") {
				localStorage.removeItem("anemone_userid");
				localStorage.removeItem("anemone_level");
				return ("Reset!");
			}  else {
				return ("Not allowed!");
			}
			consoleLog(2);
		}
	});
	consoleLog(3);
	return false;
} // gameReset

function gaEvent(categoryOfEvent, actionOfEvent, labelOfEvent, valueOfEvent) {
	if (categoryOfEvent == "Level") {
		ga('send', {
			hitType: 'pageview',
			title: valueOfEvent + " - " + document.title,
			location: window.location
		});
	}
	ga('send', {
		hitType: 'event',
		eventCategory: categoryOfEvent,
		eventAction: labelOfEvent,
		eventLabel: labelOfEvent,
		eventValue: valueOfEvent
	});
} // gaEvent

function finishBeta() {
	$("#finished").removeClass("hidden");
	var finishedText = '<h1>Wow! You&rsquo;re good!</h1><p>You&rsquo;ve reached the end of this game&rsquo;s beta. Do let me know on <a href="mailto:amit+rekrypt@recaptured.in">ami...@re...d.in</a> how you liked the game, what didn&rsquo;t go well, what should be added, what should be improved upon, and if you would want to tell your friends about Rekrypt.</p><p>You can <a href="https://www.rekrypt.com/">join the newsletter</a> to stay updated about what is happening with Rekrypt and when you can expect a full release.</p><p>Thanks a lot for playing!</p><p>Amit Sharma<br/><a href="https://www.recaptured.in/">Blog</a> - <a href="https://twitter.com/hypnosh">@hypnosh</a></p>';
	var oboObject = {
		theObject: $("#middle-column"),
		theText: finishedText,
		oneByOneCounter: 0,
		delayVarBase: 0,
		increment: 5
	};
	oneByOne(oboObject);
} // finishBeta
function getImageFromArrays(imgurl) {
	if (typeof imgurl == "object") {
		for (var i = imgurl.length - 1; i >= 0; i--) {
			if (!!imgurl[i]) {
				// consoleLog({img: imgurl[i]});
				imgurlx = imgurl[i].split(":");
				imgurl[i] = "url(https:" + imgurlx[1] + ")"; // make the protocol https
			}
		}
		imgurl = imgurl.join(", ");
	}
	return imgurl;
} // getImageFromArrays

function isPseudo() {
	if ($("body").hasClass("pseudoLevel")) {
		if ($("body").hasClass("hasPseudo")) {
			return 1; // pseudo on
		} else {
			return -1; // pseudo level but off
		}
	} else {
		return 0; // not a pseudo level
	}
} // isPseudo
