// @codekit-prepend "jquery.foundation.forms.js";
// @codekit-prepend "jquery.foundation.tooltips.js";

;(function ($, window, undefined) {
  'use strict';

	var rates = { "#tab1": { rate: { min: 12, max: 22, avg: 18 }, name: { est: "krediidkaart", rus: "кредитная карточка" },
							term: { min: 30, max: 360, avg: 60, step: 30 },
							amount: { min: 200, max: 4000, avg: 500 },
							fee: { min: 10, max: 10, rate: 0 },
							penalty: { fee: 3, rate: { est: "8% aastas", rus: "8% в год" } } },
				  "#tab2": { rate: { min: 14, max: 25, avg: 19 }, name: { est: "järelmaks", rus: "кредит в рассрочку" },
				  			term: { min: 120, max: 1440, avg: 240, step: 30 },
							amount: { min: 120, max: 10000, avg: 800 },
							fee: { min: 17, max: 17, rate: 0 },
							penalty: { fee: 16, rate: { est: "8% aastas", rus: "8% в год" } } },
				  "#tab3": { rate: { min: 2, max: 6, avg: 3.5 }, name: { est: "kodulaen", rus: "жилищный кредит" },
				  			term: { min: 1440, max: 14400, avg: 3600, step: 360 },
							amount: { min: 1900, max: 200000, avg: 50000 },
							fee: { min: 64, max: 192, rate: 0.01 },
							penalty: { fee: 8, rate: { est: "8% aastas", rus: "8% в год" } } },
				  "#tab4": { rate: { min: 5.5, max: 12, avg: 6 }, name: { est: "autoliising", rus: "лизинг автомобилей"  },
				  			term: { min: 360, max: 2160, avg: 1440, step: 30 },
							amount: { min: 3000, max: 100000, avg: 10000 },
							fee: { min: 175, max: 9999999, rate: 0.01 },
							penalty: { fee: 8, rate: { est: "8% aastas", rus: "8% в год" } } },
				  "#tab5": { rate: { min: 13, max: 26, avg: 19 }, name: { est: "väikelaen", rus: "потребительский кредит" },
				  			term: { min: 30, max: 1800, avg: 60, step: 30 },
							amount: { min: 320, max: 10000, avg: 1000 },
							fee: { min: 32, max: 9999999, rate: 0.015 },
							penalty: { fee: 8, rate: { est: "8% aastas", rus: "8% в год" } } },
				  "#tab6": { rate: { min: 14, max: 25, avg: 19 }, name: { est: "arvelduslaen", rus: "расчетный кредит" },
				  			term: { min: 30, max: 360, avg: 60, step: 30 },
							amount: { min: 190, max: 2000, avg: 500 },
							fee: { min: 6, max: 9999999, rate: 0.01 },
							penalty: { fee: 3, rate: { est: "8% aastas", rus: "8% в год" } } },
				  "#tab7": { rate: { min: 112, max: 245, avg: 146 }, name: { est: "kiirlaen", rus: "быстрый кредит" },
				  			term: { min: 30, max: 360, avg: 60, step: 30 },
							amount: { min: 50, max: 1500, avg: 130 },
							fee: { min: 0, max: 9999999, rate: 0.35 },
							penalty: { fee: 20, rate: { est: "0,75% päevas", rus: "0,75% в день" } } }
				  };

  var fee = rates["#tab1"]["fee"]; // { min: 10, max: 10, rate: 0 };
  var penalty = rates["#tab1"]["penalty"]; // { fee: 3, rate: { est: "8% aastas", rus: "8% в год" } };

  var periods = { "est": { day: "päeva", month: "kuud", year: "aastat"}, "rus": { day: "д.", month: "мес.", year: "лет"} };

  // 'improve' Math.round() to support a second argument http://stackoverflow.com/a/10453009
  var _round = Math.round;
  Math.round = function(number, decimals /* optional, default 0 */)
	{
	  if (arguments.length == 1)
	    return _round(number);

	  var multiplier = Math.pow(10, decimals);
	  return _round(number * multiplier) / multiplier;
	}

  function calculateAPRmagic(loanamount, fee, annuity, numpayments) {

  	/* from http://brian-stewart.orpheusweb.co.uk/credit/javascript/equalapr.htm */

	var p=loanamount;
	var i=fee;
	var a=annuity;
	var n=numpayments;
	var f=0;

	//Isaac's magic ...
	var x=1.0001; var fx=0; var dx=0; var z=0;

	do {
		fx=i+a*(Math.pow(x,n+1)-x)/(x-1)+f*Math.pow(x,n)-p;
		dx=a*(n*Math.pow(x,n+1)-(n+1)*Math.pow(x,n)+1)/Math.pow(x-1,2)+n*f*Math.pow(x,n-1);
		z=fx/dx; x=x-z;
	} while (Math.abs(z)>1e-9);

	var r = (Math.pow(1/x,12)-1);

	return r;
  }


  $.fn.loanCalc = function (amount, period, interest) {

  		var currentFee = amount * fee["rate"];
  		if ( currentFee < fee["min"] ) { currentFee = fee["min"]; }
  		if ( currentFee > fee["max"] ) { currentFee = fee["max"]; }


  		$(".fee").html(Math.round(currentFee));
  		$(".penalty").html(penalty["rate"][lang]);
  		$(".penalty-fee").html(penalty["fee"]);

	  	$(".sum").html(amount);

	  	if (period < 60) {
	  		$(".time").html( Math.round(period, 1) + " " + periods[lang]["day"]);
	  	} else if (period < 720) {
		  	$(".time").html( Math.round(period/30, 1) + " " + periods[lang]["month"] );
	  	} else {
		  	$(".time").html( Math.round(period/30/12, 1) + " " + periods[lang]["year"] );
	  	}

	  	$(".payments").html( Math.round(period/30, 1) );

	  	$(".interest").html(interest);

	  	var rate = interest / 100;
	  	var monthlyRate = rate / 12;
	  	var payments = Math.round(period/30);
		var annuity = ((amount) * monthlyRate * Math.pow(1+monthlyRate,payments)) / (Math.pow(1+monthlyRate, payments)-1);
		var totalsum = annuity * (period/30);
		var totalinterest = totalsum - amount;

	  	$(".annuity").html(Math.round(annuity));
	  	$(".totalsum").html(Math.round(totalsum));
	  	$(".totalinterest").html(Math.round(totalinterest));
	  	$(".amountminusfee").html(Math.round(amount-currentFee));
	  	$(".reversediscount").html( Math.round( (totalsum / (amount-currentFee)) * 100 ) - 100 );

	  	var apr = calculateAPRmagic (amount, currentFee, annuity, payments);

	  	$(".apr").html(Math.round(apr*100, 2));

	  };

  $(document).ready(function() {

	$(".amount-slider").slider({
		range: "min",
		min: rates["#tab1"]["amount"]["min"],
		max: rates["#tab1"]["amount"]["step"],
		step: 50,
		value: rates["#tab1"]["amount"]["avg"],
		slide: function(event, ui) {
		 $.fn.loanCalc (ui.value, parseInt ($(".period-slider").slider("value")), parseFloat ($(".interest-slider").slider("value"))  );
		}
	});

	$(".period-slider").slider({
		range: "min",
		min: rates["#tab1"]["term"]["min"],
		max: rates["#tab1"]["term"]["max"],
		step: rates["#tab1"]["term"]["step"],
		value: rates["#tab1"]["term"]["avg"],
		slide: function(event, ui) {
		 $.fn.loanCalc ( parseInt ($(".amount-slider").slider("value")), ui.value, parseFloat ($(".interest-slider").slider("value")) );
		}
	});

	$(".interest-slider").slider({
		range: "min",
		min: rates["#tab1"]["rate"]["min"],
		max: rates["#tab1"]["rate"]["max"],
		step: 0.5,
		value: rates["#tab1"]["rate"]["avg"],
		slide: function(event, ui) {
		 $.fn.loanCalc ( parseInt ($(".amount-slider").slider("value")), parseInt ($(".period-slider").slider("value")), ui.value);
		}
	});

	$.fn.loanCalc ( parseInt ($(".amount-slider").slider("value")), parseInt ($(".period-slider").slider("value")), parseFloat ($(".interest-slider").slider("value")) );

  });


    $.fn.foundationTabs = function (options) {

    var settings = $.extend({
      callback: $.noop
    }, options);

    var activateTab = function ($tab) {

      var $activeTab = $tab.closest('dl, ul').find('.active'),
          target = $tab.children('a').attr("href"),
          hasHash = /^#/.test(target),
          contentLocation = '';

      $(".interest-slider").slider( "option", "min", rates[target]["rate"]["min"] );
      $(".interest-slider").slider( "option", "max", rates[target]["rate"]["max"] );
      $(".interest-slider").slider( "option", "value", rates[target]["rate"]["avg"] );

      $(".period-slider").slider( "option", "min", rates[target]["term"]["min"] );
      $(".period-slider").slider( "option", "max", rates[target]["term"]["max"] );
      $(".period-slider").slider( "option", "value", rates[target]["term"]["avg"] );
      $(".period-slider").slider( "option", "step", rates[target]["term"]["step"] );

      $(".amount-slider").slider( "option", "min", rates[target]["amount"]["min"] );
      $(".amount-slider").slider( "option", "max", rates[target]["amount"]["max"] );
      $(".amount-slider").slider( "option", "value", rates[target]["amount"]["avg"] );

      $(".loantype").html(rates[target]["name"][lang]);

      fee = rates[target]["fee"];
      penalty = rates[target]["penalty"];

      $.fn.loanCalc ( parseInt ($(".amount-slider").slider("value")), parseInt ($(".period-slider").slider("value")), parseFloat ($(".interest-slider").slider("value")) );

      if (hasHash) {
        contentLocation = target + 'Tab';

        // Strip off the current url that IE adds
        contentLocation = contentLocation.replace(/^.+#/, '#');

        //Show Tab Content
        $(contentLocation).closest('.tabs-content').children('li').removeClass('active').hide();
        $(contentLocation).css('display', 'block').addClass('active');
      }

      //Make Tab Active
      $activeTab.removeClass('active');
      $tab.addClass('active');
    };

    $(document).on('click.fndtn', '.tabs a', function (event){
      activateTab($(this).parent('dd, li'));
    });

    if (window.location.hash) {
      activateTab($('a[href="' + window.location.hash + '"]').parent('dd, li'));
      settings.callback();
    }

  };

  var $doc = $(document),
      Modernizr = window.Modernizr;

  $(document).ready(function() {
    $.fn.foundationTabs             ? $doc.foundationTabs({callback : $.foundation.customForms.appendCustomMarkup}) : null;
    $.fn.foundationTooltips         ? $doc.foundationTooltips() : null;
    $.fn.foundationClearing         ? $doc.foundationClearing() : null;
  });

  // Hide address bar on mobile devices (except if #hash present, so we don't mess up deep linking).
  if (Modernizr.touch && !window.location.hash) {
    $(window).load(function () {
      setTimeout(function () {
        window.scrollTo(0, 1);
      }, 0);
    });
  }

// fix for flash player z-index

$('iframe').each(function() {
  var url = $(this).attr("src");
  if ($(this).attr("src").indexOf("?") > 0) {
    $(this).attr({
      "src" : url + "&wmode=transparent",
      "wmode" : "Opaque"
    });
  }
  else {
    $(this).attr({
      "src" : url + "?wmode=transparent",
      "wmode" : "Opaque"
    });
  }
});


})(jQuery, this);

// uservoice

/*
  var uvOptions = {};
  (function() {
    var uv = document.createElement('script'); uv.type = 'text/javascript'; uv.async = true;
    uv.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'widget.uservoice.com/YnVsGWDq3Xw9Ki78vbJGw.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(uv, s);
  })();

*/