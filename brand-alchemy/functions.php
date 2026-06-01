<?php
/**
 * Brand-Alchemy theme bootstrap.
 *
 * @package Brand_Alchemy
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'BA_VERSION', '0.1.0' );
define( 'BA_DIR', get_theme_file_path() );
define( 'BA_URI', get_theme_file_uri() );

require_once BA_DIR . '/inc/theme-setup.php';
require_once BA_DIR . '/inc/enqueue.php';
require_once BA_DIR . '/inc/dequeue-bloat.php';

// SEO / schema / tracking are added in Phase 5; load them only once they exist.
foreach ( array( 'seo.php', 'schema.php', 'tracking.php' ) as $ba_optional ) {
	$ba_path = BA_DIR . '/inc/' . $ba_optional;
	if ( file_exists( $ba_path ) ) {
		require_once $ba_path;
	}
}
