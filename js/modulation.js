$(function(){
	$("body").css("height",$(document).outerHeight()- $(".head").outerHeight());

	var boxerHeight = $(".boxer").outerHeight();
	var infoHeight = $(".info").outerHeight();
	var titleHeight = $(".title").outerHeight();
	var detailHeight = $(".detail").outerHeight();

	$("#page1").css({
		"z-index":200,
		"opacity":1
	});


	$("#page2").css({
		"z-index":100,
		"opacity":0
	});

	$("#page1").hammer()
	.on("swipeup",function(){
		
		$("#page2").css({
			"z-index":"200",
			"opacity":1
		});

		$(".title,.detail").css("height",0);

		$(".title").animate({
			"height":infoHeight
		},500,function(){
			$(".detail").animate({
				"height":boxerHeight
			},500,function(){
				$("#page1").css({
					"z-index":100,
					"opacity":0
				});
			});
		});


	});


});