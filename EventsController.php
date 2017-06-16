<?php

namespace SquiresCall;
 
use Respect\Rest\Routable;
use SquiresCall\SquireData;
use Webmozart\Assert\Assert;

/*
 * Class to manage event data, including strings about events
 */
class EventsController implements Routable {
	private $eventData;
	private $langData;
	private $chapter;
	private $language = "en_us";

	public function __construct($sitePrefix = '', $chapter) {
		$this->chapter = $chapter;
		$relSitePrefix = substr($sitePrefix, 1);
		$this->eventData = new SquireData($relSitePrefixa, "events", $chapter);
		// no other language support yet
		$this->langData = new SquireData($relSitePrefixa, "lang." . $this->language, $chapter);
	}

	/** 
	 * load event data from chapter specific file.
	 * @return - string containing json data
	 */
	public function getEvents() {
		try {
			$data = $this->eventData->get();
			return json_encode($data);
		} catch(Exception $e) {
			throw $e;
		}
	}

	/**
	 * save event data
	 */
	public function saveEvents($data) {
		$this->eventData->save($data);
	}

    /** 
	 * load language data from chapter specific file.
	 * @param $encode - boolean whether to json encode returned data
	 * @return - string containing data
	 */
	public function getStrings($encode=true) {
		try {
			$data = $this->langData->get();
			if ($encode) {
				$data = json_encode($data);
			}
			return $data;
		} catch(Exception $e) {
			throw $e;
		}
	}

	/**
	 * save language strings
	 */
	public function saveStrings($data) {
		$this->langData->save($data);
	}


    public function delete($chapter) {
    }

    public function post($chapter) {
    }

    public function put($chapter) {
    }
}