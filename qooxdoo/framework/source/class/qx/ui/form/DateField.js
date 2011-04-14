/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Martijn Evers (mevers)

************************************************************************ */

/**
 * A *date field* is like a combo box with the date as popup. As button to
 * open the calendar a calendar icon is shown at the right to the textfield.
 *
 * To be conform with all form widgets, the {@link qx.ui.form.IForm} interface
 * is implemented.
 *
 * The following example creates a date field and sets the current
 * date as selected.
 *
 * <pre class='javascript'>
 * var dateField = new qx.ui.form.DateField();
 * this.getRoot().add(dateField, {top: 20, left: 20});
 * dateField.setValue(new Date());
 * </pre>
 *
 * @childControl datechooser {qx.ui.control.DateChooser} date chooser component
 * @childControl popup {qx.ui.popup.Popup} popup which shows the datechooser
 */
qx.Class.define("qx.ui.form.DateField",
{
  extend : qx.ui.form.AbstractDateField,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._createChildControl("datechooser");
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init   : "datefield"
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Checks if the field is empty.
     *
     * @return {Boolean} True, if the date field is empty.
     * @deprecated since 1.5: Please use "if (field.getValue() === null)" instead.
     */
    isEmpty: function()
    {
      if (qx.core.Environment.get("qx.debug")) {
        qx.Bootstrap.warn(
          "The method 'qx.ui.form.AbstractDateField.isEmpty' is deprecated: "+
          "Please use 'if (qx.ui.form.AbstractDateField.getValue() === null)' instead.");
      }
      
      return (null === this.getValue());
    },


    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "list":
          if (qx.core.Environment.get("qx.debug")) {
            qx.Bootstrap.warn(
              "The child control 'list' of qx.ui.form.DateField is deprecated: "+
              "Please use the 'datechooser' child control instead.");
          }
          // omit break statement

        case "datechooser":
          control = new qx.ui.control.DateChooser();
          control.set({focusable: false, keepFocus: true});
          control.addListener("execute", this._onChangeDate, this);

          var popup = this.getChildControl("popup");
          popup.addListener("mouseup", this._onChangeDate, this);
          popup.add(control);
          break;
      }

      return control || this.base(arguments, id);
    },


    /**
     * Handler method which handles the click on the calender popup.
     *
     * @param e {qx.event.type.Mouse?null} The mouse event of the click.
     */
    _onChangeDate : function(e)
    {
      this.setValue(this.getChildControl("datechooser").getValue());
      this.close();
    },


    // overridden
    _onKeyPress : function(e) {
      this.getChildControl("datechooser").handleKeyPress(e);
    },


    // overridden
    _onPopupOpen : function(popup)
    {
      // Synchronize the chooser with the current value on every
      // opening of the popup. This is needed when the value has been
      // modified and not saved yet (e.g. no blur)
      this._onTextFieldChangeValue();
      this.getChildControl("datechooser").setValue(this.getValue());
    }
  }
});