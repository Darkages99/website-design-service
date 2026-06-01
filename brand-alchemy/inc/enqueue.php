<?php
/**
 * Vite manifest reader + asset enqueue.
 *
 * Reads brand-alchemy/assets/dist/.vite/manifest.json (or /manifest.json) and enqueues the
 * hashed JS (as a module) + its CSS for a given entry.
 *
 * @package Brand_Alchemy
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Resolve a Vite entry to its built asset URLs.
 *
 * @param string $entry Source entry key (e.g. 'src/main.js').
 * @return array|null { js: string|null, css: string[] } or null if manifest/entry missing.
 */
function ba_vite_asset( $entry = 'src/main.js' ) {
	$dist_dir = BA_DIR . '/assets/dist';
	$dist_uri = BA_URI . '/assets/dist';

	$manifest_path = file_exists( $dist_dir . '/.vite/manifest.json' )
		? $dist_dir . '/.vite/manifest.json'
		: $dist_dir . '/manifest.json';

	if ( ! file_exists( $manifest_path ) ) {
		return null;
	}

	$manifest = json_decode( file_get_contents( $manifest_path ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions
	if ( empty( $manifest[ $entry ] ) ) {
		return null;
	}

	$item      = $manifest[ $entry ];
	$js        = isset( $item['file'] ) ? $dist_uri . '/' . $item['file'] : null;
	$css       = array();
	$css_paths = array();
	if ( ! empty( $item['css'] ) ) {
		foreach ( $item['css'] as $css_file ) {
			$css[]       = $dist_uri . '/' . $css_file;
			$css_paths[] = $dist_dir . '/' . $css_file;
		}
	}

	return array(
		'js'        => $js,
		'css'       => $css,
		'css_paths' => $css_paths,
	);
}

add_action(
	'wp_enqueue_scripts',
	function () {
		$asset = ba_vite_asset( 'src/main.js' );

		if ( ! $asset ) {
			// Build hasn't run yet — surface a console hint instead of failing silently.
			add_action(
				'wp_footer',
				function () {
					echo "\n<script>console.warn('[Brand-Alchemy] Vite manifest not found — run: npm run build && ./sync.ps1');</script>\n";
				}
			);
			return;
		}

		// Inline the (small) critical CSS so it never render-blocks before the
		// LCP headline. Falls back to an external <link> if the file is missing.
		wp_register_style( 'ba-main', false ); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters
		wp_enqueue_style( 'ba-main' );
		foreach ( $asset['css'] as $i => $href ) {
			$path = isset( $asset['css_paths'][ $i ] ) ? $asset['css_paths'][ $i ] : '';
			if ( $path && file_exists( $path ) ) {
				wp_add_inline_style( 'ba-main', file_get_contents( $path ) ); // phpcs:ignore WordPress.WP.AlternativeFunctions
			} else {
				wp_enqueue_style( 'ba-main-ext-' . $i, $href, array(), null ); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters
			}
		}

		if ( $asset['js'] ) {
			wp_enqueue_script( 'ba-main', $asset['js'], array(), null, true ); // phpcs:ignore WordPress.WP.EnqueuedResourceParameters
		}
	}
);

// Load the main bundle as an ES module.
add_filter(
	'script_loader_tag',
	function ( $tag, $handle, $src ) {
		if ( 'ba-main' === $handle ) {
			return '<script type="module" src="' . esc_url( $src ) . '" id="ba-main-js"></script>' . "\n";
		}
		return $tag;
	},
	10,
	3
);
