<?php

//////////////////////////////////////////////////////////////////////////////80
// Check trait
//////////////////////////////////////////////////////////////////////////////80
// Copyright (c) 2020 Liam Siira (liam@siira.io), distributed as-is and without
// warranty under the MIT License. See [root]/license.md for more.
// This information must remain intact.
//////////////////////////////////////////////////////////////////////////////80
// Authors: Codiad Team, @Fluidbyte, Atheos Team, @hlsiira
//////////////////////////////////////////////////////////////////////////////80

trait Check {

	//////////////////////////////////////////////////////////////////////////80
	// Check if user can configure Atheos
	//////////////////////////////////////////////////////////////////////////80
	public static function checkAccess($permission = "configure") {
		$users = Common::readJSON("users");
		$username = SESSION("user");

		if (array_key_exists($username, $users)) {
			$permissions = $users[$username]["permissions"];
			return in_array($permission, $permissions);
		} else {
			return false;
		}
	}

	//////////////////////////////////////////////////////////////////////////80
	// Check Path
	//////////////////////////////////////////////////////////////////////////80
	public static function checkPath($path) {
		$users = Common::readJSON("users");
		$username = SESSION("user");
		$projects = Common::readJSON('projects');

		if (!array_key_exists($username, $users)) {
			return false;
		}

		$userACL = $users[$username]["userACL"];

		if ($userACL === "full") {
			return true;
		} else {
			foreach ($projects as $projectPath => $projectName) {
				if (!in_array($projectPath, $userACL)) {
					continue;
				}

				if (strpos($path, $projectPath) === 0 || strpos($path, WORKSPACE . "/$projectPath") === 0) {
					return true;
				}
			}
		}
		return false;
	}

	//////////////////////////////////////////////////////////////////////////80
	// Check Session
	//////////////////////////////////////////////////////////////////////////80
	public static function checkSession() {
		$loose_ip = long2ip(ip2long($_SERVER["REMOTE_ADDR"]) & ip2long("255.255.0.0"));

		//Some security checks, helps with securing the service
		if (isset($_SESSION["user"]) && isset($_SESSION["LOOSE_IP"])) {
			$destroy = false;

			$destroy = $destroy ?: $_SESSION["LOOSE_IP"] !== $loose_ip;
			$destroy = $destroy ?: $_SESSION["AGENT_STRING"] !== $_SERVER["HTTP_USER_AGENT"];
			$destroy = $destroy ?: $_SESSION["ACCEPT_ENCODING"] !== $_SERVER["HTTP_ACCEPT_ENCODING"];
			$destroy = $destroy ?: $_SESSION["ACCEPT_LANGUAGE"] !== $_SERVER["HTTP_ACCEPT_LANGUAGE"];

			if ($destroy) {
				session_unset();
				session_destroy();
				Common::send("error", "Security violation");
			}

			$_SESSION["LAST_ACTIVE"] = time(); //Reset user activity timer
		} else {
			//Store identification data so we can detect malicous logins potentially. (Like XSS)
			$_SESSION["AGENT_STRING"] = $_SERVER["HTTP_USER_AGENT"];
			$_SESSION["ACCEPT_ENCODING"] = $_SERVER["HTTP_ACCEPT_ENCODING"];
			$_SESSION["ACCEPT_LANGUAGE"] = $_SERVER["HTTP_ACCEPT_LANGUAGE"];
			$_SESSION["LOOSE_IP"] = $loose_ip;
			$_SESSION["LAST_ACTIVE"] = time();
		}

		if (!isset($_SESSION['user'])) {
			Common::send("error", "Authentication error");
		}
	}
}