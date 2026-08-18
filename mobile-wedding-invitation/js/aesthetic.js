/* ============================================================
   aesthetic.js — 청첩장 인터랙션 레이어 (jQuery 비의존)
   1) 스크롤 등장 애니메이션
   2) 예식일 달력 렌더링
   3) 카운트다운 / 카운트업 타이머
   4) 갤러리 '더보기'
   ============================================================ */
(function () {
    'use strict';

    /* 예식 일시 / 처음 만난 날 — 여기만 고치면 됩니다 */
    var WEDDING_AT     = new Date(2027, 0, 30, 11, 0, 0);  // 2027-01-30 11:00
    var ANNIVERSARY_AT = new Date(2022, 1, 17, 0, 0, 0);   // 2022-02-17

    var pad = function (n) { return n < 10 ? '0' + n : String(n); };

    /* ── 1. 스크롤 등장 애니메이션 ─────────────────────────── */
    function initReveal() {
        var targets = document.querySelectorAll('.reveal');
        if (!targets.length) return;

        if (!('IntersectionObserver' in window)) {
            Array.prototype.forEach.call(targets, function (el) { el.classList.add('is-in'); });
            return;
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-in');
                io.unobserve(entry.target);   // 한 번만 재생
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

        Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
    }

    /* 같은 묶음 안의 요소를 순차적으로 등장시킵니다 */
    function applyStagger() {
        Array.prototype.forEach.call(document.querySelectorAll('[data-stagger]'), function (group) {
            var step = parseFloat(group.getAttribute('data-stagger')) || 0.12;
            Array.prototype.forEach.call(group.querySelectorAll('.reveal'), function (el, i) {
                el.style.setProperty('--reveal-delay', (i * step).toFixed(2) + 's');
            });
        });
    }

    /* ── 2. 예식일 달력 ──────────────────────────────────── */
    function renderCalendar(host) {
        if (!host) return;

        var year  = WEDDING_AT.getFullYear();
        var month = WEDDING_AT.getMonth();       // 0-based
        var day   = WEDDING_AT.getDate();

        var first    = new Date(year, month, 1).getDay();          // 1일의 요일
        var lastDate = new Date(year, month + 1, 0).getDate();     // 그 달의 마지막 날
        var labels   = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

        var html = '<table><caption class="sound">' + year + '년 ' + (month + 1) + '월 달력</caption><thead><tr>';
        labels.forEach(function (label, i) {
            html += '<th scope="col"' + (i === 0 ? ' class="is-sun"' : '') + '>' + label + '</th>';
        });
        html += '</tr></thead><tbody><tr>';

        var col = 0;
        for (var i = 0; i < first; i++) { html += '<td class="is-empty">·</td>'; col++; }

        for (var d = 1; d <= lastDate; d++) {
            if (col === 7) { html += '</tr><tr>'; col = 0; }
            var sun = col === 0 ? ' is-sun' : '';
            if (d === day) {
                html += '<td class="is-wedding' + sun + '"><span class="wd__mark">' + d + '</span></td>';
            } else {
                html += '<td class="' + sun.trim() + '">' + d + '</td>';
            }
            col++;
        }
        while (col < 7 && col !== 0) { html += '<td class="is-empty">·</td>'; col++; }
        html += '</tr></tbody></table>';

        host.innerHTML = html;
    }

    /* ── 3. 타이머 ──────────────────────────────────────── */

    /* 달력 기준(연→월→일)으로 두 날짜의 차이를 계산합니다.
       단순히 일수를 30으로 나누지 않으므로 '몇 년 몇 개월'이 정확합니다. */
    function calendarDiff(from, to) {
        var y = to.getFullYear() - from.getFullYear();
        var m = to.getMonth()    - from.getMonth();
        var d = to.getDate()     - from.getDate();

        var h  = to.getHours()   - from.getHours();
        var mi = to.getMinutes() - from.getMinutes();
        var s  = to.getSeconds() - from.getSeconds();

        if (s  < 0) { s  += 60; mi--; }
        if (mi < 0) { mi += 60; h--;  }
        if (h  < 0) { h  += 24; d--;  }
        if (d  < 0) {
            // 이전 달의 마지막 날짜를 빌려옵니다
            d += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
            m--;
        }
        if (m < 0) { m += 12; y--; }

        return { y: y, m: m, d: d, h: h, mi: mi, s: s };
    }

    function startTimers() {
        var ddayHost  = document.getElementById('wdDday');
        var sentence  = document.getElementById('wdSentence');
        var sinceHost = document.getElementById('wdSince');
        if (!ddayHost && !sentence && !sinceHost) return;

        var units = [
            { key: 'days',  cap: 'DAYS'  },
            { key: 'hours', cap: 'HOUR'  },
            { key: 'mins',  cap: 'MIN'   },
            { key: 'secs',  cap: 'SEC'   }
        ];

        if (ddayHost) {
            ddayHost.innerHTML = units.map(function (u) {
                return '<div class="wd__unit"><span class="wd__num" data-unit="' + u.key + '">00</span>' +
                       '<span class="wd__cap">' + u.cap + '</span></div>';
            }).join('');
        }

        var slots = {};
        units.forEach(function (u) {
            slots[u.key] = ddayHost ? ddayHost.querySelector('[data-unit="' + u.key + '"]') : null;
        });

        function tick() {
            var now  = new Date();
            var left = WEDDING_AT - now;

            /* 남은 시간 */
            if (left > 0) {
                var sec  = Math.floor(left / 1000);
                var days = Math.floor(sec / 86400);
                var hrs  = Math.floor((sec % 86400) / 3600);
                var mins = Math.floor((sec % 3600) / 60);
                var secs = sec % 60;

                if (slots.days)  slots.days.textContent  = days;
                if (slots.hours) slots.hours.textContent = pad(hrs);
                if (slots.mins)  slots.mins.textContent  = pad(mins);
                if (slots.secs)  slots.secs.textContent  = pad(secs);

                if (sentence) {
                    /* 위 박스와 같은 값을 써야 164일 / 165일 처럼 어긋나 보이지 않습니다 */
                    sentence.innerHTML = '태웅 <span aria-hidden="true">♥</span> 수진의 결혼식이 <b>' +
                        (days > 0 ? days + '일' : '오늘') + '</b> 남았습니다.';
                }
            } else {
                units.forEach(function (u) { if (slots[u.key]) slots[u.key].textContent = '00'; });
                if (sentence) {
                    sentence.innerHTML = '저희 두 사람, <b>부부</b>가 되었습니다.<br>함께해 주셔서 감사합니다.';
                }
            }

            /* 함께한 시간 */
            if (sinceHost) {
                var g = calendarDiff(ANNIVERSARY_AT, now);
                sinceHost.innerHTML =
                    '<b>' + g.y + '</b>년 <b>' + g.m + '</b>개월 <b>' + g.d + '</b>일 ' +
                    pad(g.h) + '시간 ' + pad(g.mi) + '분 ' + pad(g.s) + '초';
            }
        }

        tick();
        setInterval(tick, 1000);
    }

    /* ── 4. 갤러리 더보기 ───────────────────────────────── */
    function initGalleryMore() {
        var grid = document.querySelector('.skin_gallery');
        var btn  = document.querySelector('.gallery__more');
        if (!grid || !btn) return;

        var total  = grid.querySelectorAll('figure').length;
        var shown  = 9;

        if (total <= shown) { btn.classList.add('is-hidden'); grid.classList.add('is-expanded'); return; }

        btn.textContent = '사진 더보기 (' + (total - shown) + ')';
        btn.addEventListener('click', function () {
            grid.classList.add('is-expanded');
            btn.classList.add('is-hidden');
        });
    }

    /* ── 실행 ───────────────────────────────────────────── */
    function boot() {
        applyStagger();
        renderCalendar(document.getElementById('wdCal'));
        startTimers();
        initGalleryMore();
        initReveal();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
