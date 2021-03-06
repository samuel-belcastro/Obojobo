import './viewer-component.scss'

import Common from 'obojobo-document-engine/src/scripts/common'
import React from 'react'
import Viewer from 'obojobo-document-engine/src/scripts/viewer'
import katex from 'katex'

const { NonEditableChunk } = Common.chunk
const { OboComponent } = Viewer.components

const getLatexHtml = function(latex) {
	try {
		const html = katex.renderToString(latex, { displayMode: true })
		return { html }
	} catch (e) {
		return { error: e }
	}
}

const MathEquation = props => {
	let katexHtml = getLatexHtml(props.model.modelState.latex)
	if (katexHtml.error) {
		katexHtml = ''
	} else {
		katexHtml = katexHtml.html
	}

	if (katexHtml.length === 0) {
		return null
	}

	/*
	Note on aria-label, math and accessibility: It seems that screenreaders are not very consistant in
	reading MathML. Chromevox will sometimes read the MathML when going through the document, however
	when focused on this chunk (for example) ChromeVox will remain silent. It is difficult to predict
	when ChromeVox will read math and when it won't.

	Our solution is to allow document authors to provide an `alt` property which would be the text version
	of a mathematical equation (for example, "x equals sin of theta"). If no `alt` property exists then we
	fall back to the raw LaTeX used to generate the equation. This is not ideal but is the best compromise
	that we have currently as this will always be read.

	If given only the aria-label ChromeVox will sometimes read the aria-label and sometimes read the
	actual MathML generated by KaTeX. In order to be consistent the MathML is hidden from readers so
	that the aria-label is always read.
	*/

	return (
		<OboComponent
			model={props.model}
			moduleData={props.moduleData}
			className={`obojobo-draft--chunks--math-equation pad align-${props.model.modelState.align}`}
			role="math"
			aria-label={
				(props.model.modelState.label === ''
					? ''
					: 'Equation ' + props.model.modelState.label + ': ') +
				(props.model.modelState.alt || props.model.modelState.latex)
			}
		>
			<NonEditableChunk>
				<div
					aria-hidden
					className="katex-container"
					style={{ fontSize: props.model.modelState.size }}
					dangerouslySetInnerHTML={{ __html: katexHtml }}
				/>
				{props.model.modelState.label === '' ? null : (
					<div className="equation-label" aria-hidden="true">
						{props.model.modelState.label}
					</div>
				)}
			</NonEditableChunk>
		</OboComponent>
	)
}

export default MathEquation
