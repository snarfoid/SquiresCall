<?php

/* Simple tool to manage data and metadata for Squire's Call iOS app
 * to assist in building the multi-varient story.
 *
 * Server written in nodejs, using express and handlebars
 * Client uses jQuery and React.
 *
 * Author: Robert FIeld
 * Date: 4/28/2017
 *
 * ROUTES
 * GET / - load the application
 * GET /lang/1 - get a language strings by chapter
 * GET /events/1 - get a list of events by chapter
 * GET /event/eventId - get details for named event
 * POST /event/eventId - add new event
 * PUT /event/eventId - update named event
 * DELETE /event/eventId - delete named event
 * POST /location/locId - add new location
 * POST /person/personId - add new person
 * POST /chapter/chapterId - add new chapter
 */
require "vendor/autoload.php";

use Respect\Rest\Router;
use bracesTemplate\bracesTemplate as bt;
use SquiresCall\EventsController;
use SquiresCall\SquireRoutes;

// get a router to route requests
#$sitePrefix = '/phpSquiresCall';
$sitePrefix = '/' . basename(__DIR__);
$r3 = new Router($sitePrefix);

// map routes to controllers
$r3->get('/', function() {
	$fields = array();
	$template = __DIR__ . '/index.tmpl';
	try {
		$content = bt::fill($template, $fields, true);
	} catch(Exception $e) {
		return generateError($e);
	}
    return $content;
});


$r3->get("/events/*", function($chapter) {
	global $sitePrefix;
	try {
	    $ec = new EventsController($sitePrefix, $chapter);
	    return $ec->getEvents();
	} catch(Exception $e) {
		return generateError($e);
	}
});

$r3->get("/strings/*", function($chapter) {
	global $sitePrefix;
	try {
	    $ec = new EventsController($sitePrefix, $chapter);
	    return $ec->getStrings();
	} catch(Exception $e) {
		return generateError($e);
	}
});

$r3->post("/location/*", function($chapter) {
	global $sitePrefix;
	try {
	    $ec = new EventsController($sitePrefix, $chapter);
	    $data = json_decode($ec->getStrings(), true);
	    $k = $_REQUEST['key'];
	    $t = $_REQUEST['text'];
	    error_log( var_export($data['locations'], true) );
	    $data['locations'][$k] = $t;
	    $ec->saveStrings($data);
	    return generateSuccess();
	} catch(Exception $e) {
		return generateError($e);
	}
});

echo $r3->run();

/**
 * generate json error message
 *
 * @param $e - exception object
 * @return string containing son error message
 */
function generateError($e) {
	$msg = $e->getMessage();
	return "{\"error\": \"$msg\"}";
}

function generateSuccess($msg='') {
	return "{ \"status\": \"success\", \"msg\": \"$msg\" }";
}

