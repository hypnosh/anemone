<?php
/**
 * Plugin Name: Anomene
 */

add_action("rest_api_init", function() {
	register_rest_route("wp/v2", '/r3d4', array(
			'methods'	=> 'GET',
			'callback'	=> 'anomene_get_level',
		)
	); // r3d4
	register_rest_route("wp/v2", '/validate', array(
			'methods'	=> 'GET',
			'callback'	=> 'anomene_validate',
		)
	); // validate
	register_rest_route("wp/v2", '/player/token', array(
			'methods'	=> 'POST',
			'callback'	=> 'anomene_player_token',
		)
	); // user
	register_rest_route("wp/v2", '/player/levelupdate', array(
			'methods'	=> 'GET',
			'callback'	=> 'anomene_player_levelupdate',
		)
	); // user
	
}); // rest_api_init


function anomene_player_token() {
	// once user logs in
	// data coming in
	//		google token, email address, timestamp, device data?
	$token = $_REQUEST['token'];
	$name = $_REQUEST['name'];
	$email = $_REQUEST['email'];
	$timestamp = time();
	$device = $_REQUEST['device'];
	$level = $_REQUEST['level'];
	// in the player table. Fetch or create

	$args = array(
			'post_type'		=> 'player',
			'meta_key'		=> 'token',
			'meta_value'	=> $token,
		);
	$player = get_posts($args);
	if (empty($player)) {
		$args = array(
				'number_posts'	=> 1,
				'post_title'	=> $name,
				'post_type'		=> 'player',
				'post_status'	=> 'publish',
			);
		$player_id = wp_insert_post($args);
		add_post_meta($player_id, 'token', $token);
		add_post_meta($player_id, 'email', $email);
		add_post_meta($player_id, 'device', $device);
		add_post_meta($player_id, 'last_level', $level);
		add_post_meta($player_id, 'first_login_time', $timestamp);

		if ($postid > 0) {
			// success
			$return_array = array(
					'id'	=> $player_id,
				);
			return $return_array;
		} else {
			return "Error";
		}
	} else {
		// return last_level 
		$player_id = $player[0]->ID;
		
		$last_level = get_post_meta($player_id, 'last_level', true);
		$return_array = array(
				'level'		=> $last_level,
			);
		return $return_array;
	}
} // anomene_player_token

function anomene_player_levelupdate() {
	// user's level update
	// data coming in
	//		google token, level no, timestamp
	$token = $_REQUEST['token'];
	$level = $_REQUEST['level'];
	$timestamp = time();

	$args = array(
			'post_type'		=> 'player',
			'meta_key'		=> 'token',
			'meta_value'	=> $token,
		);
	$player = get_posts($args);
	// in the player table. Store custom fields
	if (!empty($player)) {
		$player_id = $player[0]->ID;
		add_post_meta($player_id, 'level_' . $level, $timestamp);
		update_post_meta($player_id, 'last_level', $level);
	}
	return 1;
} // anomene_player_levelupdate

function anomene_validate() {
	$key = $_REQUEST['key'];
	if ($key == "the bard") {
		return "Ok";
	} else {
		return "Stop!";
	}
} // anomene_validate

function anomene_get_level() {
	$level = $_REQUEST['level'];
	$key = $_REQUEST['key'];

	$xys = get_posts("type=level&current=" & $level );
	$lvl = get_post($level);
	$paraphernalia = get_field_objects($level);
	$r1 = explode("; ", $paraphernalia['route_1']['value']);
	$routes = array();
	foreach ($r1 as $key => $value) {
		$r2 = explode(": ", $value);
		$routes[strtolower($r2[0])] = $r2[1];
	}
	
	if ($paraphernalia['clue_1']['value'] == null) {
		$clue1 = null;	
	} else {
		$clue1 = array(
					"type"	=> $paraphernalia['clue_1']['type'],
					"value"	=> $paraphernalia['clue_1']['value'],
				);
	}
	if ($paraphernalia['clue_2']['value'] == null) {
		$clue2 = null;	
	} else {
		$clue2 = array(
					"type"	=> $paraphernalia['clue_2']['type'],
					"value"	=> $paraphernalia['clue_2']['value'],
				);
	}
	if ($paraphernalia['clue_3']['value'] == null) {
		$clue3 = null;	
	} else {
		$value3 = $paraphernalia['clue_3']['value'];
		$value3 = (is_numeric($value3)) ? (wp_get_attachment_image_src($value3)[0]) : ($value3);
		$clue3 = array(
					"type"	=> $paraphernalia['clue_3']['type'],
					"value"	=> $value3,
				);
	}
	if ($paraphernalia['clue_4']['value'] == null) {
		$clue4 = null;	
	} else {
		$clue4 = array(
					"type"	=> $paraphernalia['clue_4']['type'],
					"value"	=> $paraphernalia['clue_4']['value'],
				);
	}	
	$source_clue = $paraphernalia["source_clue"]["value"];
	$img[0] = get_the_post_thumbnail_url($level, 'full');
	$img[1] = get_the_post_thumbnail_url($level, 'large');
	$img[2] = get_the_post_thumbnail_url($level, 'medium');

	$out = array(
		"current"	=> $paraphernalia['current']['value'],
		"title"		=> $lvl->post_title,
		"question"	=> wp_strip_all_tags($lvl->post_content),
		"answer"	=> strtolower($paraphernalia['answer']['value']),
		"img"		=> $img,
		"routes"	=> $routes,
		"clue-1"	=> $clue1,
		"clue-2"	=> $clue2,
		"clue-3"	=> $clue3,
		"clue-4"	=> $clue4,
		"source-clue"	=> $source_clue,
		"next"		=> $paraphernalia['next']['value'],
 	);

	return $out;
} // anomene_get_level

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