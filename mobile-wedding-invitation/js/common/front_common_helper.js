$(function () {

    var UserAgent = navigator.userAgent;

	//family site event
	$('.family_wrap > a').on('mouseenter', function(){
		$(this).addClass('on');
	});	
	$('.family_list').on('mouseleave', function(){
		$('.family_wrap > a').removeClass('on');
	});
	
	//접속 디바이스 구분
	var filter = "win16|win32|win64|mac";
	if( navigator.platform  ){
		if( filter.indexOf(navigator.platform.toLowerCase())<0 ){ //mobile 접속
			
			$('.follow_btn').hide();

		}else{ //PC 접속
		}
	}
	
	//마우스 커서 초기 값
	var mouseX = 0, mouseY = 0;

	//마우스 커서 위치 값 구하기
	$(document).on('mousemove', function(e){
		mouseX = e.clientX || e.pageX;
		mouseY = e.clientY || e.pageY;
		$(".circle").css({left: mouseX - 30 +'px', top: mouseY -30 +'px'});
	});

	//slide hover cursor event
	$('.follow_btn').hover(function(){
		$(".circle").addClass('over');
		if( $(this).hasClass("swiper-button-next") ){
			$('.circle').text('NEXT');
		} else {
			$('.circle').text('PREV');
		}
	}, function(){
		$(".circle").removeClass('over');
	});

    var PageNum = 1;
    var PageSize = 18;

    $.ajax({
        type: "POST",
        url: "/User/Menu/CTC02", //상단 메뉴
        dataType: "json",
        async: true,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',

        success: function (result) {
            // 대분류와 중분류를 분리하여 저장
            var 대분류Array = [];
            var 중분류Array = [];
            var 대분류IDs = new Set(); // 존재하는 대분류 ID들을 저장
            
            // 먼저 대분류와 중분류를 분리
            $(result.category_menu_list).each(function (index, list) {
                if (isEmpty(list.Parent_Category_Id)) {
                    // 대분류
                    대분류Array.push(list);
                    대분류IDs.add(list.Category_ID);
                } else {
                    // 중분류
                    중분류Array.push(list);
                }
            });

            // 대분류 먼저 생성
            $.each(대분류Array, function(index, list) {
                var Depth1_Url = "";
                if (list.Category_ID == "1") {
                    Depth1_Url = "/Product/List/1/18/1/0/0/0";
                } else {
                    Depth1_Url = "/Product/List/1/0/" + list.Category_ID + "/0/0/0";
                }

                var View;
                if (isEmpty(list.Category_Name_PC_URL)) {
                    View = list.Category_Name;
                } else {
                    View = "<img src=\"" + list.Category_Name_PC_URL + "\" style=\"width:54px;height:18px;\">";
                }

                // 대분류 리스트 생성
                var 대분류리스트 = "<li class=\"swiper-slide\"><a href=\"" + Depth1_Url + "\" class=\"mont\">" + View + "</a><ul class=\"menu_depth02\" id=\"" + list.Category_ID + "\" style=\"display:none;\"></ul></li>";
                
                // 모바일 네비게이션에 추가
                $(".header .area .m_nav .menu_depth01:eq(0)").append("<li class=\"swiper-slide\"><a href=\"" + Depth1_Url + "\">" + View + "</a></li>");
                
                // PC 네비게이션과 전체 메뉴에 추가
                $(".header .area .menu_nav .menu_depth01:eq(0)").append(대분류리스트);
                $(".all_menu_nav .menu_depth01:eq(1)").append(대분류리스트);

                // 모바일/PC 구분 처리 (기존 코드와 동일)
                if (navigator.platform) {
                    if (filter.indexOf(navigator.platform.toLowerCase()) < 0) {
                        //mobile
                        // 모바일 전용 처리가 필요한 경우 여기에 추가
                    } else {
                        //PC
                        // PC 전용 처리가 필요한 경우 여기에 추가
                    }
                }
            });

            // 중분류 생성 (대분류가 존재하는 경우만)
            $.each(중분류Array, function(index, list) {
                // 해당 중분류의 대분류가 실제로 존재하는지 확인
                if (대분류IDs.has(list.Parent_Category_Id)) {
                    var Parent_Category_ID = list.Parent_Category_Id;
                    var Depth2_Url = "/Product/List/" + PageNum + "/" + PageSize + "/" + Parent_Category_ID + "/0/" + list.Category_ID + "_/0";

                    var View;
                    if (isEmpty(list.Category_Name_PC_URL)) {
                        View = list.Category_Name;
                    } else {
                        View = "<img src=\"" + list.Category_Name_PC_URL + "\" style=\"width:54px;height:18px;\">";
                    }

                    var 중분류리스트 = "<li><a href=\"" + Depth2_Url + "\">" + View + "</a></li>";

                    // ID를 속성으로 찾는 방식으로 변경
                    $(".menu_depth02[id='" + Parent_Category_ID + "']").each(function() {
                        // 첫 번째 중분류 추가 시 "전체" 메뉴도 추가
                        if ($(this).children().length === 0) {
                            $(this).append("<li><a href=\"/Product/List/1/18/" + Parent_Category_ID + "/0/0/0\">전체</a></li>");
                        }
                        $(this).append(중분류리스트);
                        
                        // 중분류가 있는 대분류에 has-submenu 클래스 추가
                        $(this).closest('li').addClass('has-submenu');
                    });
                }
                // 대분류가 존재하지 않는 중분류는 무시됨 (노출되지 않음)
            });

            // 일반 메뉴 처리
            var 일반메뉴대분류Array = [];
            var 일반메뉴중분류Array = [];
            var 일반메뉴대분류IDs = new Set();

            // 일반 메뉴도 대분류와 중분류 분리
            $(result.menu_list).each(function (index, list) {
                if (list.menu_Type_Code == "MTC02") { 
                    // 풋터 메뉴
                    var View;
                    if (isEmpty(list.image_URL)) {
                        View = list.menu_Name;
                    } else {
                        View = "<img src=\"" + list.image_URL + "\" style=\"height: 22px;\">";
                    }
                    $(".footer .footer_menu").append("<li><a href=\"" + list.menu_URL + "\" target=\"_blank\">" + View + "</a></li>");
                } else {
                    if (isEmpty(list.parent_Menu_ID)) {
                        // 일반 메뉴 대분류
                        일반메뉴대분류Array.push(list);
                        일반메뉴대분류IDs.add(list.menu_ID);
                    } else {
                        // 일반 메뉴 중분류
                        일반메뉴중분류Array.push(list);
                    }
                }
            });

            // 일반 메뉴 대분류 생성
            $.each(일반메뉴대분류Array, function(index, list) {
                var View;
                if (isEmpty(list.image_URL)) {
                    View = list.menu_Name;
                } else {
                    View = "<img src=\"" + list.image_URL + "\" style=\"height: 22px;\">";
                }

                $(".header .area .menu_nav .menu_depth01").append("<li class=\"swiper-slide\"><a href=\"" + list.menu_URL + "\">" + View + "</a></li>");
                $(".header .area .m_nav .menu_depth01").append("<li class=\"swiper-slide\"><a href=\"" + list.menu_URL + "\">" + View + "</a></li>");

                var 대분류리스트 = "<li><a href=\"" + list.menu_URL + "\" class=\"mont\">" + list.menu_Name + "</a><ul class=\"menu_depth02\" id=\"" + list.menu_ID + "\"></ul></li>";
                $(".all_menu_nav .menu_depth01:eq(1)").append(대분류리스트);

                // 모바일/PC 구분 처리 (기존 코드와 동일)
                if (navigator.platform) {
                    if (filter.indexOf(navigator.platform.toLowerCase()) < 0) {
                        //mobile
                        // 기존 코드에서는 모바일에서도 동일하게 처리
                    } else {
                        //PC
                        // 기존 코드에서는 PC에서도 동일하게 처리
                    }
                }
            });

            // 일반 메뉴 중분류 생성 (대분류가 존재하는 경우만)
            $.each(일반메뉴중분류Array, function(index, list) {
                if (일반메뉴대분류IDs.has(list.parent_Menu_ID)) {
                    var View;
                    if (isEmpty(list.image_URL)) {
                        View = list.menu_Name;
                    } else {
                        View = "<img src=\"" + list.image_URL + "\" style=\"height: 22px;\">";
                    }

                    var 중분류리스트 = "<li><a href=\"" + list.menu_URL + "\">" + View + "</a></li>";
                    // ID를 속성으로 찾는 방식으로 변경
                    $(".menu_depth02[id='" + list.parent_Menu_ID + "']").each(function() {
                        $(this).append(중분류리스트);
                        
                        // 중분류가 있는 대분류에 has-submenu 클래스 추가
                        $(this).closest('li').addClass('has-submenu');
                    });
                }
            });

        },
        error: function (error) {
            //console.log(error);
        }
    });

	/* 총 찜 리스트 개수 */
	$.ajax({
		type: "POST",
        url: "/Product/Wish_Cnt?" + Math.random(),
        async: false,
        success: function (result) {
          
            //var filter = "win16|win32|win64|macintel|mac|";

            if (parseInt(result) > 0) {
                //pc버전
                $(".like_count").html(result);

                //모바일버전 
                $(".point01").html(result);

                if (parseInt(result) > 0) {

                    $("#wrap .user_wrap .menu").addClass("true");
                }
                else {
                    $("#wrap .user_wrap .menu").removeClass("true");
                }

            }
            else {

                $(".like_count").hide(); //상단 우측 위시리스트 카운트 영역 자체 비노출
                $("#wrap .user_wrap .menu").removeClass("true"); // 햄버거 메뉴 위시리스트 아이콘 비노출 
            }
           
       },
		error: function (result) {
			// swal({ title: "오류가 발생했습니다. 다시 시도해 주세요", type: "error" });
		}
	});


	$(".search_input").keypress(function (event) {
		if (event.which == 13) {
			$(".search_btn").click();
			return false;
		}
	});


	$(".search_btn").click(function (e) {

		var SearchKeyword = $(".search_input").val();

		if (isEmpty(SearchKeyword)) {
			alert("검색어를 입력해주세요");
			$(".search_input").focus();
			return;
        }

        location.href = "/Product/Search/1/18/1/" + encodeURIComponent(SearchKeyword);
   
	});
});

// 나머지 함수들은 동일하게 유지...
//미리보기 자동 높이 조절
function previewCalcHeight() {
    //find the height of the internal page
    var the_height = document.getElementById('preview_frame').contentWindow.document.body.scrollHeight;
    //change the height of the iframe
    document.getElementById('preview_frame').height = the_height;
}

var isEmpty = function (val) {
	if (val === "" || val === null || val === undefined
		|| (val !== null && typeof val === "object" && !Object.keys(val).length)
	) {
		return true
	} else {
		return false
	}
};

function PagingNavigator() {
    var obj = $(".pagination-container");
    $(obj).attr("class", "paging_wrap").find(".pagination").removeClass();

    $(obj).find("ul li").each(function () {
        var classobj = $(this).attr("class");

        if (classobj == "PagedList-skipToPrevious") $(this).find("a").addClass("paging_prev").html("이전페이지 보기");

        else if (classobj == "PagedList-skipToNext") $(this).find("a").addClass("paging_next").html("다음페이지 보기");

        else if (classobj == "active") {
            var actNum = $(this).find("span").text();

            $(this).find("span").replaceWith(function () {
                return $('<a>', { class: "on", text: actNum })
            });
        }
    });
}

function Wish_Save(Product_Id, Gubun) {
    $.ajax({
        type: "POST",
        url: "/Product/Wish_Save/" + Product_Id + "/" + Gubun, //상품ID
        async: false,
        success: function (result) {
            var TotalCnt = result.split('_')[0];
            var MemCnt = result.split('_')[1];
           
            if (parseInt(TotalCnt) > 0) {
                //pc버전 
                $(".like_count").html(TotalCnt);

                //모바일버전 
                $(".point01").html(TotalCnt);

                $(".product_detail_wrap .product_info_box .wish .wish_count").html(MemCnt);

                if (parseInt(result) > 0) {
                    $("#wrap .user_wrap .menu").addClass("true"); // 햄버거 메뉴 위시리스트 아이콘 노출 
                }
                else {
                    $("#wrap .user_wrap .menu").removeClass("true"); // 햄버거 메뉴 위시리스트 아이콘 비노출 
                }
                $(".like_count").show(); //상단 우측 위시리스트 카운트 영역 노출
            }
            else {
                $(".like_count").hide(); //상단 우측 위시리스트 카운트 영역 자체 비노출
                $("#wrap .user_wrap .menu").removeClass("true"); // 햄버거 메뉴 위시리스트 아이콘 비노출 
            }
        },
        error: function (result) {
            // swal({ title: "오류가 발생했습니다. 다시 시도해 주세요", type: "error" });
        }
    });
}

function ClickSave(gubun, id) {
    // 배너 클릭수 업데이트
    $.ajax({
        type: "POST",
        url: "/Banner/Click_Update/" + id + "/" + gubun,
        dataType: "json",
        async: true,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        success: function (result) {
        }
    });
}

function GoURL(obj) {
    if (!isEmpty($(obj).val())) {
        location.href = $(obj).val();
    }
}

function replaceAll(str, s, t) {
    while (str.indexOf(s) >= 0) {
        str = str.replace(s, t);
    }
    return str;
}

function load_mainbanner() {
    var PCbanner = "";
    var PCbanner2 = "";
    var PCbanner3 = "";

    var pc_area = "";
    var pc_area2 = "";
    var pc_area3 = "";

    var Mo_area = "";
    var Mo_area2 = "";
    var Mo_area3 = "";

    //첫번째 메인배너
    $.ajax({
        type: "POST",
        url: "/User/MainBanner/1",
        dataType: "json",
        async: false,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        success: function (result) {
            var pc_sortnum = "";
            $(result.banner).each(function (index, list) {
                
                if (list.Status == "진행") {
                    if (list.Banner_Type_Code == "BTC01") {

                        pc_area = "           <div class=\"pc_area\">";
                        pc_area += "                   <div class=\"text_wrap\">";
                        pc_area += "                       <p class=\"main_text\">";
                        pc_area += list.Banner_Main_Description;
                        pc_area += "                       </p>";
                        pc_area += "                       <p class=\"sub_text\">";
                        pc_area += list.Banner_Add_Description;
                        pc_area += "                       </p>";
                        pc_area += "                   </div>";
                        pc_area += "                   <div class=\"mb_obj mb_obj01\">";
                        pc_area += "                       <a href=\"" + list.Link_URL + "\"  target=\"" + list.NewPage_YN + "\">";
                        pc_area += "                           <img src=\"" + list.Image_URL + "\" alt=\"메인 배너 오브젝트\">";
                        pc_area += "                       </a>";
                        pc_area += "                   </div>";
                        pc_area += "          </div>";
                        pc_sortnum = list.Sort;

                        $(result.banner).each(function (index1, list2) {
                            if (list2.Banner_Type_Code == "BTC02") {
                                if (list2.Status == "진행") {
                                    if (pc_sortnum == list2.Sort) {

                                        Mo_area = "           <div class=\"m_area\">";
                                        Mo_area += "                   <div class=\"mb_obj mb_obj01\">";
                                        Mo_area += "                       <a href=\"" + list2.Link_URL + "\"  target=\"" + list2.NewPage_YN + "\">";
                                        Mo_area += "                           <img src=\"" + list2.Image_URL + "\" alt=\"메인 배너 오브젝트\">";
                                        Mo_area += "                       </a>";
                                        Mo_area += "                   </div>";
                                        Mo_area += "                   <div class=\"text_wrap\">";
                                        Mo_area += "                       <p class=\"main_text\">";
                                        Mo_area += list2.Banner_Main_Description;
                                        Mo_area += "                       </p>";
                                        Mo_area += "                       <p class=\"sub_text\">";
                                        Mo_area += list2.Banner_Add_Description;
                                        Mo_area += "                       </p>";
                                        Mo_area += "                   </div>";

                                        Mo_area += "          </div>";

                                        var backimg = replaceAll(list.Image_URL2, "\\", "/");

                                        PCbanner += " <div class=\"swiper-slide mb_slide01\" style=\"background: url(" + backimg + ") no-repeat center; background-size: cover;\"><div class=\"mb_area\">" + pc_area + Mo_area + "</div></div>";

                                    }
                                }
                                else {
                                    if (pc_sortnum == list2.Sort) {
                                        Mo_area = "           <div class=\"m_area\">";
                                        Mo_area += "          </div>";

                                        var backimg = replaceAll(list.Image_URL2, "\\", "/");
                                        PCbanner += " <div class=\"swiper-slide mb_slide01\" style=\"background: url(" + backimg + ") no-repeat center; background-size: cover;\"><div class=\"mb_area\">" + pc_area + Mo_area + "</div></div>";
                                    }
                                }
                            }
                        });
                    }
                }
            });
            
            $(".main_banner .swiper-wrapper").html(PCbanner);
        }
    });

    //두번째 메인배너
    $.ajax({
        type: "POST",
        url: "/User/MainBanner/2",
        dataType: "json",
        async: false,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        success: function (result) {
            var pc_sortnum = "";

            $(result.banner).each(function (index, list) {

                if (list.Status == "진행") {

                    if (list.Banner_Type_Code == "BTC01") {

                        pc_area2 = "           <div class=\"pc_area\">";
                        pc_area2 += "             <div class=\"img_con\">";
                        pc_area2 += "                 <span class=\"banner_badge\">" + list.Banner_Main_Description.split("]")[0].replace("[", "") + "</span>"
                        pc_area2 += "                     <a href=\"" + list.Link_URL + "\" target=\"" + list.NewPage_YN + "\">";
                        pc_area2 += "                         <img src=\"" + list.Image_URL + "\" alt=\"무료제작 이미지\">";
                        pc_area2 += "                     </a>";
                        pc_area2 += "             </div>";
                        pc_area2 += "             <p><strong>" + list.Banner_Main_Description.split("]")[1].replace("", "") + "</strong></p>";
                        pc_area2 += "             <p>" + list.Banner_Add_Description + "</p>";
                        pc_area2 += "             </div>";
                        pc_sortnum = list.Sort

                        $(result.banner).each(function (index1, list2) {

                            if (list2.Banner_Type_Code == "BTC02") {

                                if (list2.Status == "진행") {

                                    if (pc_sortnum == list2.Sort) {
                                        Mo_area2 = "   <a href=\"" + list2.Link_URL + "\" target=\"" + list2.NewPage_YN + "\">";
                                        Mo_area2 += "         <div class=\"m_area\">";
                                        Mo_area2 += "             <div class=\"img_con\">";

                                        Mo_area2 += "                         <img src=\"" + list2.Image_URL + "\" alt=\"무료제작 이미지\">";
                                        Mo_area2 += "             </div>";
                                        Mo_area2 += "             <dl>";
                                        Mo_area2 += "                 <dt>" + list2.Banner_Main_Description + "</dt>";
                                        Mo_area2 += "                 <dd>" + list2.Banner_Add_Description + "</dd>";
                                        Mo_area2 += "             </dl>";
                                        Mo_area2 += "         </div>";
                                        Mo_area2 += " </a>";
                                        PCbanner2 += "<li>" + pc_area2 + Mo_area2 + "</li>";
                                    }
                                }
                                else {

                                    if (pc_sortnum == list2.Sort) {
                                        Mo_area2 = "         <div class=\"m_area\">";
                                        Mo_area2 += "         </div>";
                                        PCbanner2 += "<li>" + pc_area2 + Mo_area2 + "</li>";
                                    }
                                }
                            }
                        });

                    }
                }
            });

            $(".banner_list .area").html("<ul>" + PCbanner2 + "</ul>");
        }
    });


    //메인 띠배너 
    $.ajax({
        type: "POST",
        url: "/User/MainBanner/5",
        dataType: "json",
        async: false,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        success: function (result) {

            var pc_sortnum = "";

            $(result.banner).each(function (index, list) {

                if (list.Status == "진행") {

                    if (list.Banner_Type_Code == "BTC01") {

                        pc_area3 = "        <div class=\"pc_area\">";
                        pc_area3 += "             <div class=\"area\">";
                        pc_area3 += "               <div class=\"service_text\">";
                        pc_area3 += "                   <h3>" + list.Banner_Main_Description + "</h3>";
                        pc_area3 += "                   <p>" + list.Banner_Add_Description + "</p>";
                        pc_area3 += "               </div>";
                        pc_area3 += "               <div class=\"img_con\">";
                        pc_area3 += "                   <a href=\"" + list.Link_URL + "\" target=\"" + list.NewPage_YN + "\" onclick=\"GoBanner(" + list.Banner_Item_ID + ");\">";
                        pc_area3 += "                       <img src=\"" + list.Image_URL + "\"  alt=\"축의금 송금 서비스 이미지\">"
                        pc_area3 += "                   </a>";
                        pc_area3 += "               </div>";
                        pc_area3 += "           </div>";
                        pc_area3 += "       </div>";
                        pc_sortnum = list.Sort;
                        PCbanner3 += pc_area3;
                        $(result.banner).each(function (index1, list2) {
                            if (list2.Banner_Type_Code == "BTC02") {

                                if (list2.Status == "진행") {

                                    if (pc_sortnum == list2.Sort) {

                                        Mo_area3 = "         <div class=\"m_area\">";
                                        Mo_area3 += "               <div class=\"area\">";
                                        Mo_area3 += "                   <div class=\"img_con\">";
                                        Mo_area3 += "                       <a href=\"" + list2.Link_URL + "\" target=\"" + list2.NewPage_YN + "\">";
                                        Mo_area3 += "                           <img src=\"" + list2.Image_URL + "\"  alt=\"카카오페이 이미지\">";
                                        Mo_area3 += "                       </a>";
                                        Mo_area3 += "                   </div>";
                                        Mo_area3 += "                   <div class=\"service_text\">";
                                        Mo_area3 += "                       <h3>" + list2.Banner_Main_Description + "</h3>";
                                        Mo_area3 += "                       <p>" + list2.Banner_Add_Description + "</p>";
                                        Mo_area3 += "                   </div>";
                                        Mo_area3 += "               </div>";
                                        Mo_area3 += "           </div>";

                                        PCbanner3 += Mo_area3;
                                    }
                                }
                                else {
                                    if (pc_sortnum == list2.Sort) {
                                        Mo_area3 = "         <div class=\"m_area\">";
                                        Mo_area3 += "           </div>";
                                        PCbanner3 += Mo_area3;
                                    }
                                }
                            }
                        });

                    }
                }
            });
            $(".service").append(PCbanner3);
        }
    });
}

function GoBanner(id) {
    // 배너 클릭수 업데이트
    $.ajax({
        type: "POST",
        url: "/User/Banner/Click_Update/" + id,
        dataType: "json",
        async: false,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        success: function (result) {
        }
    });
}

function addComma(value) {
    alert(value);
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return value;
}

function isMobile() {
    var UserAgent = navigator.userAgent;

    if (UserAgent.match(/iPhone|iPod|Android|Windows CE|BlackBerry|Symbian|Windows Phone|webOS|Opera Mini|Opera Mobi|POLARIS|IEMobile|lgtelecom|nokia|SonyEricsson/i) != null || UserAgent.match(/LG|SAMSUNG|Samsung/) != null) {
        return true;
    } else {
        return false;
    }
}

var url = location.href.toLocaleUpperCase();

if (url.indexOf("MCARDSTEP") > 0 || url.indexOf("MTHANKSSTEP") > 0 || url.indexOf("MDOLLSTEP") > 0 || url.indexOf("ORDER_DETAIL") > 0) {
    url = url.split('/');
    User_Order_Chk(url.slice(-1)[0]);
}

function User_Order_Chk(ID) {
    $.ajax({
        type: "POST",
        url: "/Member/User_Order_Chk/1/" + ID, 
        async: false,
        success: function (result) {
            if (parseInt(result) == 0) {
                alert("잘못된 경로입니다.");
                location.replace("/");
            }
        }
    });
}