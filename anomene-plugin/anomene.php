<?php
/**
 * Plugin Name: Anomene
 */

add_action("rest_api_init", function() {
	register_rest_route("wp/v2", '/r3d4', array(
			'methods'	=> 'GET',
			'callback'	=> 'anomene_get_level',
		)
	);
}); // rest_api_init

function anomene_get_level() {
	$level = $_REQUEST['level'];
	$key = $_REQUEST['key'];

	$lvl = get_post($level);
	$paraphernalia = get_field_objects($level);
	$r1 = explode(", ", $paraphernalia['route_1']['value']);
	$routes = array(
			$r1[0]	=> $r1[1],
		);
	$clue1 = array(
				"type"	=> $paraphernalia['clue_1']['type'],
				"value"	=> $paraphernalia['clue_1']['value'],
			);
	$clue2 = array(
				"type"	=> $paraphernalia['clue_2']['type'],
				"value"	=> $paraphernalia['clue_2']['value'],
			);
	$clue3 = array(
				"type"	=> $paraphernalia['clue_3']['type'],
				"value"	=> $paraphernalia['clue_3']['value'],
			);
	$clue4 = array(
				"type"	=> $paraphernalia['clue_4']['type'],
				"value"	=> $paraphernalia['clue_4']['value'],
			);
	$source_clue = "source";
	$out = array(
		"title"		=> $lvl->post_title,
		"question"	=> wp_strip_all_tags($lvl->post_content),
		"answer"	=> $paraphernalia['answer']['value'],
		"img"		=> '',
		"routes"	=> $routes,
		"clue-1"	=> $clue1,
		"clue-2"	=> $clue2,
		"clue-3"	=> $clue3,
		"clue-4"	=> $clue4,
		"source-clue"	=> $source_clue,
		"next"		=> $paraphernalia['next']['value'],
 	);

	return $out;
} // main

// var o = {
// 		"title": "In the shade",
// 		"question": "What are we looking at?",
// 		"answer": "Ray-Ban",
// 		"routes": {
// 			"Ray Ban": "Where is the -?", 
// 			"RayBan": "Where is the -?",
// 			"Rabbit": "Hoppity hoppity hop. Your answer is a flop!",
// 		},
// 		"img": "http://recaptured.in/puzz/wp-content/uploads/2019/08/Screen-Shot-2019-08-01-at-9.45.33-PM.png",
// 		"clue-1": {"type": "text", "value": "yet another hello world"},
// 		"clue-2": {"type": "link", "value": "http://recaptured.in/puzz/wp-content/uploads/2019/08/Screen-Shot-2019-08-01-at-9.45.33-PM.png"},
// 		"clue-3": {"type": "image", "value": "http://recaptured.in/puzz/wp-content/uploads/2019/08/Screen-Shot-2019-08-01-at-9.45.33-PM.png", "width": 300, "height": 300 },
// 		"clue-4": {"type": "text", "value": "hello world"},
// 		"source-clue": "Hell here it is!"
// 	}; // o

// {
// 	"answer":{"ID":15,"key":"field_5d41e07559bc0","label":"Answer","name":"answer","prefix":"acf","type":"text","value":"42","menu_order":0,"instructions":"","required":1,"id":"","class":"","conditional_logic":0,"parent":14,"wrapper":{"width":"","class":"","id":""},"default_value":"","placeholder":"","prepend":"","append":"","maxlength":"","_name":"answer","_valid":1},
// 	"variance_1":{"ID":16,"key":"field_5d41e09059bc1","label":"Variance 1","name":"variance_1","prefix":"acf","type":"text","value":"2","menu_order":1,"instructions":"","required":0,"id":"","class":"","conditional_logic":0,"parent":14,"wrapper":{"width":"","class":"","id":""},"default_value":"","placeholder":"","prepend":"","append":"","maxlength":"","_name":"variance_1","_valid":1},
// 	"clue_1":{"ID":9,"key":"field_5d348a2bf62ee","label":"Clue 1","name":"clue_1","prefix":"acf","type":"text","value":"","menu_order":0,"instructions":"","required":1,"id":"","class":"","conditional_logic":0,"parent":5,"wrapper":{"width":"","class":"","id":""},"default_value":"","placeholder":"","prepend":"","append":"","maxlength":"","_name":"clue_1","_valid":1},
// 	"clue_2":{"ID":11,"key":"field_5d41e0209c36f","label":"Clue 2","name":"clue_2","prefix":"acf","type":"text","value":"","menu_order":1,"instructions":"","required":0,"id":"","class":"","conditional_logic":0,"parent":5,"wrapper":{"width":"","class":"","id":""},"default_value":"","placeholder":"","prepend":"","append":"","maxlength":"","_name":"clue_2","_valid":1},
// 	"clue_3":{"ID":12,"key":"field_5d41e0379c370","label":"Clue 3","name":"clue_3","prefix":"acf","type":"image","value":false,"menu_order":2,"instructions":"","required":0,"id":"","class":"","conditional_logic":0,"parent":5,"wrapper":{"width":"","class":"","id":""},"return_format":"id","preview_size":"medium","library":"uploadedTo","min_width":"","min_height":"","min_size":"","max_width":"","max_height":"","max_size":"","mime_types":"","_name":"clue_3","_valid":1},
// 	"clue_4":{"ID":13,"key":"field_5d41e0559c371","label":"Clue 4","name":"clue_4","prefix":"acf","type":"url","value":"","menu_order":3,"instructions":"","required":0,"id":"","class":"","conditional_logic":0,"parent":5,"wrapper":{"width":"","class":"","id":""},"default_value":"","placeholder":"","_name":"clue_4","_valid":1}
// }