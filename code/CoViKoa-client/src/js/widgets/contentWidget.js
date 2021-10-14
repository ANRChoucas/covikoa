import { Widget } from '@lumino/widgets';
import '../../css/contentWidget.css';

/*
* Widget displaying some other (mostly static) content
* in the interface (that corresponds to a gviz:StaticContentComponent)
*
*/
export default class ContentWidget extends Widget {
  // static createNode() {
  //   const node = document.createElement('div');
  //   const content = document.createElement('div');
  //   const input = document.createElement('input');
  //   input.placeholder = 'Placeholder...';
  //   content.appendChild(input);
  //   node.appendChild(content);
  //   return node;
  // }

  constructor(options) {
    // super({ node: ContentWidget.createNode() });
    super();
    this.setFlag(Widget.Flag.DisallowLayout);
    this.addClass('cvk-ContentWidget');
    this.title.label = options.title;
    this.title.closable = true;
    this.title.caption = `Long description for: ${options.name}`;
    const elem = document.createElement('div');
    elem.innerHTML = options.content;
    //   elem.innerHTML = `<div>
    //   <h2 style="margin-bottom: 0">Woo title</h2>
    //   <div style="display: flex;">
    //     <div style="flex-basis: 50%;">
    //       <p style="font-size:26px;">🚀🌝</p>
    //     </div>
    //     <div style="flex-basis: 50%;">
    //       <p>Made by MyUserName (c) 2021</p>
    //       <p><i>Some html content fetched dynamically by a SPARQL query ...</i><p>
    //     </div>
    //   </div>
    // </div>`;
    this.node.append(elem);
  }

  // get inputNode() {
  //   return this.node.getElementsByTagName('input')[0];
  // }
  //
  // onActivateRequest(_msg) { // eslint-disable-line no-unused-vars
  //   if (this.isAttached) {
  //     this.inputNode.focus();
  //   }
  // }
}
