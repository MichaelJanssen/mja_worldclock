
timezones_utc = [
    {"code":"Etc/GMT+0","small":true,"loc":"top:4px; left:570px;"},
    {"code":"Etc/GMT-1","small":true,"loc":"top:4px; left:623px;"},
    {"code":"Etc/GMT-2","small":true,"loc":"top:4px; left:676px;"},
    {"code":"Etc/GMT-3","small":true,"loc":"top:4px; left:729px;"},
    {"code":"Etc/GMT-4","small":true,"loc":"top:4px; left:782px;"},
    {"code":"Etc/GMT-5","small":true,"loc":"top:4px; left:835px;"},
    {"code":"Etc/GMT-6","small":true,"loc":"top:4px; left:888px;"},
    {"code":"Etc/GMT-7","small":true,"loc":"top:4px; left:941px;"},
    {"code":"Etc/GMT-8","small":true,"loc":"top:4px; left:994px;"},
    {"code":"Etc/GMT-9","small":true,"loc":"top:4px; left:1047px;"},
    {"code":"Etc/GMT-10","small":true,"loc":"top:4px; left:1100px;"},
    {"code":"Etc/GMT-11","small":true,"loc":"top:4px; left:1153px;"},
    {"code":"Etc/GMT-12","small":true,"loc":"top:4px; left:1206px;"},
    {"code":"Etc/GMT+1","small":true,"loc":"top:4px; left:517px;"},
    {"code":"Etc/GMT+2","small":true,"loc":"top:4px; left:464px;"},
    {"code":"Etc/GMT+3","small":true,"loc":"top:4px; left:411px;"},
    {"code":"Etc/GMT+4","small":true,"loc":"top:4px; left:358px;"},
    {"code":"Etc/GMT+5","small":true,"loc":"top:4px; left:305px;"},
    {"code":"Etc/GMT+6","small":true,"loc":"top:4px; left:252px;"},
    {"code":"Etc/GMT+7","small":true,"loc":"top:4px; left:199px;"},
    {"code":"Etc/GMT+8","small":true,"loc":"top:4px; left:146px;"},
    {"code":"Etc/GMT+9","small":true,"loc":"top:4px; left:93px;"},
    {"code":"Etc/GMT+10","small":true,"loc":"top:4px; left:40px;"},
    {"code":"Etc/GMT+11","small":true,"loc":"top:4px; left:-13px;"},
    {"code":"UTC","loc":"top:39px; left:571px;"}
];

// timezones to be displayed.
timezones_flat = {
    //'Europe/Paris': true
}

many = "America/Bogota,Asia/Calcutta,America/Los_Angeles,Asia/Baghdad,Africa/Accra,Africa/Windhoek,America/Argentina/Buenos_Aires,America/New_York,Europe/Moscow,Asia/Novosibirsk,Australia/Sydney,Australia/Perth,Africa/Nairobi,Europe/London,Europe/Rome,Asia/Tokyo,Asia/Singapore,Atlantic/Reykjavik,America/Anchorage";

few = "Europe/Paris,America/Bogota,Asia/Calcutta,America/Los_Angeles,Asia/Baghdad,Australia/Sydney,Asia/Tokyo";

do_background_color = true;
background_color = {
    0: '#555 1',
    1: '#555 1',
    2: '#555 1',
    3: '#555 1',
    4: '#555 1',
    5: '#555 1',
    6: '#555 1',
    7: '#0F4C7D 1',
    8: '#075296 1',
    9: '#166FB3 1',
    10: '#4B97D3',
    11: '#BBDBF4',
    12: '#E4F1FA',
    13: '#E4F1FA',
    14: '#E4F1FA',
    15: '#E6F2F2',
    16: '#F0F3BC',
    17: '#F9F591',
    18: '#F2CE22',
    19: '#E4A301',
    20: '#D97A04',
    21: '#8E77BF',
    22: '#5852AA 1',
    23: '#4F5C9D 1',
}

function search() {
    window.clearTimeout(t);
    var t = window.setTimeout(function () {
        search_inner();
    }, 250);
}

function search_inner() {
    var s = $('#search_input').val();
    if ( ! s ) {
        var result = $('#search_results');
        result.empty();
        return;
    }
    var result = $('#search_results');
    result.empty();
    for (var key in lat_lon) {
        var regexp = new RegExp(s, 'ig');
        if (regexp.test(key)) {
            result.append('<div class="search-result" onclick="search_select(\''+key+'\')">'+key+'</div>');
        }
    }
}

function search_select(code) {
    toggle_timezone(code);
}

function toggle_timezone(code) {
    if (timezones_flat[code]) {
        timezones_flat[code] = false;
    } else {
        timezones_flat[code] = true;
    }
    create_and_update_clocks();
}

function remove_timezone(ev, code) {
    timezones_flat[code] = false;
    create_and_update_clocks();
}

function add_timezone(code) {
    timezones_flat[code] = true;
    create_and_update_clocks();
}

function create_and_update_clocks() {
    for (var code in timezones_flat) {
        if (!timezones_flat[code] && time_nodes[code]) {
            console.log('remove clock', code);
            time_nodes[code].parent().remove();
            delete time_nodes[code];
        }
        else if (timezones_flat[code] && !time_nodes[code]) {
            console.log('adding clock', code);
            var tz = [{
                code: code,
                loc: image_location_for_tz(code)
            }]
            create_clocks(tz);
        }
    }
    update_clocks(true);
}

function image_location_for_tz (code, numerically) {
    var ll = lat_lon[code].split(',')
    var mapx = 1280 - 100;
    var mapy = 690 + 200;
    var streckenx = 1280 / 360;
    var streckeny = 690 / 180;
    var top = parseInt(ll[0]);
    top *= -1;
    top *= streckeny;
    top += (mapy/2);
    var left = parseInt(ll[1]);
    left *= streckenx;
    left += (mapx/2);
    if (numerically) {
        return [top, left];
    }
    top -= 50;
    return "top:"+top+"px; left:"+left+"px;";
}

function nearest_clock(top, left) {
    var tops = []; // (distance, code)
    for (var code in lat_lon) {
        var tl = image_location_for_tz(code, true);
        tops.push([Math.abs(top - tl[0])+Math.abs(left - tl[1]), code]);
    }
    tops.sort(function (a,b) {
        return a[0] - b[0];
    });
    var code = tops[0][1];
    console.log('add nearest_clock:', code);
    add_timezone(code)
}

function show(lst) {
    var spl = lst.split(',');
    for (var code in timezones_flat) {
        if (spl.indexOf(code) == -1) {
            timezones_flat[code] = false;
        }
    }
    if (lst) {
        for (var i = 0, len = spl.length; i < len; i++) {
            var code = spl[i];
            timezones_flat[code] = true;
        }
    }
    create_and_update_clocks();
}

function show_all() {
    for (var code in lat_lon) {
        timezones_flat[code] = true;
    }
    create_and_update_clocks();
}


function main () {
    show(many);
    // firing up search, if browser has populated this field
    search_inner();
    create_clocks(timezones_utc);
    create_and_update_clocks();
    update_clocks(true);
    window.setInterval(function () {
        update_clocks();
    }, 1000);
    create_timebuttons();
    $('#worldclocks').on('click', function (ev) {
        if ($(ev.target).hasClass('remove_button')) {
            return;
        }
        var offset = $(this).offset();
        var left = (ev.pageX - offset.left);
        var top = (ev.pageY - offset.top);
        nearest_clock(top, left);
    });
    $(document).on('keyup', function (ev) {
        //console.log('body keyup', ev);
        if (ev.originalEvent.key == "ArrowLeft") {
            handle_arrow_keys(-1);
        }
        else if (ev.originalEvent.key == "ArrowRight") {
            handle_arrow_keys(1);
        }
        else if (ev.originalEvent.key == "ArrowUp" || ev.originalEvent.key == "ArrowDown") {
            $('#settime-'+global_settime).prop('checked', false);
            global_settime = null;
            update_clocks();
        }
    });
}


clock_counter = 0
function create_clocks(timezones) {
    for (var i = 0, len = timezones.length; i < len; i++) {
        clock_counter += 1
        var elem = timezones[i];
        var code = elem.code;
        var city = code.split('/').pop().replace('_', ' ');
        var title = "";
        if (elem.name) {
            city = elem.name;
        }
        var check = moment.tz.zone(code);
        var alert = '';
        if (check === null) {
            alert = 'border:2px solid red;';
            title += ' timezone not supported';
        }
        var loc = '';
        if (elem.loc) {
            loc = 'position:absolute; '+elem.loc;
        }
        var clockId = 'clock'+clock_counter;
        var remove_button = '<span class="remove_button" onclick="return toggle_timezone(\''+code+'\');">&#10006;</span>';
        if (elem.small) {
            var offset = parseInt(code.match(/[+-]\d+/)[0])
            title += code;
            var left = 570 + (53 * offset * -1);
            var html = '<div id="'+clockId+'" class="small" style="'+loc+'" title="'+title+'"><div class="time" data-timezone="'+code+'" style="'+alert+'"></div></div>';
        } else {
            var html = '<div id="'+clockId+'" class="clock" style="'+loc+'" title="'+title+'">'+city+'&nbsp;'+remove_button+'<div class="time" data-timezone="'+code+'" style="'+alert+'"></div></div>';
        }
        $('#worldclocks').append(html);

        time_nodes[code] = $('#'+clockId+' .time');

    }
}
global_settime = null;
function create_timebuttons(){
    var buttons = $('#timebuttons');
    buttons.append('<span>UTC:</span>');
    for (var i = 0; i < 24; i++) {
        buttons.append('<input id="settime-'+i+'" type="radio" class="btn settime" name="settime" value="'+i+'" style="display:none"><label for="settime-'+i+'">'+zpad(i, 2)+'</label>');
    }
    i = 99;
    buttons.append('<input id="settime-'+i+'" type="radio" class="btn settime" name="settime" value="99" style="display:none"><label for="settime-'+i+'">&#x232B;</label>');
    $('input.settime').change(function () {
        var node = $(this);
        var val = node.val()
        //console.log(this, val);
        global_settime = parseInt(val);
        if ( global_settime == 99) {
            global_settime = null;
            $('#settime-99').prop('checked', false);
        }
        update_clocks(true);
    });
}
function zpad(s, len, char_) {
	char_ = char_ || "0";
	s = String(s);
	if (s.length >= len) {
		return s;
	}
	for (var i = 0, len2 = len - s.length; i < len2; i++) {
		s = char_ + s;
	}
	return s;
}

function show_timezones_data() {
    var s = '[\n';
    var maxlen = timezones.length-1;
    for (var i = 0, len = timezones.length; i < len; i++) {
        s += '    ';
        s += JSON.stringify(timezones[i]);
        if (i != maxlen) {
            s += ',';
        }
        s += '\n';
    }
    s += '];';
    console.log(s);
}

time_nodes = {}; // code: node
last_minute = null;
last_hour = null;
function update_clocks(force) {
    if (global_settime != null) {
        var now = moment().utc().hours(global_settime).minutes(0);
    } else {
        var now = moment();
    }
    var minute = now.format('HH:mm')
    if (!force && last_minute == minute) {
        return;
    }
    last_minute = minute;
    for (var code in time_nodes) {
        var node = time_nodes[code];
        var time = now.tz(code).format('HH:mm');
        node.text(time);
    };
    if (do_background_color) {
        var hour = now.format('HH')
        if (!force && last_hour == hour) {
            return;
        }
        last_hour = hour;
        update_backgrounds();
    }
}

function handle_arrow_keys(change) {
    change = change||1; // 1: right -1: left
    var current = null;
    var next = null;

    current = global_settime;
    if (current == null) {
        var now = moment();
        var hour = now.utc().format('HH');
        current = parseInt(hour);
    }
    next = current + change
    if (next < 0) {
        next = 23;
    }
    if (next > 23) {
        next = 0;
    }

    var current_node = $('#settime-'+current);
    var next_node = $('#settime-'+next);
    current_node.prop('checked', false);
    next_node.prop('checked', true);
    global_settime = next;
    console.log(change, next)
    update_clocks(true);
}

function update_backgrounds() {
    if (global_settime != null) {
        var now = moment().utc().hours(global_settime).minutes(0);
    } else {
        var now = moment();
    }
    for (var code in time_nodes) {
        var node = time_nodes[code];
        var hour = parseInt(now.tz(code).format('H'));
        //console.log('update_backgrounds', code, hour);
        if (background_color[hour]) {
            var spl = background_color[hour].split(' ');
            var bg = spl[0];
            var fg = spl[1] ? '#ddd' : '#000';
            node.parent().css({'background-color': bg, 'color': fg});
        } else {
            node.parent().css('background-color', '#fed', 'color', '#000');
        }
    };
}

main();
