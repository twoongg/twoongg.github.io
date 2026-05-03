$(function () {
	
	//header
	$(window).scroll(function () {
		var scrollTop = $(window).scrollTop();
		var $header = $('.header');
		var hedaerTop = $header.height();
		if (scrollTop >= hedaerTop) {
			$header.addClass('fixed');
		} else {
			$header.removeClass('fixed');
		}
	});

	$(window).on('load resize', function () {

		resizeR();

		if( $('.header').hasClass('mobile') ){
			moFamily();
		}
	});

	//all menu
	$('.user_wrap .ico.menu').on('click', function () {

		if ($(this).hasClass('close')) {
			menuClose(wdSize);
		} else {
			menuOpen(wdSize);
		}
	});

	$('.all_menu .close_btn, .mobile_menu_bg').on('click', function () {
		menuClose(wdSize);
	});

	//user menu
	//$('.user_wrap .user').on('click', function () {
	//	$('.user_menu').show();
	//});
	$('html').on('click', function (e) {
		if (!$(e.target).hasClass('tip_btn')) {
			$('.tip_box').removeClass('open');
		}

	});


	var filter = "win16|win32|win64|macintel|mac|"; // PC일 경우
	if (navigator.platform) {
		if (filter.indexOf(navigator.platform.toLowerCase()) < 0) {
			//resizeR();
			//ie 예외처리
			$('.not_ie').hide();
		}
	}


	function resizeR() {
		wdSize = $(window).outerWidth();

		resizeBr(wdSize);
		initSwiper(wdSize);
	}

	//모바일 2차메뉴 이벤트
	$(document).on("click", ".all_menu_nav .menu_depth01 > li > a", function () {
		if (wdSize <= mbSize && $(this).siblings(".menu_depth02").find("li").length > 0) {
			$(this).siblings('.menu_depth02').slideToggle(300);
			$('.menu_list > li > a').not(this).siblings('.menu_depth02').slideUp(300);
			return false;
		}
	});

	//탭메뉴 공통
	$('.tab_wrap').each(function () {

		$(this).find('.tab_ul li:eq(0)').addClass('active');
		$(this).find('.tab_ul li').on('click', function () {

			var tabIndex = $(this).index();
			var $tabCon = $(this).parents('.tab_wrap').find('.tab_con').eq(tabIndex);

			$(this).addClass('active').siblings('li').removeClass('active');
			$tabCon.fadeIn().siblings('div').hide();

		});
	});

	$('.pop_mask').on('click', function () {
		popClose();
	});

	/** 툴팁 이벤트 **/
	$('.tip_btn').on('click', function () {
		$(this).parents('.tip_box').addClass('open');
	});

	//IE 예외처리 호출
	notUseIe();

	const myAudio = document.getElementById("mp3_player");
	/* BGM PLAY */
	$('.bgm_play_btn').on('click', function () {
		$(this).toggleClass('pause');

		if($(this).hasClass("pause")){
			myAudio.play();
		}else {
			myAudio.pause();
		}
	});

	setTimeout(function () {
		if ($("#Bgm_Auto_Use_YN").val() == "Y") {
			$(".bgm_play_btn").trigger("click");
		}
	}, 3200);

	//$('.search_input').on('focus', function () {
	//	$('.all_menu').css('display', 'block');
	//});

	$('.search_input').on('touchstart', function (event) {
		event.stopPropagation();
	});

	$('.toast_msg .btn_close').on('click', function () {
		$(this).parent().removeClass('on');
	});    

});



var mbSize = 800;
var wdSize;

var mySwiper = undefined;

function initSwiper(size) {
	try {
		if (size <= mbSize) {
			$('.header_nav').addClass('m_nav').removeClass('menu_nav');

			if (!mySwiper) {
				mySwiper = new Swiper(".m_nav", {
					slidesPerView: 'auto',
					initialSlide: 0,
					centeredSlides: false,
					slidesOffsetAfter: 24,
					slideToClickedSlide: false,
					loopAdditionalSlides: 0,
					grabCursor: false,
					observer: true,
					observeParents: true,
					resizeObserver: false,
					freeMode: false,
				});
			}
		} else {
			$('.header_nav').addClass('menu_nav').removeClass('m_nav');

			if (mySwiper) {
				mySwiper.destroy();
				mySwiper = undefined;
			}
		}
	} catch (e) {
		console.error("Swiper initialization error:", e);
	}
}

function resizeBr(size) {

	if (size > mbSize) {

		$('.header').removeClass('mobile fixed');
		$('.all_menu').css({ 'display': 'none', 'left': '0' });
		$('.mobile_menu_bg, .log_btn').hide();
		$('.ico.menu').removeClass('close');
		$('.menu_depth02').show();


	} else {

		$('.header').addClass('mobile fixed');
	}
}
//메뉴 열기 이벤트
function menuOpen(size) {

	if (size > mbSize) {
		$('.all_menu').stop().slideDown();

	} else {
		$('.mobile_menu_bg').fadeIn();
		$('.all_menu').css('display','block').animate({ 'left': '0' });
		$('.log_btn').animate({ 'left': '34px' });
		$('.ico.menu').addClass('close');

		//스크롤 방지
		scrollDisable();
	}
}
//메뉴 닫기 이벤트
function menuClose(size) {

	if (size > mbSize) {
		$('.all_menu').stop().slideUp();
	} else {
		$('.mobile_menu_bg').fadeOut();
		$('.all_menu, .log_btn').animate({ 'left': '-100%' });
		$('.ico.menu').removeClass('close');

		//스크롤 방지 해제
		scrollAble();
	}

}

//레이어 팝업 열기 이벤트

function layerPopOpen(popName) {
	var $popWrap = $('.'+popName);
	$popWrap.show();
}

function popOpen(popNum) {
	var $popWrap = $('.pop_wrap').eq(popNum);
	$popWrap.show();
}

//레이어 팝업 닫기 이벤트
function popClose() {
	$('.pop_wrap').hide();
}

//인사말 샘플 팝업
function samplePop(spVal) {
	var spUrl = ['../popup/pop_GreetingSearch01.html', '../popup/pop_GreetingSearch02.html'];
	var spTitle = '인사말 샘플 팝업';
	var spOptions = 'width=602px,height=680px,top=100px,left=200px,scrollbars=yes';

	window.open(spUrl[spVal], spTitle, spOptions);
}

//확대보기
function detailFull() {
	window.open("../popup/pop_detail.html");
}

//축의금 설정 팝업
function cgMoneyPop(cgVal) {
	var cgUrl = ['../manage/manage_cg_money_setting.html', '../manage/m_manage_cg_money_setting.html'];
	var cgTitle = '축의금 설정 팝업';

	window.open(cgUrl[cgVal], cgTitle);
}

function windowPopClose() {
	window.close();
}

function fileUpload() {
	var fUrl = 'https://www.barunsoncard.com/order/common/pop_Fileupload.asp?input_name=upfile1&index=&up_dir=cs&order_seq=';
	var fTitle = '파일 업로드';
	var fOptions = 'width=602px,height=680px,top=100px,left=200px,scrollbars=yes';
	window.open(fUrl, fTitle, fOptions);
}

//스크롤 방지 이벤트
function scrollDisable() {
	$('body').addClass('scroll_off').on('scroll touchmove mousewheel', function (e) {
		e.preventDefault();
	});
}
//스크롤 방지해제 이벤트
function scrollAble() {
	$('body').removeClass('scroll_off').off('scroll touchmove mousewheel');
}

//토스트 알림 기능
function toast(select, msg, timer) {
	//alert(msg);
	var selId = $(select).attr('id');
	var $elem = $("<p>" + msg + "</p>");

	if ($('#' + selId).is(":checked")) {

		$(".toast").html($elem).show();

		$elem.slideToggle(100, function () {
			setTimeout(function () {
				$elem.fadeOut(function () {
					$(this).remove();
					$('.toast ').css('bottom', '');
				});
			}, timer);
			return false;
		});

		$('.toast').stop().animate({ 'bottom': '5%' });

	}
}

function textEllipsis(target, textLength) {
	var $target = $(target);

	if ($target.length > 0) {

		$target.each(function () {
			var length = textLength; //표시할 글자 수 정하기

			$(this).each(function () {
				if ($(this).text().length >= length) {
					$(this).text($(this).text().substr(0, length) + '...'); //지정한 글자수 이후 표시할 텍스트 '...'
				}
			});
		});

	}

}

//IE 예외처리
function notUseIe() {
	var agent = navigator.userAgent.toLowerCase();
	if ((navigator.appName == 'Netscape' && agent.indexOf('trident') != -1) || (agent.indexOf("msie") != -1)) {
		// ie일 경우
		$('.not_ie').show();
	} else {
		// ie가 아닐 경우
		$('.not_ie').hide();
	}
}

function closeIe() {
	$('.not_ie').fadeOut();
}

//pc family site event
//function pcFamily(){
	
//	$('.family_wrap .family').on('mouseenter', function () {
//		$(this).addClass('on');
//	});
//	$('.family_list, .header').on('mouseleave', function () {
//		$('.family_wrap .family').removeClass('on');
//	});
//}
//mo family site event
function moFamily(){
	
	$('.family_wrap .family').on('click', function(){
		$(this).toggleClass('on');
	});
}

//비밀번호 변경 input 입력 시 비활성화 해제
$('#setInpPwd').keyup(function () {
	var pwdVal = $(this).val();
	if (pwdVal)  {
		$('#setPwd').attr('class', "btn type03");		
	} else {
		$('#setPwd').attr('class', "btn type00");
		$('#setPwd').attr('href', "javascript:;");
	} 
});

// 눈표시 클릭 시 패스워드 보이기
$('.pwd_eyes').click(function () {
	$('.pwd_box').toggleClass('active');

	if ($('.pwd_box').hasClass('active') == true) {
		$(this).find('.fa-eye').attr('class', "fas fa-eye-slash").parents('.pwd_box').find('.input_pwd').attr('type', "text");
		// i 클래스                // 텍스트 보이기 i 클래스
	}
	else {
		$(this).find('.fa-eye-slash').attr('class', "fas fa-eye").parents('.pwd_box').find('.input_pwd').attr('type', 'password');
	}
});
function audioEnded() {
	$(".bgm_play_btn").removeClass("pause");
}

//n초 뒤 토스트 팝업 숨김
function hideToastAfterDelay(selector, delay) {
	if ($(selector).hasClass("on")) {
		setTimeout(() => {
			$(selector).removeClass("on");
		}, delay);
	}
}

//공통 모바일 체크
function commonIsMobile() {
	var UserAgent = navigator.userAgent;
	if (UserAgent.match(/iPhone|iPod|Android|Windows CE|BlackBerry|Symbian|Windows Phone|webOS|Opera Mini|Opera Mobi|POLARIS|IEMobile|lgtelecom|nokia|SonyEricsson/i) != null || UserAgent.match(/LG|SAMSUNG|Samsung/) != null) {
		return true;
	} else {
		return false;
	}
}

//모바일에서는 토스트 팝업 자동 감춤
if (commonIsMobile()) {
	hideToastAfterDelay(".toast_msg", 5000);
}

function GoLogin() {
	location.href = "/member/logIn?utm_source=main_no_login&utm_medium=cta&utm_[…]=no_login_mypage_direct&utm_content=no_login_mypage_direct&ReturnUrl=" + location.pathname;
}