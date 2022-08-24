import Block, {BlockType} from "../../block/block.class";
import PathBuilder, {PLine} from "../../utils/path-builder";
import {ArgType} from "../../block/arg.class";
import './base-render.css'
import {ShapeProvider} from "./shape-provider";
import SvgElCreator from "./svg-el-creator";

export default class BaseRender {
  // 细节形状提供器
  static provider = new ShapeProvider()

  // 整图形块参数
  static MIN_WIDTH = 36; // 最小宽度
  static MIN_LINE_HEIGHT = 28; // 每行最小高度
  static PADDING_VERTICAL = 5; // 每行垂直边距
  static PADDING_HORIZONTAL = 3; // 图形块水平边距(不含CONTENT_SPACING)
  static CONTENT_SPACING = 4; // 行内内容之间间距

  // 文本参数
  static TEXT_COLOR = '#ffffff' // 文本颜色
  static FONT_SIZE = 14; // 字体大小
  static TEXT_LINE_HEIGHT = 16; // 文本行高

  static MIN_VALUE_WIDTH = 36 // 最小VALUE块宽度
  static MIN_VALUE_HEIGHT = this.MIN_LINE_HEIGHT // 最小VALUE块高度

  static render(block: Block, svg: SVGGElement): SVGGElement {

    const el = SvgElCreator.newGroup({
      class: 'rb-block-holder'
    })
    svg.appendChild(el)

    const innerPath: string[] = []

    const linesWidth = [];
    const linesHeight = [];
    const statementsX = []
    let currentY = this.PADDING_VERTICAL
    let startX = this.PADDING_HORIZONTAL + this.CONTENT_SPACING;
    if(block.type === BlockType.Output){
      startX += this.provider.TAB_WIDTH
    }
    for (const line of block.lines) {
      let lineHeight = this.MIN_LINE_HEIGHT;
      let currentX = startX
      for (const arg of line) {
        let svgEl = null
        let wh = [0, 0]
        if (arg.type === ArgType.Text) {
          svgEl = SvgElCreator.newText(arg.text, currentX, currentY, this.FONT_SIZE, this.TEXT_COLOR);
        } else if (arg.type === ArgType.Statement) {
          statementsX.push(currentX + this.PADDING_VERTICAL)
        } else if (arg.type === ArgType.Field) {

        } else if (arg.type === ArgType.Value) {
          wh = [this.MIN_VALUE_WIDTH, this.MIN_VALUE_HEIGHT]
          innerPath.push(this.makeValuePath(currentX, currentY, [], wh[0], wh[1]).build())
        }
        if (svgEl) {
          el.appendChild(svgEl)
          const rect = svgEl.getBoundingClientRect()
          wh = [rect.width, rect.height]
        }
        currentX += wh[0] + this.CONTENT_SPACING
        lineHeight = Math.max(lineHeight, wh[1] + this.PADDING_VERTICAL * 2)
      }
      currentY += lineHeight
      linesWidth.push(currentX + this.PADDING_HORIZONTAL)
      linesHeight.push(lineHeight);
    }

    const width = Math.max(this.MIN_WIDTH, ...linesWidth)
    const height = sum(linesHeight)

    const builder = new PathBuilder()
    if(block.type === BlockType.Output){
      builder.pushPath(this.makeValuePath(0, 0, [], width, height).getPath(false))
    }else{
      builder.moveTo(0, this.provider.CORNER_SIZE, true)
      builder.pushPath(this.provider.makeTopLeftCorner())
      builder.pushPath(this.makePuzzleLine(width))
      builder.verticalTo(height)
      builder.pushPath(this.makePuzzleLine(width, true))
      builder.pushPath(this.provider.makeBottomLeftCorner(true))
      builder.verticalTo(-height + this.provider.CORNER_SIZE * 2)
      builder.close()
    }

    let bodyPath = builder.build() + ' ' + innerPath.join(' ')
    console.log(bodyPath)

    const background = SvgElCreator.newPath(bodyPath, block.color, 'none');
    background.setAttribute('class', 'rb-block-body');

    appendChildToFirst(el, background);

    return el
  }

  static makeValuePath(x: number = 0, y: number = 0, rightLine: PLine[] = [], width: number = this.MIN_VALUE_WIDTH, height: number = this.MIN_VALUE_HEIGHT): PathBuilder {
    return new PathBuilder()
      .moveTo(x + width, y + height, true)
      .horizontalTo(- width + this.provider.TAB_WIDTH)
      .pushPath(this.makeTabLine(height, true))
      .horizontalTo(width - this.provider.TAB_WIDTH)
      .pushPath(rightLine)
      .close()
  }


  static makePuzzleLine(width: number, reverse: boolean = false): PLine[] {
    return new PathBuilder()
      .horizontalTo(this.provider.PUZZLE_LEFT - this.provider.CORNER_SIZE)
      .pushPath(this.provider.makePuzzle())
      .horizontalTo(width - this.provider.PUZZLE_WIDTH - this.provider.PUZZLE_LEFT)
      .getPath(reverse)
  }

  static makeTabLine(height: number, reverse: boolean = false): PLine[] {
    return new PathBuilder()
      .verticalTo(this.provider.TAB_TOP)
      .pushPath(this.provider.makeTab())
      .verticalTo(height - this.provider.TAB_HEIGHT - this.provider.TAB_TOP)
      .getPath(reverse)
  }


}

function sum(arr: number[]): number {
  return arr.reduce((prev, curr, idx, arr) => {
    return prev + curr
  })
}

function appendChildToFirst(parent: HTMLElement | SVGElement, child: HTMLElement | SVGElement) {
  if (parent.children.length === 0) {
    parent.appendChild(child)
  } else {
    parent.insertBefore(child, parent.children[0])
  }
}
