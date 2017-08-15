/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Martijn Evers, The Netherlands

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martijn Evers (mever)

************************************************************************ */
qx.Class.define("qx.test.ui.form.VirtualSelectBox",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    setUp : function()
    {
      this.__selectBox = new qx.ui.form.VirtualSelectBox();
      this.getRoot().add(this.__selectBox);

      this.flush();
    },

    tearDown : function()
    {
      this.base(arguments);
      this.__selectBox.dispose();
      this.__selectBox = null;
    },

    __simulateUiInteraction : function() {
      // focus -> array key down -> array key down -> enter
      this.__selectBox.getSelection().setItem(0, this.__selectBox.getModel().getItem(1));
    },

    testChangeValueEvent : function()
    {
      var m = qx.data.marshal.Json.createModel(["a", "b"]);

      this.__selectBox.addListenerOnce("changeValue", function(e) {
        this.assertIdentical("a", e.getData());
        this.assertNull(e.getOldData());
      }.bind(this));

      this.__selectBox.setModel(m);

      this.__selectBox.addListenerOnce("changeValue", function(e) {
        this.assertIdentical("b", e.getData());
        this.assertIdentical("a", e.getOldData());
      }.bind(this));

      this.__simulateUiInteraction();
    },

    /**
     * This is a test for a bug. It took me quite a while
     * to discover what was wrong!
     */
    testChangeLabelPath : function() {

      // setup our precondition, an empty selectbox with 'a' as label path
      var i = qx.data.marshal.Json.createModel({b: 1});
      var m = qx.data.marshal.Json.createModel([]);
      var sb = new qx.ui.form.VirtualSelectBox(m);
      sb.setLabelPath('a');
      this.getRoot().add(sb);

      // flusing it causes the selectbox to bind the array model to its items
      this.flush();

      // when we change the path and add an element we get the following error:
      // ------------------------------------------------------------------------------------------
      // Failed to remove event listener for id 'undefined' from the target 'qx.data.model.b':
      // Invalid id type.: tearDown failed: Expected value to be a string but found 'undefined'!
      sb.setLabelPath('b');

      // you can work around this issue by flushing the UI queue or call syncWidget manually on the selectbox:
      // this.flush(); // or
      sb.syncWidget();

      // this line triggers the error
      m.push(i);
    }
  }
});