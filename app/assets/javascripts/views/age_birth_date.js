//Hook up the corresponding event to auto calculate the age and date of birth.
//For example if there a field named child_age and there is the corresponding child_date_of_birth,
//they will update each other. Field that end on _age and _date_of_birth will be hook up the events.
_primero.Views.AutoCalculateAgeDOB = _primero.Views.Base.extend({
  el: '.page_content form:not(.incident-form)',

  events: {
    'change input[id$="_date_of_birth"]': 'update_age',
    'change input[id$="_age"]': 'update_date'
  },

  initialize: function() {
    var context = this.el;
    var $context_element = $(context);
    //Find every date_of_birth field in order to update the age that there is a change to be wrong
    //according the current year.
    $context_element.find("input[id$='_date_of_birth']").each(function(x, date_of_birth_el){
      var $date_of_birth_el = $(date_of_birth_el);
      var date_of_birth_name = $date_of_birth_el.attr("name");
      var date_of_birth_value = $date_of_birth_el.val();
      if (date_of_birth_value != "") {
        var age_name = date_of_birth_name.replace(/date_of_birth\]$/, "age]");
        $context_element.find("input[name='" + age_name + "']").each(function(x, age_el){
          try {
            var date_of_birth_date = $.datepicker.parseDate($.datepicker.defaultDateFormat, date_of_birth_value);
            var current_moment_date = moment(new Date);
            var date_of_birth_moment_date = moment(date_of_birth_date);
            var age = current_moment_date.diff(date_of_birth_moment_date, "years");
            if (age >= 0) {
              $(age_el).val(age);
            }
          } catch (e) {
            console.error("Has ocurred an error during re-calculate of age. " + e);
          }
        });
      }
    });

    this.update_child_fields();
  },

  //This method will be called when the age field was changed.
  update_date: function(event) {
    event.preventDefault();
    var $age_field = $(event.target);
    //Find the corresponding birth date field related to the age field.
    var date_of_birth_name = $age_field[0].getAttribute("name").replace(/age\]$/, "date_of_birth]")
    var $date_of_birth_field = $(this.el).find("input[name='" + date_of_birth_name + "']");

    if ($date_of_birth_field.length > 0) {
      if (isNaN($age_field.val()) || $age_field.val() < 0) {
        $date_of_birth_field.val("");
      } else {
        if (!$date_of_birth_field.hasClass("hasDatepicker")) {
          $.datepicker.initialize_datepicker($date_of_birth_field);
        }
        var date_format = $date_of_birth_field.datepicker("option", "dateFormat");
        var year_of_birth = (new Date).getFullYear() - $age_field.val();
        var date_of_birth = $.datepicker.formatDate(date_format, $.datepicker.parseDate($.datepicker.defaultDateFormat, '01-Jan-' + year_of_birth));
        $date_of_birth_field.val(date_of_birth);
      }
    }

    this.update_child_fields();
  },

  //This method will be called when the birth of date was changed.
  update_age: function(event) {
    event.preventDefault();
    var $date_of_birth_field = $(event.target);
    //Find the corresponding age field related to the birth date field changed.
    var age_name = $date_of_birth_field[0].getAttribute("name").replace(/date_of_birth\]$/, "age]")
    var $age_field = $(this.el).find("input[name='" + age_name + "']");

    if ($age_field.length > 0) {
      try {
          var date_format = $date_of_birth_field.datepicker("option", "dateFormat");
          var date_of_birth = $.datepicker.parseDate(date_format, $date_of_birth_field.val());
          var current_moment_date = moment(new Date);
          var date_of_birth_moment_date = moment(date_of_birth);
          var age = current_moment_date.diff(date_of_birth_moment_date, "years");
          if (age >= 0) {
            $age_field.val(age);
          } else {
            $age_field.val("");
          }
      } catch (e) {
        $age_field.val("");
        console.error("Has ocurred an error during auto calculate of age. " + e);
      }
    }

    this.update_child_fields();
  },

  update_child_fields: function() {
    var dob = $('input[id$="_date_of_birth"]').val() || $('.key.date_of_birth').parents('.row:first').find('.value').text(),
        $field_tag_inputs = $('[data-field-tags]:not([data-field-tags="[]"])'),
        fields = [];

    _.each($field_tag_inputs, function(field) {
      if (_.contains($(field).data('field-tags'), 'child')) {
        var child_field = $(field).parents('.row:first');
        _primero.is_under_18(dob) ? child_field.show() : child_field.hide();
      }
    });
  }
});