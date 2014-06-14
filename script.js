/**
 * html5-picker Javascript Lib Core
 * Ver : 0.0.1-SNAPSHOT
 * Date : 2014-06-10
 * created by julio-kim
 **/
(function (window, undefined) {
    var picker = window.picker || {};
    
    picker.bind = function (canvas) {
        var that = this;
        var _canvas = canvas;
        var _ctx = _canvas.getContext("2d");
        var _source = null;
        var _isPainted = false;
        var _isRightClicked = false;
        var _oldPos = null;
        var _prevPos = {x:0,y:0};
        var $CANVAS = $(_canvas);
        var $CONTAINER = $($CANVAS).parent();
        
        // -------------------------------------------
        // private method
        // -------------------------------------------
        var _init = function () {
            $CANVAS.attr({width: $CONTAINER.width()});
            $CANVAS.attr({height: $CONTAINER.height()});
            $(window).resize(function() {
                $CANVAS.attr({width: $CONTAINER.width()});
                $CANVAS.attr({height: $CONTAINER.height()});
            });
            
            $CANVAS.mousemove(function (evt) {
                var mousePos = picker.util.mousePosition(evt);
                if(_isRightClicked === false) {
                    var hexColor = _getCanvasPosColor(mousePos);
                    $("#current #color").css({background: hexColor});
                    $("#current #value").html(hexColor);
                } else {
                    // FIXME
                    console.log(_prevPos);
                    console.log(mouse.Pos.x - _oldPos.x, mousePos.y - _oldPos.y);
                    that.redraw(_prevPos.x + mousePos.x - _oldPos.x, _prevPos + mousePos.y - _oldPos.y);
                    _oldPos = mousePos;
                }
            });
            
            $CANVAS.mousedown(function (evt) {
                if(evt.button == 2) {
                    _isRightClicked = true;
                    _oldPos = picker.util.mousePosition(evt);
                    $CANVAS.css({cursor: "move"});
                }
            });
            
            $CANVAS.mouseup(function (evt) {
                if(evt.button == 2) {
                    _isRightClicked = false;
                    $CANVAS.css({cursor: "crosshair"});
                    _prevPos = _oldPos;
                } else if (evt.button == 0) {
                    if(_isPainted == true)
                        _addPalette(_getCanvasPosColor(picker.util.mousePosition(evt)));
                }
            });
            
            $CANVAS.bind("dragenter", function (evt) {
                $CONTAINER.css({borderColor: "red"});
                return false;
            });
            
            $CANVAS.bind("dragleave", function (evt) {
                $CONTAINER.css({borderColor: "gray"});
                return false;
            });
            
            $CANVAS.bind("dragover", function (evt) {
                return false;
            });
            
            $CANVAS.bind("dragover", function (evt) {
                picker.util.stopEvent(evt);
                $CONTAINER.css({borderColor: "gray"});
                
                var files = evt.originalEvent.dataTransfer.files;
                var reader = new FileReader();
                reader.onload = function (evt) {
                    var URLObj = window.URL || window.webkitURL;
                    that.setSource(evt.target.result);
                    that.redraw();
                };
                
                for (var i = 0; i < files.length; i++) {
                    if (files[i].type.match('image.*')) {
                        reader.readAsDataURL(files[i]);
                        berak;
                    }
                }
                
                return false;
            });
            
            $("#footerBtn").click(function (evt) {
                var eles = $("#colorList").children();
                if (eles.length > 0)
                    _removeRecursive(eles, 0, eles.length);
            });
            
            $(window).bind("paste", function (evt) {
                var clipboard = evt.originalEvent.clipboardData;
                if (clipboard) {
                    var items = clipboard.items;
                    if (items) {
                        for (var i = 0; i < items.length; i++) {
                            if (items[i].type.indexOf("image") !== -1) {
                                var blob = items[i].getAsFile();
                                var URLObj = window.URL || window.webkitURL;
                                var source = URLObj.createObjectURL(blob);
                                that.setSource(source);
                            }
                        }
                    }
                }
                that.redraw();
            });
        };
        
        var _getCanvasPosColor = function (position) {
            var color = _ctx.getImageData(position.x, position.y, 1, 1).data;
            return picker.util.rgbToHex(color[0], color[1], color[2]);
        };
        
        var _addPalette = function (color) {
            var $ITEM = $("<div class='coloritem'><div class='color' style='background:" + color + "'></div><div class='value'>" + color + "</div><div class='remove'></div></div>");
            $ITEM.find(".remove").click(function (evt) {
                $(evt.currentTarget).parent().hide(500, function() {
                    $(evt.currentTarget).parent().remove();
                    _checkRemoveAllButton();
                });
            });
            $ITEM.hide();
            $("#colorList").append("$ITEM");
            $ITEM.show(500, function () {
                _checkRemoveAllButton();
            });
        };
        
        var _checkRemoveAllButton = function () {
            if ($("#colorList").children().size() > 0)
                $("#footerBtn").css({background: "red"});
            else
                $("#footerBtn").css({background: "gray"});
        };
        
        var _clear = function (x, y, w, h) {
            if (x == undefined) x = 0;
            if (y == undefined) y = 0;
            if (w == undefined) w = $CANVAS.width();
            if (h == undefined) h = $CANVAS.height();
            
            _ctx.clearRect(x, y, w, h);
            _isPainted = false;
        };
        
        var _removeRecursive = function (eles, curIdx, totalIdx) {
            $(eles[curIdx]).hide(200, function () {
                if (curIdx < totalIdx) {
                    $(eles[curIdx]).remove();
                    _removeRecursive(eles, ++curIdx,totalIdx);
                }
                _checkRemoveAllButton();
            });
        };
        
        // -------------------------------------------
        // public method
        // -------------------------------------------
        this.setSource = function (source) {
            _source = source;
        };
        
        this.redraw = function (x, y) {
            if (x == undefined) x = 0;
            if (y == undefined) y = 0;
            
            _clear();
            
            var pastedImage = new Image();
            pastedImage.onload = function() {
                _ctx.drawImage(pastedImage, x, y);
                _prevPos.x = x;
                _prevPos.y = y;
            };
            
            pastedImage.stc = _source;
            _isPainted = true;
            
        };
        
        // Call init();
        _init();
    };
    
    picker.util = {
        
        mousePosition: function (evt) {
            var mouseX, mouseY;
            if (evt.offsetX) {
                mouseX = evt.offsetX;
                mouseY = evt.offsetY;
            } else if (evt.layerX) {
                mouseX = evt.layerX;
                mouseY = evt.layerY;
            }
            return {x: mouseX, y:mouseY};
        },
        
        componentToHex: function (c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        },
        
        rgbToHex: function (r, g, b) {
            return "#" + picker.util.componentToHex(r) + picker.util.componentToHex(g) + picker.util.componentToHex(b)
        },
        
        stopEvent: function (evt) {
            if (evt.stopPropagation) evt.stopPropagation();
            if (evt.preventDefault) evt.preventDefault();
        }
        /*
        browserDetect: function () {
            // Browser Name
            this.browser = "";
            // Browser Version
            this.version = "";
            // Document Mode (Only IE)
            this.documentMode = "";
            
            var ua = navigator.userAgent, 
                ie = /(msie|trident)/i.test(ua),
                chrome = /chrom|crois/i.test(ua),
                phantom = /phantom/i.test(ua),
                iphone = /iphone/i.test(ua),
                touchpad = /touchpad/i.test(ua),
                silk = /silk/i.test(ua),
                safari = /safari/i.test(ua) && !chrome && !phantom && !silk,
                android = /android/i.test(ua),
                opera = /opera/i.test(ua) || /opr/i.test(ua),
                firefox = /firefox/i.test(ua),
                gecko = /gecko\//i.test(ua),
                webkitVersion = /version\/(\d+(\.\d+)?)/i,
                firefoxVersion = /firefox\/(\d+(\.\d+)?)/i;
            
            if (ie) {
                this.browser = "IE";
                
                if (/trident\/(\d+(\.\d+)?)/i.test(ua)) {
                    var trident = ua.match(/trident\/(\d+
                }
            }
        }
        */
    };
    
    window.picker = picker;
})(window);