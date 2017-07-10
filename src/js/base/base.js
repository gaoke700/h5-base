(function (window, $) {
    var base = window.base = {};

    base.ajax = function (opts) {
        var options = {
            type: 'get',
            url: '',
            data: {},
            dataType: 'json',
            async: true,
            success: function () {
            },
            error: function () {
            }
        };

        $.extend(options, (opts || {}));
        if (!options.url) return false;
        $.ajax(options);
    };

    base.utils = {
        removeDuplicatedItem: function (ar) {
            var ret = [];
            for (var i = 0, j = ar.length; i < j; i++) {
                if (ret.indexOf(ar[i]) === -1) {
                    ret.push(ar[i]);
                }
            }
            return ret;
        },
        dataSrcHandle: function (json) {
            var returnObj={};
            if (!json.image) {
                return returnObj;
            }
            var attr=json.attr||'data-src';
            var webp = '';
            if (base.utils.isAndroid()) {
                webp = 'format/webp';
            }//安卓使用webp
            // var scale=1.2;//压缩系数
            // var dpr = window.devicePixelRatio > 1 ? window.devicePixelRatio : 1;
            var dpr = window.devicePixelRatio || 1;
            var w = Math.floor(json.image.offsetWidth * dpr);
            var h = Math.floor(json.image.offsetHeight * dpr);
            if (w == 0) {
                return returnObj;
            }
            var replace = '?imageMogr2/thumbnail/' + w + 'x' + h + '/strip/quality/90/' + webp;
            var opt = $.extend(true, {
                image: null,//默认的图片dom(默认无)
                rule: /\?.*/g,//默认规则(?号以及？号之后的一切)
                replace: replace,//默认替换为
                isPinjie: true,//如果没有匹配到规则rule,图片data-src末尾是否拼接上replace(默认拼接)
                domainRule: /\.fy\.shopex\./g,//域名规则(默认商派规则)
                isDomainRule: false//是否开启域名规则限制(默认关闭)
            }, json);
            var image = opt.image;
            var rule = opt.rule;
            replace = opt.replace;
            if (!image.getAttribute(attr)) {
                return returnObj;
            }
            var search = image.getAttribute(attr).match(rule);
            if (opt.isDomainRule) {
                if (!image.getAttribute(attr).match(opt.domainRule)) {
                    return returnObj;
                }
            }
            if (search) {
                returnObj.src = image.getAttribute(attr).replace(rule, replace);
            } else {
                if (opt.isPinjie) {
                    returnObj.src = image.getAttribute(attr) + replace;
                }
            }
            return returnObj;
        },
        isIPhone: function () {
            return window.navigator.appVersion.match(/iphone/gi);
        },
        isAndroid: function () {
            return window.navigator.appVersion.match(/android/gi);
        },
        isPc: function () {
            var userAgentInfo = navigator.userAgent;
            var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
            var flag = true;
            for (var v = 0; v < Agents.length; v++) {
                if (userAgentInfo.indexOf(Agents[v]) > 0) {
                    flag = false;
                    break;
                }
            }
            return flag;
        },
        isWeixin: function () {
            var ua = navigator.userAgent.toLowerCase();
            if (ua.match(/MicroMessenger/i) == "micromessenger") {
                return true;
            } else {
                return false;
            }
        },
        getPhoneType: function () {
            var pattern_phone = new RegExp("iphone", "i");
            var pattern_android = new RegExp("Android", "i");
            var userAgent = navigator.userAgent.toLowerCase();
            var isAndroid = pattern_android.test(userAgent);
            var isIphone = pattern_phone.test(userAgent);
            var phoneType = "phoneType";
            if (isAndroid) {
                var zh_cnIndex = userAgent.indexOf("-");
                var spaceIndex = userAgent.indexOf("build", zh_cnIndex + 4);
                var fullResult = userAgent.substring(zh_cnIndex, spaceIndex);
                phoneType = fullResult.split(";")[1];
            } else if (isIphone) {
                //6   w=375    6plus w=414   5s w=320     5 w=320
                var wigth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                if (wigth > 400) {
                    phoneType = "iphone6 plus";
                } else if (wigth > 370) {
                    phoneType = "iphone6";
                } else if (wigth > 315) {
                    phoneType = "iphone5 or iphone5s";
                } else {
                    phoneType = "iphone 4s";
                }
            } else {
                phoneType = "您的设备太先进了";
            }
            return phoneType;
        },
        px2rem: function (opts) {
            if (!opts) {
                return false
            }
            ;
            var num = 0;
            var data = 0;
            if (!(opts instanceof Array) && base.utils.isJson(opts)) {
                num = opts.num;
                opts.type = opts.type || 'rem';
                data = (opts.type != 'rem' ? (num / 75) : ((num / 75) + opts.type));
            } else {
                num = opts;
                data = (num / 75) + 'rem';
            }
            ;

            return data;
        },
        toArrary: function (obj) {
            if (!obj) return false;
            if (obj instanceof Array) {
                return obj;
            } else if (base.utils.isJson(obj)) {
                obj = base.jsonToArray(obj);
                return obj;
            } else {
                var arr = [];
                arr.push(obj);
                return arr;
            }
        },
        isJson: function (obj) {
            obj = obj || {};
            var isjson = typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
            return isjson;
        },
        parseUrl: function (str) {
            var arr, part, url = {};
            if (!(str || '').replace(/^\s+|\s+$/, '')) {
                return {};
            }
            str = str.substring(1, str.length);
            if (str) {
                arr = str.split('&');
                for (var i = 0; i < arr.length; i++) {
                    part = arr[i].split('=');
                    url[part[0]] = part[1];
                }
            }
            return url;
        },
        getUrlObj: function () {
            return base.utils.parseUrl(location.search || location.hash);
        },
        addParam: function (opts) {
            if (!opts || !opts.url || !opts.params || !(opts.params instanceof Array)) {
                console.log('出错');
                return false;
            }

            var url = opts.url, params = opts.params, paramStr = '';

            for (var i = 0; i < params.length; i++) {
                paramStr += '&' + (params[i].key || '') + '=' + (params[i].value || '');
            }

            url = url.indexOf('?') > -1 ? (url + paramStr) : (url + '?' + paramStr);
            return url;
        },
        setParam: function (opts) {
            if (!opts || !opts.url || !opts.param) {
                console.log('出错');
                return false;
            }

            var url = opts.url, param = opts.param, paramStr = '', urlSearch, urlArr, num = 0;

            var qIndex = url.indexOf('?');

            if (qIndex <= -1) {
                paramStr = base.utils.addParam({
                    url: url,
                    params: [{key: (param.key || ''), value: (param.value || '')}]
                });
                return paramStr;
            }

            urlSearch = url.substring(qIndex + 1);
            urlArr = urlSearch.split('&');

            for (var i = 0; i < urlArr.length; i++) {
                urlArr[i] = urlArr[i].split('=');
                if (urlArr[i][0] == (param.key || '')) {
                    num = 1;
                    urlArr[i][1] = param.value || '';
                }
            }

            if (num > 0) {
                for (var i = 0; i < urlArr.length; i++) {
                    urlArr[i] = urlArr[i].join('=');
                }
                return (url.substring(0, (qIndex + 1)) + urlArr.join('&'));
            }

            paramStr = base.utils.addParam({
                url: url,
                params: [{key: (param.key || ''), value: (param.value || '')}]
            });
            return paramStr;
        },
        strlen: function (str) {
            if (!str) return false;
            var len = 0;
            for (var i = 0; i < str.length; i++) {
                var c = str.charCodeAt(i);
                ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) ? (len++) : (len += 2)
            }
            return len;
        },
        setCookie: function (name, value, expires) {
            var myDate = new Date();
            var myTime = myDate.getTime();
            myDate.setTime(myTime + expires * 24 * 60 * 60 * 1000);
            document.cookie = name + '=' + value + '; expires=' + myDate;
        },
        getCookie: function (name) {
            var cookie = document.cookie;
            var arr = cookie.split('; ');
            var value = '';
            arr.forEach(function (v, i) {
                var arr2 = v.split('=');
                if (arr2[0] == name) {
                    value = arr2[1];
                    return false;
                }
            });
            return (value ? value : null);
        },
        delCookie: function (name) {
            base.utils.setCookie(name, '', -1);
        },
        arrayFindkey: function (arr, key, value) {
            //  value可不传，是查json值用的
            if (!(arr && arr instanceof Array && key)) return false;
            var index = -1;
            for (var i = 0; i < arr.length; i++) {
                if (value) {
                    if (arr[i][key] == value) {
                        index = i;
                    }
                } else {
                    if (arr[i] == key) {
                        index = i;
                    }
                }
            }
            return index;
        }
    };

    base.jsonToArray = function (opts) {
        opts = opts || {};
        var arr = [];
        if (opts instanceof Array) {
            return opts;
        }

        for (var i in opts) {
            arr.push(opts[i]);
        }
        return arr;
    };
    base.statistics = function () {
        (function () {
            //百度统计
            var doc = document;
            var _hmt = _hmt || [];
            (function () {
                var hm = doc.createElement("script");
                hm.src = "//hm.baidu.com/hm.js?a82be26d433bd6112940674a0c6dd37b";
                var s = doc.getElementsByTagName("script")[0];
                s.parentNode.insertBefore(hm, s);
            })();
        })();
    };
    base.scrollTo = function (json) {
        var opt = json || {};
        var obj = opt.obj;
        var resultTop = opt.resultTop || '0';
        if (!obj) {
            console.log('parameter error');
            return false;
        }
        var doc = document;
        var scale = 6;
        var scrollT = doc.documentElement.scrollTop || doc.body.scrollTop;
        var speed = 0;
        var timer = null;
        var fn = function () {
            speed = Math.ceil((scrollT - resultTop) / scale);
            scrollT -= speed;
            window.scrollTo(0, scrollT);
            timer = requestAnimationFrame(fn);
            if (scrollT <= resultTop * 1) {
                cancelAnimationFrame(timer);
            }
        };
        obj.addEventListener('click', function (ev) {
            ev.stopPropagation();
            ev.preventDefault();
            scrollT = doc.documentElement.scrollTop || doc.body.scrollTop;
            requestAnimationFrame(fn);
        });
        doc.addEventListener('touchstart', function (ev) {
            cancelAnimationFrame(timer);
        });
    };

    base.yesNoScroll = function () {//浏览器禁止滚动
        var doc = document;
        return {
            //阻止冒泡
            stopPropagation: function (ev) {
                ev.stopPropagation();
            },
            //阻止默认事件
            preventDefault: function (ev) {
                ev.preventDefault();
            },
            //阻止冒泡,阻止默认事件
            returnFalse: function (ev) {
                ev.preventDefault();
                ev.stopPropagation();
            },
            //禁止滚动
            noScroll: function () {
                doc.addEventListener('touchmove', this.preventDefault, false);
                doc.documentElement.style.overflow = 'hidden';
            },
            //解除禁止浏览器滚动
            yesScroll: function () {
                doc.removeEventListener('touchmove', this.preventDefault, false);
                doc.documentElement.style.overflow = 'auto';
            }
        }
    };

    base.loading = function () {//加载中
        var doc = document;
        var body = doc.body;
        var loading = doc.createElement('div');
        loading.className = 'loading on';
        loading.innerHTML = '<img src="data:image/png;base64,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"/>';
        return {
            show: function () {
                body.appendChild(loading);
            },
            hide: function () {
                body.removeChild(loading);
            }
        }
    };

    base.secondsToDate = function (opt) {//秒转日期
        var seconds = opt.seconds;
        var killDate = new Date(seconds * 1000);
        var fen = (killDate.getMinutes() > 9) ? killDate.getMinutes() : ('0' + killDate.getMinutes());
        return {
            month: killDate.getMonth() + 1,//月
            day: killDate.getDate(),//天
            hour: killDate.getHours(),//小时
            minu: fen//分
        }
    };
    base.secondsToTime = function (opt) {//秒转剩余时间
        var seconds = opt.seconds;
        var d = Math.floor(seconds / 3600 / 24);//天
        var h = Math.floor(seconds / 3600 % 24);//小时
        var m = Math.floor(seconds % 3600 / 60);//分钟
        var s = Math.floor(seconds % 60);//秒数
        return {d: d, h: h, m: m, s: s, a: seconds};
    };
    base.timeCountDown = function (opt) {//倒计时
        var seconds = opt.seconds;
        var runCallback = opt.runCallback;//运行的回调
        var overCallback = opt.overCallback;//结束的回调
        var timeTransform = base.secondsToTime;//时间转换
        if (seconds <= 0) {//时间小于0秒
            seconds = 0;
            runCallback && runCallback(timeTransform({seconds: seconds}));//运行时的回调
            overCallback && overCallback();//结束时的回调
        } else {//时间大于0秒
            runCallback && runCallback(timeTransform({seconds: seconds}));//运行时的回调
            //倒计时走你
            var timer = setInterval(function () {
                seconds--;
                runCallback && runCallback(timeTransform({seconds: seconds}));//运行时的回调
                if (seconds < 0) {
                    seconds = 0;
                    clearInterval(timer);
                    runCallback && runCallback(timeTransform({seconds: seconds}));//运行时的回调
                    overCallback && overCallback();//结束时的回调
                }
            }, 1000);
        }
    };

    return base;

})(window, $);