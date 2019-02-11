import {expect} from "chai"

import {LayoutDOM} from "models/layouts/layout_dom"
import {ToolbarBox, ProxyToolbar} from "models/tools/toolbar_box"
import {ToolProxy} from "models/tools/tool_proxy"
import {CustomAction} from "models/tools/actions/custom_action"
import {ResetTool} from "models/tools/actions/reset_tool"
import {SaveTool} from "models/tools/actions/save_tool"
import {BoxEditTool} from "models/tools/edit/box_edit_tool"
import {PointDrawTool} from "models/tools/edit/point_draw_tool"
import {SelectTool, SelectToolView} from "models/tools/gestures/select_tool"
import {PanTool} from "models/tools/gestures/pan_tool"
import {TapTool} from "models/tools/gestures/tap_tool"
import {CrosshairTool} from "models/tools/inspectors/crosshair_tool"
import {HoverTool} from "models/tools/inspectors/hover_tool"

class MultiToolView extends SelectToolView {}

class MultiTool extends SelectTool {
  type = "MultiTool"
  default_view = MultiToolView
  icon = "Multi Tool"
  tool_name = "Multi Tool"
  event_type = ["tap" as "tap", "pan" as "pan"]
}

describe("ToolbarBox", () => {

  it("should be an instance of LayoutDOM", () => {
    const box = new ToolbarBox()
    expect(box).to.be.an.instanceof(LayoutDOM)
  })
})

describe("ProxyToolbar", () => {

  describe("_init_tools method", () => {
    let multi: MultiTool
    let pan: PanTool
    let tap: TapTool

    beforeEach(() => {
      multi = new MultiTool()
      pan = new PanTool()
      tap = new TapTool()
    })

    it("should have proxied multi tool in gestures", () => {
      const toolbar = new ProxyToolbar({tools:[multi, tap, pan]})
      expect(toolbar.gestures.multi.tools.length).to.be.equal(1)
      expect(toolbar.gestures.multi.tools[0]).to.be.an.instanceof(ToolProxy)
      expect(toolbar.gestures.multi.tools[0].computed_icon).to.be.equal('Multi Tool')
      expect(((toolbar.gestures.multi.tools[0]) as any).tools.length).to.be.equal(1) // XXX
      expect(((toolbar.gestures.multi.tools[0]) as any).tools[0]).to.be.equal(multi) // XXX
    })
  })

  describe("_merge_tools method", () => {

    it("should correctly merge multiple actions", () => {
      const reset1 = new ResetTool()
      const reset2 = new ResetTool()
      const save1 = new SaveTool()
      const save2 = new SaveTool()
      const proxy_toolbar = new ProxyToolbar({tools: [reset1, reset2, save1, save2]})
      expect(proxy_toolbar.actions.length).equal(2)
    })

    it("should correctly merge multiple inspectors", () => {
      const hover1 = new HoverTool()
      const hover2 = new HoverTool()
      const crosshair1 = new CrosshairTool()
      const crosshair2 = new CrosshairTool()
      const proxy_toolbar = new ProxyToolbar({tools: [hover1, hover2, crosshair1, crosshair2]})
      expect(proxy_toolbar.inspectors.length).equal(2)
    })

    it("should avoid merge of multiple multi-gesture tools", () => {
      const pointdraw = new PointDrawTool()
      const boxedit1 = new BoxEditTool()
      const boxedit2 = new BoxEditTool()
      const proxy_toolbar = new ProxyToolbar({tools: [pointdraw, boxedit1, boxedit2]})
      expect(proxy_toolbar.gestures.multi.tools.length).equal(3)
    })

    it("should avoid merge of multiple CustomAction tools", () => {
      const reset1 = new ResetTool()
      const reset2 = new ResetTool()
      const custom_action1 = new CustomAction()
      const custom_action2 = new CustomAction()
      const proxy_toolbar = new ProxyToolbar({tools: [reset1, reset2, custom_action1, custom_action2]})
      expect(proxy_toolbar.actions.length).equal(3)
    })
  })
})
