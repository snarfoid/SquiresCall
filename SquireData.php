<?php

namespace SquiresCall;

use Webmozart\Json\JsonEncoder;
use Webmozart\Json\JsonDecoder;

/*
 *  Class to manage json data files
 */
class SquireData {
	private $baseDir = "";
	private $fileBaseDir = "data";
	private $fileBaseName = "events";
	private $fileExtension = ".json";
	private $chapter = 1;

	/**
	 *
	 * @param $baseDir - relative base directory of application
	 * @param $baseFile - base file name for the data
	 * @param $chapter - which chapter of data to use
	 */
	public function __construct($baseDir='', $baseFile='', $chapter=1) {
		$this->setBaseDir($baseDir);
		$this->setBaseFile($baseFile);
		$this->setChapter($chapter);
	}

	/**
	 * get data from file
	 * @return - native data object (unencoded json)
	 */
	public function get() {
		try {
			$data = $this->load();
			return $data;
		} catch(Exception $e) {
			throw $e;
		}
	}

	/**
	 * add or update a particular event
	 * @param $eventName - key name of the event
	 * @param $newData - array of new data to be saved
	 */
	public function add($eventName, $newData) {
		try {
			$data = $this->load();
			if (!array_key_exists($eventName, $data)) {
				$data[$eventName] = array();
			}
			$data[$eventName] = $newData;
			$this->save($data);
		} catch(Exception $e) {
			throw $e;
		}
	}

	/**
	 * save data to file
	 * @param $data - data to be saved
	 */
	public function save($data) {
		$file = $this->getFileName();
		$encoder = new JsonEncoder();
		$encoder->encodeFile($data, $file);
	}

	// return json data as native variable
	public function load() {
		$file = $this->getFileName();

		try {
			$decoder = new JsonDecoder();
			$data = $decoder->decodeFile($file);
		} catch(Exception $e) {
			throw $e;
		}
		return $data;
	
	}

	/**
	 * generate file name for named data source
	 * @return - string containing file name
	 */
	public function getFileName() {
		$fn = $this->baseDir . DIRECTORY_SEPARATOR;
		$fn .= $this->fileBaseDir . DIRECTORY_SEPARATOR;
		$fn .= $this->fileBaseName . "_" . $this->chapter . $this->fileExtension;
		$fn = substr($fn, 1);
		return $fn;
	}

	/**
	 * get the current chapter
	 * @return integer containing chapter number
	 */
	public function getChapter() {
		return $this->chapter;
	}

	/**
	 * set the current chapter
	 * @param $chapter - number to set the chapter to
	 */
	public function setChapter($chapter) {
		$this->chapter = $chapter;
	}

	/**
	 * set the current base dirctory
	 * @param $baseDir - string with relative directory path
	 */
	public function setBaseDir($baseDir) {
		$this->baseDir = $baseDir;
	}

	/**
	 * set the current base file
	 * @param $baseFile - string with base file name (no extension)
	 */
	public function setBaseFile($baseFile) {
		$this->fileBaseName = $baseFile;
	}
}