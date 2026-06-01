<?php
/**
 * Strip default WordPress front-end bloat for a lean, fast-loading page.
 * (Heavier optimisation — conditional block CSS, etc. — happens in Phase 6.)
 *
 * @package Brand_Alchemy
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Remove emoji detection script + styles.
add_action(
	'init',
	function () {
		remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
		remove_action( 'wp_print_styles', 'print_emoji_styles' );
		remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
		remove_action( 'admin_print_styles', 'print_emoji_styles' );
		remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
		remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
		remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
		add_filter( 'emoji_svg_url', '__return_false' );
	}
);

// Remove unnecessary <head> clutter.
remove_action( 'wp_head', 'wp_generator' );
remove_action( 'wp_head', 'rsd_link' );
remove_action( 'wp_head', 'wlwmanifest_link' );
remove_action( 'wp_head', 'wp_shortlink_wp_head' );
remove_action( 'wp_head', 'feed_links_extra', 3 );

// Drop the WP global-styles SVG filter duotone block (we don't use duotone).
remove_action( 'wp_body_open', 'wp_global_styles_render_svg_filters' );
