/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import {
	Button,
	ExternalLink,
	__experimentalTruncate as Truncate,
} from '@wordpress/components';
import { useCopyToClipboard } from '@wordpress/compose';
import { filterURLForDisplay, safeDecodeURI } from '@wordpress/url';
import { Icon, globe, info, linkOff, edit, copySmall } from '@wordpress/icons';
import { __unstableStripHTML as stripHTML } from '@wordpress/dom';
import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';

/**
 * Internal dependencies
 */
import { ViewerSlot } from './viewer-slot';

import useRichUrlData from './use-rich-url-data';

export default function LinkPreview( {
	value,
	onEditClick,
	hasRichPreviews = false,
	hasUnlinkControl = false,
	onRemove,
} ) {
	// Avoid fetching if rich previews are not desired.
	const showRichPreviews = hasRichPreviews ? value?.url : null;

	const { richData, isFetching } = useRichUrlData( showRichPreviews );

	// Rich data may be an empty object so test for that.
	const hasRichData = richData && Object.keys( richData ).length;

	const displayURL =
		( value && filterURLForDisplay( safeDecodeURI( value.url ), 24 ) ) ||
		'';

	// url can be undefined if the href attribute is unset
	const isEmptyURL = ! value?.url?.length;

	const displayTitle =
		! isEmptyURL &&
		stripHTML( richData?.title || value?.title || displayURL );

	let icon;

	if ( richData?.icon ) {
		icon = <img src={ richData?.icon } alt="" />;
	} else if ( isEmptyURL ) {
		icon = <Icon icon={ info } size={ 32 } />;
	} else {
		icon = <Icon icon={ globe } />;
	}

	const { createNotice } = useDispatch( noticesStore );
	const ref = useCopyToClipboard( value.url, () => {
		createNotice( 'info', __( 'Link copied to clipboard.' ), {
			isDismissible: true,
			type: 'snackbar',
		} );
	} );

	return (
		<div
			aria-label={ __( 'Currently selected' ) }
			className={ classnames( 'block-editor-link-control__search-item', {
				'is-current': true,
				'is-rich': hasRichData,
				'is-fetching': !! isFetching,
				'is-preview': true,
				'is-error': isEmptyURL,
				'is-url-title': displayTitle === displayURL,
			} ) }
		>
			<div className="block-editor-link-control__search-item-top">
				<span className="block-editor-link-control__search-item-header">
					<span
						className={ classnames(
							'block-editor-link-control__search-item-icon',
							{
								'is-image': richData?.icon,
							}
						) }
					>
						{ icon }
					</span>
					<span className="block-editor-link-control__search-item-details">
						{ ! isEmptyURL ? (
							<>
								<ExternalLink
									className="block-editor-link-control__search-item-title"
									href={ value.url }
								>
									<Truncate numberOfLines={ 1 }>
										{ displayTitle }
									</Truncate>
								</ExternalLink>
								{ value?.url && displayTitle !== displayURL && (
									<span className="block-editor-link-control__search-item-info">
										<Truncate numberOfLines={ 1 }>
											{ displayURL }
										</Truncate>
									</span>
								) }
							</>
						) : (
							<span className="block-editor-link-control__search-item-error-notice">
								{ __( 'Link is empty' ) }
							</span>
						) }
					</span>
				</span>
				<Button
					icon={ edit }
					label={ __( 'Edit link' ) }
					onClick={ onEditClick }
					size="compact"
				/>
				{ hasUnlinkControl && (
					<Button
						icon={ linkOff }
						label={ __( 'Remove link' ) }
						onClick={ onRemove }
						size="compact"
					/>
				) }
				<Button
					icon={ copySmall }
					label={ sprintf(
						// Translators: %s is a placeholder for the link URL and an optional colon, (if a Link URL is present).
						__( 'Copy link%s' ), // Ends up looking like "Copy link: https://example.com".
						isEmptyURL ? '' : ': ' + value.url
					) }
					ref={ ref }
					disabled={ isEmptyURL }
					size="compact"
				/>
				<ViewerSlot fillProps={ value } />
			</div>
		</div>
	);
}
