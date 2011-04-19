/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martijn Evers (mevers)

************************************************************************ */
qx.Class.define("qx.test.ui.form.DateLocale",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    testInitDateField : function() {
      var manager = this.__getLocaleManager();

      var date = new Date(2011, 3, 15);
      var widget = new qx.ui.form.DateField();
      widget.setValue(date);
      this.getRoot().add(widget);
      this.flush();

      this.assertEquals("Apr 15, 2011", this.__getVisibleValueOf(widget));
      widget.destroy();

      manager.setLocale("de_QX");
      var date = new Date(2012, 4, 16);
      var widget = new qx.ui.form.DateField();
      widget.setValue(date);
      this.getRoot().add(widget);

      this.assertEquals("16.05.2012", this.__getVisibleValueOf(widget));

      // get rid of the widget
      widget.destroy();
    },


    testChangeValueDateField : function() {
      var manager = this.__getLocaleManager();

      var date = new Date(2011, 3, 15);
      var widget = new qx.ui.form.DateField();
      widget.setValue(date);
      this.getRoot().add(widget);
      this.flush();

      this.assertEquals("Apr 15, 2011", this.__getVisibleValueOf(widget));
      widget.setValue(new Date(2012, 4, 16));
      this.assertEquals("May 16, 2012", this.__getVisibleValueOf(widget));

      // get rid of the widget
      widget.destroy();
    },


    testChangeLocaleDefaultFormatter : function() {
      var manager = this.__getLocaleManager();

      var date = new Date(2011, 3, 15);
      var widget = new qx.ui.form.DateField();
      widget.setValue(date);
      this.getRoot().add(widget);
      this.flush();

      this.assertEquals("Apr 15, 2011", this.__getVisibleValueOf(widget));
      manager.setLocale("de_QX");
      this.assertEquals("15.04.2011", this.__getVisibleValueOf(widget));

      // get rid of the widget
      widget.destroy();
    },


    testChangeLocaleOwnFormatter : function() {
      var manager = this.__getLocaleManager();

      var date = new Date(2011, 3, 15);
      var widget = new qx.ui.form.DateField();
      widget.setDateFormat(new qx.util.format.DateFormat('y-M-d:D'));
      widget.setValue(date);
      this.getRoot().add(widget);
      this.flush();

      this.assertEquals("2011-4-15:105", this.__getVisibleValueOf(widget));
      manager.setLocale("de_QX");
      this.assertEquals("2011-4-15:105", this.__getVisibleValueOf(widget));

      // get rid of the widget
      widget.destroy();
    },


    __getLocaleManager : function() {
      var manager = qx.locale.Manager.getInstance();

      // add dummy translations
      manager.addTranslation("en_QX", {
        "test one": "test one",
        "test One car": "test One car"
      });

      manager.addTranslation("de_QX", {
        "test one": "Eins",
        "test One car": "Ein Auto"
      });

      manager.setLocale("en_QX");
      return manager;
    },


    __getVisibleValueOf: function(widget) {
      if (qx.Class.isSubClassOf(widget.constructor, qx.ui.form.AbstractField)) {
        return widget.getContentElement().getValue();
      } else if (qx.Class.isSubClassOf(widget.constructor, qx.ui.form.ComboBox)
              || qx.Class.isSubClassOf(widget.constructor, qx.ui.form.AbstractDateField)) {
        return widget.getChildControl("textfield").getContentElement().getValue();
      }
    }
  }
});
