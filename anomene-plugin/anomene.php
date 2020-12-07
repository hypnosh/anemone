<?php
/**
 * Plugin Name: Anomene
 */

add_action("rest_api_init", function() {
	date_default_timezone_set("Asia/Kolkata"); 
	register_rest_route("wp/v2", '/r3d4', array(
			'methods'	=> 'POST',
			'callback'	=> 'anomene_get_level',
		)
	); // r3d4
	register_rest_route("wp/v2", '/validate', array(
			'methods'	=> 'POST',
			'callback'	=> 'anomene_validate',
		)
	); // validate
	register_rest_route("wp/v2", '/player_token', array(
			'methods'	=> 'POST',
			'callback'	=> 'anomene_player_token',
		)
	); // user
	register_rest_route("wp/v2", '/player_levelupdate', array(
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
	$timestamp = date("F j, Y, g:i a", time());
	$device = $_REQUEST['device'];
	$level = $_REQUEST['level'];
	$profilepic = $_REQUEST['profilepic'];
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
		$fname = substr($name, 0, strpos($name, " "));
		$player_id = wp_insert_post($args);
		add_post_meta($player_id, 'token', $token);
		add_post_meta($player_id, 'email', $email);
		add_post_meta($player_id, 'device', $device);
		add_post_meta($player_id, 'last_level', $level);
		add_post_meta($player_id, 'first_login_time', $timestamp);
		add_post_meta($player_id, 'profile_pic', $profilepic);

		if ($player_id > 0) {
			// success
			$return_array = array(
					'id'	=> $player_id,
					'fname'	=> $fname,
					'level'	=> intval($level),
				);
			return $return_array;
		} else {
			return "Error";
		}
	} else {
		// return last_level 
		$player_id = $player[0]->ID;
		$name = get_the_title($player_id);
		$last_level = get_post_meta($player_id, 'last_level', true);
		$fname = substr($name, 0, strpos($name, " "));
		$return_array = array(
				'id'		=> $player_id,
				'fname'		=> $fname,
				'level'		=> intval($last_level),
			);
		return $return_array;
	}
} // anomene_player_token

function anomene_player_levelupdate() {
	// user's level update
	// data coming in
	//		user ID, level no, timestamp
	$player_id = $_REQUEST['id'];
	$level = $_REQUEST['level'];
	$timestamp = date("F j, Y, g:i a", time());

	$level_history = unserialize(get_post_meta($player_id, 'level_history', true));
	
	$level_history[$level] = $timestamp;

	$level_history_json = serialize($level_history);
	update_post_meta($player_id, 'level_history', $level_history_json);
	update_post_meta($player_id, 'last_level', $level);
	return [1];
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
	$r1 = explode("; ", $paraphernalia['pseudo_route']['value']);
	$pseudo_routes = array();
	foreach ($r1 as $key => $value) {
		$r2 = explode(": ", $value);
		$pseudo_routes[strtolower($r2[0])] = $r2[1];
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
	if ($paraphernalia['clue_3a']['value'] == null) {
		$clue3a = null;	
	} else {
		$value3a = $paraphernalia['clue_3a']['value'];
		$value3a = (is_numeric($value3a)) ? (wp_get_attachment_image_src($value3a)[0]) : ($value3a);
		$clue3a = array(
					"type"	=> $paraphernalia['clue_3a']['type'],
					"value"	=> $value3a,
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
		"current"		=> $paraphernalia['current']['value'],
		"title"			=> $lvl->post_title,
		"question"		=> wp_strip_all_tags($lvl->post_content),
		"answer"		=> strtolower($paraphernalia['answer']['value']),
		"img"			=> $img,
		"routes"		=> $routes,
		"clue-1"		=> $clue1,
		"clue-2"		=> $clue2,
		"clue-3"		=> $clue3,
		"clue-3a"		=> $clue3a,
		"clue-4"		=> $clue4,
		"source-clue"	=> $source_clue,
		"next"			=> $paraphernalia['next']['value'],
		"slug"			=> $lvl->post_name,
 	);

	$alt_value = $paraphernalia['alt_image']['value'];
	if ($alt_value !== null) {
		$alt_img[0] = wp_get_attachment_image_src($alt_value, 'full')[0];
		$alt_img[1] = wp_get_attachment_image_src($alt_value, 'large')[0];
		$alt_img[2] = wp_get_attachment_image_src($alt_value, 'medium')[0];
		$out['altimg'] = $alt_img;
		$out['pseudo'] = $paraphernalia['pseudo']['value'];
		$out['pseudo_routes'] = $pseudo_routes;
	}
	
	return $out;
} // anomene_get_level

