define(function (require, exports, module) {
    var Dialog = require('js/common/plug/dialog');
    var addSubtract=require('js/common/plug/addSubtract');

    function ProductSelectStandard(opts){
        this.opts = $.extend({
            goods_id:'',
            defaultData:'',
            showJoinCart:false,
            showBuyNow:false,
            showSendGift:false,
            showHowToGiftTip:false,
            groupSingleBuy:false,
            joinGroupId:'',
            closeCallback:'null'
        }, opts || {});
        this.data = {};
        this.init();
    }
    ProductSelectStandard.prototype.constructor = ProductSelectStandard;
    ProductSelectStandard.prototype.init = function(){
        var _this=this;
        if(!this.opts.goods_id){ return false;}
        this.$productSelectStandard = $('<div class="g-product-select-standard"></div>');
        this.dialog = new Dialog.Dialog({
            showBtn: false,
            customContent: true,
            content: this.$productSelectStandard,
            closeCallback:_this.opts.closeCallback,
            style:{
                position:'bottom',
                borderRadius:.1,
                width: '100%'
            }
        });
        this.ajax();
        this.event();
    };
    ProductSelectStandard.prototype.render = function(obj){
        var htmls = [],data = obj.classifylist || [], _this = this;
        var searchid = _this.currentStandard.searchid.split('-') || [];
        var buyType = _this.data.result.goodsType;
        htmls.push('<div class="product-header">');
        htmls.push('<i class="icons icons-guanbi close-popup js-close-parent"></i>');
        htmls.push('<img class="product-img" src=""/>');

        htmls.push('<div class="product-infos">');
        if(buyType == 'scoremall'){
            htmls.push('<div class="score-goods-name"></div>');
            htmls.push('<div class="score-goods-price"></div>');
        }else{
            htmls.push('<div class="product-pirce"></div>');
            htmls.push('<p class="product-store">库存：<span></span></p>');
            htmls.push('<p class="product-standard">已选：<span></span></p>');
        }
        htmls.push('</div>');
        htmls.push('</div>');


        htmls.push('<div class="product-content">');
        htmls.push('<div class="is-scroll">');
        if(_this.opts.showHowToGiftTip){
            var dom=`
        	<div class="how-to-gift">
        		<div class="how-to-gift-content">
                    <div class="gift-content-title" >如何送礼</div>
        			<p class="gift-content-bottom">
        				1、选择要送出的礼物和数量，如购买10件可分享送给10个好友领取；<br/>
						2、付款成功后将订单分享给好友，好友领取礼物并填写收货地址，即可完成礼物的领取；<br/>
						3、送礼订单的有效期为3天，逾期未领取的礼物钱款将自动退还至送礼人的支付账户中。<br/>	
        			</p>
        		</div>
        	</div>`.trim();
            htmls.push(dom);
        }
        htmls.push('<div class="standards">');
        for(var i=0;i<data.length;i++) {
            htmls.push('<div class="js-classify classify-'+data[i].classify+'">');
            htmls.push('<p>'+data[i].title+'</p>');
            htmls.push('<ul>');
            for (var j = 0; j < data[i].list.length; j++) {
                htmls.push('<li data-pid="' + data[i].list[j].id + '" class="'+((data[i].list[j].id == searchid[i])? 'active2':'')+'">' + data[i].list[j].text + '</li>');
            }
            htmls.push('</ul>');
            htmls.push('</div>');
        }
        htmls.push('</div>');

        htmls.push('<div class="number-warp">');
        htmls.push('<p>数量</p>');
        htmls.push('<div class="limit-buy none">（可购买数：<span></span>件）</div>');
        htmls.push('<div class="plus">');
        htmls.push('<span class="no-active js-reduce-num"><i class="icons icons-jianhao"></i></span>');
        htmls.push('<input class="num-value" type="text" value="1" />');
        htmls.push('<span class="js-add-num"><i class="icons icons-jiahao"></i></span>');
        htmls.push('</div>');
        htmls.push('</div>');

        htmls.push('</div>');
        htmls.push('</div>');
        htmls.push('<div class="bottom-btns">');
        if(_this.opts.showJoinCart){
            htmls.push('<div class="join-cart join-cart-js">加入购物车</div>');
        }
        if(_this.opts.showBuyNow){
            if(buyType=='normal'){
                htmls.push('<div class="normal buy-now buy-now-js">立即购买</div>');
            }else if(buyType=='secKill'){
                htmls.push('<div class="buy-now buy-now-js seckill">立即购买</div>');
            }else if(buyType=='group'){
                if(_this.opts.groupSingleBuy){  //拼团中的单独购买
                    htmls.push('<div class="buy-now buy-now-js normal">立即购买</div>');
                }else{
                    htmls.push('<div class="open-group buy-now buy-now-js">立即购买</div>');
                }
            }else if(buyType=='joinGroup'){
                if(_this.opts.groupSingleBuy){  //参团中的单独购买
                    htmls.push('<div class="buy-now buy-now-js normal">立即购买</div>');
                }else{
                    htmls.push('<div class="join-group buy-now buy-now-js">立即购买</div>');
                }
            }else if(buyType=='scoremall'){
                htmls.push('<div class="buy-now buy-now-js score-mall">立即兑换</div>');
            }
        }
        if(_this.opts.showSendGift){
            htmls.push('<div class="send-gift send-gift-js">选好礼物</div>');
        }
        htmls.push('</div>');
        return htmls.join('');
    };
    ProductSelectStandard.prototype.event = function(){
        var _this = this;
        //关闭弹窗
        this.$productSelectStandard.on('click', '.js-close-parent', function(){
            _this.dialog.remove();
        });
//选择规格
        this.$productSelectStandard.on('click', '.standards li', function(){

            if(!$(this).hasClass('active1')) {

                //规格筛选
                if($(this).hasClass('active2')){
                    $(this).removeClass('active2');
                }else{
                    $(this).siblings().removeClass('active2');
                    $(this).addClass('active2');
                }
                _this.renderStandard();

            }
        });
        //加入购物车
        this.$productSelectStandard.on('click', '.join-cart-js', function(){
            // if(!$(this).hasClass('bg-grey')) {   //请暂时别删这行有问题问高科
                if(!_this.isSelectAll()){
                    Dialog.dialogPrompt1({
                        content: '请选择所有规格'
                    });
                    return false;
                }
                // if (_this.currentStandard.store <= 0) {     //一开始库存数
                //     _this.$productSelectStandard.find('.bottom-btns div').addClass('bg-grey');
                //     Dialog.dialogPrompt1({
                //         content: '商品已抢光'
                //     });
                //     return false;
                // }
                base.ajax({
                    url: 'index.php?ctl=carts&act=add',
                    type: 'post',
                    data: {
                        product_id: _this.currentStandard.pid,
                        num: _this.$productSelectStandard.find('.num-value')[0].value
                    },
                    dataType: 'json',
                    success: function (data) {
                        //购物车小红点
                        if(data.res == 'succ'){
                            $('body').find('.js-my b').removeClass('none');
                            $('body').find('.js-dian-carts b').removeClass('none');
                            $('body').find('.js-cart i').removeClass('none').html(parseInt($('body').find('.js-cart i').html())+parseInt(_this.$productSelectStandard.find('.num-value')[0].value));
                            //加完购物车关闭弹层
                            Dialog.dialogPrompt1({content: '已加入购物车'});
                            _this.dialog.remove();
                        }
                    }
                });
            // }
        });
        //立即购买
        this.$productSelectStandard.on('click', '.buy-now-js', function(){
            // if(!$(this).hasClass('bg-grey')){    //请暂时别删这行有问题问高科
                if(!_this.isSelectAll()){
                    Dialog.dialogPrompt1({
                        content: '请选择所有规格'
                    });
                    return false;
                }
                var value=_this.$productSelectStandard.find('.num-value')[0].value;

                if($(this).hasClass('normal')){//普通商品
                    location.href='index.php?ctl=orders&act=checkout&goods['+ _this.currentStandard.pid +']='+value;
                }else if($(this).hasClass('seckill')){  //秒杀
                    $.ajax({
                        url:"openapi.php?act=getGoodsInfos&goods_id=" + _this.opts.goods_id,
                        dataType:'json',
                        success:function(v){
                            if(v.result.seckillMsg.countDown>0){
                                location.href='index.php?ctl=orders&act=checkout&type=seckill&goods['+_this.currentStandard.pid +']='+value;
                            }else{
                                Dialog.dialogPrompt1({content:'活动已结束'});
                                _this.$productSelectStandard.find('.bottom-btns div').addClass('bg-grey');
                                _this.$productSelectStandard.find('.bottom-btns .buy-now-js').removeClass('buy-now-js');
                            }
                        }
                    });
                }else if($(this).hasClass('open-group')){ //拼团--开团
                    location.href='index.php?ctl=orders&act=checkout&type=groupbuy&goods['+_this.opts.goods_id +']='+value;
                }else if($(this).hasClass('join-group')){ //拼团--参团
                    location.href='index.php?ctl=orders&act=checkout&type=groupbuy&goods['+_this.opts.goods_id +']='+value+'&team_id='+_this.opts.joinGroupId;
                }else if($(this).hasClass('score-mall')){
                    location.href='index.php?ctl=orders&act=checkout&type=scoremall&goods['+_this.currentStandard.pid +']='+value;
                }
            // }
        });
        //送礼
        this.$productSelectStandard.on('click', '.send-gift-js', function(){
            // if(!$(this).hasClass('bg-grey')){    //请暂时别删这行有问题问高科
                if(!_this.isSelectAll()){
                    Dialog.dialogPrompt1({
                        content: '请选择所有规格'
                    });
                    return false;
                }
                window.location.href='index.php?ctl=orders&type=gifts&act=checkout&goods['+_this.currentStandard.pid+']='+_this.$productSelectStandard.find('.num-value')[0].value;
            // }
        })
    };
    ProductSelectStandard.prototype.isSelectAll = function(){
        var claLen = this.$productSelectStandard.find('.js-classify').length;
        var actLen = this.$productSelectStandard.find('.js-classify li.active2').length;
        return ((claLen == actLen) && (actLen>0))? true:false
    };
    ProductSelectStandard.prototype.renderStandard = function(){
        var _this = this;
        _this.activedStandard = [];
        _this.$productSelectStandard.find('.js-classify li.active2').each(function (i,v) {
            var obj={};
            obj.selfIndex=$(v).parents('.js-classify').find(v).index();
            obj.fatherIndex = $(v).parents('.js-classify').index();
            obj.thisPid = $(v).data('pid');
            _this.activedStandard.push(obj);
        });

        //选择
        _this.$productSelectStandard.find('.js-classify li').removeClass('active1');

        //联动判断（为禁止当前规格写的），但产品取消了此需求，防止后面加上，请暂时别删这行有问题问高科
        // $.each(_this.activedStandard,function (key,item) {
        //     var linkother = _this.data.result.classifylist[item.fatherIndex].list[item.selfIndex].linkother || 'all';
        //     if(linkother != 'all'){
        //         $.each(linkother,function (index,value) {
        //             if(value.itemsid != 'all'){
        //                 $('.classify-'+value.classify+' li').each(function (i,v) {
        //                     if(!$(v).hasClass('active1')){
        //                         if(value.itemsid.indexOf($(v).data('pid').toString()) == -1){
        //                             $(v).addClass('active1')
        //                         }
        //                     }
        //                 })
        //             }
        //         });
        //     }
        // });

        //库存判断，当选择的规格比所有规格少一项时，判断最后一项组合起来库存为0 的置灰不可点;如果全部规格选中（根据其他项定当前项第库存）

        _this.$productSelectStandard.find('.js-classify').each(function (i,v) {
            if($(v).find('li.active2').length>0){
                $(v).addClass('has-active2');
            }else{
                $(v).removeClass('has-active2');
            }
        });

        var classifyLength = _this.$productSelectStandard.find('.js-classify').length;
        if(classifyLength >= _this.activedStandard.length -1){
            var pidHearder = [];
            $.each(_this.activedStandard,function (i,v) {
                pidHearder.push(v.thisPid);
            });

            if(classifyLength == _this.activedStandard.length){
                _this.$productSelectStandard.find('.js-classify li').each(function (key,item) {
                    var thisFatherIndex = $(item).parents('.js-classify').index();
                    var changedPidHearder=JSON.parse(JSON.stringify(pidHearder));
                    changedPidHearder.splice(thisFatherIndex,1,$(item).data('pid'));
                    var pid = changedPidHearder.join('-');
                    $.each(_this.data.result.product,function (i,v) {
                        if(v.searchid == pid){
                            if(v.store <=0 || v.marketable == 'false'){
                                $(item).addClass('active1');
                            }
                            return false;
                        }
                    });
                })
            }else{
                var hasNotActive2Index = _this.$productSelectStandard.find('.js-classify').not('.has-active2').index();
                _this.$productSelectStandard.find('.js-classify').eq(hasNotActive2Index).find('li').each(function (key,item) {
                    var changedPidHearder=JSON.parse(JSON.stringify(pidHearder));
                    changedPidHearder.splice(hasNotActive2Index,0,$(item).data('pid'));
                    var pid = changedPidHearder.join('-');
                    $.each(_this.data.result.product,function (i,v) {
                        if(v.searchid == pid){
                            if(v.store <=0 || v.marketable == 'false'){
                                $(item).addClass('active1');
                                // pidHearder.splice(hasNotActive2Index,1);
                            }
                            return false;
                        }
                    });
                })
            }
        }

        //寻找当前规格信息
        var searchidarr = [];
        var choosedtext = [];
        _this.$productSelectStandard.find('.js-classify li.active2').each(function (i,v) {
            searchidarr.push($(v).data('pid'));
            choosedtext.push($(v).html());
        });

        _this.currentStandard = _this.data.result.product[0];
        if(searchidarr.length<classifyLength){
            $.each(_this.data.result.product,function (i,v) {
                if(v.defaultselect){
                    _this.currentStandard = v;
                    return false;
                }
            });
        }else{
            var searchid = searchidarr.join('-');
            $.each(_this.data.result.product,function (i,v) {
                if(v.searchid == searchid){
                    _this.currentStandard = v;
                    return false;
                }
            });
        }

        $('.currentStandard').val(JSON.stringify(_this.currentStandard));

        //库存限购数
        _this.limitNum = _this.currentStandard.store;

        //更改当前规格信息
        _this.$productSelectStandard.find('.product-img').prop('src',_this.currentStandard.imgsrc);
        if(_this.data.result.goodsType == 'scoremall'){
            _this.$productSelectStandard.find('.score-goods-name').html(_this.data.result.title);
            _this.$productSelectStandard.find('.score-goods-price').html('￥'+_this.currentStandard.price+'+'+_this.currentStandard.score+'积分');
            $('body').find('.score-price').html('￥'+_this.currentStandard.price+'+'+_this.currentStandard.score+'积分');
            $('body').find('.select-standard .content').html(_this.currentStandard.text);
        }else{
            _this.$productSelectStandard.find('.product-pirce').html('￥'+_this.currentStandard.price);
            _this.$productSelectStandard.find('.product-store span').html(_this.currentStandard.store+'件');
            _this.$productSelectStandard.find('.product-standard span').html(choosedtext.join('、'));
            $('body').find('.select-standard .content').html(choosedtext.join('、'));
            $('body').find('.price big').html(_this.currentStandard.price);

            if (_this.data.result.goodsType == 'secKill') {
                $('body').find('.seckill .seckill-price span').html(_this.currentStandard.sec_price);
            }else if (_this.data.result.goodsType == 'group' || _this.data.result.goodsType == 'joinGroup') {
                $('body').find('.price big').html(_this.currentStandard.group_price);
                if(!_this.opts.groupSingleBuy){ //拼团的信息
                    _this.$productSelectStandard.find('.product-pirce').html('￥'+_this.currentStandard.group_price);
                    _this.$productSelectStandard.find('.product-store span').html(_this.currentStandard.group_store+'件');

                    _this.limitNum = _this.currentStandard.group_store;
                }

            }
        }

        //限购
        var buyNum = _this.limitNum;
        if(_this.data.result.limitBuy == 'on' && !_this.opts.groupSingleBuy){
            buyNum = _this.data.result.limit_num;
            if(buyNum>_this.limitNum*1){
                buyNum=_this.limitNum;
            }
            _this.$productSelectStandard.find('.limit-buy').removeClass('none').find('span').html(buyNum);
        }

        //如果可购买数为0
        if(buyNum<=0){
            _this.$productSelectStandard.find('.bottom-btns div').addClass('bg-grey');
            _this.$productSelectStandard.find('.bottom-btns .join-cart-js').removeClass('join-cart-js');
            _this.$productSelectStandard.find('.bottom-btns .buy-now').removeClass('buy-now-js');
        }else{
            _this.$productSelectStandard.find('.bottom-btns div').removeClass('bg-grey');
            _this.$productSelectStandard.find('.bottom-btns .join-cart').addClass('join-cart-js');
            _this.$productSelectStandard.find('.bottom-btns .buy-now').addClass('buy-now-js');
        }

        //如果已选数量大于库存就改为库存
        var selectNum = _this.$productSelectStandard.find('.num-value')[0].value*1;
        if (selectNum > buyNum) {
            _this.$productSelectStandard.find('.num-value')[0].value = buyNum;
        }
        _this.$productSelectStandard.find('.js-reduce-num').addClass('no-active');
        addSubtract({
            noActiveClass: 'no-active',
            add: _this.$productSelectStandard.find('.js-add-num')[0],
            substract: _this.$productSelectStandard.find('.js-reduce-num')[0],
            input: _this.$productSelectStandard.find('.num-value')[0],
            inventoryNum: buyNum
        });

    };
    ProductSelectStandard.prototype.doRenderFunction = function(){

        var _this = this;
        _this.currentStandard = _this.data.result.product[0] || {};
        $.each(_this.data.result.product,function (ind,val) {
            if(val.defaultselect){
                // this.currentStandard = JSON.parse(JSON.stringify(val));
                _this.currentStandard = val;
                return false;
            }
        });

        if($('.currentStandard').length>0){
            if(($('.currentStandard').data('goodsid')==_this.opts.goods_id)){
                _this.currentStandard =JSON.parse($('.currentStandard').val());
            }
            $('.currentStandard').data('goodsid',_this.opts.goods_id).val(JSON.stringify(_this.currentStandard))
        }else{
            // this.currentStandard = JSON.parse(JSON.stringify(this.data.result.product[0])) || {};
            $('body').append($('<input class="currentStandard" type="hidden" data-goodsid="'+_this.opts.goods_id+'" value="'+JSON.stringify(_this.currentStandard)+'" />'))
        }

        _this.$productSelectStandard.html(_this.render(_this.data.result || {}));
        _this.renderStandard();
    };
    ProductSelectStandard.prototype.ajax = function(){
        var _this = this;

        if(_this.opts.defaultData!='' && !_this.opts.joinGroupId){
            _this.data = _this.opts.defaultData;
            _this.doRenderFunction();
        }else{
            var sendData = {
                goods_id: _this.opts.goods_id
            };
            if(_this.opts.joinGroupId){  //参团
                sendData.team_id = _this.opts.joinGroupId;
            }
            base.ajax({
                url: 'openapi.php?act=getGoodsInfos',
                data: sendData,
                dataType: 'json',
                success: function(res){
                    _this.data = res || {};
                    /*_this.data={
                     res:'succ',
                     msg:'成功',
                     result:{
                     goodsType:'normal',

                     // goodsType:'joinGroup',
                     // goodsType:'openGroup',
                     // goodsType:'seckill',
                     product:[
                     {
                     searchid:'12-23-36',
                     pid:'62545',
                     text:'黄色,5寸,18g',
                     price:'12.34',
                     secPrice:2,
                     groupPrice:2,
                     joinGroupId:'12',
                     store:'5',
                     defaultselect:true,
                     limitBuy:true,
                     limit_num:3,
                     imgsrc:'https://img.yzcdn.cn/upload_files/2017/05/22/Fn0x-rqt26VxxZ2Hv8JZIyNCABSk.jpg?imageView2/2/w/100/h/100/q/75/format/webp?imageView2/2/w/100/h/100/q/75/format/webp',
                     },
                     {
                     searchid:'12-25-36',
                     pid:'65545',
                     price:'12.34',
                     store:'13',
                     text:'黄色,6寸,19g',
                     imgsrc:'https://img.yzcdn.cn/upload_files/2017/05/22/Fn0x-rqt26VxxZ2Hv8JZIyNCABSk.jpg?imageView2/2/w/100/h/100/q/75/format/webp?imageView2/2/w/100/h/100/q/75/format/webp',
                     },
                     {
                     searchid:'12453',
                     pid:'62945',
                     price:'12.34',
                     store:'22',
                     text:'黄色,7寸,20g',
                     imgsrc:'https://img.yzcdn.cn/upload_files/2017/05/22/Fn0x-rqt26VxxZ2Hv8JZIyNCABSk.jpg?imageView2/2/w/100/h/100/q/75/format/webp?imageView2/2/w/100/h/100/q/75/format/webp',
                     }
                     ],
                     classifylist:[
                     {
                     classify:'color',
                     title:'颜色',
                     list:[
                     {
                     id:'12',
                     text:'黄色',
                     linkother:[
                     {
                     classify:'size',
                     itemsid:['1','23']
                     },
                     {
                     classify:'weight',
                     itemsid:['13','2']
                     }
                     ]
                     },
                     {
                     id:'1',
                     text:'淡蓝色',
                     linkother:[
                     {
                     classify:'size',
                     itemsid:['1','2']
                     },
                     {
                     classify:'weight',
                     itemsid:'all'
                     }
                     ]
                     },
                     {
                     id:'23',
                     text:'黑青色',
                     linkother:'all'
                     },
                     {
                     id:'3',
                     text:'黑色',
                     linkother:'all'
                     }
                     ]
                     },
                     {
                     classify:'size',
                     title:'尺寸',
                     list:[{
                     id:'23',
                     text:'5寸',
                     linkother:[{
                     classify:'color',
                     itemsid:['12','3']
                     },{
                     classify:'weight',
                     itemsid:['13','36']
                     }]
                     },{
                     id:'1',
                     text:'13',
                     linkother:'all'
                     },{
                     id:'12',
                     text:'14',
                     linkother:'all'
                     },{
                     id:'3',
                     text:'55',
                     linkother:'all'
                     }]
                     },
                     {
                     classify:'weight',
                     title:'重量',
                     list:[{
                     id:'13',
                     text:'5g',
                     linkother:[{
                     classify:'size',
                     itemsid:['1','23']
                     },{
                     classify:'color',
                     itemsid:['1','3']
                     }]
                     },{
                     id:'36',
                     text:'18g',
                     linkother:'all'
                     },{
                     id:'2',
                     text:'7g',
                     linkother:'all'
                     }]
                     }
                     ]
                     }
                     };*/

                    _this.doRenderFunction();

                }
            });
        }


    };

    module.exports = ProductSelectStandard;
});