<?php
/**
 * Analytics / pixel placeholders.
 *
 * Each tag is INERT until you set its ID below — empty IDs output nothing, so
 * the live site stays clean until the founder provides the real values (plan.md §12).
 * To activate, fill the constant (or define it earlier, e.g. in wp-config / a
 * small mu-plugin) and the snippet enqueues itself.
 *
 * @package Brand_Alchemy
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'BA_GA4_ID' ) ) {
	define( 'BA_GA4_ID', '' );        // e.g. 'G-XXXXXXXXXX'  (Google Analytics 4)
}
if ( ! defined( 'BA_GTM_ID' ) ) {
	define( 'BA_GTM_ID', '' );        // e.g. 'GTM-XXXXXXX'   (Google Tag Manager)
}
if ( ! defined( 'BA_META_PIXEL_ID' ) ) {
	define( 'BA_META_PIXEL_ID', '' ); // e.g. '123456789012345' (Meta/Facebook Pixel)
}

// --- Google Analytics 4 (gtag.js) ----------------------------------------
add_action(
	'wp_head',
	function () {
		if ( ! BA_GA4_ID ) {
			return;
		}
		$id = BA_GA4_ID;
		?>
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo esc_attr( $id ); ?>"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','<?php echo esc_js( $id ); ?>');</script>
		<?php
	},
	20
);

// --- Google Tag Manager (head) -------------------------------------------
add_action(
	'wp_head',
	function () {
		if ( ! BA_GTM_ID ) {
			return;
		}
		?>
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','<?php echo esc_js( BA_GTM_ID ); ?>');</script>
		<?php
	},
	1
);

// --- Google Tag Manager (body noscript) ----------------------------------
add_action(
	'wp_body_open',
	function () {
		if ( ! BA_GTM_ID ) {
			return;
		}
		?>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=<?php echo esc_attr( BA_GTM_ID ); ?>" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
		<?php
	}
);

// --- Meta (Facebook) Pixel -----------------------------------------------
add_action(
	'wp_head',
	function () {
		if ( ! BA_META_PIXEL_ID ) {
			return;
		}
		?>
<!-- Meta Pixel -->
<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','<?php echo esc_js( BA_META_PIXEL_ID ); ?>');fbq('track','PageView');</script>
		<?php
	},
	20
);
