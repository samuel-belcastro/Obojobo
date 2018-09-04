import './viewer-component.scss'

import ListStyles from './list-styles'

import Common from 'Common'

const { TextGroup } = Common.textGroup
const { TextGroupEl } = Common.chunk.textChunk
const { Chunk } = Common.models
const { MockElement } = Common.mockDOM
const { MockTextNode } = Common.mockDOM
const { TextChunk } = Common.chunk
const SelectionHandler = Common.chunk.textChunk.TextGroupSelectionHandler
const { OboComponent } = Common.components

const selectionHandler = new SelectionHandler()

const createMockListElement = (data, indentLevel) => {
	const style = data.listStyles.get(indentLevel)

	const tag = style.type === 'unordered' ? 'ul' : 'ol'
	const el = new MockElement(tag)
	el.start = style.start
	el._listStyleType = style.bulletStyle

	return el
}

const addItemToList = (ul, li, lis) => {
	ul.addChild(li)
	li.listStyleType = ul._listStyleType
	return lis.push(li)
}

const renderEl = (props, node, index, indent) => {
	const key = `${props.model.cid}-${indent}-${index}`

	switch (node.nodeType) {
		case 'text':
			return (
				<TextGroupEl
					parentModel={props.model}
					textItem={{ text: node.text, data: {} }}
					key={key}
					groupIndex={node.index}
				/>
			)
		case 'element':
			const ElType = node.type
			return (
				<ElType key={key} start={node.start} style={{ listStyleType: node.listStyleType }}>
					{renderChildren(props, node.children, indent + 1)}
				</ElType>
			)
	}
}

const renderChildren = (props, children, indent) => {
	const els = []
	for (let index = 0; index < children.length; index++) {
		const child = children[index]
		els.push(renderEl(props, child, index, indent))
	}

	return els
}

const __guard__ = (value, transform) => {
	return typeof value !== 'undefined' && value !== null ? transform(value) : undefined
}

export default props => {
	let curUl

	const data = props.model.modelState

	const texts = data.textGroup

	let curIndentLevel = 0
	let curIndex = 0
	const rootUl = (curUl = createMockListElement(data, curIndentLevel))
	const lis = []

	let li = new MockElement('li')
	addItemToList(curUl, li, lis)

	for (let itemIndex = 0; itemIndex < texts.items.length; itemIndex++) {
		// if this item is lower than the current indent level...
		const item = texts.items[itemIndex]
		if (item.data.indent < curIndentLevel) {
			// traverse up the tree looking for our curUl:
			while (curIndentLevel > item.data.indent) {
				curUl = curUl.parent.parent
				curIndentLevel--
			}

			// else, if this item is higher than the current indent level...
		} else if (item.data.indent > curIndentLevel) {
			// traverse down the tree...
			while (curIndentLevel < item.data.indent) {
				curIndentLevel++

				// Create the list for this level
				const newUl = createMockListElement(data, curIndentLevel)
				const newLi = new MockElement('li')
				addItemToList(newUl, newLi, lis)
				curUl.lastChild.addChild(newUl)
				curUl = newUl
			}
		}

		// if the lastChild is not an LI or it is an LI that already has text inside
		// lastChild is always defined because of the cals to addItemToList
		if (!(curUl.lastChild.type === 'li') || curUl.lastChild.lastChild != null) {
			li = new MockElement('li')
			addItemToList(curUl, li, lis)
		}

		const text = new MockTextNode(item.text)
		text.index = curIndex
		curIndex++

		curUl.lastChild.addChild(text)
	}

	// Remove bullets from nested LIs
	for (li of Array.from(lis)) {
		// li will always have .children because MockListElement creates it as an empty array
		if (__guard__(li.children[0], x => x.nodeType) !== 'text') {
			li.listStyleType = 'none'
		}
	}

	return (
		<OboComponent model={props.model} moduleData={props.moduleData}>
			<TextChunk className="obojobo-draft--chunks--list pad">
				<div data-indent={data.indent}>{renderEl(props, rootUl, 0, 0)}</div>
			</TextChunk>
		</OboComponent>
	)
}