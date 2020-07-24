<?php

// autoload_real.php @generated by Composer
require __DIR__ . '/ClassLoader.php';

class Autoloader {
	private static $loader;

	public static function loadClassLoader($class) {
		if ('Composer\Autoload\ClassLoader' === $class) {
			require __DIR__ . '/ClassLoader.php';
		}
	}

	/**
	* @return \Composer\Autoload\ClassLoader
	*/
	public static function getLoader() {
		if (null !== self::$loader) {
			return self::$loader;
		}

		self::$loader = $loader = new \Composer\Autoload\ClassLoader();

		require_once __DIR__ . '/static.php';

		call_user_func(\Composer\Autoload\cStaticInit::getInitializer($loader));

		$loader->register(true);

		$includeFiles = Composer\Autoload\cStaticInit::$files;

		foreach ($includeFiles as $fileIdentifier => $file) {
			cRequire($fileIdentifier, $file);
		}

		return $loader;
	}
}

function cRequire($fileIdentifier, $file) {
	if (empty($GLOBALS['__composer_autoload_files'][$fileIdentifier])) {
		require $file;

		$GLOBALS['__composer_autoload_files'][$fileIdentifier] = true;
	}
}