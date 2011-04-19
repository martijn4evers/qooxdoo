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
     * Sebastian Werner (wpbasti)
     * Jonathan Weiß (jonathan_rass)
     * Martijn Evers (mevers)

************************************************************************ */

/**
 * Superclass for fields which handle Date values. Provides a
 * popup window for the subclass.
 *
 * @childControl textfield {qx.ui.form.TextField} textfield component of the date field
 * @childControl button {qx.ui.form.Button} button to open the popup
 * @childControl popup {qx.ui.popup.Popup} popup at the disposal of the subclass
 */
qx.Class.define("qx.ui.form.AbstractDateField",
{
  extend  : qx.ui.core.Widget,
  include : [
    qx.ui.form.MForm
  ],
  implement : [
    qx.ui.form.IForm,
    qx.ui.form.IDateForm
  ],
  type : "abstract",



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Creates a new instance of AbstractDateField.
   */
  construct : function()
  {
    this.base(arguments);

    // set the layout
    var layout = new qx.ui.layout.HBox();
    this._setLayout(layout);
    layout.setAlignY("middle");

    // register listeners
    this.addListener("keypress", this.__onKeyPress);
    this.addListener("blur", this.__onBlur, this);
    this.addListener("click", this.__onClick);
    this.addListener("resize", this.__onResize, this);

    // register mouse wheel listener
    var root = qx.core.Init.getApplication().getRoot();
    root.addListener("mousewheel", this.__onMousewheel, this, true);

    // create core children
    this._createChildControl("textfield");
    this._createChildControl("button");

    // set default date
    this.initDateFormat(this._getDefaultDateFormatter());

    // listen for locale changes
    if (qx.core.Environment.get("qx.dynlocale")) {
      this.__removeLocaleDateFormatListener = true;
      qx.locale.Manager.getInstance().addListener("changeLocale", this.__onChangeLocale2, this);
    }
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    focusable :
    {
      refine : true,
      init : true
    },

    // overridden
    width :
    {
      refine : true,
      init : 120
    },

    /**
     * Date value of this field.
     */
    value :
    {
      init : null,
      check : "Date",
      nullable : true,
      apply : '_applyValue',
      event : 'changeValue'
    },

    /**
     * String value which will be shown as a hint if the field is all of:
     * unset, unfocused and enabled. Set to null to not show a placeholder
     * text.
     */
    placeholder :
    {
      check : "String",
      nullable : true,
      apply : "_applyPlaceholder"
    },

    /** The formatter, which converts the selected date to a string. **/
    dateFormat :
    {
      nullable : false,
      deferredInit : true,
      check : "qx.util.format.DateFormat",
      apply : "_applyDateFormat"
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __removeLocaleDateFormatListener : null,

    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "textfield":
          control = new qx.ui.form.TextField();
          control.setFocusable(false);
          control.addState("inner");
          control.addListener("changeValue", this._onTextFieldChangeValue, this);
          control.addListener("blur", this.close, this);
          this._add(control, {flex: 1});

          // forward the focusin and focusout events to the textfield. The textfield
          // is not focusable so the events need to be forwarded manually.
          this.addListener("focusin", function() {
            this.fireNonBubblingEvent("focusin", qx.event.type.Focus);
          }, control);

          this.addListener("focusout", function() {
            this.fireNonBubblingEvent("focusout", qx.event.type.Focus);
          }, control);
          break;

        case "button":
          control = new qx.ui.form.Button();
          control.set({focusable: false, keepActive: true});
          control.addState("inner");
          this._add(control);
          break;

        case "popup":
          control = new qx.ui.popup.Popup(new qx.ui.layout.VBox);
          control.set({autoHide: false, keepActive: true});
          break;
      }

      return control || this.base(arguments, id);
    },


    /**
     * Return the default date formatter.
     *
     * @return {qx.util.format.DateFormat}
     */
    _getDefaultDateFormatter : function() {
      return new qx.util.format.DateFormat();
    },


    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyDateFormat : function(value, old)
    {
      // if old is undefined or null do nothing
      if (!old) {
        return;
      }

      if (this.__removeLocaleDateFormatListener) {
        qx.locale.Manager.getInstance().removeListener("changeLocale", this.__onChangeLocale2, this);
        this.__removeLocaleDateFormatListener = null;
      }

      this.getChildControl("textfield").setValue(value.format(this.getValue()));
    },


    // property apply
    _applyPlaceholder : function(value) {
      this.getChildControl("textfield").setPlaceholder(value);
    },

    // property apply
    _applyValue : function(value) {
      var textDate = (null === value) ? null : this.getDateFormat().format(value);
      this.getChildControl("textfield").setValue(textDate);
    },


    /*
    ---------------------------------------------------------------------------
      PUBLIC METHODS
    ---------------------------------------------------------------------------
    */


    // overridden
    tabFocus : function()
    {
      var field = this.getChildControl("textfield");

      field.getFocusElement().focus();
      field.selectAllText();
    },


    // overridden
    focus : function()
    {
      this.base(arguments);
      this.getChildControl("textfield").getFocusElement().focus();
    },


    /**
     * Shows the list popup.
     */
    open : function()
    {
      var popup = this.getChildControl("popup");

      popup.placeToWidget(this, true);
      this._onPopupOpen(popup);
      popup.show();
    },


    /**
     * Hides the list popup.
     */
    close : function() {
      this.getChildControl("popup").hide();
    },


    /**
     * Toggles the popup's visibility.
     */
    toggle : function()
    {
      var isListOpen = this.getChildControl("popup").isVisible();
      if (isListOpen) {
        this.close();
      } else {
        this.open();
      }
    },


    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */


    /**
     * Redirects keypress events not handled by this class to the subclass.
     *
     * @param e {qx.event.type.KeySequence} Keypress event
     */
    _onKeyPress : function(e) {
      throw new Error("Abstract method: _handleKeyPress()");
    },


    /**
     * Send a signal to the subclass when the popup is shown.
     *
     * @param popup {qx.ui.popup.Popup} popup object
     */
    _onPopupOpen : function(popup) {
      throw new Error("Abstract method: _onPopupOpen()");
    },


    /**
     * Syncs the textfield value to this widget.
     *
     * @param e {qx.event.type.Data} Change event
     */
    _onTextFieldChangeValue : function(e)
    {
      var textDate = (e) ? e.getData() : this.getChildControl("textfield").getValue();
      if (textDate) {
        try {
          this.setValue(this.getDateFormat().parse(textDate));

        } catch (err) {
          this.warn(err);
        }
      }
      else
      {
        this.setValue(null);
      }
    },


    /*
    ---------------------------------------------------------------------------
      PRIVATE EVENT LISTENERS
    ---------------------------------------------------------------------------
    */


    __onChangeLocale2 : function()
    {
      this.__removeLocaleDateFormatListener = false;
      this.setDateFormat(this._getDefaultDateFormatter());
      this.__removeLocaleDateFormatListener = true;
    },


    /**
     * Reacts on special keys and forwards other key events to the subclass.
     *
     * @param e {qx.event.type.KeySequence} Keypress event
     */
    __onKeyPress : function(e)
    {
      // get the key identifier
      var iden = e.getKeyIdentifier();
      var popup = this.getChildControl("popup");

      if ((iden == "Down") && e.isAltPressed())
      {
        this.toggle();
        e.stopPropagation();
      }

      // if the popup is closed, ignore all
      if (popup.getVisibility() == "hidden") {
        return;
      }

      // hide the popup always on escape
      if (iden == "Escape")
      {
        this.close();
        e.stopPropagation();
        return;
      }

      // Stop navigation keys when popup is open
      if (iden === "Left" || iden === "Right" || iden === "Down" || iden === "Up") {
        e.preventDefault();
      }

      // forward the rest of the events to the subclass
      this._onKeyPress(e);
    },


    /**
     * Close the pop-up if the mousewheel event isn't on the pup-up window.
     *
     * @param e {qx.event.type.Mouse} Mousewheel event.
     */
    __onMousewheel : function(e)
    {
      var popup = this.getChildControl("popup", true);
      if (popup == null) {
        return;
      }

      if (qx.ui.core.Widget.contains(popup, e.getTarget())) {
        // needed for ComboBox widget inside an inline application
        e.preventDefault();
      } else {
        this.close();
      }
    },


    /**
     * Handler for the blur event of the current widget.
     *
     * @param e {qx.event.type.Focus} The blur event.
     */
    __onBlur : function(e) {
      this.close();
    },


    /**
     * Updates list minimum size.
     *
     * @param e {qx.event.type.Data} Data event
     */
    __onResize : function(e){
      this.getChildControl("popup").setMinWidth(e.getData().width);
    },


    /**
     * Toggles the popup's visibility.
     *
     * @param e {qx.event.type.Mouse} Mouse click event
     */
    __onClick : function(e)
    {
      var target = e.getTarget();
      if (target == this.getChildControl("button")) {
        this.toggle();
      } else {
        this.close();
      }
    },


    /*
    ---------------------------------------------------------------------------
      TEXTFIELD SELECTION API
    ---------------------------------------------------------------------------
    */


    /**
     * Returns the current selection.
     * This method only works if the widget is already created and
     * added to the document.
     *
     * @return {String|null}
     */
    getTextSelection : function() {
      return this.getChildControl("textfield").getTextSelection();
    },


    /**
     * Returns the current selection length.
     * This method only works if the widget is already created and
     * added to the document.
     *
     * @return {Integer|null}
     */
    getTextSelectionLength : function() {
      return this.getChildControl("textfield").getTextSelectionLength();
    },


    /**
     * Set the selection to the given start and end (zero-based).
     * If no end value is given the selection will extend to the
     * end of the textfield's content.
     * This method only works if the widget is already created and
     * added to the document.
     *
     * @param start {Integer} start of the selection (zero-based)
     * @param end {Integer} end of the selection
     * @return {void}
     */
    setTextSelection : function(start, end) {
      this.getChildControl("textfield").setTextSelection(start, end);
    },


    /**
     * Clears the current selection.
     * This method only works if the widget is already created and
     * added to the document.
     *
     * @return {void}
     */
    clearTextSelection : function() {
      this.getChildControl("textfield").clearTextSelection();
    },


    /**
     * Selects the whole content
     *
     * @return {void}
     */
    selectAllText : function() {
      this.getChildControl("textfield").selectAllText();
    },


    /**
     * Clear any text selection, then select all text
     *
     * @return {void}
     */
    resetAllTextSelection: function() {
      this.clearTextSelection();
      this.selectAllText();
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    var root = qx.core.Init.getApplication().getRoot();
    if (root) {
      root.removeListener("mousewheel", this.__onMousewheel, this, true);
    }
  }
});