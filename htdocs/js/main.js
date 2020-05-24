/*
 * This file is part of the Eventum (Issue Tracking System) package.
 *
 * @copyright (c) Eventum Team
 * @license GNU General Public License, version 2 or later (GPL-2+)
 *
 * For the full copyright and license information,
 * please see the COPYING and AUTHORS files
 * that were distributed with this source code.
 */

function Eventum()
{
}

Eventum.TrimmedEmailToggleFunction = function () {
    var $div = $(this).parent().parent().find('div.email-trimmed');
    if ($div.hasClass('hidden')) {
        $div.removeClass('hidden')
    } else {
        $div.addClass('hidden')
    }
    return false;
};

// click to open trimmed emails
Eventum.setupTrimmedEmailToggle = function () {
    $('span.toggle-trimmed-email').find('a')
        .off('click', Eventum.TrimmedEmailToggleFunction)
        .on('click', Eventum.TrimmedEmailToggleFunction);
};

/** @deprecated: jquery-cookie, no longer used */
Eventum.expires = new Date(new Date().getTime() + (56 * 86400000));
Eventum.checkClose = false;
Eventum.closeConfirmMessage = 'Do you want to close this window?';
Eventum.rel_url = '';

Eventum.toggle_section_visibility = function(id) {
    var element = $('#' + id);
    var display = '';
    var link_title = '';
    if (element.is(':visible')) {
        display = 'none';
        element.hide();
        link_title = 'show';
    } else {
        display = 'block';
        element.show();
        link_title = 'hide';
    }

    $('#' + id + '_link').text(link_title);

    Cookie.set('visibility_' + id, display);
};

Eventum.close_and_refresh = function(noparent)
{
    if (opener && !noparent) {
        opener.location.href = opener.location;
    }
    window.close();
};

Eventum.displayFixedWidth = function(element)
{
    element.addClass('fixed_width')
};

Eventum.selectOnlyValidOption = function(select)
{
    if (select[0].selectedIndex == 0) {
        if (select[0].length == 1) {
            select[0].selectedIndex = 0;
            return;
        }
        if (select[0].length <= 2 && select[0].options[0].value == -1) {
            select[0].selectedIndex = 1;
            return;
        }
    }
};

Eventum.escapeSelector = function(selector)
{
    return selector.replace(/(\[|\])/g, '\\$1')
};

Eventum.getField = function(name_or_obj, form)
{
    if ($.type(name_or_obj) == 'string') {
        if (form) {
            return form.find('[name="' + name_or_obj + '"]');
        } else {
            return $('[name="' + name_or_obj + '"]')
        }
    }
    return name_or_obj;
};

Eventum.getOpenerPageElement = function(id)
{
    return window.opener.$('#' + id);
};

Eventum.toggleCheckAll = function(field_name)
{
    var fields = Eventum.getField(field_name).not(':disabled');
    fields.prop('checked', !fields.prop('checked'));
};

Eventum.clearSelectedOptions = function(field)
{
    field = Eventum.getField(field);
    field.val('');
};

Eventum.selectOption = function(field, new_values)
{
    // adds the specified values to the list of select options

    field = Eventum.getField(field);

    var values = field.val();

    if (!jQuery.isArray(values)) {
        field.val(new_values);
    } else {
        if (values == null) {
            values = [];
        }
        values.push(new_values);
        field.val(values);
    }
};

Eventum.removeOptionByValue = function(field, value)
{
    field = Eventum.getField(field);
    for (var i = 0; i < field[0].options.length; i++) {
        if (field[0].options[i].value == value) {
            field[0].options[i] = null;
        }
    }
};

Eventum.selectAllOptions = function(field)
{
    Eventum.getField(field).find('option').each(function() { this.selected = true; });
};

Eventum.addOptions = function(field, options)
{
    field = Eventum.getField(field);
    $.each(options, function(index, value) {
        var option = new Option(value.text, value.value);
        if (!Eventum.optionExists(field, option)) {
            field.append(option);
        }
    });
};

Eventum.optionExists = function(field, option)
{
    field = Eventum.getField(field);
    option = $(option);
    if (field.find('option[value="' + Eventum.escapeSelector(option.val()) + '"]').length > 0) {
        return true;
    }
    return false;
};

Eventum.removeAllOptions = function(field)
{
    field = Eventum.getField(field);
    field.html('');
};

Eventum.replaceParam = function(str, param, new_value)
{
    if (str.indexOf("?") == -1) {
        return param + "=" + new_value;
    } else {
        var pieces = str.split("?");
        var params = pieces[1].split("&");
        var new_params = [];
        for (var i = 0; i < params.length; i++) {
            if (params[i].indexOf(param + "=") == 0) {
                params[i] = param + "=" + new_value;
            }
            new_params[i] = params[i];
        }
        // check if the parameter doesn't exist on the URL
        if ((str.indexOf("?" + param + "=") == -1) && (str.indexOf("&" + param + "=") == -1)) {
            new_params[new_params.length] = param + "=" + new_value;
        }
        return new_params.join("&");
    }
};

Eventum.handleClose = function()
{
    if (Eventum.checkClose == true) {
        return Eventum.closeConfirmMessage;
    }
};

Eventum.checkWindowClose = function(msg)
{
    if (!msg) {
        Eventum.checkClose = false;
    } else {
        Eventum.checkClose = true;
        Eventum.closeConfirmMessage = msg;
    }
};

Eventum.updateTimeFields = function(f, year_field, month_field, day_field, hour_field, minute_field, date)
{
    function padDateValue(str)
    {
        str = new String(str);
        if (str.length == 1) {
            str = '0' + str;
        }
        return str + '';// hack to make this a string
    }
    if (typeof date == 'undefined') {
        date = new Date();
    }
    Eventum.selectOption(month_field, padDateValue(date.getMonth()+1));
    Eventum.selectOption(day_field, padDateValue(date.getDate()));
    Eventum.selectOption(year_field, date.getFullYear());
    Eventum.selectOption(hour_field, padDateValue(date.getHours()));
    // minutes need special case due the 5 minute granularity
    var minutes = Math.floor(date.getMinutes() / 5) * 5;
    Eventum.selectOption(minute_field, padDateValue(minutes));
};

Eventum.setupShowSelections = function(select_box)
{
    select_box.change(Eventum.showSelections);
    select_box.change();
};

Eventum.showSelections = function(e)
{
        var select_box = $(e.target);
        var selected = [];
        if (select_box.val() != null) {
            $.each(select_box.val(), function(index, value) {
                selected.push(select_box.find("option[value='" + value + "']").text());
            });
        }

        var display_div = $('#selection_' + select_box.attr('id'));
        display_div.text("Current Selection: " +select_box.children(':selected').map(function(){
            return this.text
        }).get().join(", "));
};

Eventum.changeVisibility = function(dom_id, visibility)
{
    $('#' + dom_id).toggle(visibility);
};

// Replace special characters MS uses for quotes with normal versions
Eventum.replaceSpecialCharacters = function(s)
{
    var newString = '';
    var thisChar;
    var charCode;
    for (var i = 0; i < s.length; i++) {
        thisChar = s.charAt(i);
        charCode = s.charCodeAt(i);
        if ((charCode == 8220) || (charCode == 8221)) {
            thisChar = '"';
        } else if (charCode == 8217) {
            thisChar = "'";
        } else if (charCode == 8230) {
            thisChar = "...";
        } else if (charCode == 8226) {
            thisChar = "*";
        } else if (charCode == 8211) {
            thisChar = "-";
        }
        newString = newString + thisChar;
    }
    return newString;
};

/**
 * Make javascript Date() object from datetime form selection.
 *
 * @param   {String}  name    Form element prefix for date.
 */
Eventum.makeDate = function(name) {
    var d = new Date();
    d.setFullYear(Eventum.getField(name + '[Year]').val());
    d.setMonth(Eventum.getField(name + '[Month]').val() - 1);
    d.setMonth(Eventum.getField(name + '[Month]').val() - 1, Eventum.getField(name + '[Day]').val());
    d.setHours(Eventum.getField(name + '[Hour]').val());
    d.setMinutes(Eventum.getField(name + '[Minute]').val());
    d.setSeconds(0);
    return d;
};

/**
 * @param   {Object}  f       Form object
 * @param   {int} type    The type of update occurring.
 *                          0 = Duration was updated.
 *                          1 = Start time was updated.
 *                          2 = End time was updated.
 *                          11 = Start time refresh icon was clicked.
 *                          12 = End time refresh icon was clicked.
 * @param {String} element Name of the element changed
 */
Eventum.calcDateDiff = function(f, type, element)
{
    var duration = Eventum.getField('time_spent').val();
    // enforce 5 minute granularity.
    duration = Math.floor(duration / 5) * 5;

    var d1 = Eventum.makeDate('date');
    var d2 = Eventum.makeDate('date2');

    var minute = 1000 * 60;
    /*
    - if time is adjusted, duration is calculated,
    - if duration is adjusted, the end time is adjusted,
    - clicking refresh icon on either icons will make that time current date
      and recalculate duration.
    */

    if (type == 0) { // duration
        d1.setTime(d2.getTime() - duration * minute);
    } else if (type == 1) { // start time
        if (element == 'date[Year]' || element == 'date[Month]' || element == 'date[Day]') {
            d2.setTime(d1.getTime() + duration * minute);
        } else {
            duration = (d2.getTime() - d1.getTime()) / minute;
        }
    } else if (type == 2) { // end time
        duration = (d2.getTime() - d1.getTime()) / minute;
    } else if (type == 11) { // refresh start time
        if (duration) {
            d2.setTime(d1.getTime() + duration * minute);
        } else {
            duration = (d2.getTime() - d1.getTime()) / minute;
        }
    } else if (type == 12) { // refresh end time
        if (duration) {
            d1.setTime(d2.getTime() - duration * minute);
        } else {
            duration = (d2.getTime() - d1.getTime()) / minute;
        }
    }

    /* refill form after calculation */
    Eventum.updateTimeFields(f, 'date[Year]', 'date[Month]', 'date[Day]', 'date[Hour]', 'date[Minute]', d1)
    Eventum.updateTimeFields(f, 'date2[Year]', 'date2[Month]', 'date2[Day]', 'date2[Hour]', 'date2[Minute]', d2)

    duration = parseInt(duration);
    if (duration > 0) {
        Eventum.getField('time_spent').val(duration);
    }
};

Eventum.changeClockStatus = function()
{
    window.location.href = Eventum.rel_url + 'clock_status.php?current_page=' + window.location.pathname;
    return false;
};

Eventum.openHelp = function(e)
{
    var $target = $(e.target);
    var topic = $target.closest('a.help').attr('data-topic');
    var width = 500;
    var height = 450;
    var w_offset = 30;
    var h_offset = 30;
    var location = 'top=' + h_offset + ',left=' + w_offset + ',';
    if (screen.width) {
        location = 'top=' + h_offset + ',left=' + (screen.width - (width + w_offset)) + ',';
    }
    var features = 'width=' + width + ',height=' + height + ',' + location + 'resizable=yes,scrollbars=yes,toolbar=no,location=no,menubar=no,status=no';
    var helpWin = window.open(Eventum.rel_url + 'help.php?topic=' + topic, '_help', features);
    helpWin.focus();

    return false;
};

Eventum.clearAutoSave = function(prefix)
{
    var i;
    var key;
    for (i = localStorage.length; i >= 0; i--)   {
        key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
            localStorage.removeItem(localStorage.key(i));
        }
    }
};
