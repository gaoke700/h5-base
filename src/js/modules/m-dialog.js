define(function (require, exports, module) {

    function Dialog(opts){
        this.opts = {
            showMask:true,
            showHeader: false,
            showBtn: true,
            parent: $('body'),
            btnOkTxt: '确定',
            btnCancelTxt: '取消',
            headerTxt: '提示',
            type:'confirm',   //alert, confirm
            cancelCallback: null,
            okCallback: null,
            closeCallback: null,
            content: '',
            customContent:false,
            style:{
                position:'center',  //center/top/bottom
                borderRadius: 5,
                zIndex:277,
                width: 'auto',
                mask:'0.5',
                background:'#fff'
            }
        };
        this.saveThrough = true;
        $.extend(true, this.opts, opts);
        this.createEle();
    };

    Dialog.prototype.constructor = Dialog;

    Dialog.prototype.createEle = function(){
        var htmls = [], showMask, showHeader, showBtn, btnHtml, contentHtml, _this= this;
        var optsStyle = this.opts.style;
        this.containerEle = $('<div class="g-dialog-container"></div>');

        showMask = this.opts.showMask ? '<div class="g-dialog-mask" style="z-index: ' + optsStyle.zIndex + '; background-color: rgba(0,0,0,' + optsStyle.mask + ')"></div>' : '';
        showHeader = this.opts.showHeader ? '<div class="g-dialog-header"><p class="title">' + this.opts.headerTxt + '</p><span class="close g-btn-cancel icons icons-guanbi"></span></div>' : '';

        if(this.opts.type == 'alert'){
            btnHtml = '<div class="g-btn-default g-btn-ok" style="margin-right: 0;">' + this.opts.btnOkTxt + '</div>';
        } else {
            btnHtml = '<div class="g-btn-default g-btn-cancel">' + this.opts.btnCancelTxt + '</div><div class="g-btn-default g-btn-ok">' + this.opts.btnOkTxt + '</div>';
        }

        showBtn = this.opts.showBtn ? ('<div class="g-dialog-btn">' + btnHtml + '</div>') : '';
        contentHtml = this.opts.customContent ? this.opts.content : ('<div class="g-dialog-content-default">' + this.opts.content + '</div>');

        htmls.push(showMask);
        htmls.push('<div class="g-dialog-wrap g-dialog-wrap-' + optsStyle.position + '" style="background: ' + optsStyle.background + '; width:' + optsStyle.width + '; border-radius: ' + base.utils.px2rem(optsStyle.borderRadius*2) + '; z-index: ' + optsStyle.zIndex + ';">');
        htmls.push(showHeader);
        htmls.push('<div class="g-dialog-content"></div>');
        htmls.push(showBtn);
        htmls.push('</div>');

        this.containerEle.html(htmls.join(''));
        this.containerEle.find('.g-dialog-content').append(contentHtml);
        this.opts.parent.append(this.containerEle);
        this.contentWrap = this.containerEle.children('.g-dialog-wrap');
        if(this.contentWrap.width()%2 !=0){
            this.contentWrap.css({'width':(this.contentWrap.width() + 1)})
        }
        if(this.contentWrap.height()%2 !=0){
            this.contentWrap.css({'height':(this.contentWrap.height() + 1)})
        }

        if(optsStyle.position && (optsStyle.position == 'top' || optsStyle.position == 'bottom')){
            setTimeout(function(){
                _this.containerEle.find('.g-dialog-wrap').addClass('g-dialog-wrap-' + optsStyle.position + '-show');
            },50);
        }
        this.containerEle.on('tap', '.g-btn-cancel, .g-dialog-mask', function(event){
            _this.remove();
            if(_this.opts.cancelCallback && (typeof _this.opts.cancelCallback == 'function')){
                _this.opts.cancelCallback();
            };
            event.preventDefault();
        });
        this.containerEle.on('touchend', '.g-btn-ok', function(event){
            if(_this.opts.okCallback && (typeof _this.opts.okCallback == 'function')){
                _this.opts.okCallback();
            }
            if(!_this.saveThrough){
                return false;
            }
            _this.remove();
            event.preventDefault();
        });
    };

    Dialog.prototype.remove = function(){
        var optsStyle = this.opts.style, _this = this;

        if(optsStyle.position && (optsStyle.position == 'top' || optsStyle.position == 'bottom')){
            _this.containerEle.find('.g-dialog-wrap').removeClass('g-dialog-wrap-' + optsStyle.position + '-show');
            setTimeout(function(){
                $(_this.containerEle).remove();
                if(_this.opts.closeCallback && (typeof _this.opts.closeCallback == 'function')){
                    _this.opts.closeCallback();
                }
            },50);
        } else {
            $(_this.containerEle).remove();
            if(_this.opts.closeCallback && (typeof _this.opts.closeCallback == 'function')){
                _this.opts.closeCallback();
            }
        }
    };

    function dialogCustom1(opts) {
        opts.content = '<div class="g-dialog-custom-1"><div class="g-dialog-custom-1-text"><p class="icons font ' + (opts.iconName || 'icons-gantanhao') + '"></p><p class="text">' + opts.content + '</p></div></div>';
        opts.customContent = true;
        return new Dialog(opts);
    }

    function dialogPrompt1(opts) {

        var defaultOpts = $.extend(true, {
            customContent: true,
            showMask: false,
            showBtn: false,
            style: {
                background: 'none'
            }
        }, opts);

        defaultOpts.content = '<div class="g-dialog-prompt-1"><div class="g-dialog-prompt-1-text">' + (opts.content || '') + '</div></div>';

        var prompt1 = new Dialog(defaultOpts);

        setTimeout(function () {
            prompt1.remove();
            if (opts.callback) {
                opts.callback();
            }
        }, opts.time || 1500);
    }

    exports.dialogCustom1 = dialogCustom1;  //带图标(有确定和取消按钮)
    exports.dialogPrompt1 = dialogPrompt1;  //闪2s
    exports.Dialog = Dialog;
});