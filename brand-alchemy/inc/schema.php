<?php
/**
 * JSON-LD structured data (AEO/GEO + rich results). Emitted on the front page
 * as a single @graph. FAQ entries MUST mirror the visible FAQ in
 * templates/front-page.html — keep them in sync when copy changes.
 *
 * @package Brand_Alchemy
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action(
	'wp_head',
	function () {
		if ( ! ( is_front_page() || is_home() ) ) {
			return;
		}

		$home     = home_url( '/' );
		$org_id   = $home . '#organization';
		$site_id  = $home . '#website';
		$page_id  = $home . '#webpage';
		$lb_id    = $home . '#localbusiness';
		$logo_uri = BA_URI . '/assets/static/logo.png';   // PLACEHOLDER — plan.md §12.
		$og_image = BA_URI . '/assets/static/og-image.png'; // PLACEHOLDER — plan.md §12.
		$area     = array( 'Chennai', 'Coimbatore', 'Madurai', 'Bangalore', 'Tamil Nadu' );

		// Mirrors the on-page FAQ accordion.
		$faqs = array(
			array( 'Do you guarantee Google rankings?', 'No — and be wary of anyone who does. We guarantee a technically perfect, search-ready site. Rankings depend on ongoing off-page work, which you will need to arrange yourself for now — we would rather be upfront than point you to someone we do not yet trust.' ),
			array( 'How fast can my site go live?', 'The Essential Web Presence build typically goes live in 3–5 days once we have your content and a short discovery call.' ),
			array( 'What does it cost?', 'The Essential Web Presence starts at a one-time ₹4,999. We quote a fixed price on the discovery call — no surprises.' ),
			array( 'Do I need to know anything technical?', 'Not a thing. You bring the business knowledge; we handle every technical detail and explain the rest in plain English.' ),
			array( 'Can I edit the site myself later?', 'Yes. Your site is built on WordPress, so you can update text, images, and prices yourself — and we will show you how.' ),
			array( 'Do you handle ongoing SEO and backlinks?', 'We build the on-page and technical SEO foundation. Off-page work — backlinks, guest posts, digital PR — you will need to arrange yourself for now; we will not refer you to someone we do not yet trust.' ),
		);
		$faq_entities = array();
		foreach ( $faqs as $faq ) {
			$faq_entities[] = array(
				'@type'          => 'Question',
				'name'           => $faq[0],
				'acceptedAnswer' => array(
					'@type' => 'Answer',
					'text'  => $faq[1],
				),
			);
		}

		$graph = array(
			array(
				'@type'       => 'Organization',
				'@id'         => $org_id,
				'name'        => 'Brand-Alchemy',
				'url'         => $home,
				'description' => 'AI-powered web design agency for Chennai SMBs — fast, conversion-first websites tracked for leads.',
				'slogan'      => 'We Transmute Clicks into Customers.',
				'logo'        => array(
					'@type' => 'ImageObject',
					'url'   => $logo_uri,
				),
				'areaServed'  => $area,
				// 'sameAs' => array( ... ), // add social profiles when available — plan.md §12.
			),
			array(
				'@type'      => 'WebSite',
				'@id'        => $site_id,
				'url'        => $home,
				'name'       => 'Brand-Alchemy',
				'inLanguage' => 'en-IN',
				'publisher'  => array( '@id' => $org_id ),
			),
			array(
				'@type'              => array( 'LocalBusiness', 'ProfessionalService' ),
				'@id'                => $lb_id,
				'name'               => 'Brand-Alchemy',
				'url'                => $home,
				'image'              => $og_image,
				'priceRange'         => '₹',
				'parentOrganization' => array( '@id' => $org_id ),
				'areaServed'         => $area,
				'address'            => array(
					'@type'           => 'PostalAddress',
					'addressLocality' => 'Chennai',
					'addressRegion'   => 'Tamil Nadu',
					'addressCountry'  => 'IN',
					// 'streetAddress' / 'postalCode' pending — plan.md §12.
				),
				'telephone'          => '+919940140907',
			),
			array(
				'@type'      => 'WebPage',
				'@id'        => $page_id,
				'url'        => $home,
				'name'       => wp_get_document_title(),
				'isPartOf'   => array( '@id' => $site_id ),
				'about'      => array( '@id' => $org_id ),
				'inLanguage' => 'en-IN',
			),
			array(
				'@type'       => 'Service',
				'name'        => 'Essential Web Presence',
				'serviceType' => 'Web design and development',
				'provider'    => array( '@id' => $org_id ),
				'areaServed'  => $area,
				'description' => '5-page responsive website with free domain, hosting and SSL for one year, Google Business Profile and on-page SEO setup, WhatsApp chat and click-to-call, an enquiry form with lead tracking, and 5 business email IDs. Live in 3–5 days.',
				'offers'      => array(
					'@type'              => 'Offer',
					'priceCurrency'      => 'INR',
					'availability'       => 'https://schema.org/InStock',
					'price'              => 4999,
					'priceSpecification' => array(
						'@type'         => 'PriceSpecification',
						'priceCurrency' => 'INR',
						'price'         => 4999,
					),
				),
			),
			array(
				'@type'      => 'FAQPage',
				'@id'        => $home . '#faq',
				'mainEntity' => $faq_entities,
			),
			array(
				'@type'           => 'BreadcrumbList',
				'itemListElement' => array(
					array(
						'@type'    => 'ListItem',
						'position' => 1,
						'name'     => 'Home',
						'item'     => $home,
					),
				),
			),
		);

		$data = array(
			'@context' => 'https://schema.org',
			'@graph'   => $graph,
		);

		echo "\n<!-- Brand-Alchemy JSON-LD -->\n";
		echo '<script type="application/ld+json">'
			. wp_json_encode( $data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE )
			. "</script>\n";
	},
	5
);
