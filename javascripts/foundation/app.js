;(function ($, window, undefined) {
  'use strict';

  var fee = 32;
  var periods = { "est": { day: "päeva", month: "kuud", year: "aastat"}, "rus": { day: "д.", month: "мес.", year: "лет"} };
  var penalty = 8;
  
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
  
  

  		
  		$(".fee").html(fee);
  		$(".penalty").html(penalty);
  		
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
	  	$(".amountminusfee").html(Math.round(amount-fee));
	  	$(".reversediscount").html( Math.round( (totalsum / (amount-fee)) * 100 ) - 100 );
	  	
	  	var apr = calculateAPRmagic (amount, fee, annuity, payments);
	  	
	  	$(".apr").html(Math.round(apr*100, 2));
	  	
	  };
  

  
  
  $(document).ready(function() {
    
	$(".amount-slider").slider({
		range: "min",
		min: 200,
		max: 4000,
		step: 50,
		value: 500,
		slide: function(event, ui) {
		 // $("#sum").html(ui.value);
		 $.fn.loanCalc (ui.value, parseInt ($(".period-slider").slider("value")), parseInt ($(".interest-slider").slider("value"))  );
		}
	});
	
	$(".period-slider").slider({
		range: "min",
		min: 30,
		max: 360,
		step: 30,
		value: 60,
		slide: function(event, ui) {
		 // $("#sum").html(ui.value);
		  
		 $.fn.loanCalc ( parseInt ($(".amount-slider").slider("value")), ui.value, parseInt ($(".interest-slider").slider("value")) );
		}
	});
	
	$(".interest-slider").slider({
		range: "min",
		min: 13,
		max: 26,
		step: 0.5,
		value: 19,
		slide: function(event, ui) {
		 $.fn.loanCalc ( parseInt ($(".amount-slider").slider("value")), parseInt ($(".period-slider").slider("value")), ui.value);
		}
	});
	
	$.fn.loanCalc ( parseInt ($(".amount-slider").slider("value")), parseInt ($(".period-slider").slider("value")), parseInt ($(".interest-slider").slider("value")) );
    
  });  
  
  
    $.fn.foundationTabs = function (options) {
    
    var settings = $.extend({
      callback: $.noop
    }, options);

    var activateTab = function ($tab) {
     
    
      var rates = { "#tab1": { rate: { min: 13, max: 26, avg: 19 }, name: { est: "krediidkaart", rus: "кредитная карточка" },
      						term: { min: 30, max: 360, avg: 60, step: 30 },
      						amount: { min: 200, max: 4000, avg: 500 },
      						fee: 10 },
      			  "#tab2": { rate: { min: 14, max: 25, avg: 19 }, name: { est: "järelmaks", rus: "кредит в рассрочку" },
      			  			term: { min: 120, max: 1440, avg: 240, step: 30 },
      						amount: { min: 120, max: 10000, avg: 800 },
      						fee: 17 },
      			  "#tab3": { rate: { min: 2, max: 6, avg: 3 }, name: { est: "kodulaen", rus: "жилищный кредит" },
      			  			term: { min: 1440, max: 14400, avg: 3600, step: 360 },
      						amount: { min: 1900, max: 200000, avg: 50000 },
      						fee: 64 },
      			  "#tab4": { rate: { min: 5.5, max: 12, avg: 6 }, name: { est: "autoliising", rus: "лизинг автомобилей"  },
      			  			term: { min: 360, max: 2160, avg: 1440, step: 30 },
      						amount: { min: 3000, max: 100000, avg: 10000 },
      						fee: 175 },
      			  "#tab5": { rate: { min: 13, max: 26, avg: 19 }, name: { est: "väikelaen", rus: "потребительский кредит" },
      			  			term: { min: 30, max: 360, avg: 60, step: 30 },
      						amount: { min: 320, max: 10000, avg: 1000 },
      						fee: 32 },
      			  "#tab6": { rate: { min: 14, max: 25, avg: 19 }, name: { est: "arvelduslaen", rus: "расчетный кредит" },
      			  			term: { min: 30, max: 360, avg: 60, step: 30 },
      						amount: { min: 190, max: 2000, avg: 500 },
      						fee: 6 },
      			  "#tab7": { rate: { min: 112, max: 245, avg: 146 }, name: { est: "kiirlaen", rus: "быстрый кредит" },
      			  			term: { min: 30, max: 360, avg: 60, step: 30 },
      						amount: { min: 50, max: 2000, avg: 130 },
      						fee: 35 }
      			  };

    
      var $activeTab = $tab.closest('dl, ul').find('.active'),
          target = $tab.children('a').attr("href"),
          hasHash = /^#/.test(target),
          contentLocation = '';
       
      //alert(rates[target]["avg"]);
      
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

      
      $.fn.loanCalc ( parseInt ($(".amount-slider").slider("value")), parseInt ($(".period-slider").slider("value")), parseInt ($(".interest-slider").slider("value")) );

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
    $.fn.foundationButtons          ? $doc.foundationButtons() : null;
    $.fn.foundationTabs             ? $doc.foundationTabs({callback : $.foundation.customForms.appendCustomMarkup}) : null;
    $.fn.foundationTooltips         ? $doc.foundationTooltips() : null;
    $.fn.foundationClearing         ? $doc.foundationClearing() : null;

    $('input, textarea').placeholder();
  });

  // UNCOMMENT THE LINE YOU WANT BELOW IF YOU WANT IE8 SUPPORT AND ARE USING .block-grids
  // $('.block-grid.two-up>li:nth-child(2n+1)').css({clear: 'both'});
  // $('.block-grid.three-up>li:nth-child(3n+1)').css({clear: 'both'});
  // $('.block-grid.four-up>li:nth-child(4n+1)').css({clear: 'both'});
  // $('.block-grid.five-up>li:nth-child(5n+1)').css({clear: 'both'});

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