$(function(){

	$("div.icon > div").addClass("animated");
	var enterArea;
	var $trash = $("#trash");
	var trashRange = {
		x1:$trash.position().left,
		x2:$trash.position().left + $trash.outerWidth(),
		y1:$trash.position().top,
		y2:$trash.position().top + $trash.outerHeight()
	};

	var $application = $("#application");
	var applicationRange = {
		x1:$application.position().left,
		x2:$application.position().left + $application.outerWidth(),
		y1:$application.position().top,
		y2:$application.position().top + $application.outerHeight()
	};

	var $dropper = $("#dropper");
	var dropperRange = {
		x1:$dropper.position().left,
		x2:$dropper.position().left + $dropper.outerWidth(),
		y1:$dropper.position().top,
		y2:$dropper.position().top + $dropper.outerHeight()
	};

	var moveOptions = {
		moveObj :"",
		moveX : 0,//横向移动距离
		moveY : 0,//纵向移动距离
		transform : "",//
		zIndex : 0,//层次
		duration : 0,//动画时间
		isHolded: false,
		isMoved : false//是否发生移动
	};

	var items = $(".item").hammer({
		drag_min_distance:0
	});

	items.each(function(index,ele){
		var item = $(ele);
		item.on("tap",function(){
			$(this).removeClass("shake");
		})
		.on("touch", function(ev) {
			touchCallback(item);
		})
		.on("release", function(ev) {
			releaseCallback(item,ev);
		})
		.on("hold",function(ev_hd){
			holdCallback(item);
			var pointerDiffX = -(item.position().left + 330 / 2 - ev_hd.gesture.touches[0].pageX).toFixed();
			var pointerDiffY = -(item.position().top + 90 - ev_hd.gesture.touches[0].pageY).toFixed();

			moveOptions.moveObj = item;
			moveOptions.isMoved = true;
			moveOptions.transform = "translate3d(" + pointerDiffX +"px," + pointerDiffY + "px, 0)";
			moveOptions.zIndex = 502;
			moveOptions.duration = "300ms";
			updateElementTransform(item);

			$(item).on("drag", function (ev) {
				dragCallback(item,ev,pointerDiffX,pointerDiffY);
	    });
		});
	});

	$("#close").hammer().on("tap",function(){
		hideModal();
		releaseScreen();
	});

	$(".keys span").hammer()
	.on("touch", function(ev) {
		$(this).attr("hold",true);
	})
	.on("release", function(ev) {
		$(this).removeAttr("hold");

		var value = $("#screen").text().trim();
		if(ev.target.id == "clear"){
			if(value.length != 0){
				value = value.substring(0,value.length-1);
				$("#screen").text(value);
				value = $("#screen").text().trim();
				if(value.length < 5){
					$("#confirm").hide();
				}
			}
		}else{
			$("#screen").append($(this).attr("value"));
			value = $("#screen").text().trim();
			if(value.length >= 5){
				$("#confirm").show();
			}else{
				$("#confirm").hide();
			}
		}

	});

	//确认
	$("#confirm").hammer()
	.on("touch", function(ev) {
		$(this).addClass("active");
	})
	.on("release", function(ev) {
		$(this).removeClass("active");
		valid();
	});

	function touchCallback(obj){
		$(obj).attr({"hold" : true,"style":""}).removeClass("shake");
		moveOptions.moveX = 0;
		moveOptions.moveY = 0;
		moveOptions.isMoved = false;
		moveOptions.isHolded = false;
	};

	//手指释放事件
	function releaseCallback(obj,ev){
		$(obj).removeAttr("hold").off("drag");

		releaseScreen();

		if(moveOptions.isMoved){
			if(checkArea(ev)!=null && checkArea(ev)!=""){
				$("#screen").text("");
				$("#confirm").hide();
				showModal();
				freezeScreen();
			}

			moveOptions.transform = "";
			moveOptions.zIndex = 0;
			moveOptions.duration = "500ms";
			updateElementTransform(obj);
			//晃动效果
			setTimeout(function(){
				$(obj).addClass("shake");
			},500);
		}
		$(obj).removeClass("holding");

		if(moveOptions.isHolded){
			if($("#trash").hasClass("fadeInLeft")){
				$("#trash").removeClass("fadeInLeft").addClass("fadeOutLeft");
			}
			if($("#application").hasClass("fadeInLeft")){
				$("#application").removeClass("fadeInLeft").addClass("fadeOutLeft");
			}
			if($("#dropper").hasClass("fadeInRight")){
				$("#dropper").removeClass("fadeInRight").addClass("fadeOutRight");
			}
		}

	};

	//
	function holdCallback(obj){
		if($(obj).hasClass("no-glue")){
			$("#application").removeClass("fadeOutLeft").addClass("fadeInLeft");
		}else if($(obj).hasClass("over-shelf-life")){//过期
			$("#trash,#application").removeClass("fadeOutLeft").addClass("fadeInLeft");
		}else{
			$("#trash,#application").removeClass("fadeOutLeft").addClass("fadeInLeft");
			$("#dropper").removeClass("fadeOutRight").addClass("fadeInRight");
		}

		// 清除进入区域效果
		$(".icon_dragenter").removeClass("icon_dragenter");		

		moveOptions.isHolded = true;

		freezeScreen();

		// 移动中特效
		var $obj = $(obj);
		$obj.addClass("holding");
	};

	function dragCallback(obj,ev,pointerDiffX,pointerDiffY){
		moveOptions.moveX = (ev.gesture.deltaX + pointerDiffX).toFixed();//横向拖动距离
		moveOptions.moveY = (ev.gesture.deltaY + pointerDiffY).toFixed();//垂直拖动距离
 		
 		//发生拖拽
		if(moveOptions.moveX!=0 || moveOptions.moveY!=0){
			moveOptions.moveObj = obj;
			moveOptions.isMoved = true;
			moveOptions.transform = "translate3d(" + moveOptions.moveX +"px," + moveOptions.moveY + "px, 0)";
			moveOptions.zIndex = 502;
			moveOptions.duration = "0s";
			updateElementTransform(obj);
		}

		var area = checkArea(ev);
		if (area) {
			$("#" + area).addClass("icon_dragenter");
		} else {
			$(".icon_dragenter").removeClass("icon_dragenter");
		}
	};

	function updateElementTransform(obj){
 		$(obj).css({
			"transition-duration":moveOptions.duration,
    		"transform":moveOptions.transform,
    		"z-index": moveOptions.zIndex
    	});
	};

	function checkArea(ev){
		var pageX = ev.gesture.center.pageX;
		var pageY = ev.gesture.center.pageY;
		
		if($("#trash").hasClass("fadeInLeft") &&
			(pageX >= trashRange.x1 && pageX <= trashRange.x2) && 
			(pageY >= trashRange.y1 && pageY <= trashRange.y2)){
			enterArea = "trash";
		}else if($("#application").hasClass("fadeInLeft") &&
			(pageX >= applicationRange.x1 && pageX <= applicationRange.x2) && 
			(pageY >= applicationRange.y1 && pageY <= applicationRange.y2)){
			enterArea = "application";
		}else if($("#dropper").hasClass("fadeInRight") &&
			(pageX >= dropperRange.x1 && pageX <= dropperRange.x2) && 
			(pageY >= dropperRange.y1 && pageY <= dropperRange.y2)){
			enterArea = "dropper";
		}else{
			enterArea = "";
		}
		return enterArea;
	}

	//删除
	function del(obj){
		//待处理
	};

	//申请
	function application(obj){
		//待处理
		//$(obj).removeClass("no-glue");
		//$(obj).find(".item-stauts").append('<div class="inuse">申请中</div>');
	};

	//领用
	function use(obj){
		//待处理
		//$(obj).find(".item-stauts").append('<div class="section">翻修2课 分解工程领用中</div>');
	};

	function valid(){
		if(enterArea == "trash"){
			del(moveOptions.moveObj);
		}else if(enterArea == "application"){
			application(moveOptions.moveObj);
		}else if(enterArea == "dropper"){
			use(moveOptions.moveObj);
		}

		hideModal();
		releaseScreen();
		
	}

	function freezeScreen(){
		//手指拖动禁止屏幕滚动
		$("body").bind('touchmove', function (event) {
			event.preventDefault();
		});
		$(".container").addClass("unevent");
	}

	function releaseScreen(){
		$("body").unbind('touchmove');
		$(".container").removeClass("unevent");
	}

	function showModal(){
		$(".modal").removeClass("fadeOutUp").addClass("fadeInUp");
	}

	function hideModal(){
		$(".modal").removeClass("fadeInUp").addClass("fadeOutUp");
	}

});