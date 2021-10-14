/**
 * Get all child widgets of a DockPanel.
 *
 * @param {lumino.widgets.DockPanel|lumino.widgets.BoxPanel} panel - The DockPanel or BoxPanel to extract widgets from
 * @returns {array}
 */
export const getChildWidgets = (panel) => {
  if (typeof panel.widgets === 'object') return panel.widgets;
  let w;
  const r = [];
  const it = panel.widgets();
  while (w = it.next()) {
    r.push(w);
  }
  return r;
};

/**
 * Get the widget that was added the last on a DockPanel.
 *
 * @param {lumino.widgets.DockPanel} panel - The DockPanel to extract widget from
 * @returns {lumino.widgets.Widget|undefined}
 */
export const getLastWidget = (panel) => {
  const widgets = getChildWidgets(panel);
  return widgets[widgets.length - 1];
};
