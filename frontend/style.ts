import {css} from 'lit-element';

export default css`
	* {
		box-sizing: border-box;
	}
`

export const tenukiCSS = css`
	/*!
	* Tenuki v0.3.1 (https://github.com/aprescott/tenuki)
	* Copyright © 2016-2019 Adam Prescott.
	* Licensed under the MIT license.
	*/
	.tenuki-dom-renderer.tenuki-board {
		position: relative;
		-webkit-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
		overflow: hidden;
		cursor: default;
	}

	.tenuki-dom-renderer.tenuki-board .tenuki-inner-container {
		background: #ebc98a;
	}

	.tenuki-dom-renderer.tenuki-board .tenuki-zoom-container {
		transition: transform 0.2s ease-in-out;
		/*
		* address an issue somewhat related to the shrink-to-fit problem on iOS 9: https://forums.developer.apple.com/thread/13510
		* by setting this initial scale, any subsequent shrinking will not leave whitespace on the right of the board, which leads
		* to a horizontal scrollbar
		*/
		transform: scale(1);
	}

	.tenuki-dom-renderer.tenuki-board[data-include-coordinates=true] .cancel-zoom.visible,
	.tenuki-dom-renderer.tenuki-board[data-include-coordinates=true] .cancel-zoom.visible + .cancel-zoom-backdrop {
		/* additional gutter margin offset */
		margin-left: 25px;
		margin-bottom: 25px;
	}

	.tenuki-dom-renderer.tenuki-board .lines {
		position: absolute;
		top: 0;
		left: 0;
		margin: 18px;
	}

	.tenuki-dom-renderer.tenuki-board[data-include-coordinates=true] .lines {
		/* base margin + additional gutter margin */
		margin: 43px;
	}

	.tenuki-dom-renderer.tenuki-board .line {
		background: #997f48;
		float: left;
		position: relative;
	}

	.tenuki-dom-renderer.tenuki-board .line.horizontal {
		height: 1px;
		width: 100%;
		margin-bottom: 28px;
		clear: left;
	}

	.tenuki-dom-renderer.tenuki-board .line.vertical {
		width: 1px;
		height: 100%;
		margin-right: 28px;
	}

	.tenuki-dom-renderer.tenuki-board .line.vertical:last-child {
		margin-right: -1px;
	}

	.tenuki-dom-renderer.tenuki-board[data-include-coordinates=true] .line.vertical:before,
	.tenuki-dom-renderer.tenuki-board[data-include-coordinates=true] .line.vertical:after,
	.tenuki-dom-renderer.tenuki-board[data-include-coordinates=true] .line.horizontal:before,
	.tenuki-dom-renderer.tenuki-board[data-include-coordinates=true] .line.horizontal:after {
		width: 20px;
		/* gutter margin, less 5px */
		height: 20px;
		text-align: center;
		/* gutter margin, less 5px */
		line-height: 20px;
		font-family: sans-serif;
		color: #8b7341;
		display: block;
		font-size: 14px;
	}

	.tenuki-dom-renderer.tenuki-board[data-include-coordinates=true] .line.vertical:before,
	.tenuki-dom-renderer.tenuki-board[data-include-coordinates=true] .line.vertical:after {
		content: attr(data-top-gutter);
	}

	.tenuki-dom-renderer.tenuki-board[data-include-coordinates=true] .line.horizontal:before,
	.tenuki-dom-renderer.tenuki-board[data-include-coordinates=true] .line.horizontal:after {
		content: attr(data-left-gutter);
	}

	.tenuki-dom-renderer.tenuki-board[data-include-coordinates=true] .line.vertical:before {
		/* -1*width/2 */
		margin-left: -10px;
		/* -1*width/2, less the intersection gap size */
		margin-top: -38px;
	}

	.tenuki-dom-renderer.tenuki-board[data-include-coordinates=true] .line.vertical:after {
		position: absolute;
		bottom: 0;
		left: 0;
		/* -1*width/2 */
		margin-left: -10px;
		/* -1*width/2, less the intersection gap size */
		margin-bottom: -38px;
	}

	.tenuki-dom-renderer.tenuki-board[data-include-coordinates=true] .line.horizontal:before {
		/* -1*width/2, less the intersection gap size */
		margin-left: -38px;
		/* -1*width/2 */
		margin-top: -10px;
	}

	.tenuki-dom-renderer.tenuki-board[data-include-coordinates=true] .line.horizontal:after {
		position: absolute;
		top: 0;
		right: 0;
		/* -1*width/2, less the intersection gap size */
		margin-right: -38px;
		/* -1*width/2 */
		margin-top: -10px;
	}

	.tenuki-dom-renderer.tenuki-board .hoshi {
		/* -2px to account for the hoshi's own width */
		margin-top: 16px;
		margin-left: 16px;
	}

	.tenuki-dom-renderer.tenuki-board[data-include-coordinates=true] .hoshi {
		/* -2px to account for the hoshi's own width */
		margin-top: 41px;
		margin-left: 41px;
	}

	.tenuki-dom-renderer.tenuki-board .hoshi {
		width: calc(2 * 2px + 1px);
		height: calc(2 * 2px + 1px);
		border-radius: 50%;
		background: #8b7341;
		position: absolute;
	}

	.tenuki-dom-renderer.tenuki-board .intersections {
		position: absolute;
		/* base margin, less half the intersection gap size */
		top: 4px;
		/* base margin, less half the intersection gap size */
		left: 4px;
	}

	.tenuki-dom-renderer.tenuki-board[data-include-coordinates=true] .intersections {
		/* additional gutter margin */
		margin-top: 25px;
		/* additional gutter margin */
		margin-left: 25px;
	}

	.tenuki-dom-renderer.tenuki-board .intersection {
		width: 29px;
		height: 29px;
	}

	.tenuki-dom-renderer.tenuki-board-nonflat,
	.tenuki-dom-renderer.tenuki-board-nonflat .tenuki-inner-container,
	.tenuki-dom-renderer.tenuki-board-nonflat .tenuki-zoom-container,
	.tenuki-dom-renderer.tenuki-board-nonflat .intersections {
		/* scale(1) is for the same iOS 9 reason as above */
		transform: scale(1) translate3d(0, 0, 0);
	}

	.tenuki-dom-renderer.tenuki-board-nonflat.tenuki-smaller-stones .intersection {
		width: 27px;
		height: 27px;
		border: 1px solid transparent;
	}

	.tenuki-dom-renderer.tenuki-board-nonflat.tenuki-fuzzy-placement .occupied {
		transition: 0.1s margin;
	}

	.tenuki-dom-renderer.tenuki-board-nonflat.tenuki-fuzzy-placement .intersection.played {
		transition: none;
	}

	.tenuki-dom-renderer.tenuki-board-nonflat.tenuki-fuzzy-placement .intersection.v-shift-up {
		margin-top: -1px;
	}

	.tenuki-dom-renderer.tenuki-board-nonflat.tenuki-fuzzy-placement .intersection.v-shift-upup {
		margin-top: -2px;
	}

	.tenuki-dom-renderer.tenuki-board-nonflat.tenuki-fuzzy-placement .intersection.v-shift-down {
		margin-top: 1px;
	}

	.tenuki-dom-renderer.tenuki-board-nonflat.tenuki-fuzzy-placement .intersection.v-shift-downdown {
		margin-top: 2px;
	}

	.tenuki-dom-renderer.tenuki-board-nonflat.tenuki-fuzzy-placement .intersection.h-shift-left {
		margin-left: -1px;
	}

	.tenuki-dom-renderer.tenuki-board-nonflat.tenuki-fuzzy-placement .intersection.h-shift-leftleft {
		margin-left: -2px;
	}

	.tenuki-dom-renderer.tenuki-board-nonflat.tenuki-fuzzy-placement .intersection.h-shift-right {
		margin-left: 1px;
	}

	.tenuki-dom-renderer.tenuki-board-nonflat.tenuki-fuzzy-placement .intersection.h-shift-rightright {
		margin-left: 2px;
	}

	.tenuki-dom-renderer.tenuki-board .intersection,
	.tenuki-dom-renderer.tenuki-board .intersection .stone {
		position: absolute;
	}

	.tenuki-dom-renderer.tenuki-board .occupied .stone,
	.tenuki-dom-renderer.tenuki-board .empty.hovered .stone {
		content: "";
		display: block;
		border-radius: 50%;
		border: 1px solid black;
		width: calc(100% - 2px);
		height: calc(100% - 2px);
	}

	.tenuki-dom-renderer.tenuki-board .intersection.occupied.played .stone:after {
		content: "";
		display: block;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		border: 2px solid;
		position: absolute;
		/*
		* 100% of the stone width + 2px for its border is an odd number of pixels,
		* so we go to (n+1)/2 which brings us 1 pixel to the right of, and 1 pixel
		* below the intersection we want.
		*/
		left: calc((100% + 2px + 1px)/2);
		top: calc((100% + 2px + 1px)/2);
		/* now correct by the 1px, plus the width of the played marker */
		margin-left: -6px;
		margin-top: -6px;
		z-index: 2;
	}

	.tenuki-dom-renderer.tenuki-board .intersection.white.occupied.played .stone:after {
		color: black;
		background: black;
	}

	.tenuki-dom-renderer.tenuki-board .intersection.black.occupied.played .stone:after {
		color: white;
		background: white;
	}

	.tenuki-dom-renderer.tenuki-board .occupied.white .stone,
	.tenuki-dom-renderer.tenuki-board .empty.hovered.white .stone {
		background: white;
		border-color: #676767;
	}

	.tenuki-dom-renderer.tenuki-board .empty.hovered.white .stone {
		border-color: black;
	}

	.tenuki-dom-renderer.tenuki-board .occupied.black .stone,
	.tenuki-dom-renderer.tenuki-board .empty.hovered.black .stone {
		background: black;
	}

	.tenuki-dom-renderer.tenuki-board .intersection.empty.hovered .stone,
	.tenuki-dom-renderer.tenuki-board .intersection.dead .stone {
		opacity: 0.5;
	}

	.tenuki-dom-renderer.tenuki-board-nonflat .intersection.dead .stone {
		opacity: 0.7;
	}

	.tenuki-dom-renderer.tenuki-board .intersection.ko .stone {
		background: none !important;
		width: 11px !important;
		height: 11px !important;
		border: 1px solid black !important;
		border-radius: 0 !important;
		left: 50% !important;
		top: 50% !important;
		opacity: 1.0 !important;
		position: absolute;
		margin-top: calc(-1px - 6px);
		margin-left: calc(-1px - 6px);
	}

	.tenuki-dom-renderer.tenuki-board .intersection.occupied.black.dead .stone,
	.tenuki-dom-renderer.tenuki-board .intersection.occupied.black.white .stone {
		border-color: rgba(0, 0, 0, 0.5);
	}

	.tenuki-dom-renderer.tenuki-board .intersection.occupied.black.dead .stone {
		background: rgba(0, 0, 0, 0.5);
	}

	.tenuki-dom-renderer.tenuki-board .intersection.occupied.white.dead .stone {
		background: rgba(255, 255, 255, 0.5);
	}

	.tenuki-dom-renderer.tenuki-board .intersection.territory-black:after,
	.tenuki-dom-renderer.tenuki-board .intersection.territory-white:after {
		content: "";
		display: block;
		width: calc(25% + 4px);
		height: calc(25% + 4px);
		position: absolute;
		left: 50%;
		top: 50%;
		margin-left: calc((-25% - 4px)/2);
		margin-top: calc((-25% - 4px)/2);
	}

	.tenuki-dom-renderer.tenuki-board .intersection.territory-black:after {
		background: black;
	}

	.tenuki-dom-renderer.tenuki-board .intersection.territory-white:after {
		background: white;
	}

	.tenuki-dom-renderer.tenuki-board-nonflat .occupied .stone {
		box-shadow: 0px 1.5px 0px rgba(62, 62, 62, 0.38);
	}

	.tenuki-dom-renderer.tenuki-board-nonflat .intersection.dead .stone {
		box-shadow: 0px 1.5px 0px rgba(62, 62, 62, 0.19);
	}

	.tenuki-dom-renderer.tenuki-board-nonflat .occupied.black .stone,
	.tenuki-dom-renderer.tenuki-board-nonflat .empty.hovered.black .stone {
		border-color: #474747;
	}

	.tenuki-dom-renderer.tenuki-board-nonflat .occupied.white .stone,
	.tenuki-dom-renderer.tenuki-board-nonflat .empty.hovered.white .stone {
		border-color: #DEDEDE;
	}

	.tenuki-dom-renderer.tenuki-board-nonflat .occupied .stone:before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		z-index: 2;
	}

	.tenuki-dom-renderer.tenuki-board-nonflat .occupied.black .stone:before {
		background: radial-gradient(circle at 50% 15%, #616161, #39363D 50%);
	}

	.tenuki-dom-renderer.tenuki-board-nonflat .occupied.white .stone:before {
		background: radial-gradient(circle at 50% 15%, #FFFFFF, #fafdfc 70%);
	}
	.tenuki-board.tenuki-scaled .cancel-zoom.visible {
		background: #B95858;
		height: 70px;
		width: 20px;
		position: absolute;
		transform: rotateZ(45deg);
		bottom: 62px;
		z-index: 2;
		left: 89px;
	}

	.tenuki-board.tenuki-svg-renderer.tenuki-scaled .cancel-zoom.visible {
		left: 87px;
	}

	.tenuki-board.tenuki-scaled .cancel-zoom.visible:after {
		background: #B95858;
		content: "";
		height: 20px;
		left: -25px;
		position: absolute;
		top: 25px;
		width: 70px;
	}

	.tenuki-board.tenuki-scaled .cancel-zoom.visible + .cancel-zoom-backdrop {
		position: absolute;
		z-index: 1;
		bottom: 48px;
		background: rgba(235, 201, 138, 0.81);
		border-radius: 50%;
		width: 100px;
		height: 100px;
		left: 49px;
	}

	.tenuki-board.tenuki-svg-renderer.tenuki-scaled .cancel-zoom.visible + .cancel-zoom-backdrop {
		width: 99px;
		height: 98px;
		left: 47px;
	}
	.tenuki-svg-renderer {
		-webkit-user-select: none;
		user-select: none;
		cursor: default;
	}

	.tenuki-svg-renderer.tenuki-board-nonflat svg,
	.tenuki-svg-renderer.tenuki-board-nonflat .tenuki-zoom-container,
	.tenuki-svg-renderer.tenuki-board-nonflat .intersections {
		transform: translate3d(0, 0, 0);
	}

	.tenuki-svg-renderer.tenuki-board {
		position: relative;
		overflow: hidden;
		-webkit-tap-highlight-color: rgba(0, 0, 0, 0);
	}

	.tenuki-svg-renderer.tenuki-board .line-box {
		stroke: #997f48;
		fill: transparent;
	}

	.tenuki-svg-renderer.tenuki-board .hoshi {
		stroke: #8b7341;
		fill: #8b7341;
	}

	.tenuki-svg-renderer.tenuki-board .tenuki-inner-container {
		background-color: #ebc98a;
	}

	.tenuki-svg-renderer.tenuki-board .tenuki-zoom-container {
		transition: transform 0.2s ease-in-out;
	}

	.tenuki-svg-renderer.tenuki-board .intersection,
	.tenuki-svg-renderer.tenuki-board .intersection .stone {
		fill: transparent;
		stroke: transparent;
	}

	.tenuki-svg-renderer.tenuki-board .intersection.black .stone {
		fill: black;
		stroke: black;
	}

	.tenuki-svg-renderer.tenuki-board .intersection.white .stone {
		fill: white;
		stroke: #676767;
	}

	.tenuki-svg-renderer.tenuki-board .intersection.hovered .stone,
	.tenuki-svg-renderer.tenuki-board .intersection.dead .stone,
	.tenuki-svg-renderer.tenuki-board .intersection.dead .stone-shadow {
		opacity: 0.5;
	}

	.tenuki-svg-renderer.tenuki-board-nonflat .intersection.dead .stone,
	.tenuki-svg-renderer.tenuki-board-nonflat .intersection.dead .stone-shadow {
		opacity: 0.7;
	}

	.tenuki-svg-renderer.tenuki-board .intersection.dead.white .stone,
	.tenuki-svg-renderer.tenuki-board .intersection.hovered.white .stone {
		stroke: black;
	}

	.tenuki-svg-renderer.tenuki-board .intersection .marker,
	.tenuki-svg-renderer.tenuki-board .intersection .ko-marker,
	.tenuki-svg-renderer.tenuki-board .intersection .territory-marker {
		visibility: hidden;
	}

	.tenuki-svg-renderer.tenuki-board .intersection.black .marker {
		fill: white;
	}

	.tenuki-svg-renderer.tenuki-board .intersection.white .marker {
		fill: black;
	}

	.tenuki-svg-renderer.tenuki-board .intersection.ko .ko-marker {
		stroke: black;
	}

	.tenuki-svg-renderer.tenuki-board .intersection.territory-black .territory-marker {
		fill: black;
	}

	.tenuki-svg-renderer.tenuki-board .intersection.territory-white .territory-marker {
		fill: white;
	}

	.tenuki-svg-renderer.tenuki-board .intersection.territory-black .territory-marker,
	.tenuki-svg-renderer.tenuki-board .intersection.territory-white .territory-marker,
	.tenuki-svg-renderer.tenuki-board .intersection.ko .ko-marker,
	.tenuki-svg-renderer.tenuki-board .intersection.played .marker {
		visibility: visible;
	}

	.tenuki-svg-renderer.tenuki-board-nonflat .intersection.hovered.black .stone,
	.tenuki-svg-renderer.tenuki-board-nonflat .intersection.hovered.white .stone {
		filter: none !important;
	}

	.tenuki-svg-renderer.tenuki-board-nonflat .intersection.black .stone,
	.tenuki-svg-renderer.tenuki-board-nonflat .intersection.dead.black .stone,
	.tenuki-svg-renderer.tenuki-board-nonflat .intersection.hovered.black .stone {
		stroke: #474747;
	}

	.tenuki-svg-renderer.tenuki-board-nonflat .intersection.black .stone-shadow,
	.tenuki-svg-renderer.tenuki-board-nonflat .intersection.white .stone-shadow {
		fill: rgba(61, 61, 61, 0.38);
	}

	.tenuki-svg-renderer.tenuki-board-nonflat .intersection.dead .stone-shadow {
		fill: rgba(61, 61, 61, 0.19);
	}

	.tenuki-svg-renderer.tenuki-board-nonflat .intersection.hovered.white .stone-shadow,
	.tenuki-svg-renderer.tenuki-board-nonflat .intersection.hovered.black .stone-shadow {
		fill: none;
	}

	.tenuki-svg-renderer.tenuki-board-nonflat .intersection.white .stone,
	.tenuki-svg-renderer.tenuki-board-nonflat .intersection.dead.white .stone,
	.tenuki-svg-renderer.tenuki-board-nonflat .intersection.hovered.white .stone {
		stroke: #DEDEDE;
	}

	.tenuki-svg-renderer.tenuki-board-nonflat.tenuki-fuzzy-placement .intersection.occupied,
	.tenuki-svg-renderer.tenuki-board-nonflat.tenuki-fuzzy-placement .intersection.occupied .intersection-inner-container {
		transition: 0.1s transform;
	}

	.tenuki-svg-renderer.tenuki-board-nonflat.tenuki-fuzzy-placement .intersection.played,
	.tenuki-svg-renderer.tenuki-board-nonflat.tenuki-fuzzy-placement .intersection.played .intersection-inner-container {
		transition: none;
	}

	.tenuki-svg-renderer.tenuki-board-nonflat.tenuki-fuzzy-placement .intersection.v-shift-up {
		transform: translateY(-1px);
	}

	.tenuki-svg-renderer.tenuki-board-nonflat.tenuki-fuzzy-placement .intersection.v-shift-upup {
		transform: translateY(-2px);
	}

	.tenuki-svg-renderer.tenuki-board-nonflat.tenuki-fuzzy-placement .intersection.v-shift-down {
		transform: translateY(1px);
	}

	.tenuki-svg-renderer.tenuki-board-nonflat.tenuki-fuzzy-placement .intersection.v-shift-downdown {
		transform: translateY(2px);
	}

	.tenuki-svg-renderer.tenuki-board-nonflat.tenuki-fuzzy-placement .intersection.h-shift-left .intersection-inner-container {
		transform: translateX(-1px);
	}

	.tenuki-svg-renderer.tenuki-board-nonflat.tenuki-fuzzy-placement .intersection.h-shift-leftleft .intersection-inner-container {
		transform: translateX(-2px);
	}

	.tenuki-svg-renderer.tenuki-board-nonflat.tenuki-fuzzy-placement .intersection.h-shift-right .intersection-inner-container {
		transform: translateX(1px);
	}

	.tenuki-svg-renderer.tenuki-board-nonflat.tenuki-fuzzy-placement .intersection.h-shift-rightright .intersection-inner-container {
		transform: translateX(2px);
	}

	.tenuki-svg-renderer .coordinates {
		fill: #8b7341;
		font-family: sans-serif;
		font-size: 14px;
	}
`;
