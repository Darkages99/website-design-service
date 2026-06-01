<?php
/**
 * On-page SEO: <title>, meta description, canonical, robots, Open Graph, Twitter.
 * Technical/on-page only — off-page (links/PR) is explicitly out of scope (see site copy).
 *
 * @package Brand_Alchemy
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Front-page-focused meta description (≤160 chars). */
function ba_meta_description() {
	if ( is_front_page() || is_home() ) {
		return 'AI-powered web design for Chennai SMBs. Fast, conversion-first websites built in days and tracked for leads — we transmute clicks into customers.';
	}
	if ( is_singular() ) {
		$excerpt = wp_strip_all_tags( get_the_excerpt() );
		if ( $excerpt ) {
			return wp_trim_words( $excerpt, 30, '…' );
		}
	}
	return get_bloginfo( 'description', 'display' );
}

/** Canonical / OG URL for the current view. */
function ba_canonical_url() {
	if ( is_singular() && ! is_front_page() ) {
		return get_permalink();
	}
	return home_url( '/' );
}

/** Curated front-page <title>. */
add_filter(
	'document_title_parts',
	function ( $parts ) {
		if ( is_front_page() || is_home() ) {
			$parts['title'] = 'Brand-Alchemy — AI-Powered Web Design for Chennai SMBs';
			unset( $parts['tagline'] );
		}
		return $parts;
	}
);

add_filter( 'document_title_separator', function () { return '·'; } );

/** Control the single core robots tag (avoids emitting a duplicate). */
add_filter(
	'wp_robots',
	function ( $robots ) {
		$robots['index']             = true;
		$robots['follow']            = true;
		$robots['max-image-preview'] = 'large';
		return $robots;
	}
);

/** Head meta tags. */
add_action(
	'wp_head',
	function () {
		$desc     = ba_meta_description();
		$url      = ba_canonical_url();
		$title    = wp_get_document_title();
		$site     = get_bloginfo( 'name' );
		$is_front = is_front_page() || is_home();

		$og_image_path = BA_DIR . '/assets/static/og-image.png';
		$og_image_uri  = BA_URI . '/assets/static/og-image.png';
		$has_og_image  = file_exists( $og_image_path );

		echo "\n<!-- Brand-Alchemy SEO -->\n";
		printf( '<meta name="description" content="%s">' . "\n", esc_attr( $desc ) );
		printf( '<link rel="canonical" href="%s">' . "\n", esc_url( $url ) );
		// robots is handled via the wp_robots filter above (single tag).

		// Open Graph.
		printf( '<meta property="og:type" content="%s">' . "\n", $is_front ? 'website' : 'article' );
		printf( '<meta property="og:site_name" content="%s">' . "\n", esc_attr( $site ) );
		printf( '<meta property="og:title" content="%s">' . "\n", esc_attr( $title ) );
		printf( '<meta property="og:description" content="%s">' . "\n", esc_attr( $desc ) );
		printf( '<meta property="og:url" content="%s">' . "\n", esc_url( $url ) );
		echo '<meta property="og:locale" content="en_IN">' . "\n";
		if ( $has_og_image ) {
			printf( '<meta property="og:image" content="%s">' . "\n", esc_url( $og_image_uri ) );
			echo '<meta property="og:image:width" content="1200">' . "\n";
			echo '<meta property="og:image:height" content="630">' . "\n";
		} else {
			echo '<!-- og:image pending: add assets/static/og-image.png (1200x630) — plan.md §12 -->' . "\n";
		}

		// Twitter.
		echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
		printf( '<meta name="twitter:title" content="%s">' . "\n", esc_attr( $title ) );
		printf( '<meta name="twitter:description" content="%s">' . "\n", esc_attr( $desc ) );
		if ( $has_og_image ) {
			printf( '<meta name="twitter:image" content="%s">' . "\n", esc_url( $og_image_uri ) );
		}
		echo "<!-- /Brand-Alchemy SEO -->\n";
	},
	1
);
