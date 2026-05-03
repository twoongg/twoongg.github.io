var varUA = navigator.userAgent.toLowerCase();

var delay = 300;
var timer = null;
var container = [];
var ratio = 1;

$(function (e) {
    // hide loader
    $(".loader_mcard").fadeOut();

    var timer = setTimeout(function () {
        //D-Day 영역, 어디서 생성되는지 모름.. 지연 실행 하도록 수정
        if (typeof $(".d_day").val() != 'undefined') {
            $(".d_day").css("font-size", (parseInt($(".d_day").css("font-size").replace("px", "")) * ratio) + "px");
            setDday($("#eventDate").val());
        }

    }, delay);

    $(".policy .title").on('click',function () {
        $(this).parent().toggleClass('on');
    });

    resizePage();

    var IsPopup = $("#isPopup").val();

    //팝업 오픈 시 참석여부 전달 팝업 오픈
    if (IsPopup == "true") {
        //오늘 하루 닫기 설정이 안되어있으면
        if (getCookie("isPopupNotToday") != "Y") {
            $(".attend_pop").show();
        }
    }

    //2023-06-16 모초 랜더링 방식 개선
    $(window).resize(function (e) {
        //location.href = location.href;
    });

    //신랑 & 신부측 혼주 보기
    $('.list_con').slideDown();
    $('.info_detail').on('click', function () {
        $(this).parent('.list_wrap').toggleClass('on');
        $('.list_con').slideToggle();
    });

    // Loop over gallery items and push it to the array
    $('#gallery').find('figure').each(function () {
        var $link = $(this).find('a'),
            item = {
                src: $link.attr('href'),
                w: $link.data('width'),
                h: $link.data('height'),
                title: $link.data('caption')
            };
        container.push(item);
    });
    //갤러리 타입03 - 썸네일 슬라이드
    var galleryThumbs = null

    if ($('.gallery-thumbs').length > 0) {
        galleryThumbs =
            new Swiper('.gallery-thumbs', {
                spaceBetween: 10,
                slidesPerView: 3,
                loop: true,
                freeMode: true,
                loopedSlides: 5, //looped slides should be the same
                watchSlidesVisibility: true,
                watchSlidesProgress: true,
            });
    }
    var galleryTop = null;
    if (galleryThumbs != null) {
        galleryTop = new Swiper('.gallery-top', {
            spaceBetween: 10,
            autoHeight: true,
            loop: true,
            loopedSlides: 5, //looped slides should be the same
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            thumbs: {
                swiper: galleryThumbs,
            },
        });
    }

    //Video 크기 조정
    if ($(document).width() < 500) {
        $(".iframe_wrap iframe").css("height", "191px");
    }

    //방명록 목록
    if ($('a.btn_guestbook_more').length > 0) {
        $('a.btn_guestbook_more').click();
    }

    //Rsvp 탭 클릭
    $('.tab_btn').on('click', function () {
        var tabID = $(this).data('tab');

        $('.tab_btn').removeClass('active');
        $(this).addClass('active');

        $('.tab_content').removeClass('active').hide();
        $('#' + tabID).addClass('active').show();

        let gubun = 0;
        if (tabID == "tab_priest") {
            gubun = 1;
        }

        $("#rsvpReg").attr("onclick", "rsvpSave(" + gubun +");");

    });

    $('.tab_btn:first').click();

    $('.bottom_pop .btn_box .btn').click(function () {

        $(this).closest('.btn_box').find('.btn').removeClass('active');

        $(this).addClass('active');
    });

    //식사여부
    $(".eatTypeBtn").on("click", function (e) {
        $(this).parent().parent().find("input[name='EatType']").val($(this).data("type"));
    });

    //버스대절
    $(".isBusBtn").on("click", function (e) {
        $(this).parent().parent().find("input[name='IsBus']").val($(this).data("type"));
    });
});


//클립보드 복사 - 안드로이드 제외 클릭 이벤트
$("a.copy_url").on('click', function (e) {
    e.preventDefault();
    copyToClipboard($(this).attr("href"));

    if (varUA.indexOf('android') > -1) {
        return false;
    } else {
        toastPopup('URL이 복사되었습니다.', 1500);
    }
});
//계좌번호 팝업
$("a.an_btn").on('click', function (e) {
    e.preventDefault();
    $('div.account_pop').hide();

    var idx = $(this).attr('data-idx');
    $('div.account_pop').each(function(i, popitem) {
        if ($(popitem).attr('data-idx') == idx) {
            $(popitem).show();
            scrollDisable();
        }
    });
});
//계좌번호 팝업 닫기
$('.btn.close').on('click', function (e) {
    e.preventDefault();
    $('div.account_pop').hide();
    scrollAble();
});
//계좌 클립보드 복사
$("a.copy_account").on('click', function (e) {
    e.preventDefault();
    var account = $(this).attr('data-account');
    var copyacc = account.replace(/-/g, "");
    copyToClipboard(copyacc);

    if (varUA.indexOf('android') > -1) {
        return false;
    } else {
        toastPopup('복사되었습니다.', 1500);
    }
});

//방명록 textarea 자동 높이 조절 및 글자수 카운트
$(".write_box textarea[name='Message']").on("input", function () {
    // auto-expand
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
    // 글자수 카운트
    var len = $(this).val().length;
    $(this).closest('.message_textarea_wrap').find('.char_count em').text(len);
});

//방명록 저장
$("#frmGuestbook").on("submit", function (e) {
    e.preventDefault();
    var form = $(this);
    var url = form.attr('action');

    $.ajax({
        cache: false,
        url: url,
        type: 'POST',
        data: form.serialize()
    }).done(function (data, textStatus, jqXHR) {
        //alert(data['message']);
        $(".write_box").find("input").val("");
        var $textarea = $(".write_box").find("textarea");
        $textarea.val("").css("height", "auto");  //저장 후 textarea 초기화
        $textarea.closest('.message_textarea_wrap').find('.char_count em').text('0');
        toastPopup(data['message'], 2000);
        if (data['status'] == true) {
            $('#guestbook').html('');
            $('a.btn_guestbook_more').click();
        }
    });
});
//방명록 목록
$('a.btn_guestbook_more').on('click', function (e) {
    e.preventDefault();
    var url = $(this).attr("href");
    var lastId = 0;
    if ($('.guestbook_item').length > 0) {
        lastId = $('.guestbook_item').last().data('guestbook-id');
    }
    url += "&idx=" + lastId;

    loadGuestbook(url,'next');
});
$('a.btn_guestbook_all').on('click', function (e) {
    e.preventDefault();
    var url = $(this).attr("href");
    loadGuestbook(url,'all');
});
//방명록 목록 읽기
var loadGuestbook = function (url, type) {
    $.ajax({
        url: url,
        method: 'get',
        data: {}
    }).done(function (data, textStatus, jqXHR) {
        if (type == 'all') {
            $('#guestbook').html(data);
        }
        else {
            $('#guestbook').append(data);
        }
    });
}
//방명록 댓글 토글 이벤트
$("body").on("click", 'button.message_del', function (e) {
    e.preventDefault();
    $(this).parents('li').find(".password_check").slideToggle();
});
//방명록 댓글 삭제 이벤트
$("body").on("click", 'a.btn_delete_guestbook', function (e) {
    e.preventDefault();
    var url = $(this).attr("href");
    var password = $(this).parent().find('input[name="password"]').val();

    $.ajax({
        cache: false,
        url: url,
        type: 'POST',
        data: {
            Password: password
        }
    }).done(function (data, textStatus, jqXHR) {
        //alert(data['message']);
        toastPopup(data['message'], 2000);
        if (data['status'] == true) {
            $('#guestbook').html('');
            $('a.btn_guestbook_more').click();
        }
    });
});



//페이지 폭 조정
var resizePage = function () {
    ratio = $("#wrap").width() / 800;

    $("div.bindarea").each(function (i, divarea) {
        var areaHeight = $(divarea).height();

        $(divarea).children("div.item").each(function (j, divitem) {
            var x = parseInt($(divitem).css("top")) * ratio;
            var y = parseInt($(divitem).css("left")) * ratio;
            var w = parseInt($(divitem).css("width")) * ratio;
            var h = parseInt($(divitem).css("height")) * ratio;

            $(divitem).css("top", x + "px");
            $(divitem).css("left", y + "px");

            if ($(divitem).hasClass("ITC01")) {
                //Text
                $(divitem).css("width", w + "px");
                $(divitem).css("height", h + "px");

                var txt = $(divitem).children("div.text");
                var txtfontsize = parseInt($(txt).css("font-size")) * ratio;
                $(txt).css("font-size", txtfontsize + "px");


            } else if ($(divitem).hasClass("ITC02")) {
                //Image
                var img = $(divitem).children("img.img");
                w = parseInt($(img).css("width")) * ratio;
                h = parseInt($(img).css("height")) * ratio;
                $(img).css("width", w + "px");
                $(img).css("height", h + "px");

            } else if ($(divitem).hasClass("ITC03") || $(divitem).hasClass("ITC04")) {
                //Photo
                $(divitem).css("width", w + "px");
                $(divitem).css("height", h + "px");

                var img = $(divitem).children("img.img");
                $(img).css("max-width", w + "px");
                $(img).css("max-height", h + "px");
            }
        });
        //$(divarea).css("height", areaHeight * ratio + "px");

        if ($(divarea).attr("idx") == "2") {

            var totheight = 30.0;
            var imgheight = $(divarea).find('.img').outerHeight(true) + totheight;
            var txtheight = $(divarea).find('.text').outerHeight(true);

            $(divarea).css('min-height', areaHeight * ratio + "px");
            $(divarea).css('height', (imgheight + txtheight) + "px");
            $(divarea).find('.text').parent().css('height', (txtheight) + "px");

        } else if ($(divarea).attr("idx") == "19") {
            var totheight = 15.0;
            $.each($(divarea).find("div.text"), function (idx, txtItem) {
                var curHeight = $(txtItem).outerHeight(true);
                totheight += curHeight;
                $(txtItem).parent().css("height", curHeight + "px")
            });

            $(divarea).find("img.img").height(totheight + "px");
            $(divarea).css('height', totheight + "px")

        } else {
            $(divarea).find('.text', '.item').each(function () {
                $(this).data("height", $(this).outerHeight());
                $(this).data("fontSize", parseInt($(this).css("font-size")));
            });
            $(divarea).css("height", areaHeight * ratio + "px");
        }

    });

    //화환 영역
    if ($("div.flowergift").length > 0) {
        $("div.flowergift .templatearea").css("height", 224 * ratio + "px");
        $("div.flowergift .templatearea img").css("height", 224 * ratio + "px");
        $("div.flowergift .templatearea img").css("width", 800 * ratio + "px");
    }

    //키프트 영역
    if ($("div.fundingGift").length > 0) {
        $("div.fundingGift .templatearea").css("height", 224 * ratio + "px");
        $("div.fundingGift .templatearea img").css("height", 224 * ratio + "px");
        $("div.fundingGift .templatearea img").css("width", 800 * ratio + "px");
    }
};

//클립보드 복사
var copyToClipboard = function (text) {
    var aux = document.createElement("textarea");
    aux.value = text;
    document.body.appendChild(aux);
    aux.select();
    aux.setSelectionRange(0, 9999);
    document.execCommand("copy");
    document.body.removeChild(aux);
};

//팝업창 표시
var toastPopup = function (msg, timer) {
    var $elem = $("<p>" + msg + "</p>");

    $("div.toast").html($elem).show();

    $elem.slideToggle(100, function () {
        setTimeout(function () {
            $elem.fadeOut(function () {
                $(this).remove();
                $('div.toast').css('bottom', '');
            });
        }, timer);
        return false;
    });

    $('div.toast').stop().animate({ 'bottom': '5%' });
};

//스크롤 방지 이벤트
var scrollDisable = function () {
    $('body').addClass('scroll_off').on('scroll touchmove mousewheel');
}

//스크롤 방지해제 이벤트
var scrollAble = function () {
    $('body').removeClass('scroll_off').off('scroll touchmove mousewheel');
}

function setDday(wedding_date) {

    if (typeof $(".d_day").val() != 'undefined') {
        var today = new Date();
        var wedd_day = new Date(wedding_date);
        wedd_day.setHours(0, 0, 0, 0); //시간을 00:00:00으로 설정
        
        var distance = wedd_day - today
        var dday = Math.ceil(distance / (1000 * 60 * 60 * 24));

        if (parseInt(dday) > 0) {
            //예식일이전
            $(".d_day").text("D-" + parseInt(dday));
            $(".d_day").show();
        } else if (parseInt(dday) == 0) {
            $(".d_day").text("D-Day");
            $(".d_day").show();
            //예식일당일
        } else {
            //예식일이후
            $(".d_day").hide();
        }
    }
}

//연락처 문자열 제거
var chkNumber = function (obj) {
    $(obj).val($(obj).val().replace(/[^0-9]/gi, ""));
}

//Rsvp 저장
function rsvpSave(idx) {
    const form = $("#frmRsvp_" + idx);
    const url = form.attr('action');

    //er class 초기화
    form.find("input[name='Name']").removeClass("er");
    form.find("input[name='AttendCount']").removeClass("er");

    if (form.find("input[name='Name']").val() == "") {
        form.find("input[name='Name']").addClass("er");
        alert("성함을 입력해주세요.");
    } else if (form.find("input[name='AttendCount']").val() == "") {
        form.find("input[name='AttendCount']").addClass("er");
        alert("참석인원을 입력해주세요.");
    } else if (parseInt(form.find("input[name='AttendCount']").val()) == 0) {
        form.find("input[name='AttendCount']").addClass("er");
        alert("참석인원은 1 이상의 숫자만 입력 가능합니다.");
    } else if (form.find("input[name='EatType']").val() == "") {
        form.find("input[name='EatType']").addClass("er");
        alert("식사여부를 선택해주세요.");
    } else if (form.find("input[name='IsBus']").val() == "") {
        form.find("input[name='IsBus']").addClass("er");
        alert("대절버스여부를 선택해주세요.");
    } else {
        if (form.find("input[name='agree']").prop("checked")) {
            $.ajax({
                cache: false,
                url: url,
                type: 'POST',
                data: form.serialize()
            }).done(function (data, textStatus, jqXHR) {
                toastPopup(data['message'], 2000);
                if (data['status'] == true) {
                    popClose();
                    //초기화
                    form.find("input[name='EatType'],input[name='IsBus']").val("");
                    form.find(".eatTypeBtn, .isBusBtn").removeClass("active");
                    form[0].reset();
                    $(".rsvp").find(".tab_btn").eq(0).trigger("click");
                }
            });
        } else {
            alert("개인정보 수집 및 이용 동의 약관에 동의해주세요.");
        }
    }
}

function closePopupNotToday() {
    setCookie('isPopupNotToday', 'Y', 1);
    $(".attend_pop").hide();
}
function setCookie(name, value, expiredays) {

    var today = new Date();
    today.setDate(today.getDate() + expiredays);

    document.cookie = name + '=' + encodeURIComponent(value) + '; path=/; expires=' + today.toUTCString() + ';'
}

function getCookie(name) {

    var cName = name + "=";
    var x = 0;

    while (x <= document.cookie.length) {

        var y = (x + cName.length);

        if (document.cookie.substring(x, y) == cName) {

            if ((endOfCookie = document.cookie.indexOf(";", y)) == -1)
                endOfCookie = document.cookie.length;

            return decodeURIComponent(document.cookie.substring(y, endOfCookie));
        }

        x = document.cookie.indexOf(" ", x) + 1;

        if (x == 0) {
            break;
        }

    }

    return "";
}

window.addEventListener("load", function () {
//    $(".loader_mcard").hide();
});